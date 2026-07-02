/**
 * @htp/core — 共享类型定义、常量与工具函数
 *
 * 本模块是整个 HTP 项目的基础层，零外部依赖，仅包含纯 TypeScript 代码。
 * 主要职责包括：
 * - Manifest 相关类型定义（幻灯片、节点、动画、资源）
 * - 配置类型与默认值
 * - 警告码常量
 * - EMU / 英寸 / 像素 / 点 等长度单位的换算工具
 * - CSS 颜色解析（命名颜色、十六进制、rgb、hsl）
 * - CSS font-family 解析
 * - CSS 选择器路径构造
 * - 对象深度合并
 * - HTP 动画效果 → PowerPoint MsoAnimEffect 映射表
 *
 * 详细设计参见 docs/design-spec.md
 */

// ---------------------------------------------------------------------------
// Manifest 类型定义
// ---------------------------------------------------------------------------

/** HTP Manifest — 描述一次导出操作中所有幻灯片、节点与动画的顶层结构 */
export interface HtpManifest {
  /** 清单格式版本号 */
  version: string;
  /** 创建时间（ISO 8601 字符串），可选 */
  createdAt?: string;
  /** 幻灯片画布配置 */
  deck: DeckOptions;
  /** 幻灯片列表 */
  slides: HtpSlideNode[];
  /** 可编辑节点列表（文本、表格、图片、回退区域） */
  nodes: HtpNode[];
  /** 动画列表 */
  animations: HtpAnimation[];
  /** 外部资源列表（图片、视频、字体等），可选 */
  assets?: HtpAsset[];
}

/** 幻灯片画布尺寸与布局配置 */
export interface DeckOptions {
  /** 画布宽度 */
  width: number;
  /** 画布高度 */
  height: number;
  /** 尺寸单位 */
  unit: "in" | "cm" | "px";
  /** 预设布局类型，可选 */
  layout?: "LAYOUT_WIDE" | "LAYOUT_STANDARD" | "LAYOUT_CUSTOM";
}

/** 幻灯片节点 — 描述单个幻灯片元素及其 CSS 选择器 */
export interface HtpSlideNode {
  /** 幻灯片唯一标识符 */
  id: string;
  /** CSS 选择器，用于在 DOM 中定位幻灯片元素 */
  selector: string;
  /** 所属的 scope ID（多实例隔离），可选 */
  scopeId?: string;
  /** 幻灯片排序序号，可选 */
  order?: number;
}

/** 可编辑节点 — 描述幻灯片中的文本、表格、图片或回退区域 */
export interface HtpNode {
  /** 节点唯一标识符 */
  id: string;
  /** 节点类型 */
  type: HtpNodeType;
  /** CSS 选择器，用于在 DOM 中定位该节点 */
  selector: string;
  /** 所属幻灯片 ID */
  slideId: string;
  /** 所属的 scope ID（多实例隔离），可选 */
  scopeId?: string;
  /** 是否可编辑（默认 true），可选 */
  editable?: boolean;
  /** 文本导出模式（"editable" 为可编辑文本，"image" 为截图，"both" 为两者）*/
  textMode?: "editable" | "image" | "both";
}

/** 节点类型枚举 */
export type HtpNodeType = "slide" | "text" | "table" | "image" | "fallback";

/** 动画描述 — 将一个 HTP 动画效果绑定到某个节点 */
export interface HtpAnimation {
  /** 绑定到的节点 ID */
  nodeId: string;
  /** 动画效果名称 */
  effect: HtpAnimationEffect;
  /** 触发方式：点击 / 与上一项同时 / 上一项之后 */
  trigger?: "click" | "withPrevious" | "afterPrevious";
  /** 持续时长（毫秒） */
  duration?: number;
  /** 延迟时间（毫秒） */
  delay?: number;
  /** 缓动函数 */
  easing?: "linear" | "easeIn" | "easeOut" | "easeInOut";
  /** 排序序号，可选 */
  order?: number;
  /** 动画起始关键帧（可选） */
  from?: Partial<AnimationKeyframe>;
  /** 动画结束关键帧（可选） */
  to?: Partial<AnimationKeyframe>;
  /** 降级策略：native → PPTX 原生动画 / video → 导出视频 / none → 忽略 */
  fallback?: "native" | "video" | "none";
}

