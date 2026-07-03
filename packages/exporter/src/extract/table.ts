/**
 * 表格提取模块
 * 从幻灯片元素中提取带有 [htp="table"] 标记的 HTML 表格，
 * 解析为 HtpPptxTable 对象，包含单元格位置、内容和样式信息。
 *
 * 处理能力与限制：
 *   - 支持基本的行列结构提取
 *   - 支持单元格背景色和文字颜色的 rgb → hex 转换
 *   - 支持字体大小、粗细、对齐方式的提取
 *   - 自动测量首行各列的实际宽度
 *   - 检测 rowspan/colspan：标记为 rasterize=true 以触发图片栅格化
 *   - 复杂表格（合并单元格）会生成警告并回退为截图方式
 *
 * 所有坐标按视口与甲板比例进行线性映射。
 */

import type { Page, ElementHandle } from "playwright";
import type { HtpPptxTable, HtpPptxTableCell } from "@htp/pptx";
import type { HtpManifest, HtpWarning, MarkerConfig } from "@htp/core";
import { DEFAULT_CONFIG, HtpWarningCode } from "@htp/core";
import type { FontResolver } from "../fonts";

export interface TableExtractionOptions {
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
  /** 字体转换器 */
  fontResolver?: FontResolver;
}

export interface ExtractedTable {
  /** 表格在当前幻灯片同类 DOM 节点中的原始序号 */
  domIndex: number;
  /** 提取到的表格对象 */
  table: HtpPptxTable;
  /** 表格提取过程中的警告列表 */
  warnings: HtpWarning[];
  /** 如果为 true，表格过于复杂，应栅格化为图片 */
  rasterize: boolean;
}

/**
 * 从幻灯片元素中提取表格节点
 * 在浏览器上下文中查询当前幻灯片内所有 [htp="table"] 元素，
 * 遍历每个表格的行（tr）和单元格（td/th），构建 ExtractedTable 数组。
 *
 * 提取逻辑：
 *   1. 检测 rowspan/colspan 存在 → 标记 rasterize=true 并生成警告
 *   2. 确定表格行列数（取最大列数作为 colCount）
 *   3. 从首行单元格测量各列实际宽度
 *   4. 遍历所有单元格 → 提取文本、背景色、字体色、字号、粗细、对齐
 *   5. 从每行的首个单元格测量该行高度
 *
 * 空表格（0 行或 0 列）将被跳过。
 */
