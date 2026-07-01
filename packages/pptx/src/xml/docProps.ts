/**
 * ─────────────────────────────────────────────
 * 文档属性生成器 — docProps/core.xml 与 docProps/app.xml
 *
 * 生成 PPTX 包所需的 Dublin Core 元数据和扩展属性文件。
 * 包括标题、创建者、创建/修改时间等标准元信息。
 * ─────────────────────────────────────────────
 */

import { esc } from "./builder";

/**
 * ─────────────────────────────────────────────
 * 生成 docProps/core.xml（Dublin Core 元数据）
 *
 * 包含标题、创建者、最后修改者以及创建/修改时间戳。
 * 默认标题为 "HTP Presentation"，默认创建者为 "HTP"。
 * ─────────────────────────────────────────────
 */
export function buildCoreProps(opts?: {
  title?: string;
  creator?: string;
  created?: string;
  modified?: string;
}): string {
  const now = new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties
  xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:dcmitype="http://purl.org/dc/dcmitype/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${esc(opts?.title || "HTP Presentation")}</dc:title>
  <dc:creator>${esc(opts?.creator || "HTP")}</dc:creator>
  <cp:lastModifiedBy>${esc(opts?.creator || "HTP")}</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${esc(opts?.created || now)}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${esc(opts?.modified || now)}</dcterms:modified>
</cp:coreProperties>`;
}

/**
 * ─────────────────────────────────────────────
 * 生成 docProps/app.xml（扩展属性）
 *
 * 包含应用程序名称和版本号信息。
 * ─────────────────────────────────────────────
 */
export function buildAppProps(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
  xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>HTP - HTML To PowerPoint</Application>
  <AppVersion>0.0.1</AppVersion>
</Properties>`;
}
