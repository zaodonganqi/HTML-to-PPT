/**
 * 导出流程集成测试
 *
 * 验证完整的 HTML → PPTX 导出流程，覆盖全部 3 个测试项目。
 * 每次运行前自动清空输出目录，避免产物堆积。
 *
 * 用法: node test/scripts/export.test.js
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

// 在 ES module 中创建 CJS require 以加载 jszip
const require = createRequire(import.meta.url);

// 输出目录（每次运行前清空）
const outputDir = path.resolve(import.meta.dirname, "..", "output");

// 测试项目定义
const PROJECTS = [
  {
    // React + Vite 企业官网
    name: "react-official",
    dir: path.resolve(import.meta.dirname, "..", "projects", "react-official", "dist"),
    waitUntil: "load",
    minSlides: 9,
    hasManifest: true,
  },
  {
    // Vue 3 + Vite 博客页面
    name: "vue-blog",
    dir: path.resolve(import.meta.dirname, "..", "projects", "vue-blog", "dist"),
    waitUntil: "load",
    minSlides: 3,
    hasManifest: true,
  },
  {
    // 原生 HTML 手机发布会（内联 htp 属性，不走 @htp/runtime）
    name: "vanilla-launch",
    dir: path.resolve(import.meta.dirname, "..", "projects", "vanilla-launch"),
    waitUntil: "load",
    minSlides: 9,
    hasManifest: false,
  },
];

/**
 * 通过解析 PPTX ZIP 内部结构获取实际幻灯片数量
 *
 * PPTX 文件本质是 ZIP 压缩包，幻灯片文件路径模式为
 * ppt/slides/slide{N}.xml，直接统计匹配该模式的文件即可。
 * 用于无 manifest 的项目（如内联 htp 属性的原生 HTML）。
 *
 * @param buffer - PPTX 文件二进制数据
 * @returns 幻灯片文件数量
 */
async function countSlidesInPptx(buffer) {
  // jszip 位于 @htp/pptx 的依赖中
  const JSZip = require(
    path.resolve(import.meta.dirname, "..", "..", "packages", "pptx", "node_modules", "jszip")
  );
  const zip = await JSZip.loadAsync(buffer);
  return Object.keys(zip.files).filter(
    (f) => /ppt\/slides\/slide\d+\.xml$/.test(f)
  ).length;
}

/**
 * 对单个测试项目执行导出流程并验证结果
 *
 * 检查项包括：幻灯片数量、节点数量（如有 manifest）、
 * 产物文件大小、关键警告数量。非关键警告仅打印不记入失败。
 *
 * @param proj - 测试项目配置对象
 * @param exportPptx - 导入的导出函数
 * @returns 包含通过和失败计数的对象
 */
async function testProject(proj, exportPptx) {
  const result = await exportPptx({
    input: proj.dir,
    output: path.join(outputDir, `${proj.name}.pptx`),
    waitUntil: proj.waitUntil,
    timeout: 60000,
  });

  // 获取实际幻灯片数量
  let actualSlides = result.manifest?.slides?.length ?? 0;
  if (!proj.hasManifest) {
    actualSlides = await countSlidesInPptx(result.buffer);
  }

  // 节点数量（仅对有 manifest 的项目有意义）
  const nodeCount = result.manifest?.nodes?.length ?? 0;

  // 产物文件大小
  const outPath = path.join(outputDir, `${proj.name}.pptx`);
  const fileSize = fs.existsSync(outPath) ? fs.statSync(outPath).size : 0;

  // 关键警告
  const critWarnings = result.warnings.filter(
    (w) => w.code === "HTP_EXTRACT_FAILED"
  );

  const checks = [
    { label: `${actualSlides} slides (≥ ${proj.minSlides})`, ok: actualSlides >= proj.minSlides },
  ];

  if (proj.hasManifest) {
    checks.push({ label: `${nodeCount} nodes`, ok: nodeCount > 0 });
  }

  checks.push(
    { label: `输出 ${(fileSize / 1024).toFixed(0)} KB`, ok: fileSize > 10000 },
    { label: `warnings: ${result.warnings.length} (关键: ${critWarnings.length})`, ok: critWarnings.length === 0 },
  );

  // 打印检查结果
  let passed = 0;
  let failed = 0;
  for (const c of checks) {
    const mark = c.ok ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m";
    console.log(`  ${mark} ${c.label}`);
    if (c.ok) passed++; else failed++;
  }

  // 非关键警告明细
  for (const w of result.warnings) {
    if (w.code !== "HTP_EXTRACT_FAILED") {
      console.log(`  ⚠ [${w.code}] ${w.message.substring(0, 100)}`);
    }
  }

  return { passed, failed };
}

// ── 主流程 ────────────────────────────────────────────────────────────────

// 清空输出目录
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}
fs.mkdirSync(outputDir, { recursive: true });

// 动态导入 ESM 格式的导出函数
const exporterUrl = pathToFileURL(
  path.resolve(import.meta.dirname, "..", "..", "packages", "exporter", "dist", "index.js")
).href;
const { exportPptx } = await import(exporterUrl);

console.log("HTP 导出集成测试\n");
console.log("=".repeat(56));

let totalPassed = 0;
let totalFailed = 0;

for (const proj of PROJECTS) {
  const tag = proj.hasManifest ? "" : " (无 manifest)";
  console.log(`\n${proj.name}${tag}`);
  console.log("-".repeat(proj.name.length + tag.length + 2));

  try {
    const { passed, failed } = await testProject(proj, exportPptx);
    totalPassed += passed;
    totalFailed += failed;
  } catch (err) {
    console.log(`  \x1b[31m✗\x1b[0m 失败: ${err.message}`);
    totalFailed++;
  }
}

// 汇总
console.log(`\n${"=".repeat(56)}`);
const status = totalFailed === 0 ? "\x1b[32m通过\x1b[0m" : "\x1b[31m失败\x1b[0m";
console.log(`${status}  ${totalPassed} 通过, ${totalFailed} 失败  (输出: ${outputDir})`);
process.exit(totalFailed > 0 ? 1 : 0);