/** HTP 支持的动画效果名称 */
export type HtpAnimationEffect =
  | "appear"
  | "fade"
  | "fly-left"
  | "fly-right"
  | "fly-up"
  | "fly-down"
  | "zoom-in"
  | "zoom-out"
  | "grow"
  | "shrink"
  | "spin"
  | "wipe-left"
  | "wipe-right"
  | "wipe-up"
  | "wipe-down"
  | "motion-line";

/** 动画关键帧 — 描述元素在某一时刻的几何与视觉效果 */
export interface AnimationKeyframe {
  /** X 轴偏移 */
  x: number;
  /** Y 轴偏移 */
  y: number;
  /** 缩放比例 */
  scale: number;
  /** 旋转角度（度） */
  rotate: number;
  /** 不透明度（0–1） */
  opacity: number;
}

/** 外部资源描述 */
export interface HtpAsset {
  /** 资源唯一标识符 */
  id: string;
  /** 资源类型 */
  type: "image" | "video" | "font";
  /** 资源路径 */
  src: string;
  /** MIME 类型，可选 */
  mimeType?: string;
}

// ---------------------------------------------------------------------------
// 配置类型与默认值
// ---------------------------------------------------------------------------

/** DOM 标记属性配置 */
export interface MarkerConfig {
  /** 元素类型标记属性名（例如 "htp"，产生 htp="text" 这样的属性） */
  typeAttr: string;
  /** Scope 隔离标记属性名 */
  scopeAttr: string;
}

/** 全局 window 对象的键名配置 */
export interface GlobalsConfig {
  /** 存储 manifest JSON 的全局变量名 */
  manifest: string;
  /** 就绪信号全局变量名 */
  ready: string;
}

/** HTP 完整运行时配置 */
export interface HtpConfig {
  /** DOM 标记属性配置 */
  marker: MarkerConfig;
  /** 全局 window 对象的键名配置 */
  globals: GlobalsConfig;
}

// 默认配置常量（可通过 htp.configure() 覆盖）
export const DEFAULT_CONFIG: HtpConfig = {
  marker: {
    typeAttr: "htp",
    scopeAttr: "htp-scope",
  },
  globals: {
    manifest: "__HTP_MANIFEST__",
    ready: "__HTP_READY__",
  },
};

// ---------------------------------------------------------------------------
// 警告码定义
// ---------------------------------------------------------------------------

// 警告码常量对象 — 所有导出过程中可能产生的警告标识符
export const HtpWarningCode = {
  /** 文本换行可能与原始 HTML 不一致 */
  TEXT_WRAP_MISMATCH_RISK: "HTP_TEXT_WRAP_MISMATCH_RISK",
  /** 表格包含 rowspan，不支持完全还原 */
  TABLE_ROWSPAN_UNSUPPORTED: "HTP_TABLE_ROWSPAN_UNSUPPORTED",
  /** 表格包含 colspan，不支持完全还原 */
  TABLE_COLSPAN_UNSUPPORTED: "HTP_TABLE_COLSPAN_UNSUPPORTED",
  /** 表格结构过于复杂，已降级为截图 */
  TABLE_COMPLEX_FALLBACK: "HTP_TABLE_COMPLEX_FALLBACK",
  /** 动画已降级为视频导出 */
  ANIMATION_FALLBACK_TO_VIDEO: "HTP_ANIMATION_FALLBACK_TO_VIDEO",
  /** 节点截图失败 */
  NODE_SCREENSHOT_FAILED: "HTP_NODE_SCREENSHOT_FAILED",
  /** 字体未加载，可能使用回退字体 */
  FONT_NOT_LOADED: "HTP_FONT_NOT_LOADED",
  /** 远程资源加载超时 */
  REMOTE_ASSET_TIMEOUT: "HTP_REMOTE_ASSET_TIMEOUT",
  /** 不支持的 CSS 变换 */
  UNSUPPORTED_TRANSFORM: "HTP_UNSUPPORTED_TRANSFORM",
  /** 不支持的动画效果 */
  UNSUPPORTED_ANIMATION_EFFECT: "HTP_UNSUPPORTED_ANIMATION_EFFECT",
} as const;

