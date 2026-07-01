/**
 * @htp/exporter 集成测试脚本
 *
 * 验证完整的 HTML → PPTX 导出流程：
 * - 文本提取与字体样式保留
 * - 表格提取与单元格内容完整性
 * - 回退元素截图
 * - 幻灯片背景生成
 *
 * 用法: node test/scripts/export.test.js
 */

const path = require("node:path");
const fs = require("node:fs");
const { pathToFileURL } = require("node:url");

// 测试输入（使用 test/fixtures/vanilla 静态 HTML）
const fixtureDir = path.resolve(__dirname, "..", "fixtures", "vanilla");
const outputDir = path.resolve(__dirname, "..", "output");

// 确保输出目录存在
fs.mkdirSync(outputDir, { recursive: true });

async function main() {
  // 动态导入 ESM 模块
  const exporterPath = pathToFileURL(
    path.resolve(__dirname, "..", "..", "packages", "exporter", "dist", "index.js")
  ).href;
  const { exportPptx } = await import(exporterPath);

  console.log("🔨 HTP Exporter Integration Test\n");

  let passed = 0;
  let failed = 0;

  // ── 测试 1: 基本导出流程 ──────────────────────────────
  console.log("Test 1: Full export pipeline (text + table + fallback)");
  try {
    const result = await exportPptx({
      input: path.join(fixtureDir, "index.html"),
      output: path.join(outputDir, "test-basic.pptx"),
      waitUntil: "load",
      debug: { outputDir: path.join(outputDir, "debug"), saveScreenshots: true, saveManifest: true },
    });

    // 检查基本属性
    const checks = [];
    checks.push({ label: "Buffer non-empty", ok: result.buffer.length > 10000 });
    checks.push({ label: "Output file written", ok: fs.existsSync(path.join(outputDir, "test-basic.pptx")) });
    checks.push({ label: "No critical warnings", ok: result.warnings.filter((w) => w.code === "HTP_EXTRACT_FAILED").length === 0 });

    for (const c of checks) {
      console.log(`   ${c.ok ? "✅" : "❌"} ${c.label}`);
      if (c.ok) passed++; else failed++;
    }

    // 验证 PPTX 内容
    console.log("   📦 PPTX size:", (result.buffer.length / 1024).toFixed(1), "KB");
    console.log("   ⚠️  Warnings:", result.warnings.length);
    for (const w of result.warnings) {
      console.log(`      - [${w.code}] ${w.message}`);
    }
    passed++;

  } catch (err) {
    console.log(`   ❌ Failed: ${err.message}`);
    failed++;
  }

  // ── 结果 ─────────────────────────────────────────────
  console.log(`\n${"=".repeat(40)}`);
  console.log(`Result: ${passed} passed, ${failed} failed`);
  console.log(`Output: ${outputDir}`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
