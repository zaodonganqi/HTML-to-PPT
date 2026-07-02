<p align="center">
  <h1 align="center">HTP</h1>
  <p align="center"><strong>HTML To PowerPoint</strong></p>
  <p align="center">用 HTML 写幻灯片，一键导出为原生 PowerPoint。</p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-blue" alt="version">
  <img src="https://img.shields.io/badge/license-GPL%203.0-green" alt="license">
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" alt="node">
</p>

---

## 特性

- **可编辑文本**：导出到 PPTX 后文字可直接编辑，保留字体、字号、颜色、对齐方式
- **原生表格**：HTML `<table>` 映射为 PowerPoint 原生表格，支持单元格背景色与文字样式
- **图片导出**：`<img>` 元素与 CSS 装饰区域通过截图精确还原
- **动画支持**：HTP 声明式动画 API 映射为 PPTX 原生动画时序
- **声明式标记**：通过 HTML 属性或 JS API 标记哪些元素参与导出
- **CLI + Node API + Vite 插件**：适配命令行、脚本、构建流程三种使用场景
- **Playwright 驱动**：在无头 Chromium 中渲染页面，所见即所得

## 快速开始

### 安装

```bash
pnpm install
pnpm build
```

### CLI

```bash
# 从 HTML 文件导出
htp export ./slides.html ./output.pptx

# 从 URL 导出
htp export https://example.com/deck ./output.pptx

# 指定视口尺寸
htp export ./slides.html ./output.pptx --viewport 2560 1440

# 使用配置文件
htp export ./slides.html ./output.pptx --config ./htp.config.json
```

### Node API

```js
import { exportPptx } from "@htp/exporter";

const result = await exportPptx({
  input: "./dist/index.html",
  output: "./deck.pptx",
  viewport: { width: 1920, height: 1080 },
  deck: { width: 13.333, height: 7.5 },
});

console.log(result.warnings);
```

### 浏览器端标记

```js
import { htp } from "@htp/runtime";

// 标记幻灯片与可编辑元素
htp.slide(".slide-1");
htp.text("#title", { id: "main-title" });
htp.table("#metrics");
htp.fallback(".chart-area");

// 添加动画
htp.animate("#title", { effect: "fly-left", duration: 500 });

// 发出就绪信号
htp.ready();
```

## 工作原理

```
HTML 页面  →  Playwright 渲染  →  DOM 提取  →  PPTX 组装  →  .pptx 文件
              (无头 Chromium)     (文本/表格/图片)   (Office Open XML)
```

1. 用户在 HTML 中用 `htp` 属性或 `@htp/runtime` API 标记内容区域
2. `@htp/exporter` 启动 Playwright Chromium，加载页面并等待就绪信号
3. 逐张幻灯片提取：隐藏可编辑节点截取背景 → 提取文本样式与位置 → 解析表格结构 → 截取图片/回退区域
4. `@htp/pptx` 将提取结果组装为 Office Open XML 并打包为合法 `.pptx` 文件

## 文档

| 文档 | 说明 |
|------|------|
| [设计文档](docs/design-spec.md) | 完整技术方案与架构设计 |
| [项目约束](docs/project-constraints.md) | 代码规范、目录约束、提交约定 |
| [变更日志](docs/CHANGELOG.md) | 版本变更记录 |

## 协议

[GPL 3.0](LICENSE) — GNU General Public License v3

本项目为自由软件：你可以再发布和/或修改它，但必须遵循 GPL 3.0 的条款。
