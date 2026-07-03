# HTP

HTP 是一个 HTML To PowerPoint 工具库。它在 Chromium 中渲染 HTML，读取真实 DOM 布局、computed style、字体、坐标与 canvas 像素信息，然后生成原生 `.pptx` 文件：关键文本可编辑、表格可编辑，复杂视觉区域以 PPT 图片元素稳定承载。

> 当前状态：早期 alpha。仓库已可用于本地开发和集成测试，npm 包尚未正式发布。

![version](https://img.shields.io/badge/version-0.0.1-blue)
![license](https://img.shields.io/badge/license-GPL%203.0-green)
![node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)

## 特性

- 真实浏览器布局：通过 Playwright/Chromium 获取 DOM 坐标、computed style、字体加载状态、canvas 像素、SVG、CSS 效果和最终可见状态。
- 原生 PowerPoint 文本：标记为 `text` 的节点导出为可编辑 PPT 文本框。
- 原生 PowerPoint 表格：标记为 `table` 的 HTML 表格导出为可编辑 DrawingML 表格。
- 视觉区域栅格化：`image` 表示把一个 DOM 区域按浏览器最终渲染结果绘制为 PPT 图片元素，可覆盖 `<img>`、canvas、SVG、图表、CSS 装饰和复杂容器。
- 父子节点合并策略：当 `image` 区域内部还有已标记的文本、表格或图片子节点时，通过合并策略避免重复绘制和元素重叠。
- 字体映射：CSS 字体不在 PPT 安全字体表中时给出警告，并允许开发者配置字体替换规则。
- Office 兼容：生成的 PPTX 包含 Microsoft PowerPoint 和 WPS 需要的 PresentationML 部件、关系文件和内容类型。
- 多种入口：同一 pnpm workspace 中提供浏览器 runtime、Node exporter、CLI、Vite 插件和底层 PPTX 写入包。

## 包结构

| 包 | 作用 |
| --- | --- |
| `@htp/runtime` | 浏览器端 API，用于标记幻灯片、文本、表格、图片区域和动画。 |
| `@htp/exporter` | Node.js 导出器，驱动 Chromium 并生成 PPTX。 |
| `@htp/pptx` | Office Open XML 写入层，由 exporter 调用。 |
| `@htp/cli` | 命令行入口，提供 `htp export`。 |
| `@htp/vite-plugin` | Vite 构建集成，用于构建后导出 PPTX。 |
| `@htp/core` | 共享类型、配置、单位换算、颜色、字体和 warning 契约。 |

## 安装

在当前仓库中开发：

```bash
pnpm install
pnpm build
```

包发布后，库使用者只需要安装实际用到的包：

```bash
pnpm add @htp/runtime @htp/exporter
```

Playwright 需要 Chromium 运行时。如果环境中还没有浏览器，可安装 Chromium：

```bash
pnpm exec playwright install chromium
```

## 快速开始

### 标记页面

```html
<section class="slide">
  <h1 id="title">Q2 Growth Review</h1>

  <div id="chart-card">
    <canvas id="chart"></canvas>
  </div>

  <table id="metrics">
    <tr><th>Metric</th><th>Value</th></tr>
    <tr><td>Revenue</td><td>$1.2M</td></tr>
  </table>
</section>

<script type="module">
  import { htp } from "@htp/runtime";

  htp.slide(".slide");
  htp.text("#title");
  htp.table("#metrics");
  htp.image("#chart-card");
  htp.ready();
</script>
```

公开标记边界保持克制：

```text
slide -> PPT 幻灯片
text  -> 可编辑 PPT 文本框
table -> 可编辑 PPT 表格
image -> 栅格化 DOM 区域，并作为 PPT 图片元素插入
```

公开视觉标记只有 `image`。如果某个区域需要按浏览器视觉结果交付，就把这个区域标记为 `image`。

### Node API 导出

```js
import { exportPptx } from "@htp/exporter";

const result = await exportPptx({
  input: "./dist/index.html",
  output: "./deck.pptx",
  viewport: { width: 1920, height: 1080 },
  deck: { width: 13.333, height: 7.5, layout: "wide" },
  fonts: {
    map: {
      Inter: "Arial",
      "Space Grotesk": "Arial",
      "Playfair Display": "Times New Roman",
    },
    defaultFont: "Arial",
    eastAsia: "Microsoft YaHei",
    latin: "Arial",
    monospace: "Consolas",
    warn: true,
  },
});

console.log(result.warnings);
```

`id` 和 `order` 只作为高级逃生口。正常项目不应该给每个节点手写这些字段；runtime 和 exporter 会基于 DOM、selector 和 slide 结构推导节点身份与页面顺序。

### CLI 导出

```bash
htp export ./dist/index.html ./deck.pptx
htp export http://localhost:5173 ./deck.pptx --viewport 1920x1080
htp export ./dist/index.html ./deck.pptx --config ./htp.config.json
```

配置示例：

```json
{
  "fonts": {
    "map": {
      "Inter": "Arial",
      "Space Grotesk": "Arial"
    },
    "defaultFont": "Arial",
    "warn": true
  }
}
```

## 合并策略

当已标记的父节点内部还有已标记的子节点时，HTP 会先建立标记节点树，再决定每个视觉区域由谁导出。这样可以避免父级 `image` 已经包含文本，而子级 `text` 又单独导出，最终在 PPT 中重叠。

```js
htp.image(".card");                    // 默认 auto
htp.image(".card", { merge: "text" }); // text/table 合并进父级图片
htp.image(".poster", { merge: "all" }); // 整块区域导出为一张图片
```

| `merge` | 父图包含 text/table 子节点 | 父图包含 image 子节点 | 子 text/table 单独导出 | 子 image 单独导出 |
| --- | :---: | :---: | :---: | :---: |
| `auto` | 否 | 否 | 是 | 是 |
| `text` | 是 | 否 | 否 | 是 |
| `all` | 是 | 是 | 否 | 否 |
| `none` | 否 | 否 | 否 | 否 |
| `only` | 否 | 否 | 是 | 是 |

默认 `auto` 会尽量保留文本和表格的可编辑性，同时在父级栅格化时排除已标记子区域。卡片类区域需要更稳定的视觉时使用 `text`。封面、海报、复杂整块视觉可使用 `all`。

## 字体映射

PowerPoint 和 WPS 未必拥有浏览器中加载的字体。HTP 会把每个 CSS `font-family` 放到 PPT 安全字体表中解析：

- `fonts.table` 定义允许直接写入 PPTX 的字体表。
- `fonts.map` 定义项目字体到 Office/WPS 字体的映射。
- `defaultFont`、`latin`、`eastAsia`、`monospace` 控制默认替换字体。
- `warn` 控制字体不在表内时是否输出控制台警告。

库本身不写死任何业务项目的品牌字体。具体项目应该自己配置字体映射规则。

## 工作原理

```text
HTML / React / Vue / 静态页面
        -> Chromium 真实布局与绘制
        -> DOM + CSSOM + 坐标 + canvas 像素
        -> HTP 对象模型
        -> Office Open XML
        -> .pptx
```

HTP 使用浏览器不是为了简单截图，而是因为坐标测量、字体度量、canvas 输出、SVG 渲染、伪元素、滤镜和复杂 CSS 都属于浏览器职责。截图只是可能的输出形式之一，核心依赖是真实渲染信息。

## 兼容性

`@htp/pptx` 写入完整 PresentationML 包，而不是只生成最小 zip 外壳。当前生成内容包括 presentation properties、view properties、table styles、theme defaults、slide master text styles、color map overrides、合法段落对齐 token、slide/media relationships 和 content type overrides，用于保证 Microsoft PowerPoint 与 WPS 可直接打开。

## 开发

```bash
pnpm install
pnpm build
```

构建测试项目：

```bash
pnpm --filter htp-react-official-fixture build
pnpm --filter vue-blog-fixture build
```

运行集成导出测试：

```bash
node test/scripts/export.test.js
```

集成测试只维护三个项目：

- `test/projects/react-official`
- `test/projects/vue-blog`
- `test/projects/vanilla-launch`

这三个项目用于覆盖 runtime 标记、浏览器采集、字体映射、表格导出、图片栅格化和 PPTX 打包。测试配置不应该变成第二套答案配置。

## 文档

- [设计文档](docs/design-spec.md)
- [项目约束](docs/project-constraints.md)
- [变更日志](docs/CHANGELOG.md)

## 贡献

欢迎 issue 和 pull request。行为变更应尽量配套 fixture 或聚焦测试；不要通过给测试项目堆配置来掩盖 exporter 问题。公开 API 应保持小而清晰。

## 许可证

[GPL-3.0](LICENSE)
