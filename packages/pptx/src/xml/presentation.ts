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
      `  <p:sldId id="${256 + i}" r:id="rId${i + 1}"/>`,
    );
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation
  xmlns:a="${NS.a}"
  xmlns:r="${NS.r}"
  xmlns:p="${NS.p}">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rId1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
${slideEntries.join("\n")}
  </p:sldIdLst>
  <p:sldSz cx="12192000" cy="6858000"/>
  <p:notesSz cx="12192000" cy="6858000"/>
  <p:defaultTextStyle>
    <a:defPPr>
      <a:defRPr lang="zh-CN"/>
    </a:defPPr>
    <a:lvl1pPr marL="0" algn="l" defTabSz="914400" rtl="0" eaLnBrk="1" latinLnBrk="0" hangingPunct="1">
      <a:defRPr sz="1800" kern="1200">
        <a:solidFill><a:schemeClr val="tx1"/></a:solidFill>
        <a:latin typeface="+mn-lt"/><a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/>
      </a:defRPr>
    </a:lvl1pPr>
  </p:defaultTextStyle>
  <p:extLst>
    <p:ext uri="{EFAFB233-063F-42B5-8137-9DF3F51BA10A}">
      <p15:sldGuideLst xmlns:p15="http://schemas.microsoft.com/office/powerpoint/2012/main"/>
    </p:ext>
  </p:extLst>
</p:presentation>`;
}

export function buildPresProps(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentationPr xmlns:a="${NS.a}" xmlns:r="${NS.r}" xmlns:p="${NS.p}">
  <p:extLst>
    <p:ext uri="{E76CE94A-603C-4142-B9EB-6D1370010A27}">
      <p14:discardImageEditData xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" val="0"/>
    </p:ext>
    <p:ext uri="{D31A062A-798A-4329-ABDD-BBA856620510}">
      <p14:defaultImageDpi xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" val="32767"/>
    </p:ext>
    <p:ext uri="{FD5EFAAD-0ECE-453E-9831-46B23BE46B34}">
      <p15:chartTrackingRefBased xmlns:p15="http://schemas.microsoft.com/office/powerpoint/2012/main" val="1"/>
    </p:ext>
  </p:extLst>
</p:presentationPr>`;
}

export function buildViewProps(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:viewPr xmlns:a="${NS.a}" xmlns:r="${NS.r}" xmlns:p="${NS.p}">
  <p:normalViewPr>
    <p:restoredLeft sz="14995" autoAdjust="0"/>
    <p:restoredTop sz="94660"/>
  </p:normalViewPr>
  <p:slideViewPr>
    <p:cSldViewPr snapToGrid="0">
      <p:cViewPr varScale="1">
        <p:scale><a:sx n="81" d="100"/><a:sy n="81" d="100"/></p:scale>
        <p:origin x="754" y="67"/>
      </p:cViewPr>
      <p:guideLst/>
    </p:cSldViewPr>
  </p:slideViewPr>
  <p:notesTextViewPr>
    <p:cViewPr>
      <p:scale><a:sx n="1" d="1"/><a:sy n="1" d="1"/></p:scale>
      <p:origin x="0" y="0"/>
    </p:cViewPr>
  </p:notesTextViewPr>
  <p:gridSpacing cx="72008" cy="72008"/>
</p:viewPr>`;
}

export function buildTableStyles(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:tblStyleLst xmlns:a="${NS.a}" def="{5C22544A-7EE6-4342-B048-85BDC9FD1C3A}"/>`;
}
