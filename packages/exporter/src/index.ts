/**
 * ────────────────────────────────────────────────────────────────────────────────
 * @htp/exporter 入口模块
 * ────────────────────────────────────────────────────────────────────────────────
 * 本模块是 HTP 导出器的顶层入口，负责协调整个导出流程：
 *   1. 解析输入（HTML 文件、目录、URL 或字符串）
 *   2. 启动浏览器并通过 Playwright 渲染页面
 *   3. 从页面中提取幻灯片结构并组装为 PPTX 数据模型
 *   4. 生成 .pptx 二进制文件并写入磁盘
 *   5. 可选的调试输出（清单、屏幕截图、警告信息）
 * ────────────────────────────────────────────────────────────────────────────────
 */

import fs from "node:fs";
import path from "node:path";
import type { HtpManifest, HtpWarning } from "@htp/core";
import { DEFAULT_VIEWPORT, DEFAULT_SLIDE_SIZE, DEFAULT_CONFIG } from "@htp/core";
import { writePptx } from "@htp/pptx";
import { resolveInput } from "./input";
import { createBrowserSession } from "./browser";
import { assembleDeck } from "./assemble";
import { writeDebugOutput } from "./debug";

// ── 公共 API 类型定义 ──────────────────────────────────────────────────────────

export interface ExportPptxOptions {
  /** 输入源：HTML 文件路径、目录路径、HTTP URL 或 HTML 字符串 */
  input: string | Buffer;
  /** 输出 .pptx 文件路径（可选——始终返回 Buffer） */
  output?: string;
  /** 解析相对路径时使用的工作目录 */
  cwd?: string;
  /** 浏览器视口尺寸 */
  viewport?: {
    width: number;
    height: number;
  };
  /** PowerPoint 幻灯片画布尺寸 */
  deck?: {
    width?: number;
    height?: number;
    layout?: "wide" | "standard" | "custom";
  };
  /** 页面就绪判定策略 */
  waitUntil?: "load" | "networkidle" | "htp-ready";
  /** 最大等待时间（毫秒） */
  timeout?: number;
  /** 文本导出选项 */
  text?: {
    defaultMode?: "editable" | "image";
    preserveLineBreaks?: boolean;
  };
  /** 回退截图选项（用于无法原生映射的复杂内容） */
  fallback?: {
    format?: "png" | "jpeg";
    scale?: number;
    quality?: number;
  };
  /** 动画导出选项 */
  animation?: {
    mode?: "native" | "video" | "none";
  };
  /** 调试输出配置 */
  debug?: {
    outputDir?: string;
    saveScreenshots?: boolean;
    saveManifest?: boolean;
  };
}

export interface ExportPptxResult {
  /** 生成的 PPTX 文件二进制数据 */
  buffer: Buffer;
  /** 实际写入的输出路径（未指定时为空） */
  output?: string;
  /** 页面清单信息 */
  manifest: HtpManifest | null;
  /** 导出过程中产生的所有警告 */
  warnings: HtpWarning[];
}

/**
 * ────────────────────────────────────────────────────────────────────────────────
 * 主导出函数：将 HTML 页面转换为 PowerPoint (.pptx) 文件
 * ────────────────────────────────────────────────────────────────────────────────
 * 这是库的顶层入口函数。接收导出选项，依次完成以下步骤：
 *   1. 解析输入源为可导航的 URL
 *   2. 启动无头浏览器并加载页面
 *   3. 读取页面中的 HTP 清单（manifest）
 *   4. 从 DOM 中提取幻灯片并组装为 PPTX 甲板（deck）
 *   5. 生成完整的 .pptx 二进制缓冲区
 *   6. 如果指定了输出路径则写入文件系统
 *   7. 如果开启了调试选项则输出调试产物
 *
 * 返回包含 Buffer、清单和警告信息的 ExportPptxResult 对象。
 * ────────────────────────────────────────────────────────────────────────────────
 */
export async function exportPptx(
  options: ExportPptxOptions,
): Promise<ExportPptxResult> {
  const viewport = options.viewport ?? DEFAULT_VIEWPORT;
  const deckWidth = options.deck?.width ?? DEFAULT_SLIDE_SIZE.width;
  const deckHeight = options.deck?.height ?? DEFAULT_SLIDE_SIZE.height;
  const waitUntil = options.waitUntil ?? "htp-ready";
  const timeout = options.timeout ?? 60000;
  const marker = DEFAULT_CONFIG.marker;
  const textMode = options.text?.defaultMode ?? "editable";
  const animationMode = options.animation?.mode ?? "native";

  const warnings: HtpWarning[] = [];

  // 步骤 1：将输入解析为可导航的 URL
  const resolved = await resolveInput(options.input, options.cwd);

  let manifest: HtpManifest | null = null;

  try {
    // 步骤 2：启动浏览器并加载页面
    const session = await createBrowserSession(resolved.url, {
      viewport,
      waitUntil,
      timeout,
      readyKey: DEFAULT_CONFIG.globals.ready,
    });

    const { page } = session;

    try {
      // 步骤 3：尝试读取页面清单
      try {
        manifest = await page.evaluate((key: string) => {
          return (window as any)[key] || null;
        }, DEFAULT_CONFIG.globals.manifest);
      } catch {
        // 清单不可用——将回退到 DOM 自动检测
      }

      // 步骤 4：从页面中组装 PPTX 甲板
      const { deck, warnings: assemblyWarnings } = await assembleDeck(
        page,
        manifest,
        {
          marker,
          viewport,
          deckWidth,
          deckHeight,
          textMode,
          animationMode,
        },
      );
      warnings.push(...assemblyWarnings);

      // 步骤 5：生成 PPTX 二进制缓冲区
      const buffer = await writePptx({ deck });

      // 步骤 6：如果指定了输出路径则写入文件
      if (options.output) {
        const outPath = path.isAbsolute(options.output)
          ? options.output
          : path.resolve(options.cwd || process.cwd(), options.output);
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, buffer);
      }

      // 步骤 7：调试输出
      if (options.debug?.outputDir) {
        const debugDir = path.isAbsolute(options.debug.outputDir)
          ? options.debug.outputDir
          : path.resolve(options.cwd || process.cwd(), options.debug.outputDir);

        const screenshots = options.debug.saveScreenshots
          ? deck.slides.map((s, i) => ({
              index: i,
              buffer: s.background?.data ?? Buffer.alloc(0),
            }))
          : undefined;

        await writeDebugOutput(debugDir, manifest, warnings, screenshots);
      }

      return {
        buffer,
        output: options.output,
        manifest,
        warnings,
      };
    } finally {
      await session.browser.close();
    }
  } finally {
    // 清理临时文件和本地服务器
    if (resolved.server) {
      await resolved.server.close();
    }
    if (resolved.tempFile) {
      try {
        const tmpDir = path.dirname(resolved.tempFile);
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {
        // 尽最大努力清理
      }
    }
  }
}
