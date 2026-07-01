/**
 * ─────────────────────────────────────────────
 * HTP Vanilla 示例 — 使用 @htp/runtime 库标记幻灯片内容
 *
 * 此文件演示了 @htp/runtime 的标准用法：
 * 1. 导入 htp 单例
 * 2. 配置幻灯片尺寸
 * 3. 标记文本 / 表格 / 图片 / 回退元素
 * 4. 调用 ready() 发出就绪信号
 * ─────────────────────────────────────────────
 */
import { htp } from "@htp/runtime";

// 配置幻灯片尺寸（宽屏 16:9 → 13.333" × 7.5"）
htp.configure({
  deck: { width: 13.333, height: 7.5, layout: "LAYOUT_WIDE" },
  globals: { ready: "__HTP_READY__", manifest: "__HTP_MANIFEST__" },
});

// Slide 1: 标题页
htp.slide(".slide-1", { id: "slide-1" });
htp.text("#title", { id: "title" });
htp.text("#subtitle", { id: "subtitle" });
htp.fallback(".accent-bar", { id: "accent-bar" });

// Slide 2: 内容页
htp.slide(".slide-2", { id: "slide-2" });
htp.text("#slide2-title", { id: "slide2-title" });
htp.fallback(".visual", { id: "visual" });
htp.table("#metrics", { id: "metrics" });

// Slide 3: 结尾页
htp.slide(".slide-3", { id: "slide-3" });
htp.text(".slide-3 h1", { id: "thanks-title" });
htp.text(".slide-3 p", { id: "thanks-text" });

// 发出就绪信号（模拟异步数据加载的延迟）
setTimeout(() => {
  htp.ready();
}, 200);
