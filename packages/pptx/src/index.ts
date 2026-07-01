/**
 * ─────────────────────────────────────────────
 * PPTX 模块入口 — HTP PPTX 对象模型定义与主写入接口
 *
 * 定义生成 .pptx 文件所需的中间表示（IR）数据结构，
 * 包括 Deck、Slide、文本框、表格、图片、动画与主题，
 * 并导出 writePptx() 作为外部调用的唯一入口。
 * 详见 docs/design-spec.md §11 完整设计文档。
 * ─────────────────────────────────────────────
 */

import { buildPptxZip } from "./zip";

// ---------------------------------------------------------------------------
// HTP PPTX 对象模型（中间表示层）
// ---------------------------------------------------------------------------

export interface HtpPptxDeck {
  width: number;   // 幻灯片宽度（英寸）
  height: number;  // 幻灯片高度（英寸）
  slides: HtpPptxSlide[];
  theme?: HtpPptxTheme;
}

export interface HtpPptxSlide {
  id: string;
  background?: HtpPptxImage;
  objects: HtpPptxObject[];
  animations?: HtpPptxAnimation[];
}

export type HtpPptxObject = HtpPptxTextBox | HtpPptxTable | HtpPptxImage;

export interface HtpPptxTextBox {
  type: "text-box";
  x: number; // 水平位置（英寸）
  y: number; // 垂直位置（英寸）
  w: number; // 宽度（英寸）
  h: number; // 高度（英寸）
  text: string;
  fontFamily?: string;
  fontSize?: number; // 字号（磅）
  fontWeight?: number | string;
  fontStyle?: "normal" | "italic";
  color?: string;    // 颜色（十六进制）
  textAlign?: "left" | "center" | "right" | "justify";
  lineHeight?: number;
}

export interface HtpPptxTable {
  type: "table";
  x: number; // 水平位置（英寸）
  y: number; // 垂直位置（英寸）
  w: number; // 宽度（英寸）
  h: number; // 高度（英寸）
  rows: number;
  cols: number;
  cells: HtpPptxTableCell[];
}

export interface HtpPptxTableCell {
  row: number;
  col: number;
  text: string;
  rowSpan?: number;
  colSpan?: number;
  fill?: string;      // 单元格填充色（十六进制）
  fontSize?: number;  // 字号（磅）
  fontColor?: string; // 字体颜色（十六进制）
  fontWeight?: number | string;
  hAlign?: "left" | "center" | "right";
  vAlign?: "top" | "middle" | "bottom";
}

export interface HtpPptxImage {
  type: "image";
  x: number; // 水平位置（英寸）
  y: number; // 垂直位置（英寸）
  w: number; // 宽度（英寸）
  h: number; // 高度（英寸）
  data: Buffer;
  mimeType?: "image/png" | "image/jpeg";
  altText?: string;
  opacity?: number;
}

export interface HtpPptxAnimation {
  nodeId: string;
  shapeId: number | string;
  effect: string;
  trigger?: "click" | "withPrevious" | "afterPrevious";
  duration?: number; // 持续时间（秒）
  delay?: number;    // 延迟时间（秒）
}

export interface HtpPptxTheme {
  name: string;
  colors?: Record<string, string>;
  fonts?: { major?: string; minor?: string };
}

// ---------------------------------------------------------------------------
// 主写入函数
// ---------------------------------------------------------------------------

export interface WritePptxOptions {
  deck: HtpPptxDeck;
}

/**
 * ─────────────────────────────────────────────
 * 从 Deck 对象模型生成完整的 .pptx 文件缓冲区
 *
 * 接收 HTP PPTX 中间表示（HtpPptxDeck），
 * 将其转换为符合 Office Open XML 规范的 ZIP 包，
 * 以 Node.js Buffer 形式返回，可直接写入磁盘。
 * ─────────────────────────────────────────────
 */
export async function writePptx(options: WritePptxOptions): Promise<Buffer> {
  return buildPptxZip(options.deck);
}
