/**
 * ─────────────────────────────────────────────
 * [Content_Types].xml 生成器
 *
 * 根据幻灯片、图片和主题的数量生成 OOXML 包所需的
 * Content_Types.xml 内容，定义每个部件的 MIME 类型映射。
 * ─────────────────────────────────────────────
 */

import { esc } from "./builder";

/** 内容类型条目，描述 ZIP 包中某个部件的 PartName 与 ContentType */
export interface ContentTypeEntry {
  part: string;
  type: string;
}

/**
 * ─────────────────────────────────────────────
 * 根据内容类型条目列表生成完整的 [Content_Types].xml
 *
 * 包含默认扩展名映射（rels、xml、png、jpeg、jpg），
 * 以及调用方传入的 Override 条目。
 * ─────────────────────────────────────────────
 */
export function buildContentTypes(entries: ContentTypeEntry[]): string {
  const defaults = [
    { ext: "rels", type: "application/vnd.openxmlformats-package.relationships+xml" },
    { ext: "xml", type: "application/xml" },
    { ext: "png", type: "image/png" },
    { ext: "jpeg", type: "image/jpeg" },
    { ext: "jpg", type: "image/jpeg" },
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n';

  for (const d of defaults) {
    xml += `  <Default Extension="${esc(d.ext)}" ContentType="${esc(d.type)}"/>\n`;
  }

  for (const e of entries) {
    xml += `  <Override PartName="${esc(e.part)}" ContentType="${esc(e.type)}"/>\n`;
  }

  xml += "</Types>";
  return xml;
}

/**
 * ─────────────────────────────────────────────
 * 为指定数量的幻灯片构建 ContentType 条目列表
 *
 * 根据 slideCount、imageCount、themeCount 生成所有部件的
 * ContentType 映射条目，供 buildContentTypes() 使用。
 * ─────────────────────────────────────────────
 */
export function buildContentTypeEntries(
  slideCount: number,
  imageCount: number,
  themeCount: number,
): ContentTypeEntry[] {
  const entries: ContentTypeEntry[] = [];

  entries.push({
    part: "/ppt/presentation.xml",
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml",
  });

  for (let i = 1; i <= slideCount; i++) {
    entries.push({
      part: `/ppt/slides/slide${i}.xml`,
      type: "application/vnd.openxmlformats-officedocument.presentationml.slide+xml",
    });
  }

  entries.push({
    part: "/ppt/slideMasters/slideMaster1.xml",
    type: "application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml",
  });

  entries.push({
    part: "/ppt/slideLayouts/slideLayout1.xml",
    type: "application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml",
  });

  for (let i = 1; i <= themeCount; i++) {
    entries.push({
      part: `/ppt/theme/theme${i}.xml`,
      type: "application/vnd.openxmlformats-officedocument.theme+xml",
    });
  }

  for (let i = 1; i <= imageCount; i++) {
    const isPng = true; // 默认使用 PNG 格式
    entries.push({
      part: `/ppt/media/image${i}.${isPng ? "png" : "jpeg"}`,
      type: isPng ? "image/png" : "image/jpeg",
    });
  }

  return entries;
}
