# HTP 项目约束文档

> 版本: 1.0.0 | 生效日期: 2026-06-29 | 强制等级: **企业级**

---

## 一、目录结构约束

```
htp/
├── docs/                          # 项目文档（设计、约束、变更日志）
│   ├── design-spec.md             # 技术方案
│   ├── project-constraints.md     # 本约束文档
│   └── CHANGELOG.md               # 变更日志
│
├── packages/                      # 核心源码（monorepo）
│   ├── core/                      # @htp/core — 共享类型与工具库
│   ├── pptx/                      # @htp/pptx — PPTX 生成器
│   ├── runtime/                   # @htp/runtime — 浏览器运行时
│   ├── exporter/                  # @htp/exporter — Node.js 导出器
│   ├── cli/                       # @htp/cli — 命令行工具
│   └── vite-plugin/               # @htp/vite-plugin — Vite 集成
│
├── test/                          # 测试根目录（严格隔离，禁止混入 packages）
│   ├── projects/                  # 测试用项目（多个完整项目，含构建工具）
│   │   ├── vanilla-launch/        # 原生 HTML 手机发布会页面
│   │   ├── vue-blog/              # Vue 3 + Vite 博客页面
│   │   └── react-official/        # React + Vite 企业官网页面
│   ├── scripts/                   # 可执行的 .js 测试脚本（禁止 .mjs）
│   ├── unit/                      # 单元测试（vitest）
│   └── output/                    # 测试生成的 .pptx 产物（gitignore，不含截图）
│
├── examples/                      # 用户示例项目（完整可运行）
│   └── vanilla/                   # 纯 HTML + 内联 runtime 的使用示例
│
├── package.json                   # 根 workspace 配置
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .gitignore
└── README.md
```

### 1.1 禁止事项

| 事项 | 说明 |
|------|------|
| 禁止在 `packages/*/` 下放置任何测试文件 | 测试脚本、debug 脚本、临时脚本一律放入 `test/scripts/` |
| 禁止在 `packages/*/` 下放置测试产物 | `.pptx`、`debug-*.png` 等一律放入 `test/output/` |
| 禁止使用 `.mjs` 扩展名 | 项目仅使用 `.js`（CJS）或 `.ts`（源码），ESM 脚本用 `.js` + `"type":"module"` |
| 禁止在非 test 目录下创建 `debug*` 前缀文件 | debug 是测试行为，归属 `test/` 管理 |

### 1.2 目录职责矩阵

| 目录 | 源码 | 测试 | 文档 | 示例 | 产物 |
|------|:----:|:----:|:----:|:----:|:----:|
| `packages/*/src/` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `packages/*/dist/` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `test/projects/` | ⚠️ 测试项目源码 | ✅ | ❌ | ❌ | ❌ |
| `test/scripts/` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `test/output/` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `docs/` | ❌ | ❌ | ✅ | ❌ | ❌ |
| `examples/` | ⚠️ 示例源码 | ❌ | ❌ | ✅ | ❌ |

---

## 二、注释约束（强制）

### 2.1 语言

**所有注释必须使用简体中文**，包括但不限于：

- 文件头注释
- 函数 / 方法注释
- 类型 / 接口注释
- 变量声明注释
- TODO / FIXME / HACK 标记
- 行内解释注释

例外：JSDoc 标准标签保留英文（`@param`, `@returns`, `@throws`, `@see`）。

### 2.2 函数注释格式（标准 JSDoc，中文正文）

所有 `export` 函数、类方法、以及内部复杂度较高的 `function`，必须使用标准 JSDoc 多行格式：

```typescript
/**
 * <函数功能的一句话概述>
 *
 * <详细说明>
 * <可以有多行正文，描述算法思路、注意事项、边界条件、调用时机等>
 */
export function myFunction(): void { ... }
```

简单函数允许单行 `/** 做某件事 */`，不做行数强制。

**规则详情：**