/** 警告码类型（从常量对象推导） */
export type HtpWarningCode = (typeof HtpWarningCode)[keyof typeof HtpWarningCode];

/** 警告信息结构 */
export interface HtpWarning {
  /** 警告码 */
  code: HtpWarningCode | string;
  /** 警告描述文本 */
  message: string;
  /** 关联的节点 ID，可选 */
  nodeId?: string;
  /** 关联的幻灯片 ID，可选 */
  slideId?: string;
  /** 附加详情，可选 */
  detail?: unknown;
}

// ---------------------------------------------------------------------------
// 单位换算常量与工具
// ---------------------------------------------------------------------------

// 1 英寸 = 914400 EMU（Office Open XML 规范固定值）
export const EMU_PER_INCH = 914400;

// 1 点 = 12700 EMU
export const EMU_PER_POINT = 12700;

// 1 厘米 = 360000 EMU
export const EMU_PER_CM = 360000;

// 1 英寸 = 72 点
export const POINTS_PER_INCH = 72;

// 默认浏览器视口尺寸（像素）
export const DEFAULT_VIEWPORT = { width: 1920, height: 1080 } as const;

// 默认幻灯片尺寸（英寸，16:9 宽屏）
export const DEFAULT_SLIDE_SIZE = { width: 13.333, height: 7.5 } as const;

/**
 * 将像素值转换为英寸值
 *
 * 根据视口像素大小和幻灯片英寸尺寸，按比例完成换算。
 * 如果视口尺寸为 0，直接返回 0 以避免除零错误。
 */
export function pxToInches(
  px: number,
  viewportPx: number,
  slideIn: number,
): number {
  if (viewportPx === 0) return 0;
  return (px / viewportPx) * slideIn;
}

/**
 * 将像素值转换为 EMU（English Metric Units）
 *
 * 先将像素转换为英寸，再乘以 EMU_PER_INCH 常量。
 * 这是 Office Open XML 中使用的标准长度单位。
 */
export function pxToEmu(
  px: number,
  viewportPx: number,
  slideIn: number,
): number {
  return pxToInches(px, viewportPx, slideIn) * EMU_PER_INCH;
}

/**
 * 将英寸值转换为 EMU
 *
 * 直接乘法换算，1 英寸 = 914400 EMU。
 */
export function inchToEmu(inches: number): number {
  return inches * EMU_PER_INCH;
}

/**
 * 将点（point）值转换为 EMU
 *
 * 直接乘法换算，1 点 = 12700 EMU。
 * PowerPoint 中的字号单位即为点。
 */
export function ptToEmu(points: number): number {
  return points * EMU_PER_POINT;
}

/**
 * 将 CSS px 字号转换为 PowerPoint 点数
 *
 * 换算链：CSS px → 英寸（基于视口高度比例）→ 点数。
 * 这是文本节点提取时字号计算的核心函数。
 */
export function cssPxToPt(
  cssPx: number,
  viewportHeight: number,
  deckHeightIn: number,
): number {
  if (viewportHeight === 0) return cssPx;
  // px → 英寸 → 点
  const inches = (cssPx / viewportHeight) * deckHeightIn;
  return inches * POINTS_PER_INCH;
}

