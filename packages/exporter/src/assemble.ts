/**
 * PPTX 甲板组装模块
 * 本模块负责将 Playwright 页面中提取的 DOM 数据组装为 HtpPptxDeck 对象模型。
 * 对每一张幻灯片执行以下处理流程：
 *   1. 隐藏可编辑节点（文本、表格）
 *   2. 截取整张幻灯片作为背景图片
 *   3. 恢复可编辑节点
 *   4. 提取文本节点 → 文本框对象
 *   5. 提取表格节点 → 表格对象（复杂表格回退为截图）
 *   6. 提取图片节点 → PNG 截图
 *   7. 提取回退节点 → PNG 截图（用于无法原生映射的复杂视觉区域）
 *   8. 按 z-order 分层：背景 → 图片 → 表格 → 文本（从底到顶）
 */

import type { Page, ElementHandle } from "playwright";
import type { HtpPptxDeck, HtpPptxSlide, HtpPptxImage, HtpPptxObject } from "@htp/pptx";
import type { HtpManifest, HtpWarning, MarkerConfig } from "@htp/core";
import { DEFAULT_CONFIG } from "@htp/core";
import { discoverSlides, SlideInfo } from "./slides";
import { extractTextNodes, TextExtractionOptions } from "./extract/text";
import { extractTableNodes, TableExtractionOptions } from "./extract/table";
import { extractImageNodes, ImageExtractionOptions } from "./extract/image";
import { extractFallbackNodes, FallbackExtractionOptions } from "./extract/fallback";

export interface AssembleOptions {
  /** 标记属性配置（用于识别 html 元素上的 htp 类型） */
  marker: MarkerConfig;
  /** 浏览器视口尺寸 */
  viewport: { width: number; height: number };
  /** PPTX 画布宽度（英寸） */
  deckWidth: number;
  /** PPTX 画布高度（英寸） */
  deckHeight: number;
  /** 文本导出模式：editable=可编辑文本框，image=截图 */
  textMode: "editable" | "image";
  /** 动画导出模式 */
  animationMode: "native" | "video" | "none";
}

export interface AssembleResult {
  /** 组装完成的 PPTX 甲板对象 */
  deck: HtpPptxDeck;
  /** 组装过程中产生的警告列表 */
  warnings: HtpWarning[];
}

/**
 * 从已渲染的页面中组装完整的 PPTX 甲板
 * 这是幻灯片装配的核心函数。它遍历页面中发现的每一张幻灯片，
 * 依次提取各类内容节点（回退区域、图片、表格、文本），
 * 并将它们组装为 HtpPptxDeck 数据结构。
 *
 * 每张幻灯片的处理流程：
 *   1. 隐藏所有可编辑节点 → 截取幻灯片背景
 *   2. 恢复可编辑节点
 *   3. 提取各类内容对象并按 z-order 排列
 */
