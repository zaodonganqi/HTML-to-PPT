/**
 * ZIP 组装层 — 收集所有 XML 部件与二进制图片，产出 .pptx 缓冲区
 *
 * 将所有幻灯片数据、图片资源、关系文件和元数据组装为一个
 * 符合 Office Open XML 规范的 ZIP 包。
 * 负责图片全局索引分配、幻灯片对象到 DrawingML 的映射、
 * 以及动画时序 XML 的注入。
 */

import JSZip from "jszip";
import { buildContentTypes, buildContentTypeEntries } from "./xml/contentTypes";
import {
  buildRootRels,
  buildPresentationRels,
  buildSlideRelsWithImages,
  buildRels,
  REL_TYPE,
} from "./xml/rels";
import { buildCoreProps, buildAppProps } from "./xml/docProps";
import { buildPresentation } from "./xml/presentation";
import { buildSlide, SlideDef } from "./xml/slide";
import { buildSlideLayout } from "./xml/slideLayout";
import { buildSlideMaster } from "./xml/slideMaster";
import { buildTheme } from "./xml/theme";
import { buildTiming, TimingAnimationDef } from "./xml/animations";
import { inchToEmu } from "@htp/core";
import type { HtpPptxDeck } from "./index";

/**
 * 从 Deck 对象模型构建完整的 .pptx ZIP 缓冲区
 *
 * 收集所有 XML 部件（Content_Types、rels、docProps、presentation、
 * slides、masters、layouts、theme）和二进制图片数据，
 * 组装为一个标准的 Office Open XML ZIP 包。
 */
