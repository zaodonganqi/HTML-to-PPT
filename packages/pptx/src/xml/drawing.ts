/**
 * DrawingML 辅助函数 — 形状、填充、变换等可复用 XML 片段
 *
 * 提供 DrawingML 命名空间下的基础构建块，包括坐标变换、
 * 预设几何形状、纯色/渐变填充、边框、图片填充、文本框、
 * 表格和幻灯片背景。所有其他幻灯片级 XML 模块均依赖此模块。
 */

import { NS, esc } from "./builder";

// ---------------------------------------------------------------------------
// 坐标变换（位置 + 尺寸）
// ---------------------------------------------------------------------------

/** 2D 变换定义（EMU 单位） */
export interface Xfrm {
  x: number;   // 水平偏移量（EMU）
  y: number;   // 垂直偏移量（EMU）
  cx: number;  // 宽度（EMU）
  cy: number;  // 高度（EMU）
  rot?: number; // 旋转角度（1/60000 度）
}

/**
 * 构建 a:xfrm 坐标变换节点
 *
 * 包含位置（a:off）、尺寸（a:ext）和可选的旋转角度，
 * 所有值以 EMU 为单位。
 */
export function buildXfrm(xfrm: Xfrm): string {
  const rotAttr = xfrm.rot !== undefined ? ` rot="${Math.round(xfrm.rot)}"` : "";
  return `<a:xfrm${rotAttr}>
    <a:off x="${Math.round(xfrm.x)}" y="${Math.round(xfrm.y)}"/>
    <a:ext cx="${Math.round(xfrm.cx)}" cy="${Math.round(xfrm.cy)}"/>
  </a:xfrm>`;
}

// ---------------------------------------------------------------------------
// 预设几何形状
// ---------------------------------------------------------------------------

/**
 * 构建 a:prstGeom 预设几何形状节点
 *
 * 默认为 "rect"（矩形），可通过 prst 参数指定其他预设形状。
 */
export function buildPrstGeom(prst: string = "rect"): string {
  return `<a:prstGeom prst="${esc(prst)}"><a:avLst/></a:prstGeom>`;
}

// ---------------------------------------------------------------------------
// 纯色填充
// ---------------------------------------------------------------------------

/**
 * 构建 a:solidFill 纯色填充节点
 *
 * 接收十六进制颜色值（如 "FF0000" 或 "#FF0000"），
 * 自动去除 # 前缀并转为大写。
 */
export function buildSolidFill(colorHex: string): string {
  const clean = colorHex.replace("#", "").toUpperCase();
  return `<a:solidFill><a:srgbClr val="${esc(clean)}"/></a:solidFill>`;
}

// ---------------------------------------------------------------------------
// 渐变填充（基础线性渐变）
// ---------------------------------------------------------------------------

/**
 * 构建 a:gradFill 线性渐变填充节点
 *
 * 接收角度（度，0 = 从左到右）和色标数组，
 * 转换为 DrawingML 方向角度并生成渐变 XML。
 */
export function buildGradientFill(
  angle: number,
  stops: { color: string; position: number }[],
): string {
  // 角度转 DrawingML 方向（从顶部顺时针为正 = angle * 60000）
  const dirAngle = ((360 - angle) % 360) * 60000;

  let xml = `<a:gradFill flip="none" rot="withShape">`;
  xml += `<a:gsLst>`;
  for (const stop of stops) {
    const clean = stop.color.replace("#", "").toUpperCase();
    xml += `<a:gs pos="${Math.round(stop.position * 100000)}">`;
    xml += `<a:srgbClr val="${esc(clean)}"/>`;
    xml += `</a:gs>`;
  }
  xml += `</a:gsLst>`;
  xml += `<a:lin ang="${Math.round(dirAngle)}" scaled="0"/>`;
  xml += `</a:gradFill>`;
  return xml;
}

// ---------------------------------------------------------------------------
// 线条/边框
// ---------------------------------------------------------------------------

/**
 * 构建 a:ln 线条/边框节点
 *
 * 支持 solid（实线）、dashed（虚线）、dotted（点线）
 * 和 none（无边框）四种样式。
 */
export function buildLn(
  widthEmu: number,
  colorHex: string,
  style: "solid" | "dashed" | "dotted" | "none" = "solid",
): string {
  if (style === "none") {
    return `<a:ln w="${Math.round(widthEmu)}"><a:noFill/></a:ln>`;
  }
  const prstDash = style === "dashed" ? "dash" : style === "dotted" ? "dot" : "solid";
  const clean = colorHex.replace("#", "").toUpperCase();
  return `<a:ln w="${Math.round(widthEmu)}">
    <a:solidFill><a:srgbClr val="${esc(clean)}"/></a:solidFill>
    <a:prstDash val="${prstDash}"/>
  </a:ln>`;
}