export async function extractTableNodes(
  page: Page,
  slideHandle: ElementHandle,
  manifest: HtpManifest | null,
  options: TableExtractionOptions,
): Promise<ExtractedTable[]> {
  const { marker, viewport, deckWidth, deckHeight, slideSelector } = options;

  const extracted = await page.evaluate(
    ({ typeAttr, mergeAttr, nodes, vw, vh, dw, dh, slideSelector }: {
      typeAttr: string;
      mergeAttr: string;
      nodes: Array<{ selector: string; merge?: string }>;
      vw: number; vh: number;
      dw: number; dh: number;
      slideSelector: string;
    }) => {
      const results: Array<{ domIndex: number; table: any; warnings: any[]; rasterize: boolean }> = [];

      const slideEl = document.querySelector(slideSelector);
      if (!slideEl) return results;

      const markedTypes = new Set(["text", "table", "image"]);
      const getMerge = (el: Element): string => {
        const attrMerge = el.getAttribute(mergeAttr);
        if (attrMerge) return attrMerge;
        const matched = nodes.find((node) => document.querySelector(node.selector) === el);
        return matched?.merge || "auto";
      };
      const shouldExport = (el: Element, type: string): boolean => {
        if (getMerge(el) === "only") return false;
        for (let parent = el.parentElement; parent && parent !== slideEl; parent = parent.parentElement) {
          const parentType = parent.getAttribute(typeAttr);
          if (!parentType || !markedTypes.has(parentType)) continue;
          const merge = getMerge(parent);
          if (merge === "all" || merge === "none") return false;
          if (merge === "text" && (type === "text" || type === "table")) return false;
        }
        return true;
      };

      const tableEls = slideEl.querySelectorAll(`[${typeAttr}="table"]`);

      tableEls.forEach((tableEl, domIndex) => {
        if (!shouldExport(tableEl, "table")) return;
        const htmlTable = tableEl as HTMLTableElement;
        const rect = htmlTable.getBoundingClientRect();
        const warnings: any[] = [];
        let rasterize = false;

        // 检测合并单元格（rowspan / colspan）
        const hasRowspan = htmlTable.querySelectorAll("[rowspan]").length > 0;
        const hasColspan = htmlTable.querySelectorAll("[colspan]").length > 0;

        if (hasRowspan || hasColspan) {
          warnings.push({
            code: hasRowspan ? "HTP_TABLE_ROWSPAN_UNSUPPORTED" : "HTP_TABLE_COLSPAN_UNSUPPORTED",
            message: `Table has ${hasRowspan ? "rowspan" : "colspan"} which is not fully supported and may be degraded`,
          });
          rasterize = true;
        }

        const rows = htmlTable.querySelectorAll("tr");
        const rowCount = rows.length;
        let colCount = 0;
        rows.forEach((row) => {
          colCount = Math.max(colCount, row.querySelectorAll("td,th").length);
        });

        if (rowCount === 0 || colCount === 0) return;

        // 计算相对于幻灯片元素的位置（而非相对于视口）
        const slideRect = slideEl.getBoundingClientRect();
        const x = (rect.x - slideRect.x) / vw * dw;
        const y = (rect.y - slideRect.y) / vh * dh;
        const w = rect.width / vw * dw;
        const h = rect.height / vh * dh;

        const cells: any[] = [];
        const colWidths: number[] = Array(colCount).fill(w / colCount);
        const rowHeights: number[] = Array(rowCount).fill(h / rowCount);

        // 从首行单元格测量实际列宽
        const firstRow = rows[0];
        if (firstRow) {
          const firstRowCells = firstRow.querySelectorAll("td,th");
          firstRowCells.forEach((cell, ci) => {
            if (ci < colCount) {
              const cellRect = cell.getBoundingClientRect();
              colWidths[ci] = (cellRect.width / vw) * dw;
            }
          });
        }

        rows.forEach((row, ri) => {
          const rowCells = row.querySelectorAll("td,th");
          rowCells.forEach((cell, ci) => {
            const cellHtml = cell as HTMLElement;
            const style = getComputedStyle(cellHtml);
            const text = cellHtml.textContent?.trim() || (cellHtml as any).innerText?.trim() || "";

            // 单元格背景色：rgb → 十六进制
            const bgColor = style.backgroundColor;
            let fillHex: string | undefined;
            const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (rgbMatch) {
              fillHex = "#" + [1, 2, 3].map((i) =>
                parseInt(rgbMatch[i]).toString(16).padStart(2, "0")
              ).join("");
            }

            // 单元格字体色：rgb → 十六进制
            const fontColor = style.color;
            let fontColorHex = "#000000";
            const fRgbMatch = fontColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (fRgbMatch) {
              fontColorHex = "#" + [1, 2, 3].map((i) =>
                parseInt(fRgbMatch[i]).toString(16).padStart(2, "0")
              ).join("");
            }

            cells.push({
              row: ri,
              col: ci,
              text,
              fill: fillHex,
              fontSize: parseFloat(style.fontSize) / vh * dh * 72,
              fontColor: fontColorHex,
              fontWeight: style.fontWeight === "bold" || parseInt(style.fontWeight) >= 600 ? "bold" : "normal",
              fontFamily: style.fontFamily || "Arial",
              hAlign: style.textAlign as "left" | "center" | "right",
              vAlign: "middle" as const,
            });

            // 从每行首个单元格测量行高
            if (ci === 0) {
              rowHeights[ri] = (cellHtml.getBoundingClientRect().height / vh) * dh;
            }
          });
        });

        results.push({
          domIndex,
          table: {
            type: "table",
            x, y, w, h,
            rows: rowCount,
            cols: colCount,
            cells,
          },
          warnings,
          rasterize,
        });
      });

      return results;
    },
    {
      typeAttr: marker.typeAttr,
      mergeAttr: marker.mergeAttr,
      nodes: manifest?.nodes ?? [],
      vw: viewport.width,
      vh: viewport.height,
      dw: deckWidth,
      dh: deckHeight,
      slideSelector,
    },
  );

  const fontResolver = options.fontResolver;
  if (!fontResolver) return extracted;

  return extracted.map((item) => {
    const warnings = [...item.warnings];
    return {
      ...item,
      warnings,
      table: {
        ...item.table,
        cells: item.table.cells.map((cell: any) => {
          const resolved = fontResolver.resolve(cell.fontFamily, cell.text);
          if (resolved.warning) warnings.push(resolved.warning);
          return { ...cell, fontFamily: resolved.fontFamily };
        }),
      },
    };
  });
}