export async function assembleDeck(
  page: Page,
  manifest: HtpManifest | null,
  options: AssembleOptions,
): Promise<AssembleResult> {
  const warnings: HtpWarning[] = [];
  const { marker, viewport, deckWidth, deckHeight } = options;

  // 发现页面中的所有幻灯片
  const { slides: slideInfos } = await discoverSlides(page, marker);

  const extractBase = {
    marker,
    viewport,
    deckWidth,
    deckHeight,
    slideSelector: "",
  };

  const htpSlides: HtpPptxSlide[] = [];

  for (let si = 0; si < slideInfos.length; si++) {
    const slideInfo = slideInfos[si];
    const slideOpts = { ...extractBase, slideSelector: slideInfo.selector };

    // 获取幻灯片元素的 Playwright 句柄
    const slideEl = await page.$(slideInfo.selector);
    if (!slideEl) {
      warnings.push({
        code: "HTP_SLIDE_NOT_FOUND",
        message: `Slide element not found for selector: ${slideInfo.selector}`,
        slideId: slideInfo.id,
      });
      continue;
    }

    // 步骤 1-2：隐藏可编辑节点，截取幻灯片背景
    await hideEditableNodes(page, slideInfo.selector, marker.typeAttr);
    const bgScreenshot = await slideEl.screenshot({ type: "png", animations: "disabled" });
    await showEditableNodes(page, slideInfo.selector, marker.typeAttr);

    const background: HtpPptxImage = {
      type: "image",
      x: 0,
      y: 0,
      w: deckWidth,
      h: deckHeight,
      data: bgScreenshot,
      mimeType: "image/png",
    };

    // 步骤 3-7：提取各类内容对象
    const objects: HtpPptxObject[] = [];

    // 回退节点（截图，位于背景之上、其余内容之下）
    try {
      const fallbacks = await extractFallbackNodes(page, slideEl, manifest, slideOpts);
      for (const fb of fallbacks) {
        if (fb.warning) warnings.push({ ...fb.warning, slideId: slideInfo.id });
        if (fb.image.data.length > 0) objects.push(fb.image);
      }
    } catch (err) {
      warnings.push({
        code: "HTP_EXTRACT_FAILED",
        message: `Fallback extraction failed: ${err}`,
        slideId: slideInfo.id,
      });
    }

    // 图片节点
    try {
      const images = await extractImageNodes(page, slideEl, manifest, slideOpts);
      for (const img of images) {
        if (img.warning) warnings.push({ ...img.warning, slideId: slideInfo.id });
        if (img.image.data.length > 0) objects.push(img.image);
      }
    } catch (err) {
      warnings.push({
        code: "HTP_EXTRACT_FAILED",
        message: `Image extraction failed: ${err}`,
        slideId: slideInfo.id,
      });
    }

    // 表格节点
    try {
      const tables = await extractTableNodes(page, slideEl, manifest, slideOpts);
      for (const tbl of tables) {
        warnings.push(...tbl.warnings.map((w) => ({ ...w, slideId: slideInfo.id })));
        if (tbl.fallback) {
          // 复杂表格→截取表格元素作为图片回退
          try {
            const tblEls = await slideEl.$$(`[${marker.typeAttr}="table"]`);
            const tblIdx = tables.indexOf(tbl);
            if (tblEls[tblIdx]) {
              const ss = await tblEls[tblIdx].screenshot({ type: "png", animations: "disabled" });
              objects.push({
                type: "image",
                x: tbl.table.x,
                y: tbl.table.y,
                w: tbl.table.w,
                h: tbl.table.h,
                data: ss,
                mimeType: "image/png",
              } as HtpPptxImage);
            }
          } catch {
            // 使用已解析的表格对象作为回退
            objects.push(tbl.table);
          }
        } else {
          objects.push(tbl.table);
        }
      }
    } catch (err) {
      warnings.push({
        code: "HTP_EXTRACT_FAILED",
        message: `Table extraction failed: ${err}`,
        slideId: slideInfo.id,
      });
    }

    // 文本节点（最顶层）
    if (options.textMode !== "image") {
      try {
        const texts = await extractTextNodes(page, slideEl, manifest, slideOpts);
        for (const t of texts) {
          if (t.warning) warnings.push({ ...t.warning, slideId: slideInfo.id });
          objects.push(t.textBox);
        }
      } catch (err) {
        warnings.push({
          code: "HTP_EXTRACT_FAILED",
          message: `Text extraction failed: ${err}`,
          slideId: slideInfo.id,
        });
      }
    }

    htpSlides.push({
      id: slideInfo.id,
      background,
      objects,
    });
  }

  const deck: HtpPptxDeck = {
    width: deckWidth,
    height: deckHeight,
    slides: htpSlides,
  };

  return { deck, warnings };
}

// ── 内部辅助函数 ────────────────────────────────────────────────────────────────

/**
 * 隐藏页面上所有可编辑节点（文本和表格），为背景截图做准备。
 * 对全页所有 [htp="text"] 和 [htp="table"] 元素设置 visibility: hidden，
 * 以防止固定定位元素（如导航栏）的文本残留在幻灯片截图中。
 */
async function hideEditableNodes(
  page: Page,
  _slideSelector: string,
  typeAttr: string,
): Promise<void> {
  await page.evaluate(
    ({ attr }) => {
      // 隐藏所有已标记的可编辑/可截图元素，确保背景截图不包含它们
      const allTypes = ["text", "table", "image", "fallback"];
      allTypes.forEach((type) => {
        document.querySelectorAll(`[${attr}="${type}"]`).forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (!htmlEl.dataset.__htpHidden) {
            htmlEl.dataset.__htpHidden = "1";
            htmlEl.style.visibility = "hidden";
          }
        });
      });
    },
    { attr: typeAttr },
  );
}

/**
 * 恢复之前被隐藏的可编辑节点，使其重新在页面上可见。
 * 仅恢复被 hideEditableNodes 标记过（dataset.__htpHidden === "1"）的元素。
 */
async function showEditableNodes(
  page: Page,
  _slideSelector: string,
  typeAttr: string,
): Promise<void> {
  await page.evaluate(
    ({ attr }) => {
      // 恢复所有之前被隐藏的元素
      const allTypes = ["text", "table", "image", "fallback"];
      allTypes.forEach((type) => {
        document.querySelectorAll(`[${attr}="${type}"]`).forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.dataset.__htpHidden === "1") {
            htmlEl.style.visibility = "";
            delete htmlEl.dataset.__htpHidden;
          }
        });
      });
    },
    { attr: typeAttr },
  );
}