// ---------------------------------------------------------------------------
// 颜色解析
// ---------------------------------------------------------------------------

/** 解析后的颜色结构 — 同时提供 HEX 字符串与 RGB 分量 */
export interface ParsedColor {
  /** 十六进制颜色字符串（如 "#ff0000"），不含 alpha */
  hex: string;
  /** 红色分量（0–255） */
  r: number;
  /** 绿色分量（0–255） */
  g: number;
  /** 蓝色分量（0–255） */
  b: number;
}

// CSS 命名颜色表（148 种标准颜色名 → 十六进制）
const NAMED_COLORS: Record<string, string> = {
  aliceblue: "#f0f8ff",
  antiquewhite: "#faebd7",
  aqua: "#00ffff",
  aquamarine: "#7fffd4",
  azure: "#f0ffff",
  beige: "#f5f5dc",
  bisque: "#ffe4c4",
  black: "#000000",
  blanchedalmond: "#ffebcd",
  blue: "#0000ff",
  blueviolet: "#8a2be2",
  brown: "#a52a2a",
  burlywood: "#deb887",
  cadetblue: "#5f9ea0",
  chartreuse: "#7fff00",
  chocolate: "#d2691e",
  coral: "#ff7f50",
  cornflowerblue: "#6495ed",
  cornsilk: "#fff8dc",
  crimson: "#dc143c",
  cyan: "#00ffff",
  darkblue: "#00008b",
  darkcyan: "#008b8b",
  darkgoldenrod: "#b8860b",
  darkgray: "#a9a9a9",
  darkgreen: "#006400",
  darkgrey: "#a9a9a9",
  darkkhaki: "#bdb76b",
  darkmagenta: "#8b008b",
  darkolivegreen: "#556b2f",
  darkorange: "#ff8c00",
  darkorchid: "#9932cc",
  darkred: "#8b0000",
  darksalmon: "#e9967a",
  darkseagreen: "#8fbc8f",
  darkslateblue: "#483d8b",
  darkslategray: "#2f4f4f",
  darkslategrey: "#2f4f4f",
  darkturquoise: "#00ced1",
  darkviolet: "#9400d3",
  deeppink: "#ff1493",
  deepskyblue: "#00bfff",
  dimgray: "#696969",
  dimgrey: "#696969",
  dodgerblue: "#1e90ff",
  firebrick: "#b22222",
  floralwhite: "#fffaf0",
  forestgreen: "#228b22",
  fuchsia: "#ff00ff",
  gainsboro: "#dcdcdc",
  ghostwhite: "#f8f8ff",
  gold: "#ffd700",
  goldenrod: "#daa520",
  gray: "#808080",
  green: "#008000",
  greenyellow: "#adff2f",
  grey: "#808080",
  honeydew: "#f0fff0",
  hotpink: "#ff69b4",
  indianred: "#cd5c5c",
  indigo: "#4b0082",
  ivory: "#fffff0",
  khaki: "#f0e68c",
  lavender: "#e6e6fa",
  lavenderblush: "#fff0f5",
  lawngreen: "#7cfc00",
  lemonchiffon: "#fffacd",
  lightblue: "#add8e6",
  lightcoral: "#f08080",
  lightcyan: "#e0ffff",
  lightgoldenrodyellow: "#fafad2",
  lightgray: "#d3d3d3",
  lightgreen: "#90ee90",
  lightgrey: "#d3d3d3",
  lightpink: "#ffb6c1",
  lightsalmon: "#ffa07a",
  lightseagreen: "#20b2aa",
  lightskyblue: "#87cefa",
  lightslategray: "#778899",
  lightslategrey: "#778899",
  lightsteelblue: "#b0c4de",
  lightyellow: "#ffffe0",
  lime: "#00ff00",
  limegreen: "#32cd32",
  linen: "#faf0e6",
  magenta: "#ff00ff",
  maroon: "#800000",
  mediumaquamarine: "#66cdaa",
  mediumblue: "#0000cd",
  mediumorchid: "#ba55d3",
  mediumpurple: "#9370db",
  mediumseagreen: "#3cb371",
  mediumslateblue: "#7b68ee",
  mediumspringgreen: "#00fa9a",
  mediumturquoise: "#48d1cc",
  mediumvioletred: "#c71585",
  midnightblue: "#191970",
  mintcream: "#f5fffa",
  mistyrose: "#ffe4e1",
  moccasin: "#ffe4b5",
  navajowhite: "#ffdead",
  navy: "#000080",
  oldlace: "#fdf5e6",
  olive: "#808000",
  olivedrab: "#6b8e23",
  orange: "#ffa500",
  orangered: "#ff4500",
  orchid: "#da70d6",
  palegoldenrod: "#eee8aa",
  palegreen: "#98fb98",
  paleturquoise: "#afeeee",
  palevioletred: "#db7093",
  papayawhip: "#ffefd5",
  peachpuff: "#ffdab9",
  peru: "#cd853f",
  pink: "#ffc0cb",
  plum: "#dda0dd",
  powderblue: "#b0e0e6",
  purple: "#800080",
  rebeccapurple: "#663399",
  red: "#ff0000",
  rosybrown: "#bc8f8f",
  royalblue: "#4169e1",
  saddlebrown: "#8b4513",
  salmon: "#fa8072",
  sandybrown: "#f4a460",
  seagreen: "#2e8b57",
  seashell: "#fff5ee",
  sienna: "#a0522d",
  silver: "#c0c0c0",
  skyblue: "#87ceeb",
  slateblue: "#6a5acd",
  slategray: "#708090",
  slategrey: "#708090",
  snow: "#fffafa",
  springgreen: "#00ff7f",
  steelblue: "#4682b4",
  tan: "#d2b48c",
  teal: "#008080",
  thistle: "#d8bfd8",
  tomato: "#ff6347",
  turquoise: "#40e0d0",
  violet: "#ee82ee",
  wheat: "#f5deb3",
  white: "#ffffff",
  whitesmoke: "#f5f5f5",
  yellow: "#ffff00",
  yellowgreen: "#9acd32",
  transparent: "#000000",
};

