/**
 * ────────────────────────────────────────────────────────────────────────────────
 * 文本节点提取模块
 * ────────────────────────────────────────────────────────────────────────────────
 * 从幻灯片元素中提取带有 [htp="text"] 标记的 HTML 元素，
 * 计算其计算样式（字体、颜色、大小、对齐方式等）和边界框位置，
 * 并将视口坐标转换为 PPTX 坐标（英寸）。
 *
 * 提取的内容包括：
 *   - 文本内容（trim 后的 textContent）
 *   - 字体家族、字号（转换为磅值 pt）
 *   - 字体粗细和样式（加粗、斜体）
 *   - 文字颜色（rgb 解析为 #hex）
 *   - 文本对齐方式
 *   - 行高
 *
 * 所有坐标和尺寸均按视口与甲板的比例进行线性映射。
 * ────────────────────────────────────────────────────────────────────────────────
 */

import type { Page, ElementHandle } from "playwright";
import type { HtpPptxTextBox } from "@htp/pptx";
import type { HtpManifest, HtpWarning, MarkerConfig } from "@htp/core";
import { DEFAULT_CONFIG, HtpWarningCode, cssPxToPt, pxToInches, resolveColor, parseFontFamily } from "@htp/core";
import { DEFAULT_VIEWPORT, DEFAULT_SLIDE_SIZE } from "@htp/core";

export interface TextExtractionOptions {
  /** 标记属性配置 */
  marker: MarkerConfig;
  /** 浏览器视口尺寸 */
  viewport: { width: number; height: number };
  /** PPTX 甲板宽度（英寸） */
  deckWidth: number;
  /** PPTX 甲板高度（英寸） */
  deckHeight: number;
  /** 默认文本导出模式 */
  defaultMode: "editable" | "image";
  /** 当前幻灯片的 CSS 选择器 */
  slideSelector: string;
}

export interface ExtractedText {
  /** 提取到的文本框对象 */
  textBox: HtpPptxTextBox;
  /** 提取过程中的警告（如有） */
  warning?: HtpWarning;
}

/**
 * ────────────────────────────────────────────────────────────────────────────────
 * 从幻灯片元素中提取文本节点
 * ────────────────────────────────────────────────────────────────────────────────
 * 在浏览器上下文中查询当前幻灯片内所有 [htp="text"] 元素，
 * 读取每个元素的 getBoundingClientRect 和 getComputedStyle，
 * 构建 HtpPptxTextBox 对象数组。
 *
 * 坐标转换公式：
 *   x(英寸) = rect.x / 视口宽度 * 甲板宽度
 *   y(英寸) = rect.y / 视口高度 * 甲板高度
 *   字号(pt) = fontSizePx / 视口高度 * 甲板高度 * 72
 *
 * 颜色解析：支持 rgb(r, g, b) 格式自动转换为 #rrggbb。
 * 空文本节点会被自动跳过。
 * ────────────────────────────────────────────────────────────────────────────────
 */
export async function extractTextNodes(
  page: Page,
  slideHandle: ElementHandle,
  manifest: HtpManifest | null,
  options: TextExtractionOptions,
): Promise<ExtractedText[]> {
  const { marker, viewport, deckWidth, deckHeight } = options;

  return page.evaluate(
    ({ typeAttr, vw, vh, dw, dh, slideSelector }: {
      typeAttr: string;
      vw: number; vh: number;
      dw: number; dh: number;
      slideSelector: string;
    }) => {
      const results: Array<{ textBox: any; warning?: any }> = [];

      // 在当前幻灯片范围内查找文本节点
      const slideEl = document.querySelector(slideSelector);
      if (!slideEl) return results;

      const textEls = slideEl.querySelectorAll(`[${typeAttr}="text"]`);

      textEls.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const rect = htmlEl.getBoundingClientRect();
        const style = getComputedStyle(htmlEl);
        const text = htmlEl.textContent?.trim() || (htmlEl as any).innerText?.trim() || "";

        if (!text) return;

        // 视口坐标 → PPTX 英寸坐标
        const x = rect.x / vw * dw;
        const y = rect.y / vh * dh;
        const w = rect.width / vw * dw;
        const h = rect.height / vh * dh;

        // 字号：CSS px → PPT 磅值 (pt)
        const fontSizePx = parseFloat(style.fontSize);
        const fontSizePt = fontSizePx / vh * dh * 72;

        // 文字颜色：rgb → 十六进制
        const color = style.color;
        let colorHex = "#000000";
        const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
          colorHex = "#" + [1, 2, 3].map((i) =>
            parseInt(rgbMatch[i]).toString(16).padStart(2, "0")
          ).join("");
        }

        const fontFamily = style.fontFamily.split(",")[0]?.trim().replace(/['"]/g, "") || "Arial";
        const fontWeight = style.fontWeight;
        const fontStyle = style.fontStyle;
        const textAlign = style.textAlign as "left" | "center" | "right" | "justify";
        const lineHeight = parseFloat(style.lineHeight) || undefined;

        results.push({
          textBox: {
            type: "text-box",
            x, y, w, h,
            text,
            fontFamily,
            fontSize: fontSizePt,
            fontWeight,
            fontStyle: fontStyle as "normal" | "italic",
            color: colorHex,
            textAlign,
            lineHeight,
          },
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
      slideSelector: options.slideSelector,
    },
  );
}
