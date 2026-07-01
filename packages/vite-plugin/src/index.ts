/**
 * ────────────────────────────────────────────────────────────
 * @htp/vite-plugin — HTP 的 Vite 构建集成插件
 *
 * 在 Vite 构建流程中自动将 HTML 页面导出为 PowerPoint 文件。
 * 通过 closeBundle 钩子在打包完成后触发 HTP 导出器，
 * 无需额外的手动步骤即可生成 .pptx 演示文稿。
 * 详细设计参见 docs/design-spec.md §8.1。
 * ────────────────────────────────────────────────────────────
 */

import type { Plugin, ResolvedConfig } from "vite";
import { exportPptx } from "@htp/exporter";
import type { MarkerConfig } from "@htp/core";

// ---------------------------------------------------------------------------
// 插件选项
// ---------------------------------------------------------------------------

export interface HtpPluginOptions {
  /** 构建后的 HTML 入口文件路径 */
  entry?: string;
  /** 输出的 .pptx 文件路径 */
  output?: string;
  /** 构建完成后是否自动导出 */
  afterBuild?: boolean;
  /** 标记属性配置 */
  marker?: Partial<MarkerConfig>;
  /** 浏览器视口尺寸 */
  viewport?: { width: number; height: number };
  /** 调试输出目录 */
  debug?: string;
}

// ---------------------------------------------------------------------------
// Vite 插件
// ---------------------------------------------------------------------------

/**
 * ────────────────────────────────────────────────────────────
 * HTP Vite 插件
 *
 * 创建一个 Vite 插件实例。在 bundle 构建完成并关闭后，
 * 自动读取指定的 HTML 入口文件并调用 HTP 导出器，
 * 将其转换为 PowerPoint 演示文稿（.pptx 格式）。
 *
 * @param options - 插件配置选项
 * @returns Vite Plugin 实例
 * ────────────────────────────────────────────────────────────
 */
export function htpPlugin(options: HtpPluginOptions = {}): Plugin {
  // 解构插件选项并设置默认值
  const {
    entry = "dist/index.html",
    output = "dist/deck.pptx",
    afterBuild = true,
    viewport,
    debug,
  } = options;

  // Vite 解析后的配置对象
  let resolvedConfig: ResolvedConfig;

  return {
    name: "htp-vite-plugin",

    configResolved(config) {
      resolvedConfig = config;
    },

    async closeBundle() {
      if (!afterBuild) return;

      // 构建输入和输出的绝对路径
      const root = resolvedConfig.root;
      const inputPath = `${root}/${entry}`;
      const outputPath = `${root}/${output}`;

      console.log(`\n[HTP] Exporting PPTX: ${inputPath} → ${outputPath}`);

      try {
        const result = await exportPptx({
          input: inputPath,
          output: outputPath,
          viewport,
          debug: debug
            ? { outputDir: debug, saveScreenshots: true, saveManifest: true }
            : undefined,
        });

        console.log(
          `[HTP] ✅ Done — ${result.warnings.length} warning(s)`,
        );
      } catch (err) {
        console.error(`[HTP] ❌ Export failed:`, err);
      }
    },
  };
}