/**
 * 将十六进制颜色字符串转换为 RGB 分量
 *
 * 支持 3 位（#abc → #aabbcc）和 6 位（#aabbcc）格式。
 * 该函数为内部工具，由 resolveColor() 调用。
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

/**
 * 将 RGB 三个数值通道转换为十六进制颜色字符串
 *
 * 每个通道会被 clamp 到 0–255 范围后再转换为两位十六进制数。
 */
function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * 解析 rgb / rgba 函数字符串为 ParsedColor
 *
 * 支持百分比值（如 rgb(100%, 0%, 0%)）和整数（如 rgb(255, 0, 0)）。
 * 如果字符串格式不匹配则返回 null。
 */
function parseRgbaString(s: string): ParsedColor | null {
  const m = s.match(
    /rgba?\s*\(\s*(\d+%?)\s*,\s*(\d+%?)\s*,\s*(\d+%?)\s*(?:,\s*([\d.]+)\s*)?\)/i,
  );
  if (!m) return null;
  const parseVal = (v: string) =>
    v.endsWith("%") ? (parseFloat(v) / 100) * 255 : parseInt(v, 10);
  const r = parseVal(m[1]);
  const g = parseVal(m[2]);
  const b = parseVal(m[3]);
  const hex = rgbToHex(r, g, b);
  return { hex, r, g, b };
}

/**
 * 解析 hsl / hsla 函数字符串为 ParsedColor
 *
 * 实现标准 HSL → RGB 转换算法。
 * 色相为角度制（0–360），饱和度与亮度为百分比。
 */
