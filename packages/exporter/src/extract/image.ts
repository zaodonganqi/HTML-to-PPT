/**
 * 图片节点提取模块
 * 从幻灯片元素中提取带有 [htp="image"] 标记的 HTML 元素，
 * 使用 Playwright 的 element.screenshot() 进行精确渲染截图。
 *
 * 相比纯 DOM 提取的优势：
 *   - 完整保留 CSS 视觉效果：border-radius、clip-path、filter、box-shadow 等
 *   - 支持背景图片、渐变等复杂样式
 *   - 截图输出为 PNG 格式，直接嵌入 PPTX
 *
 * 提取流程分两步：
 *   1. 在浏览器上下文中获取所有图片元素的位置和尺寸（视口 → 英寸映射）
 *   2. 返回 Node.js 端使用 Playwright 对每个元素逐一截图
 */

import type { Page, ElementHandle } from "playwright";
import type { HtpPptxImage } from "@htp/pptx";
import type { HtpManifest, MarkerConfig, HtpWarning } from "@htp/core";
import { DEFAULT_CONFIG } from "@htp/core";

export interface ImageExtractionOptions {
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

export interface ExtractedImage {
  /** 提取到的图片对象 */
  image: HtpPptxImage;
  /** 截图失败时的警告信息 */
  warning?: HtpWarning;
}

/**
 * 从幻灯片元素中提取图片节点
 * 分两阶段处理：
 *
 * 阶段 1（浏览器上下文）：
 *   遍历当前幻灯片内所有 [htp="image"] 元素，通过 getBoundingClientRect
 *   获取每个元素的视口坐标，并按比例映射为 PPTX 英寸坐标。
 *
 * 阶段 2（Node.js 端）：
 *   使用 Playwright 的 element.screenshot() 对每个图片元素逐一截图。
 *   截图成功 → 返回包含 PNG 数据的 HtpPptxImage
 *   截图失败 → 返回空数据的图片对象并附带 HTP_NODE_SCREENSHOT_FAILED 警告
 */
export async function extractImageNodes(
  page: Page,
  slideHandle: ElementHandle,
  manifest: HtpManifest | null,
  options: ImageExtractionOptions,
): Promise<ExtractedImage[]> {
  const { marker, viewport, deckWidth, deckHeight, slideSelector } = options;

  // 阶段 1：在浏览器上下文中获取所有图片元素的位置信息
  const imageInfos = await page.evaluate(
    ({ typeAttr, vw, vh, dw, dh, slideSelector }: {
      typeAttr: string;
      vw: number; vh: number;
      dw: number; dh: number;
      slideSelector: string;
    }) => {
      const results: Array<{
        x: number; y: number; w: number; h: number;
        isFallback: boolean;
      }> = [];

      const slideEl = document.querySelector(slideSelector);
      if (!slideEl) return results;

      const imgEls = slideEl.querySelectorAll(`[${typeAttr}="image"]`);

      imgEls.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const rect = htmlEl.getBoundingClientRect();

        // 计算相对于幻灯片元素的位置（而非相对于视口）
        const slideRect = slideEl.getBoundingClientRect();
        results.push({
          x: (rect.x - slideRect.x) / vw * dw,
          y: (rect.y - slideRect.y) / vh * dh,
          w: rect.width / vw * dw,
          h: rect.height / vh * dh,
          isFallback: false,
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

  // 阶段 2：在 Node.js 端对每个图片元素进行截图
  const results: ExtractedImage[] = [];

  for (let i = 0; i < imageInfos.length; i++) {
    const info = imageInfos[i];
    try {
      // 通过 slideHandle 定位图片元素
      const imgEls = await slideHandle.$$(`[${marker.typeAttr}="image"]`);
      if (imgEls[i]) {
        const screenshot = await imgEls[i].screenshot({ type: "png", animations: "disabled" });
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
      // 截图失败——报告警告并跳过该图片
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
          message: `Failed to screenshot image element: ${err}`,
        },
      });
    }
  }

  return results;
}
