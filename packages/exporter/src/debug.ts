/**
 * 调试输出模块
 * 负责将导出过程中的调试信息写入磁盘，便于问题排查和开发调试。
 *
 * 输出的调试产物包括：
 *   - manifest.json：页面清单的完整 JSON 序列化
 *   - warnings.json：导出过程中收集的所有警告信息
 *   - slide-N-background.png：每张幻灯片背景的截图（可选）
 *
 * 所有文件均写入指定的调试输出目录。
 */

import fs from "node:fs";
import path from "node:path";
import type { HtpManifest, HtpWarning } from "@htp/core";

export interface DebugOutputOptions {
  /** 调试产物输出目录 */
  outputDir: string;
  /** 是否保存每张幻灯片的背景截图 */
  saveScreenshots?: boolean;
  /** 是否保存页面清单 JSON */
  saveManifest?: boolean;
}

/**
 * 将调试产物写入输出目录
 * 在指定的输出目录中创建以下文件：
 *   - manifest.json（如果清单存在）
 *   - warnings.json（始终写入，即使警告列表为空）
 *   - slide-N-background.png（如果提供了幻灯片截图数组）
 *
 * 每次写入完成后会在控制台输出日志，便于确认文件生成位置。
 */
export async function writeDebugOutput(
  outputDir: string,
  manifest: HtpManifest | null,
  warnings: HtpWarning[],
  slideScreenshots?: Array<{ index: number; buffer: Buffer }>,
): Promise<void> {
  fs.mkdirSync(outputDir, { recursive: true });

  // 保存页面清单
  if (manifest) {
    const manifestPath = path.join(outputDir, "manifest.json");
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
    console.log(`[HTP Debug] Manifest saved: ${manifestPath}`);
  }

  // 保存警告列表
  const warningsPath = path.join(outputDir, "warnings.json");
  fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2), "utf-8");
  console.log(`[HTP Debug] ${warnings.length} warning(s) saved: ${warningsPath}`);

  // 保存幻灯片截图
  if (slideScreenshots && slideScreenshots.length > 0) {
    for (const ss of slideScreenshots) {
      const ssPath = path.join(outputDir, `slide-${ss.index + 1}-background.png`);
      fs.writeFileSync(ssPath, ss.buffer);
      console.log(`[HTP Debug] Screenshot saved: ${ssPath}`);
    }
  }
}