// ---------------------------------------------------------------------------
// 图片填充（Blip Fill）
// ---------------------------------------------------------------------------

/**
 * 构建 a:blipFill 图片填充节点
 *
 * 通过关系 ID 引用图片，使用拉伸填充模式。
 */
export function buildBlipFill(rId: string): string {
  return `<a:blipFill dpi="0" rotWithShape="1">
    <a:blip r:embed="${esc(rId)}"/>
    <a:stretch><a:fillRect/></a:stretch>
  </a:blipFill>`;
}

// ---------------------------------------------------------------------------
// 图片形状
// ---------------------------------------------------------------------------

/**
 * 构建 p:pic 图片形状节点
 *
 * 生成包含非可视属性、图片填充和形状属性的完整图片形状，
 * 用于在幻灯片中放置图片。
 */
export function buildPic(
  shapeId: number,
  name: string,
  xfrm: Xfrm,
  blipRId: string,
): string {
  const id = shapeId;
  return `<p:pic>
    <p:nvPicPr>
      <p:cNvPr id="${id}" name="${esc(name)}"/>
      <p:cNvPicPr/>
      <p:nvPr/>
    </p:nvPicPr>
    <p:blipFill>
      <a:blip r:embed="${esc(blipRId)}"/>
      <a:stretch><a:fillRect/></a:stretch>
    </p:blipFill>
    <p:spPr>
      ${buildXfrm(xfrm)}
      ${buildPrstGeom("rect")}
    </p:spPr>
  </p:pic>`;
}

// ---------------------------------------------------------------------------
// 文本框形状
// ---------------------------------------------------------------------------

/** 文本运行定义 */
export interface TextRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  fontSize?: number;    // 字号（磅），内部乘以 100 转为 EMU
  color?: string;       // 颜色（十六进制）
  fontFamily?: string;
}

/** 段落定义 */
export interface ParagraphDef {
  runs: TextRun[];
  align?: "left" | "center" | "right" | "justify";
}

function mapParagraphAlign(align: "left" | "center" | "right" | "justify" | undefined): string | undefined {
  if (align === "center") return "ctr";
  if (align === "right") return "r";
  if (align === "justify") return "just";
  if (align === "left") return "l";
  return undefined;
}

/**
 * 构建 p:sp 文本框形状节点
 *
 * 生成包含非可视属性、坐标变换、文本框主体和段落内容的
 * 完整文本框形状。支持自定义内边距和文本换行模式。
 */
export function buildTextBox(
  shapeId: number,
  name: string,
  xfrm: Xfrm,
  paragraphs: ParagraphDef[],
  options?: {
    bodyWrap?: "square" | "none";
    bodyLIns?: number;  // 左侧内边距（EMU）
    bodyRIns?: number;  // 右侧内边距（EMU）
    bodyTIns?: number;  // 顶部内边距（EMU）
    bodyBIns?: number;  // 底部内边距（EMU）
  },
): string {
  const id = shapeId;
  const lIns = options?.bodyLIns ?? 91440;  // 默认 0.1 英寸
  const rIns = options?.bodyRIns ?? 91440;
  const tIns = options?.bodyTIns ?? 45720;  // 默认 0.05 英寸
  const bIns = options?.bodyBIns ?? 45720;

  let paraXml = "";
  for (const para of paragraphs) {
    paraXml += buildParagraph(para);
  }

  return `<p:sp>
    <p:nvSpPr>
      <p:cNvPr id="${id}" name="${esc(name)}"/>
      <p:cNvSpPr txBox="1"/>
      <p:nvPr/>
    </p:nvSpPr>
    <p:spPr>
      ${buildXfrm(xfrm)}
      ${buildPrstGeom("rect")}
    </p:spPr>
    <p:txBody>
      <a:bodyPr wrap="${esc(options?.bodyWrap || "square")}"
        lIns="${lIns}" rIns="${rIns}" tIns="${tIns}" bIns="${bIns}"/>
      <a:lstStyle/>
      ${paraXml}
    </p:txBody>
  </p:sp>`;
}

/**
 * 构建 a:p 段落节点
 *
 * 遍历段落中的文本运行（runs），为每个 run 生成 a:r 元素，
 * 并在末尾附加必需的 a:endParaRPr 节点。
 */
function buildParagraph(para: ParagraphDef): string {
  const align = mapParagraphAlign(para.align) || "l";
  const pPrXml = `<a:pPr algn="${esc(align)}"/>`;
  let runsXml = "";

  for (const run of para.runs) {
    runsXml += buildRun(run);
  }

  // Required paragraph end-run properties.
  runsXml += `<a:endParaRPr/>`;

  return `<a:p>${pPrXml}${runsXml}</a:p>`;
}

