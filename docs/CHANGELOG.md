# 变更日志

本文件记录项目中值得关注的变更。包正式发布后按语义化版本管理。

## [Unreleased]

### 新增

- 新增父子标记节点合并策略：`auto`、`text`、`all`、`none`、`only`。
- 新增 `htp-merge` 标记输出，用于 exporter 解析嵌套标记节点的导出所有权。
- 新增 `image` DOM 区域的浏览器侧栅格化能力，可覆盖 canvas、SVG、CSS 视觉和复杂容器。
- 新增 `@htp/exporter` 字体解析配置：`fonts.table`、`fonts.map`、`defaultFont`、`latin`、`eastAsia`、`monospace`、`warn`。
- 新增字体不在 PPT 安全字体表内时的控制台 warning 与导出 warning。
- 新增 Office 兼容所需 PresentationML 部件：`ppt/presProps.xml`、`ppt/viewProps.xml`、`ppt/tableStyles.xml`。
- 新增 slide/layout color map override、slide master text styles、theme object defaults，以及表格行列 id 扩展。

### 变更

- 公开标记收敛为 `slide`、`text`、`table`、`image` 四类。
- `image` 的语义调整为“把这个 DOM 区域按浏览器真实渲染结果导出为 PPT 图片元素”，不局限于 HTML `<img>`。
- 移除额外视觉标记概念；需要视觉栅格化的区域统一使用 `image`。
- 节点 `id` 和显式 `order` 作为可选逃生口，不再要求测试项目逐项配置。
- `htp-ready` 等待逻辑优先等待 runtime 的显式 ready 信号，再进入通用页面就绪兜底。
- 集成测试限定为三个维护中的 fixture：React official、Vue blog、vanilla launch。

### 修复

- 修复父级 image 区域包含已标记 text/table/image 子节点时的重复导出与重叠问题。
- 修复段落对齐 XML 写法，改为在 `a:pPr@algn` 上写入合法 DrawingML token。
- 修复 PowerPoint 会修复的表格 XML：移除无效 table cell anchor，并避免空 cell run。
- 修复缺失 presentation 关系与 content type 导致 PowerPoint 提示修复的问题。
- 通过项目级字体映射改善 WPS/PowerPoint 字体缺失表现，避免在库默认值中写死业务字体。
- 补充本地输出、诊断文件和缓存目录的忽略规则，避免生成产物被误跟踪。

## [0.0.1] - 2026-06-29

### 新增

- 初始化 pnpm workspace，包含 runtime、exporter、PPTX writer、CLI、Vite 插件和 core 工具包。
- 完成基于浏览器渲染的 HTML 到 PPTX 初始 proof of concept。
- 新增初版设计文档与项目约束文档。