| 规则 | 说明 |
|------|------|
| 格式 | 标准 JSDoc：`/**` 开头，`*/` 结尾，中间每行以 ` * ` 开头 |
| 首行 | 函数功能的一句话概述 |
| 正文 | 概述与正文之间空一行 ` *`，然后写详细说明 |
| 禁止 | 分隔线（`───`）等装饰性字符；英文正文 |

**正确示例：**

```typescript
/**
 * 解析 CSS 颜色字符串为 RGB / HEX 统一结构
 *
 * 支持以下格式：
 * - 命名颜色 (red, transparent 等 148 种)
 * - 十六进制 (#fff, #f0f0f0, #ff00ff80)
 * - rgb/rgba 函数记法
 * - hsl/hsla 函数记法
 * 透明色映射为 { r:0, g:0, b:0, a:0 }，非透明色统一附带 hex 字段。
 */
export function resolveColor(cssColor: string): ParsedColor { ... }
```

**错误示例（禁止）：**

```typescript
// ❌ 单行 // 注释用于函数（信息量不足）
export function foo() { ... }

// ❌ 带分隔线装饰
/**
 * ─────────────────────────────────────────────
 * 做某件事
 * ─────────────────────────────────────────────
 */
export function bar() { ... }

// ❌ 英文注释
/**
 * Resolve the input URL
 */
export function resolve() { ... }
```

### 2.3 变量注释格式（单行）

变量、常量、属性声明使用单行注释 `//`，禁止多行：

```typescript
// 视口宽度（像素）
const viewportWidth = 1920;

// EMU 每英寸换算常量（Office Open XML 规范值）
const EMU_PER_INCH = 914400;
```

**接口 / 类型成员**同样采用单行 `//` 注释（与普通变量一致，不使用 `/** */`）：

```typescript
export interface HtpPptxTable {
  // 表格类型标记
  type: "table";
  // 左上角 x 坐标（英寸）
  x: number;
  // 左上角 y 坐标（英寸）
  y: number;
  // 表格宽度（英寸）
  w: number;
  // 表格高度（英寸）
  h: number;
  // 行数
  rows: number;
  // 列数
  cols: number;
  // 单元格数组（先行后列排列）
  cells: HtpPptxTableCell[];
}
```

### 2.4 文件头注释

每个 `src/` 下的 `.ts` 文件必须包含文件头注释：

```typescript
/**
 * <模块名> — <一句话职责描述>
 *
 * <详细说明此文件负责的功能范围>
 */
```

---

## 三、代码风格约束

### 3.1 TypeScript

| 规则 | 要求 |
|------|------|
| 严格模式 | `tsconfig.base.json` 中 `strict: true` |
| 类型导出 | 所有公开 API 类型必须显式 `export` |
| 类型推断 | 不依赖隐式 `any`；回调参数必须标注类型 |
| 接口命名 | `I` 前缀禁用，使用描述性名称（`HtpNode` 而非 `IHtpNode`） |
| 枚举 | 优先使用 `const` 联合类型，仅在需要运行时值时使用 `enum` |

### 3.2 命名规范

| 元素 | 风格 | 示例 |
|------|------|------|
| 包名 | kebab-case | `@htp/vite-plugin` |
| 文件名 | kebab-case | `slide-master.ts` |
| 类名 | PascalCase | `HtpSelection` |
| 接口名 | PascalCase | `HtpPptxDeck` |
| 类型别名 | PascalCase | `SlideObject` |
| 函数名 | camelCase | `resolveColor` |
| 变量名 | camelCase | `deckWidth` |
| 常量 | UPPER_SNAKE | `EMU_PER_INCH` |
| 枚举成员 | UPPER_SNAKE | `HTP_SLIDE_NOT_FOUND` |
| 私有成员 | camelCase（无下划线前缀） | `#internalMap` (JS private) |

### 3.3 模块组织

每个 `packages/*/src/` 下的模块按职责拆分子文件：

