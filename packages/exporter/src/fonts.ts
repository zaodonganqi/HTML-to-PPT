import type { HtpWarning } from "@htp/core";
import { parseFontFamily } from "@htp/core";

export interface FontOptions {
  /** 可直接写入 PPTX 的字体表；未提供时使用内置 WPS/Office 常见字体表 */
  table?: string[];
  /** CSS 字体名到 PPTX 字体名的自定义映射 */
  map?: Record<string, string>;
  /** 未命中字体表和映射规则时使用的默认字体 */
  defaultFont?: string;
  /** 中文、日文、韩文等东亚文本默认字体 */
  eastAsia?: string;
  /** 拉丁文本默认字体 */
  latin?: string;
  /** 等宽字体默认映射 */
  monospace?: string;
  /** 是否在控制台输出字体转换警告，默认 true */
  warn?: boolean;
}

export interface FontResolver {
  resolve(cssFontFamily: string | undefined, text: string): { fontFamily: string; warning?: HtpWarning };
}

const DEFAULT_FONT_TABLE = [
  "Arial",
  "Calibri",
  "Aptos",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Consolas",
  "Courier New",
  "Microsoft YaHei",
  "Microsoft JhengHei",
  "SimSun",
  "NSimSun",
  "SimHei",
  "DengXian",
  "KaiTi",
  "FangSong",
  "Malgun Gothic",
  "Meiryo",
  "Yu Gothic",
];

const GENERIC_FONT_MAP: Record<string, string> = {
  serif: "Times New Roman",
  "sans-serif": "Arial",
  monospace: "Consolas",
  cursive: "Arial",
  fantasy: "Arial",
  "system-ui": "Arial",
  "ui-sans-serif": "Arial",
  "ui-serif": "Times New Roman",
  "ui-monospace": "Consolas",
};

export function createFontResolver(options: FontOptions = {}): FontResolver {
  const table = new Set((options.table ?? DEFAULT_FONT_TABLE).map(normalizeFontKey));
  const map = new Map<string, string>();
  const warned = new Set<string>();

  for (const [from, to] of Object.entries(GENERIC_FONT_MAP)) map.set(normalizeFontKey(from), to);
  for (const [from, to] of Object.entries(options.map ?? {})) map.set(normalizeFontKey(from), to);

  const latin = options.latin ?? "Arial";
  const eastAsia = options.eastAsia ?? "Microsoft YaHei";
  const monospace = options.monospace ?? "Consolas";
  const defaultFont = options.defaultFont ?? latin;
  const shouldWarn = options.warn !== false;

  return {
    resolve(cssFontFamily, text) {
      const source = parseFontFamily(cssFontFamily || "");
      const sourceKey = normalizeFontKey(source);
      const mapped = map.get(sourceKey) ?? source;

      if (table.has(normalizeFontKey(mapped))) {
        return { fontFamily: mapped };
      }

      const replacement = chooseReplacement(sourceKey, text, { defaultFont, eastAsia, monospace });
      const warningKey = `${sourceKey}->${normalizeFontKey(replacement)}`;
      if (!warned.has(warningKey)) {
        warned.add(warningKey);
        const message = `Font "${source}" is not in the PPTX font table and will be exported as "${replacement}".`;
        if (shouldWarn) console.warn(`[HTP_FONT_NOT_IN_TABLE] ${message}`);
        return {
          fontFamily: replacement,
          warning: {
            code: "HTP_FONT_NOT_IN_TABLE",
            message,
            detail: { source, replacement },
          },
        };
      }

      return { fontFamily: replacement };
    },
  };
}

function normalizeFontKey(font: string): string {
  return font.trim().replace(/^['"]|['"]$/g, "").toLowerCase();
}

function chooseReplacement(
  sourceKey: string,
  text: string,
  defaults: { defaultFont: string; eastAsia: string; monospace: string },
): string {
  if (sourceKey.includes("mono") || sourceKey.includes("code")) return defaults.monospace;
  if (/[\u2e80-\u9fff\uf900-\ufaff\uac00-\ud7af]/.test(text)) return defaults.eastAsia;
  return defaults.defaultFont;
}