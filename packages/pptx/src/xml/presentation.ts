/**
 * ppt/presentation.xml 生成器
 *
 * 生成演示文稿的主 XML 文件，定义幻灯片列表、
 * 母版引用、幻灯片尺寸和备注页尺寸。
 */

import { NS } from "./builder";

/**
 * 根据幻灯片数量生成 presentation.xml
 *
 * 为每张幻灯片分配唯一的 sldId，引用演示文稿关系文件中的
 * 幻灯片 rId，并设置默认的 16:9 幻灯片尺寸。
 */
export function buildPresentation(slideCount: number): string {
  const slideEntries: string[] = [];
  for (let i = 1; i <= slideCount; i++) {
    slideEntries.push(
      `  <p:sldId id="${256 + i}" r:id="rId${100 + i}"/>`,
    );
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation
  xmlns:a="${NS.a}"
  xmlns:r="${NS.r}"
  xmlns:p="${NS.p}"
  embedTrueTypeFonts="0"
  saveSubsetFonts="0">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rId1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
${slideEntries.join("\n")}
  </p:sldIdLst>
  <p:sldSz cx="${Math.round(13.333 * 914400)}" cy="${Math.round(7.5 * 914400)}"/>
  <p:notesSz cx="${Math.round(13.333 * 914400)}" cy="${Math.round(7.5 * 914400)}"/>
</p:presentation>`;
}