```
src/
  index.ts          # 公开 API 的 re-export 入口
  types.ts          # 本包专属类型定义
  utils.ts          # 内部工具函数（不对外导出）
  ...
```

子模块按功能域分目录（如 `pptx/src/xml/`、`exporter/src/extract/`）。

### 3.4 依赖方向约束

```
@htp/core          ← 零外部依赖（纯 TS 工具）
@htp/pptx          ← core + jszip
@htp/runtime        ← core
@htp/exporter       ← core + pptx + playwright
@htp/cli            ← exporter + commander
@htp/vite-plugin    ← exporter + vite
```

**禁止反向依赖**：上层包不能引用下层包；`core` 不能引用任何其他包。

---

## 四、测试约束

### 4.1 测试目录结构

```
test/
├── projects/          # 测试用项目（完整的可构建项目）
│   ├── vanilla-launch/ # 原生 HTML 手机发布会页面（无构建工具）
│   ├── vue-blog/       # Vue 3 + Vite 博客页面
│   └── react-official/ # React + Vite 企业官网页面
├── scripts/           # 手动执行的验证脚本（.js，禁止 .mjs）
│   ├── export.test.js # 导出流程集成测试
│   └── ...
├── unit/              # vitest 单元测试
│   ├── core.test.ts
│   ├── pptx.test.ts
│   └── ...
└── output/            # 测试产物（仅 .pptx，禁止保存截图）
```

### 4.2 测试脚本规范

- 扩展名：`.js`（不是 `.mjs`），使用 ES module（`"type": "module"` 或在 package.json 中声明）
- 位于 `test/scripts/`，不得散落在 `packages/` 或项目根目录
- 每个脚本可独立运行：`node test/scripts/<name>.js`
- 产物统一写入 `test/output/`，脚本负责确保目录存在
- 脚本执行完后输出简洁摘要（成功/失败 + 关键指标）

### 4.3 测试执行

```bash
# 单元测试
pnpm test

# 集成验证（手动）
node test/scripts/export.test.js

# 带 debug 输出
node test/scripts/export.test.js --debug
```

### 4.4 禁止事项（测试）

| 禁止 | 原因 |
|------|------|
| 测试文件放在 `packages/*/` | 污染源码目录 |
| 测试产物留在项目根目录 | 破坏目录整洁 |
| 使用 `.mjs` 扩展名 | 统一为 `.js` |
| 测试脚本依赖全局安装的工具 | 所有依赖必须在 `devDependencies` 中声明 |
| 硬编码绝对路径 | 使用 `import.meta.url` 或 `__dirname` 推导 |

---

## 五、构建与发布约束

### 5.1 构建工具

- 所有包使用 **tsup** 构建
- 输出格式：ESM（`--format esm`）
- 同时生成类型声明（`--dts`）
- `dist/` 目录不提交到 Git

### 5.2 版本管理

- 遵循语义化版本（SemVer）
- 当前版本：`0.1.0`（开发阶段）
- 公开发布前升级至 `1.0.0`

### 5.3 提交规范

```
<type>(<scope>): <简要描述>

类型: feat | fix | docs | style | refactor | test | chore | build
范围: core | pptx | runtime | exporter | cli | vite-plugin | docs | test
```

---

## 六、示例项目约束

`examples/` 目录下的示例必须：

1. 可**独立运行**（从根目录一键启动）
2. 附带 `README.md` 说明启动步骤
3. 示例 HTML 中**优先使用 `@htp/runtime` 库**，而非手写内联 manifest
4. 如需静态 HTML 示例（不依赖构建），可放在 `test/projects/` 下

---

## 七、附则

### 7.1 优先级

本约束文档 > 设计文档中的非规范性描述 > 开发者个人偏好。

### 7.2 修订

修改本文件需要：在 `CHANGELOG.md` 中记录变更内容、原因、日期。

### 7.3 合规检查

代码审查（Code Review）时逐条对照本约束文档执行。不符合约束的代码不得合并。