export async function buildPptxZip(deck: HtpPptxDeck): Promise<Buffer> {
  const zip = new JSZip();
  const slideCount = deck.slides.length;
  const themeCount = 1;

  // 收集图片并分配全局索引
  const allImages: { index: number; data: Buffer }[] = [];
  const slideImageMap: Map<number, number[]> = new Map();

  for (let si = 0; si < deck.slides.length; si++) {
    const slide = deck.slides[si];
    const imgIndices: number[] = [];

    // 幻灯片背景图片
    if (slide.background?.data) {
      const idx = allImages.length + 1;
      allImages.push({ index: idx, data: slide.background.data });
      imgIndices.push(idx);
    }

    // 幻灯片中的图片对象
    for (const obj of slide.objects) {
      if (obj.type === "image" && obj.data) {
        const idx = allImages.length + 1;
        allImages.push({ index: idx, data: obj.data });
        imgIndices.push(idx);
      }
    }

    slideImageMap.set(si, imgIndices);
  }

  // 1. [Content_Types].xml
  const ctEntries = buildContentTypeEntries(slideCount, allImages.length, themeCount);
  zip.file("[Content_Types].xml", buildContentTypes(ctEntries));

  // 2. _rels/.rels
  zip.folder("_rels")!.file(".rels", buildRootRels());

  // 3. docProps/
  zip.folder("docProps")!.file("core.xml", buildCoreProps());
  zip.folder("docProps")!.file("app.xml", buildAppProps());

  // 4. ppt/presentation.xml
  zip.folder("ppt")!.file("presentation.xml", buildPresentation(slideCount));

  // 5. ppt/_rels/presentation.xml.rels
  zip.folder("ppt")!.folder("_rels")!.file(
    "presentation.xml.rels",
    buildPresentationRels(slideCount, themeCount),
  );

  // 6. ppt/slideMasters/ + rels
  zip.folder("ppt")!.folder("slideMasters")!.file("slideMaster1.xml", buildSlideMaster());

  const masterRelsEntries = [
    { id: "rId1", type: REL_TYPE.SLIDE_LAYOUT, target: "../slideLayouts/slideLayout1.xml" },
  ];
  for (let i = 1; i <= themeCount; i++) {
    masterRelsEntries.push({
      id: `rId${10 + i}`,
      type: REL_TYPE.THEME,
      target: `../theme/theme${i}.xml`,
    });
  }
  zip.folder("ppt")!.folder("slideMasters")!.folder("_rels")!.file(
    "slideMaster1.xml.rels",
    buildRels(masterRelsEntries),
  );

  // 7. ppt/slideLayouts/
  zip.folder("ppt")!.folder("slideLayouts")!.file("slideLayout1.xml", buildSlideLayout());

  // 8. ppt/theme/
  zip.folder("ppt")!.folder("theme")!.file("theme1.xml", buildTheme());

  // 9. ppt/media/ — 全部图片
  if (allImages.length > 0) {
    const mediaFolder = zip.folder("ppt")!.folder("media")!;
    for (const img of allImages) {
      mediaFolder.file(`image${img.index}.png`, img.data);
    }
  }

  // 10. ppt/slides/ — 每张幻灯片及其关系文件
  const slidesFolder = zip.folder("ppt")!.folder("slides")!;

  for (let si = 0; si < deck.slides.length; si++) {
    const deckSlide = deck.slides[si];
    const globalImgIndices = slideImageMap.get(si) || [];

    // 将幻灯片中的图片映射到 rId：rId1 = 布局，rId2+ = 图片
    let nextRId = 2;
    const bgRId = deckSlide.background ? `rId${nextRId++}` : undefined;

    const slideObjects: SlideDef["objects"] = [];
    let shapeId = 2;

    for (const obj of deckSlide.objects) {
      switch (obj.type) {
        case "text-box": {
          const { text, fontFamily, fontSize, fontWeight, fontStyle, color, textAlign } = obj;
          const isBold = fontWeight === 700 || fontWeight === "bold";
          const isItalic = fontStyle === "italic";

          const paragraphs = text.split("\n").map((line) => ({
            runs: [
              {
                text: line,
                bold: isBold,
                italic: isItalic,
                fontSize: fontSize,
                color: color,
                fontFamily: fontFamily,
              },
            ],
            align: textAlign as "left" | "center" | "right" | "justify" | undefined,
          }));

          slideObjects.push({
            kind: "text",
            shapeId: shapeId++,
            name: obj.text.substring(0, 30) || "Text",
            xfrm: {
              x: inchToEmu(obj.x),
              y: inchToEmu(obj.y),
              cx: inchToEmu(obj.w),
              cy: inchToEmu(obj.h),
            },
            paragraphs,
          });
          break;
        }

        case "image": {
          const imgRId = `rId${nextRId++}`;
          slideObjects.push({
            kind: "image",
            shapeId: shapeId++,
            name: "Image",
            xfrm: {
              x: inchToEmu(obj.x),
              y: inchToEmu(obj.y),
              cx: inchToEmu(obj.w),
              cy: inchToEmu(obj.h),
            },
            rId: imgRId,
          });
          break;
        }

        case "table": {
          slideObjects.push({
            kind: "table",
            shapeId: shapeId++,
            name: "Table",
            xfrm: {
              x: inchToEmu(obj.x),
              y: inchToEmu(obj.y),
              cx: inchToEmu(obj.w),
              cy: inchToEmu(obj.h),
            },
            table: {
              rows: obj.rows,
              cols: obj.cols,
              cells: obj.cells.map((c) => ({
                row: c.row,
                col: c.col,
                text: c.text,
                rowSpan: c.rowSpan,
                colSpan: c.colSpan,
                fill: c.fill,
                fontSize: c.fontSize,
                fontColor: c.fontColor,
                fontWeight: c.fontWeight,
                hAlign: c.hAlign,
                vAlign: c.vAlign,
              })),
            },
          });
          break;
        }
      }
    }

    // 存在动画时生成时序 XML
    let timingXml: string | undefined;
    if (deckSlide.animations && deckSlide.animations.length > 0) {
      const timingDefs: TimingAnimationDef[] = deckSlide.animations.map((a) => ({
        shapeId: typeof a.shapeId === "string" ? parseInt(a.shapeId, 10) : a.shapeId,
        effect: a.effect,
        trigger: a.trigger,
        duration: a.duration,
        delay: a.delay,
      }));
      timingXml = buildTiming(timingDefs);
    }

    const slideXml = buildSlide({
      objects: slideObjects,
      bgRId,
      timingXml,
    });

    slidesFolder.file(`slide${si + 1}.xml`, slideXml);

    // 幻灯片关系文件
    slidesFolder.folder("_rels")!.file(
      `slide${si + 1}.xml.rels`,
      buildSlideRelsWithImages(globalImgIndices),
    );
  }

  // 生成 ZIP 缓冲区
  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
  return buffer;
}
