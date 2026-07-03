/**
 * docProps XML builders.
 */

import { esc } from "./builder";

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
  <cp:revision>1</cp:revision>
  <dcterms:created xsi:type="dcterms:W3CDTF">${esc(opts?.created || now)}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${esc(opts?.modified || now)}</dcterms:modified>
</cp:coreProperties>`;
}

export function buildAppProps(slideCount = 0): string {
  const presentationFormat = "\u5bbd\u5c4f";
  const fontHeading = "\u5df2\u7528\u7684\u5b57\u4f53";
  const themeHeading = "\u4e3b\u9898";
  const slideTitleHeading = "\u5e7b\u706f\u7247\u6807\u9898";
  const slideTitle = "PowerPoint \u6f14\u793a\u6587\u7a3f";
  const slideTitles = Array.from({ length: slideCount }, () => slideTitle);
  const titleParts = ["Arial", "HTP Default Theme", ...slideTitles];
  const titlesXml = titleParts.map((title) => `      <vt:lpstr>${esc(title)}</vt:lpstr>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
  xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <TotalTime>0</TotalTime>
  <Words>0</Words>
  <Application>Microsoft Office PowerPoint</Application>
  <PresentationFormat>${presentationFormat}</PresentationFormat>
  <Paragraphs>0</Paragraphs>
  <Slides>${slideCount}</Slides>
  <Notes>0</Notes>
  <HiddenSlides>0</HiddenSlides>
  <MMClips>0</MMClips>
  <ScaleCrop>false</ScaleCrop>
  <HeadingPairs>
    <vt:vector size="6" baseType="variant">
      <vt:variant><vt:lpstr>${fontHeading}</vt:lpstr></vt:variant>
      <vt:variant><vt:i4>1</vt:i4></vt:variant>
      <vt:variant><vt:lpstr>${themeHeading}</vt:lpstr></vt:variant>
      <vt:variant><vt:i4>1</vt:i4></vt:variant>
      <vt:variant><vt:lpstr>${slideTitleHeading}</vt:lpstr></vt:variant>
      <vt:variant><vt:i4>${slideCount}</vt:i4></vt:variant>
    </vt:vector>
  </HeadingPairs>
  <TitlesOfParts>
    <vt:vector size="${titleParts.length}" baseType="lpstr">
${titlesXml}
    </vt:vector>
  </TitlesOfParts>
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>16.0000</AppVersion>
</Properties>`;
}
