/**
 * XML 构建工具 — PPTX 生成所需的命名空间、转义与标签助手
 *
 * Office Open XML 使用多个命名空间，本模块集中定义并提供
 * XML 标签构造、属性转义、自闭合标签等基础工具函数。
 * 所有其他 XML 生成模块均依赖此模块。
 */

// OOXML 命名空间常量
export const NS = {
  a: "http://schemas.openxmlformats.org/drawingml/2006/main",
  r: "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
  p: "http://schemas.openxmlformats.org/presentationml/2006/main",
  p14: "http://schemas.microsoft.com/office/powerpoint/2010/main",
  mc: "http://schemas.openxmlformats.org/markup-compatibility/2006",
  dgm: "http://schemas.openxmlformats.org/drawingml/2006/diagram",
  pic: "http://schemas.openxmlformats.org/drawingml/2006/picture",
};

/**
 * 对字符串进行 XML 实体转义
 *
 * 将 &、<、>、"、' 替换为对应的 XML 实体引用，
 * 防止属性值或文本内容中的特殊字符破坏 XML 结构。
 */
export function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * 构建 XML 标签（含属性和可选文本内容）
 *
 * 根据属性字典和可选内容生成 XML 标签字符串。
 * 若无内容则生成自闭合形式。
 */
export function tag(
  name: string,
  attrs: Record<string, string | number | undefined> = {},
  content?: string,
): string {
  const attrStr = Object.entries(attrs)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}="${esc(String(v))}"`)
    .join(" ");

  const open = attrStr ? `<${name} ${attrStr}>` : `<${name}>`;

  if (content !== undefined) {
    return `${open}${content}</${name}>`;
  }
  return `${open}</${name}>`;
}

/**
 * 构建自闭合 XML 标签
 *
 * 生成 <name attr="val"/> 形式的自闭合标签，
 * 适用于无子元素或文本内容的节点。
 */
export function tagEmpty(
  name: string,
  attrs: Record<string, string | number | undefined> = {},
): string {
  const attrStr = Object.entries(attrs)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}="${esc(String(v))}"`)
    .join(" ");

  return attrStr ? `<${name} ${attrStr}/>` : `<${name}/>`;
}

/**
 * 构建 XML 开标签
 *
 * 仅返回开标签部分（不含闭合），
 * 便于手动拼接嵌套子元素内容。
 */
export function tagOpen(
  name: string,
  attrs: Record<string, string | number | undefined> = {},
): string {
  const attrStr = Object.entries(attrs)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}="${esc(String(v))}"`)
    .join(" ");
  return attrStr ? `<${name} ${attrStr}>` : `<${name}>`;
}

/**
 * 构建 XML 闭合标签
 *
 * 返回 </name> 形式的闭合标签。
 */
export function tagClose(name: string): string {
  return `</${name}>`;
}

/**
 * 根据关系索引生成 rId 属性值
 *
 * PPTX 内部使用 rIdN 格式的关系标识符，
 * 此函数将数字索引转换为标准 rId 字符串。
 */
export function rId(index: number): string {
  return `rId${index}`;
}

/**
 * 将 EMU 单位转换为英寸字符串
 *
 * DrawingML 使用 EMU（English Metric Unit）作为坐标单位，
 * 1 英寸 = 914400 EMU。此函数用于 a:xfrm off/ext 属性。
 */
export function emuToInchesStr(emu: number): string {
  return (emu / 914400).toFixed(6);
}
