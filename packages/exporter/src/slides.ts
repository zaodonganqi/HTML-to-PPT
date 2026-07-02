/**
 * 幻灯片发现模块
 * 负责在已渲染的页面中定位并识别所有幻灯片元素。发现策略按优先级依次尝试：
 *
 *   1. 页面清单（manifest）—— 从 window.__HTP_MANIFEST__ 读取，包含幻灯片 ID 和选择器
 *   2. DOM 标记属性 —— 查找带有 [htp="slide"] 属性的元素
 *   3. CSS 类名 —— 查找带有 .slide 类的元素
 *   4. 兜底策略 —— 将整个 <body> 作为单张幻灯片
 *
 * 每种策略都会为每张幻灯片生成唯一的 ID 和 CSS 选择器，
 * 以便后续的提取模块能够精确定位。
 */

import type { Page } from "playwright";
import type { HtpManifest, HtpSlideNode, MarkerConfig } from "@htp/core";
import { DEFAULT_CONFIG } from "@htp/core";

export interface SlideInfo {
  /** 幻灯片唯一标识符 */
  id: string;
  /** 幻灯片在甲板中的索引（从 0 开始） */
  index: number;
  /** 用于在 DOM 中定位该幻灯片的 CSS 选择器 */
  selector: string;
}

export interface SlideDiscoveryResult {
  /** 发现的所有幻灯片信息列表 */
  slides: SlideInfo[];
  /** 页面清单（如果存在） */
  manifest: HtpManifest | null;
}

/**
 * 从页面中发现所有幻灯片
 * 在浏览器上下文中执行幻灯片发现逻辑，按以下优先级查找：
 *   1. 读取 window.__HTP_MANIFEST__ 中的幻灯片定义
 *   2. 查询 DOM 中带有标记属性的 [htp="slide"] 元素
 *   3. 查询 DOM 中带有 .slide 类的元素
 *   4. 以上均未找到时，将 <body> 作为唯一的幻灯片
 *
 * 每张发现的幻灯片都会被赋予一个 id 和一个 CSS 选择器，
 * 选择器使用 CSS.escape 进行安全转义以防止选择器注入。
 */
export async function discoverSlides(
  page: Page,
  marker: MarkerConfig = DEFAULT_CONFIG.marker,
): Promise<SlideDiscoveryResult> {
  return page.evaluate(
    (typeAttr: string) => {
      // 1. 尝试读取页面清单
      const manifest = (window as any).__HTP_MANIFEST__ as HtpManifest | undefined;

      if (manifest?.slides && manifest.slides.length > 0) {
        const slides: SlideInfo[] = manifest.slides.map((s, i) => ({
          id: s.id,
          index: i,
          selector: s.selector,
        }));
        return { slides, manifest };
      }

      // 2. 在 DOM 中查询带有标记属性的幻灯片元素
      const slideEls = document.querySelectorAll(`[${typeAttr}="slide"]`);
      if (slideEls.length > 0) {
        const slides: SlideInfo[] = Array.from(slideEls).map((el, i) => {
          const id = el.id || `slide-${i + 1}`;
          return {
            id,
            index: i,
            selector: el.id ? `#${CSS.escape(el.id)}` : `[${typeAttr}="slide"]:nth-child(${i + 1})`,
          };
        });
        return { slides, manifest: null };
      }

      // 3. 查询带有 .slide 类的元素
      const classSlideEls = document.querySelectorAll(".slide");
      if (classSlideEls.length > 0) {
        const slides: SlideInfo[] = Array.from(classSlideEls).map((el, i) => ({
          id: el.id || `slide-${i + 1}`,
          index: i,
          selector: `.slide:nth-child(${i + 1})`,
        }));
        return { slides, manifest: null };
      }

      // 4. 兜底策略：整个 body 作为单张幻灯片
      return {
        slides: [{ id: "slide-1", index: 0, selector: "body" }],
        manifest: null,
      };
    },
    marker.typeAttr,
  );
}