/**
 * 构建 a:r 文本运行节点
 *
 * 生成包含运行属性（字号、粗体、斜体、颜色、字体）
 * 和文本内容的 a:r 元素。
 */
function buildRun(run: TextRun): string {
  let rPr = "";
  const parts: string[] = [];

  if (run.fontSize !== undefined) {
    parts.push(`sz="${Math.round(run.fontSize * 100)}"`);
  }
  if (run.bold) {
    parts.push(`b="1"`);
  }
  if (run.italic) {
    parts.push(`i="1"`);
  }

  let colorXml = "";
  if (run.color) {
    const clean = run.color.replace("#", "").toUpperCase();
    colorXml = `<a:solidFill><a:srgbClr val="${esc(clean)}"/></a:solidFill>`;
  }

  let fontXml = "";
  if (run.fontFamily) {
    fontXml = `<a:latin typeface="${esc(run.fontFamily)}"/><a:ea typeface="${esc(run.fontFamily)}"/><a:cs typeface="${esc(run.fontFamily)}"/>`;
  }

  if (parts.length > 0 || colorXml || fontXml) {
    rPr = `<a:rPr ${parts.join(" ")}>${colorXml}${fontXml}</a:rPr>`;
  }

  return `<a:r>${rPr}<a:t>${esc(run.text)}</a:t></a:r>`;
}

// ---------------------------------------------------------------------------
// 表格形状（graphicFrame）
// ---------------------------------------------------------------------------

/** 表格单元格定义 */
export interface TableCellDef {
  text: string;
  rowSpan?: number;
  colSpan?: number;
  fill?: string;        // 填充色（十六进制）
  fontSize?: number;    // 字号（磅）
  fontColor?: string;   // 字体颜色（十六进制）
  fontFamily?: string;   // 字体族
  fontWeight?: number | string;
  hAlign?: "left" | "center" | "right";
  vAlign?: "top" | "middle" | "bottom";
  borderTop?: { width: number; color: string; style?: string };
  borderBottom?: { width: number; color: string; style?: string };
  borderLeft?: { width: number; color: string; style?: string };
  borderRight?: { width: number; color: string; style?: string };
}

/** 表格定义 */
export interface TableDef {
  rows: number;
  cols: number;
  cells: TableCellDef[];
  colWidths?: number[];  // 列宽（EMU）
  rowHeights?: number[]; // 行高（EMU）
}

/**
 * 构建 p:graphicFrame 表格形状节点
 *
 * 生成包含表格网格、行列定义的完整 graphicFrame 形状。
 * 若未指定列宽或行高，则平均分配可用空间。
 */
export function buildTable(
  shapeId: number,
  name: string,
  xfrm: Xfrm,
  table: TableDef,
): string {
  const id = shapeId;
  const colWidth = table.colWidths
    ? table.colWidths
    : Array(table.cols).fill(Math.round(xfrm.cx / table.cols));
  const rowHeight = table.rowHeights
    ? table.rowHeights
    : Array(table.rows).fill(Math.round(xfrm.cy / table.rows));

  // 构建表格列网格
  let gridXml = `<a:tblGrid>`;
  for (let c = 0; c < table.cols; c++) {
    gridXml += `<a:gridCol w="${Math.round(colWidth[c])}"><a:extLst><a:ext uri="{9D8B030D-6E8A-4147-A177-3AD203B41FA5}"><a16:colId xmlns:a16="http://schemas.microsoft.com/office/drawing/2014/main" val="${20000 + c}"/></a:ext></a:extLst></a:gridCol>`;
  }
  gridXml += `</a:tblGrid>`;

  // 构建表格行
  let rowsXml = "";
  for (let r = 0; r < table.rows; r++) {
    rowsXml += `<a:tr h="${Math.round(rowHeight[r])}">`;
    for (let c = 0; c < table.cols; c++) {
      const cell = table.cells.find((tc) => tc.row === r && tc.col === c);
      rowsXml += buildTableCell(cell, r, c, rowHeight[r], colWidth[c]);
    }
    rowsXml += `<a:extLst><a:ext uri="{0D108BD9-81ED-4DB2-BD59-A6C34878D82A}"><a16:rowId xmlns:a16="http://schemas.microsoft.com/office/drawing/2014/main" val="${10000 + r}"/></a:ext></a:extLst></a:tr>`;
  }

  return `<p:graphicFrame>
    <p:nvGraphicFramePr>
      <p:cNvPr id="${id}" name="${esc(name)}"/>
      <p:cNvGraphicFramePr><a:graphicFrameLocks noGrp="1"/></p:cNvGraphicFramePr>
      <p:nvPr/>
    </p:nvGraphicFramePr>
    <p:xfrm>
      <a:off x="${Math.round(xfrm.x)}" y="${Math.round(xfrm.y)}"/>
      <a:ext cx="${Math.round(xfrm.cx)}" cy="${Math.round(xfrm.cy)}"/>
    </p:xfrm>
    <a:graphic>
      <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/table">
        <a:tbl>
          <a:tblPr firstRow="1" bandRow="1"/>
          ${gridXml}
          ${rowsXml}
        </a:tbl>
      </a:graphicData>
    </a:graphic>
  </p:graphicFrame>`;
}

