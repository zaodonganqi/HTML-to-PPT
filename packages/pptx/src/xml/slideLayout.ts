/**
 * ─────────────────────────────────────────────
 * ppt/slideLayouts/slideLayout1.xml 生成器 — 最小空白布局
 *
 * 生成一个类型为 "blank" 的最小化幻灯片布局 XML，
 * 包含空形状树，供幻灯片引用。
 * ─────────────────────────────────────────────
 */

import { NS } from "./builder";

/**
 * ─────────────────────────────────────────────
 * 构建最小空白幻灯片布局 XML
 *
 * 返回一个 type="blank" 的 p:sldLayout，
 * 仅包含空的 spTree 结构，不预设任何占位符。
 * ─────────────────────────────────────────────
 */
export function buildSlideLayout(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="${NS.a}" xmlns:r="${NS.r}" xmlns:p="${NS.p}"
  type="blank" preserve="1">
  <p:cSld name="Blank">
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
</p:sldLayout>`;
}