function parseHslString(s: string): ParsedColor | null {
  const m = s.match(
    /hsla?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+)\s*)?\)/i,
  );
  if (!m) return null;
  const h = parseFloat(m[1]) / 360;
  const sVal = parseFloat(m[2]) / 100;
  const l = parseFloat(m[3]) / 100;

  // HSL → RGB 辅助函数：根据色相偏移计算单个通道值
  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r: number, g: number, b: number;
  if (sVal === 0) {
    // 灰阶（无饱和度）→ 三个通道亮度相同
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + sVal) : l + sVal - l * sVal;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const ri = Math.round(r * 255);
  const gi = Math.round(g * 255);
  const bi = Math.round(b * 255);
  return { hex: rgbToHex(ri, gi, bi), r: ri, g: gi, b: bi };
}

/**
 * 解析任意 CSS 颜色字符串为统一的 ParsedColor 结构
 *
 * 支持以下 CSS 颜色格式：
 * - 命名颜色（red, transparent 等 148 种 CSS 标准颜色）
 * - 十六进制（# Tags: #fff, #f0f0f0, #ff00ff80）
 * - rgb / rgba 函数记法（支持百分比）
 * - hsl / hsla 函数记法
 * 无法识别的输入统一返回黑色（#000000）。
 */
export function resolveColor(cssColor: string): ParsedColor {
  if (!cssColor) return { hex: "#000000", r: 0, g: 0, b: 0 };

  const s = cssColor.trim().toLowerCase();

  // 命名颜色查表
  if (NAMED_COLORS[s]) {
    const hex = NAMED_COLORS[s];
    return { hex, ...hexToRgb(hex) };
  }

  // 十六进制格式
  if (s.startsWith("#")) {
    const hexMatch = s.match(/^#([0-9a-f]{3,8})$/i);
    if (hexMatch) {
      const clean = hexMatch[1];
      let hex: string;
      if (clean.length === 3) {
        hex = `#${clean[0]}${clean[0]}${clean[1]}${clean[1]}${clean[2]}${clean[2]}`;
      } else if (clean.length === 6) {
        hex = `#${clean}`;
      } else if (clean.length === 8) {
        // 8 位十六进制含 alpha，丢弃 alpha 通道
        hex = `#${clean.substring(0, 6)}`;
      } else {
        return { hex: "#000000", r: 0, g: 0, b: 0 };
      }
      return { hex, ...hexToRgb(hex) };
    }
  }

  // rgb / rgba 函数记法
  if (s.startsWith("rgb")) {
    const result = parseRgbaString(s);
    if (result) return result;
  }

  // hsl / hsla 函数记法
  if (s.startsWith("hsl")) {
    const result = parseHslString(s);
    if (result) return result;
  }

  // 所有解析均失败 → 回退为黑色
  return { hex: "#000000", r: 0, g: 0, b: 0 };
}

// ---------------------------------------------------------------------------
// 字体工具
// ---------------------------------------------------------------------------

/**
 * 从 CSS font-family 字符串中提取首选字体名
 *
 * 解析规则：
 * - 按逗号分割，取第一个非通用字体系列的名称
 * - 去除首尾引号（单引号或双引号）
 * - 跳过 serif, sans-serif, monospace 等通用回退字体
 * - 如果所有值都是通用字体或输入为空，返回 "Arial" 作为默认值
 */
export function parseFontFamily(cssFamily: string): string {
  if (!cssFamily) return "Arial";

  // 按逗号分割，去除首尾引号
  const parts = cssFamily.split(",").map((p) => p.trim().replace(/^['"]|['"]$/g, ""));

  // CSS 通用字体系列（应跳过）
  const genericFamilies = new Set([
    "serif", "sans-serif", "monospace", "cursive", "fantasy",
    "system-ui", "ui-serif", "ui-sans-serif", "ui-monospace",
    "ui-rounded", "math", "emoji", "fangsong", "inherit", "initial",
    "unset", "revert",
  ]);

  for (const part of parts) {
    const lower = part.toLowerCase();
    if (!genericFamilies.has(lower)) {
      return part;
    }
  }

  return parts[0] || "Arial";
}

// ---------------------------------------------------------------------------
// CSS 选择器构造
// ---------------------------------------------------------------------------

/**
 * 为指定 DOM 元素构造一个唯一的 CSS 选择器路径
 *
 * 优先使用元素的 id 属性（最高特异性）。
 * 如果没有 id，则从当前元素向上遍历到 body，生成 tag + class 路径。
 * 此函数用于在 manifest 中记录节点的 DOM 位置，以便 exporter 能精确还原。
 * ⚠️ 注意：此函数运行在浏览器上下文中，依赖 document 全局对象。
 */
export function buildSelector(el: Element): string {
  if (el.id) return `#${CSS.escape(el.id)}`;

  const parts: string[] = [];
  let current: Element | null = el;

  while (current && current !== document.body && current !== document.documentElement) {
    let sel = current.tagName.toLowerCase();
    if (current.id) {
      sel = `#${CSS.escape(current.id)}`;
      parts.unshift(sel);
      break;
    }
    if (current.classList.length > 0) {
      sel += "." + Array.from(current.classList).map((c) => CSS.escape(c)).join(".");
    }
    parts.unshift(sel);
    current = current.parentElement;
  }

  return parts.join(" > ");
}

// ---------------------------------------------------------------------------
// 对象深度合并
// ---------------------------------------------------------------------------

/**
 * 深度合并两个对象（用于配置覆盖）
 *
 * 递归地将 source 对象的属性合并到 target 对象的浅拷贝中。
 * 对于嵌套对象执行深度合并，对于数组和基本类型则直接覆盖。
 * ⚠️ 注意：此函数不会修改原始 target 对象。
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>,
): T {
  const result = { ...target };
  for (const key of Object.keys(source) as (keyof T)[]) {
    const sv = source[key];
    const tv = result[key];
    if (sv && typeof sv === "object" && !Array.isArray(sv) && tv && typeof tv === "object" && !Array.isArray(tv)) {
      result[key] = deepMerge(tv, sv as any);
    } else {
      result[key] = sv as T[keyof T];
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// 动画效果 → PowerPoint MsoAnimEffect 映射表
// ---------------------------------------------------------------------------

/**
 * HTP 动画效果名称 → PowerPoint MsoAnimEffect ID 的映射表
 *
 * PowerPoint 的动画 XML（p:timing）使用数值 ID 来标识动画效果类型。
 * 此映射表将 HTP 的语义化效果名称（如 "fly-left"）转换为其对应的
 * MsoAnimEffect 数值常量，供 @htp/pptx 在生成 animation timing XML 时使用。
 */
export const HTP_TO_MSO_ANIM_EFFECT: Record<string, number> = {
  appear: 1,       // msoAnimEffectAppear
  fade: 2,         // msoAnimEffectFade
  "fly-left": 9,   // msoAnimEffectFlyFromLeft
  "fly-right": 10, // msoAnimEffectFlyFromRight
  "fly-up": 11,    // msoAnimEffectFlyFromTop
  "fly-down": 12,  // msoAnimEffectFlyFromBottom
  "zoom-in": 43,   // msoAnimEffectZoomIn
  "zoom-out": 44,  // msoAnimEffectZoomOut
  grow: 39,        // msoAnimEffectGrowShrink (grow)
  shrink: 40,      // msoAnimEffectGrowShrink (shrink)
  spin: 27,        // msoAnimEffectSpin
  "wipe-left": 19, // msoAnimEffectWipeFromLeft
  "wipe-right": 20,// msoAnimEffectWipeFromRight
  "wipe-up": 21,   // msoAnimEffectWipeFromTop
  "wipe-down": 22, // msoAnimEffectWipeFromBottom
  "motion-line": 6,// msoAnimEffectPathArcLeft
};
