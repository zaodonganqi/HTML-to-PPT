/**
 * ─────────────────────────────────────────────
 * ppt/slides/slide{N}.xml 生成器
 *
 * 为单张幻灯片构建完整的 p:sld XML，包括形状树、
 * 背景图片和动画时序节点。接收上层组装的 SlideDef 定义，
 * 将其中的文本、图片、表格对象转换为对应的 DrawingML 片段。
 * ─────────────────────────────────────────────
 */

import { NS, esc } from "./builder";
import {
  Xfrm,
  ParagraphDef,
  TableDef,
  buildTextBox,
  buildTable,
  buildPic,
  buildSlideBackground,
} from "./drawing";

// ---------------------------------------------------------------------------
// 幻灯片形状信息（由导出层传入）
// ---------------------------------------------------------------------------

/** 文本形状定义 */
export interface SlideObjectText {
  kind: "text";
  shapeId: number;
  name: string;
  xfrm: Xfrm;
  paragraphs: ParagraphDef[];
}

/** 图片形状定义 */
export interface SlideObjectImage {
  kind: "image";
  shapeId: number;
  name: string;
  xfrm: Xfrm;
  rId: string;   // 关系 ID，如 "rId2"
}

/** 表格形状定义 */
export interface SlideObjectTable {
  kind: "table";
  shapeId: number;
  name: string;
  xfrm: Xfrm;
  table: TableDef;
}

/** 幻灯片形状联合类型 */
export type SlideObject = SlideObjectText | SlideObjectImage | SlideObjectTable;

/** 幻灯片构建定义 */
export interface SlideDef {
  objects: SlideObject[];
  bgRId?: string;    // 背景图片关系 ID
  timingXml?: string; // 动画时序 XML（插入到 spTree 之后）
}

// ---------------------------------------------------------------------------
// 构建完整幻灯片 XML
// ---------------------------------------------------------------------------

/**
 * ─────────────────────────────────────────────
 * 根据 SlideDef 构建单张幻灯片的完整 XML
 *
 * 组装 p:sld 根节点，包含形状树（spTree）、背景和
 * 动画时序节点。遍历 objects 数组将每个形状分发到
 * 对应的 DrawingML 构建函数。
 * ─────────────────────────────────────────────
 */
export function buildSlide(slide: SlideDef): string {
  const shapeIdCounter = slide.objects.length > 0
    ? Math.max(...slide.objects.map((o) => o.shapeId))
    : 1;

  let spTree = `<p:spTree>`;
  spTree += `<p:nvGrpSpPr>
    <p:cNvPr id="1" name=""/>
    <p:cNvGrpSpPr/>
    <p:nvPr/>
  </p:nvGrpSpPr>`;
  spTree += `<p:grpSpPr>
    <a:xfrm>
      <a:off x="0" y="0"/>
      <a:ext cx="0" cy="0"/>
      <a:chOff x="0" y="0"/>
      <a:chExt cx="0" cy="0"/>
    </a:xfrm>
  </p:grpSpPr>`;

  for (const obj of slide.objects) {
    switch (obj.kind) {
      case "text":
        spTree += buildTextBox(obj.shapeId, obj.name, obj.xfrm, obj.paragraphs);
        break;
      case "image":
        spTree += buildPic(obj.shapeId, obj.name, obj.xfrm, obj.rId);
        break;
      case "table":
        spTree += buildTable(obj.shapeId, obj.name, obj.xfrm, obj.table);
        break;
    }
  }

  spTree += `</p:spTree>`;

  // 幻灯片背景
  const bgXml = slide.bgRId ? buildSlideBackground(slide.bgRId) : "";

  // 动画时序
  const timingXml = slide.timingXml || "";

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="${NS.a}" xmlns:r="${NS.r}" xmlns:p="${NS.p}">
  <p:cSld>
    ${bgXml}
    ${spTree}
  </p:cSld>
  ${timingXml}
</p:sld>`;
}
