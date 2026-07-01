/**
 * ────────────────────────────────────────────────────────────────────────────────
 * 回退区域提取模块
 * ────────────────────────────────────────────────────────────────────────────────
 * 从幻灯片元素中提取带有 [htp="fallback"] 标记的 HTML 区域，
 * 将其渲染为 PNG 截图以嵌入 PPTX。
 *
 * 使用场景：
 *   回退节点用于标记那些无法被原生映射为 PowerPoint 对象的复杂视觉内容，
 *   例如 Canvas 绘图、SVG 图表、CSS 动画帧、自定义装饰元素等。
 *   这些区域将通过 Playwright 截图整体渲染为位图。
 *
 * 提取流程：
 *   1. 在浏览器上下文中获取所有回退区域的边界框（视口坐标 → 英寸映射）
 *   2. 返回 Node.js 端使用 Playwright 逐区域截图
 * ────────────────────────────────────────────────────────────────────────────────
 */

import type { Page, ElementHandle } from "playwright";
import type { HtpPptxImage } from "@htp/pptx";
import type { HtpManifest, MarkerConfig, HtpWarning } from "@htp/core";
import { DEFAULT_CONFIG } from "@htp/core";

export interface FallbackExtractionOptions {
  /** 标记属性配置 */
  marker: MarkerConfig;
  /** 浏览器视口尺寸 */
  viewport: { width: number; height: number };
  /** PPTX 甲板宽度（英寸） */
  deckWidth: number;
  /** PPTX 甲板高度（英寸） */
  deckHeight: number;
  /** 当前幻灯片的 CSS 选择器 */
  slideSelector: string;
}

export interface ExtractedFallback {
  /** 回退区域的截图图片对象 */
  image: HtpPptxImage;
  /** 截图失败时的警告信息 */
  warning?: HtpWarning;
}

/**
 * ────────────────────────────────────────────────────────────────────────────────
 * 从幻灯片元素中提取回退区域截图
 * ────────────────────────────────────────────────────────────────────────────────
 * 分两阶段处理：
 *
 * 阶段 1（浏览器上下文）：
 *   遍历当前幻灯片内所有 [htp="fallback"] 元素，通过 getBoundingClientRect
 *   获取每个回退区域的视口坐标，并按比例映射为 PPTX 英寸坐标。
 *
 * 阶段 2（Node.js 端）：
 *   使用 Playwright 的 element.screenshot() 对每个回退区域逐一截图。
 *   截图成功 → 返回包含 PNG 数据的 HtpPptxImage
 *   截图失败 → 返回空数据的图片对象并附带 HTP_NODE_SCREENSHOT_FAILED 警告
 * ────────────────────────────────────────────────────────────────────────────────
 */
export async function extractFallbackNodes(
  page: Page,
  slideHandle: ElementHandle,
  manifest: HtpManifest | null,
  options: FallbackExtractionOptions,
): Promise<ExtractedFallback[]> {
  const { marker, viewport, deckWidth, deckHeight, slideSelector } = options;

  // 阶段 1：在浏览器上下文中获取所有回退区域的位置信息
  const fallbackInfos = await page.evaluate(
    ({ typeAttr, vw, vh, dw, dh, slideSelector }: {
      typeAttr: string;
      vw: number; vh: number;
      dw: number; dh: number;
      slideSelector: string;
    }) => {
      const results: Array<{ x: number; y: number; w: number; h: number }> = [];

      const slideEl = document.querySelector(slideSelector);
      if (!slideEl) return results;

      const fallbackEls = slideEl.querySelectorAll(`[${typeAttr}="fallback"]`);

      fallbackEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        results.push({
          x: rect.x / vw * dw,
          y: rect.y / vh * dh,
          w: rect.width / vw * dw,
          h: rect.height / vh * dh,
        });
      });

      return results;
    },
    {
      typeAttr: marker.typeAttr,
      vw: viewport.width,
      vh: viewport.height,
      dw: deckWidth,
      dh: deckHeight,
      slideSelector,
    },
  );

  // 阶段 2：在 Node.js 端对每个回退区域进行截图
  const results: ExtractedFallback[] = [];

  for (let i = 0; i < fallbackInfos.length; i++) {
    const info = fallbackInfos[i];
    try {
      const fbEls = await slideHandle.$$(`[${marker.typeAttr}="fallback"]`);
      if (fbEls[i]) {
        const screenshot = await fbEls[i].screenshot({ type: "png" });
        results.push({
          image: {
            type: "image",
            x: info.x,
            y: info.y,
            w: info.w,
            h: info.h,
            data: screenshot,
            mimeType: "image/png",
          },
        });
      }
    } catch (err) {
      results.push({
        image: {
          type: "image",
          x: info.x,
          y: info.y,
          w: info.w,
          h: info.h,
          data: Buffer.alloc(0),
          mimeType: "image/png",
        },
        warning: {
          code: "HTP_NODE_SCREENSHOT_FAILED",
          message: `Failed to screenshot fallback element: ${err}`,
        },
      });
    }
  }

  return results;
}
