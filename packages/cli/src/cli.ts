#!/usr/bin/env node

/**
 * @htp/cli — HTP 命令行接口
 *
 * 将 HTML 页面导出为 PowerPoint 演示文稿的命令行工具。
 * 支持自定义视口尺寸、幻灯片布局、等待策略、文本导出模式、
 * 动画模式以及调试输出等选项。
 * 详细设计参见 docs/design-spec.md §10。
 */

import { Command } from "commander";
import fs from "node:fs";
import path from "node:path";
import { exportPptx } from "@htp/exporter";

// HTP 命令行程序主实例
const program = new Command();

program
  .name("htp")
  .description("HTML To PowerPoint — Export web pages to .pptx")
  .version("0.0.1");

program
  .command("export <input> [output]")
  .description("Export an HTML page to a PowerPoint file")
  .option("--viewport <WxH>", "Browser viewport size (default: 1920x1080)", "1920x1080")
  .option("--layout <layout>", "Slide layout: wide or standard", "wide")
  .option("--wait <strategy>", "Wait strategy: htp-ready, networkidle, or load", "htp-ready")
  .option("--text <mode>", "Text export mode: editable or image", "editable")
  .option("--animation <mode>", "Animation mode: native, video, or none", "native")
  .option("--debug <dir>", "Enable debug output to directory")
  .option("--timeout <ms>", "Timeout in milliseconds", "60000")
  .option("--config <path>", "Path to JSON config file")
  .action(async (input, output, options) => {
    // 解析视口宽度和高度
    const [vw, vh] = options.viewport.split("x").map(Number);

    // 如果指定了配置文件，则加载配置
    let configOpts = {};
    if (options.config) {
      // 配置文件绝对路径
      const configPath = path.resolve(process.cwd(), options.config);
      if (fs.existsSync(configPath)) {
        try {
          // 尝试解析 JSON 配置文件
          configOpts = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        } catch (err) {
          console.error(`⚠ Could not parse config file: ${configPath}`);
        }
      }
    }

    console.log(`\n📄 HTP Export`);
    console.log(`   Input:  ${input}`);
    console.log(`   Output: ${output || "deck.pptx"}`);
    console.log(`   Viewport: ${vw}x${vh}`);
    console.log(`   Layout: ${options.layout}`);
    console.log(`   Wait: ${options.wait}`);

    try {
      const result = await exportPptx({
        ...configOpts,
        input,
        output: output || "deck.pptx",
        viewport: { width: vw, height: vh },
        deck: { layout: options.layout as "wide" | "standard" },
        waitUntil: options.wait as any,
        text: { defaultMode: options.text as any },
        animation: { mode: options.animation as any },
        debug: options.debug
          ? { outputDir: options.debug, saveManifest: true }
          : undefined,
        timeout: parseInt(options.timeout, 10),
      });

      if (result.warnings.length > 0) {
        console.log(`\n⚠ ${result.warnings.length} warning(s):`);
        result.warnings.forEach((w) => {
          console.log(`   [${w.code}] ${w.message}`);
        });
      }

      console.log(`\n✅ Done — ${output || "deck.pptx"}`);
    } catch (err) {
      console.error("\n❌ Export failed:");
      console.error(`   ${err instanceof Error ? err.message : String(err)}`);
      if (err instanceof Error && err.stack) {
        const stackLines = err.stack.split("\n").slice(1, 4);
        stackLines.forEach((line) => console.error(`   ${line.trim()}`));
      }
      process.exit(1);
    }
  });

// 无匹配子命令时显示帮助信息
program.action(() => {
  program.outputHelp();
});

// 解析命令行参数
program.parse();
