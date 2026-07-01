# CHANGELOG

本文件记录项目所有值得关注的变更。
格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

---

## [0.1.0] — 2026-06-29

### Added
- 初始化 monorepo 项目结构（pnpm workspaces + TypeScript + tsup）
- `@htp/core` — 共享类型定义、单位换算、颜色解析、字体工具、选择器构造、深度合并
- `@htp/pptx` — 自建 PPTX 生成器（Office Open XML + JSZip），支持文本、表格、图片、动画
- `@htp/runtime` — 浏览器运行时库，提供 slide/text/table/image/fallback/animate API
- `@htp/exporter` — 基于 Playwright 的 Node.js 导出器，支持文件/URL/字符串输入
- `@htp/cli` — 命令行工具 `htp export <input> [output]`
- `@htp/vite-plugin` — Vite 集成插件，构建后自动导出 PPTX
- `examples/vanilla` — Vite 示例项目，演示 @htp/runtime 的标准用法
- `test/fixtures/vanilla` — 静态 HTML 测试固件
- `test/scripts/export.test.js` — 集成测试脚本
- `docs/design-spec.md` — 完整技术设计文档
- `docs/project-constraints.md` — 企业级项目约束规范

### Fixed
- 修复表格单元格文字在 PPTX 中丢失的问题（`zip.ts` 中 cell mapping 遗漏了 `row`/`col` 字段）