/**
 * 构建 a:tc 表格单元格节点
 *
 * 生成包含填充色、内边距、垂直对齐、边框和文本内容的
 * 单个表格单元格。
 */
function buildTableCell(
  cell: TableCellDef | undefined,
  row: number,
  col: number,
  h: number,
  w: number,
): string {
  const text = cell?.text || "";
  const align = mapParagraphAlign(cell?.hAlign || "left") || "l";
  const fontSize = cell?.fontSize || 11;
  const fontColor = cell?.fontColor || "000000";
  const cleanColor = fontColor.replace("#", "").toUpperCase();
  const fontFamily = cell?.fontFamily || "Arial";
  const isBold = cell?.fontWeight === 700 || cell?.fontWeight === "bold";

  const tcAttrs: string[] = [];
  if (cell?.rowSpan && cell.rowSpan > 1) tcAttrs.push(`rowSpan="${Math.round(cell.rowSpan)}"`);
  if (cell?.colSpan && cell.colSpan > 1) tcAttrs.push(`gridSpan="${Math.round(cell.colSpan)}"`);

  let tcPrChildren = "";
  if (cell?.fill) {
    const cleanFill = cell.fill.replace("#", "").toUpperCase();
    tcPrChildren += `<a:solidFill><a:srgbClr val="${esc(cleanFill)}"/></a:solidFill>`;
  }
  if (cell?.borderTop) tcPrChildren += buildCellBorder("lnT", cell.borderTop.width, cell.borderTop.color);
  if (cell?.borderBottom) tcPrChildren += buildCellBorder("lnB", cell.borderBottom.width, cell.borderBottom.color);
  if (cell?.borderLeft) tcPrChildren += buildCellBorder("lnL", cell.borderLeft.width, cell.borderLeft.color);
  if (cell?.borderRight) tcPrChildren += buildCellBorder("lnR", cell.borderRight.width, cell.borderRight.color);

  const tcOpen = tcAttrs.length > 0 ? `<a:tc ${tcAttrs.join(" ")}>` : "<a:tc>";
  const runXml = text
    ? `<a:r>
          <a:rPr sz="${Math.round(fontSize * 100)}" b="${isBold ? "1" : "0"}">
            <a:solidFill><a:srgbClr val="${esc(cleanColor)}"/></a:solidFill>
            <a:latin typeface="${esc(fontFamily)}"/>
            <a:ea typeface="${esc(fontFamily)}"/>
            <a:cs typeface="${esc(fontFamily)}"/>
          </a:rPr>
          <a:t>${esc(text)}</a:t>
        </a:r>`
    : "";

  return `${tcOpen}
    <a:txBody>
      <a:bodyPr/>
      <a:lstStyle/>
      <a:p>
        <a:pPr algn="${esc(align)}"/>
        ${runXml}
        <a:endParaRPr/>
      </a:p>
    </a:txBody>
    <a:tcPr marL="45720" marR="45720" marT="22860" marB="22860">
      ${tcPrChildren}
    </a:tcPr>
  </a:tc>`;
}

/**
 * Build a table cell border edge.
 */
function buildCellBorder(
  side: "lnT" | "lnB" | "lnL" | "lnR",
  width: number,
  color: string,
): string {
  const clean = color.replace("#", "").toUpperCase();
  return `<a:${side} w="${Math.round(width)}"><a:solidFill><a:srgbClr val="${esc(clean)}"/></a:solidFill></a:${side}>`;
}

// ---------------------------------------------------------------------------
// 幻灯片背景
// ---------------------------------------------------------------------------

/**
 * 构建 p:bg 幻灯片背景节点
 *
 * 通过关系 ID 引用背景图片，使用拉伸填充模式覆盖整个幻灯片。
 */
export function buildSlideBackground(bgRId: string): string {
  return `<p:bg>
    <p:bgPr>
      <a:blipFill dpi="0" rotWithShape="1">
        <a:blip r:embed="${esc(bgRId)}"/>
        <a:stretch><a:fillRect/></a:stretch>
      </a:blipFill>
      <a:effectLst/>
    </p:bgPr>
  </p:bg>`;
}
