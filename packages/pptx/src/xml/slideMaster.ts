/**
 * ppt/slideMasters/slideMaster1.xml 生成器 — 最小空白母版
 *
 * 生成一个最小化的幻灯片母版 XML，包含默认背景、
 * 颜色映射和指向空白布局的关系引用。
 */

import { NS } from "./builder";

/**
 * 构建最小幻灯片母版 XML
 *
 * 返回包含默认白色背景（bg1）、标准颜色映射（clrMap）
 * 和指向 slideLayout1 的关系引用的 p:sldMaster 文档。
 */
export function buildSlideMaster(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="${NS.a}" xmlns:r="${NS.r}" xmlns:p="${NS.p}">
  <p:cSld>
    <p:bg>
      <p:bgRef idx="1001">
        <a:schemeClr val="bg1"/>
      </p:bgRef>
    </p:bg>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2"
    accent1="accent1" accent2="accent2" accent3="accent3"
    accent4="accent4" accent5="accent5" accent6="accent6"
    hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst>
    <p:sldLayoutId id="2147483649" r:id="rId1"/>
  </p:sldLayoutIdLst>
</p:sldMaster>`;
}
