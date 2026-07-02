/**
 * 关系文件 (.rels) 生成器
 *
 * 生成 PPTX 包内各级 _rels 目录下的 .rels 文件，
 * 包括根级关系、演示文稿关系、幻灯片图片关系等。
 * 定义所有 OOXML 关系类型常量。
 */

import { esc } from "./builder";

/** 关系条目，描述一个 Relationship 节点的 Id / Type / Target */
export interface RelsEntry {
  id: string;
  type: string;
  target: string;
  targetMode?: "External";
}

// 关系文件命名空间
const RELS_XMLNS = "http://schemas.openxmlformats.org/package/2006/relationships";

/**
 * 根据关系条目列表生成完整的 .rels XML 字符串
 *
 * 输出标准的 OPC Relationships XML，每个条目对应一个
 * <Relationship> 节点，包含 Id、Type、Target 属性。
 */
export function buildRels(entries: RelsEntry[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += `<Relationships xmlns="${RELS_XMLNS}">\n`;

  for (const e of entries) {
    const modeAttr = e.targetMode ? ` TargetMode="${esc(e.targetMode)}"` : "";
    xml += `  <Relationship Id="${esc(e.id)}" Type="${esc(e.type)}" Target="${esc(e.target)}"${modeAttr}/>\n`;
  }

  xml += "</Relationships>";
  return xml;
}

// OOXML 关系类型常量
export const REL_TYPE = {
  OFFICE_DOC: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument",
  SLIDE: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide",
  SLIDE_MASTER: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster",
  SLIDE_LAYOUT: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout",
  THEME: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme",
  IMAGE: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
  CORE_PROPS: "http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties",
  EXT_PROPS: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties",
};

/**
 * 生成根级 .rels 文件内容
 *
 * 包含指向 presentation.xml、core.xml 和 app.xml 三个
 * 顶层部件的关系引用。
 */
export function buildRootRels(): string {
  return buildRels([
    { id: "rId1", type: REL_TYPE.OFFICE_DOC, target: "ppt/presentation.xml" },
    { id: "rId2", type: REL_TYPE.CORE_PROPS, target: "docProps/core.xml" },
    { id: "rId3", type: REL_TYPE.EXT_PROPS, target: "docProps/app.xml" },
  ]);
}

/**
 * 生成演示文稿级关系文件 (ppt/_rels/presentation.xml.rels)
 *
 * 包含所有幻灯片、幻灯片母版、幻灯片布局和主题的关系引用。
 */
export function buildPresentationRels(
  slideCount: number,
  themeCount: number,
): string {
  const entries: RelsEntry[] = [];

  for (let i = 1; i <= slideCount; i++) {
    entries.push({
      id: `rId${100 + i}`,
      type: REL_TYPE.SLIDE,
      target: `slides/slide${i}.xml`,
    });
  }

  entries.push({
    id: "rId1",
    type: REL_TYPE.SLIDE_MASTER,
    target: "slideMasters/slideMaster1.xml",
  });

  entries.push({
    id: "rId2",
    type: REL_TYPE.SLIDE_LAYOUT,
    target: "slideLayouts/slideLayout1.xml",
  });

  for (let i = 1; i <= themeCount; i++) {
    entries.push({
      id: `rId${200 + i}`,
      type: REL_TYPE.THEME,
      target: `theme/theme${i}.xml`,
    });
  }

  return buildRels(entries);
}

/**
 * 生成幻灯片级关系文件（按图片数量）
 *
 * 为单个幻灯片生成包含布局引用和图片引用的 .rels 文件。
 */
export function buildSlideRels(imageCount: number): string {
  const entries: RelsEntry[] = [];

  entries.push({
    id: "rId1",
    type: REL_TYPE.SLIDE_LAYOUT,
    target: "../slideLayouts/slideLayout1.xml",
  });

  for (let i = 1; i <= imageCount; i++) {
    entries.push({
      id: `rId${i + 1}`,
      type: REL_TYPE.IMAGE,
      target: `../media/image${i}.png`,
    });
  }

  return buildRels(entries);
}

/**
 * 生成幻灯片级关系文件（按全局图片索引）
 *
 * 根据全局图片索引数组生成每个幻灯片的 .rels 文件，
 * 支持跨幻灯片共享图片引用。
 */
export function buildSlideRelsWithImages(
  imageIndices: number[],
): string {
  const entries: RelsEntry[] = [
    { id: "rId1", type: REL_TYPE.SLIDE_LAYOUT, target: "../slideLayouts/slideLayout1.xml" },
  ];

  imageIndices.forEach((globalImgIdx, i) => {
    entries.push({
      id: `rId${i + 2}`,
      type: REL_TYPE.IMAGE,
      target: `../media/image${globalImgIdx}.png`,
    });
  });

  return buildRels(entries);
}
