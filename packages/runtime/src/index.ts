/**
 * ═══════════════════════════════════════════════════════════════
 * @htp/runtime — 浏览器运行时库
 * ═══════════════════════════════════════════════════════════════
 *
 * 提供类似 GSAP 的声明式 API，用于将 DOM 元素标记为 PPT 可导出元素。
 * 负责元素注册、清单（manifest）生成以及动画预览控制。
 * 完整设计方案详见 docs/design-spec.md §5。
 */

import type {
  HtpManifest,
  HtpConfig,
  HtpAnimationEffect,
  HtpNodeType,
} from "@htp/core";
import { DEFAULT_CONFIG, deepMerge } from "@htp/core";

// ---------------------------------------------------------------------------
// 类型定义
// ---------------------------------------------------------------------------

/** 目标元素类型：支持选择器字符串、单个元素、元素数组、NodeList 或 HtpSelection */
export type Target = string | Element | Element[] | NodeList | HtpSelection;

export interface SlideOptions {
  /** 幻灯片唯一标识符 */
  id?: string;
  /** 幻灯片在演示文稿中的排列顺序 */
  order?: number;
}

export interface TextOptions {
  /** 文本节点唯一标识符 */
  id?: string;
  /** 文本导出模式：editable（可编辑）、image（图片）或 both（两者兼有） */
  textMode?: "editable" | "image" | "both";
}

export interface TableOptions {
  /** 表格节点唯一标识符 */
  id?: string;
}

export interface ImageOptions {
  /** 图片节点唯一标识符 */
  id?: string;
}

export interface FallbackOptions {
  /** 回退节点唯一标识符 */
  id?: string;
}

export interface AnimationOptions {
  /** 动画目标节点唯一标识符 */
  id?: string;
  /** 动画效果类型（如 fadeIn、slideLeft 等） */
  effect: HtpAnimationEffect;
  /** 动画触发方式：click（点击触发）、withPrevious（与前一项同时）、afterPrevious（前一项之后） */
  trigger?: "click" | "withPrevious" | "afterPrevious";
  /** 动画持续时间（毫秒） */
  duration?: number;
  /** 动画延迟时间（毫秒） */
  delay?: number;
  /** 缓动函数：linear、easeIn、easeOut 或 easeInOut */
  easing?: "linear" | "easeIn" | "easeOut" | "easeInOut";
  /** 动画播放顺序 */
  order?: number;
  /** 动画起始状态（位移、缩放、旋转、透明度） */
  from?: { x?: number; y?: number; scale?: number; rotate?: number; opacity?: number };
  /** 动画结束状态（位移、缩放、旋转、透明度） */
  to?: { x?: number; y?: number; scale?: number; rotate?: number; opacity?: number };
  /** 动画回退策略：native（原生实现）、video（录制视频）、none（不处理） */
  fallback?: "native" | "video" | "none";
}

export interface AutoOptions {
  /** 自动检测幻灯片时使用的 CSS 选择器（默认值：".slide"） */
  slideSelector?: string;
  /** 自动标记为文本节点的 CSS 选择器（默认值："h1,h2,h3,h4,h5,h6,p,li"） */
  textSelectors?: string;
  /** 是否自动标记 img 元素（默认值：true） */
  images?: boolean;
  /** 是否自动标记 table 元素（默认值：true） */
  tables?: boolean;
}

export interface ReadyOptions {
  /** 就绪回调函数：在所有元素标记完成后异步执行 */
  callback?: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// HtpSelection — 元素集合封装
// ---------------------------------------------------------------------------

/**
 * HtpSelection 类
 *
 * 封装一组 DOM 元素，提供类 jQuery 的链式操作接口。
 * 所有标记方法（slide、text、table 等）均返回 HtpSelection 实例，
 * 以便调用方继续链式操作。
 */
export class HtpSelection {
  /** 构造并封装一组 DOM 元素 */
  constructor(public elements: Element[]) {}

  /** 获取当前集合中的元素数量 */
  get length(): number {
    return this.elements.length;
  }

  /** 遍历集合中的每个元素并执行回调函数，返回自身以支持链式调用 */
  each(fn: (el: Element, i: number) => void): this {
    this.elements.forEach(fn);
    return this;
  }
}

// ---------------------------------------------------------------------------
// HtpRuntime — 运行时接口
// ---------------------------------------------------------------------------

/**
 * HtpRuntime 接口
 *
 * 定义浏览器端运行时的完整操作契约。
 * 包括元素标记、自动检测、清单生成、动画预览以及作用域克隆等功能。
 * 全局单例通过 `htp` 常量暴露，构建插件可通过 `_withScope` 创建隔离实例。
 */
export interface HtpRuntime {
  /** 合并局部配置到当前运行时配置 */
  configure(partial: Partial<HtpConfig>): void;
  /** 将目标元素标记为幻灯片 */
  slide(target: Target, options?: SlideOptions): HtpSelection;
  /** 将目标元素标记为文本节点 */
  text(target: Target, options?: TextOptions): HtpSelection;
  /** 将目标元素标记为表格节点 */
  table(target: Target, options?: TableOptions): HtpSelection;
  /** 将目标元素标记为图片节点 */
  image(target: Target, options?: ImageOptions): HtpSelection;
  /** 将目标元素标记为回退节点 */
  fallback(target: Target, options?: FallbackOptions): HtpSelection;
  /** 为目标元素添加动画效果 */
  animate(target: Target, options: AnimationOptions): HtpSelection;
  /** 根据选择器自动检测并标记幻灯片、文本、图片、表格 */
  auto(options?: AutoOptions): void;
  /** 标记运行时就绪状态，可选传入异步回调在所有标记完成后执行 */
  ready(options?: ReadyOptions): void;
  /** 获取当前运行时收集的完整清单数据 */
  getManifest(): HtpManifest;
  /** 播放所有已注册的动画 */
  play(): void;
  /** 暂停当前正在播放的动画 */
  pause(): void;
  /** 跳转到动画时间轴的指定进度位置 */
  seek(t: number): void;
  /** @internal 创建具有独立作用域的运行时副本（供构建插件使用） */
  _withScope(scopeId: string): HtpRuntime;
}

// ---------------------------------------------------------------------------
// 内部辅助函数
// ---------------------------------------------------------------------------

// 将多种目标类型统一解析为 Element 数组
function resolveElements(target: Target): Element[] {
  if (typeof target === "string") {
    return Array.from(document.querySelectorAll(target));
  }
  if (target instanceof Element) {
    return [target];
  }
  if (target instanceof NodeList || Array.isArray(target)) {
    return Array.from(target) as Element[];
  }
  if (target instanceof HtpSelection) {
    return target.elements;
  }
  return [];
}

// 为给定元素构建唯一的 CSS 选择器路径（优先使用 id，其次使用标签 + 类名 + nth-child）
function buildSelector(el: Element): string {
  if (el.id) return `#${CSS.escape(el.id)}`;

  const parts: string[] = [];
  let current: Element | null = el;

  while (current && current !== document.body && current !== document.documentElement && parts.length < 5) {
    let sel = current.tagName.toLowerCase();
    if (current.id) {
      sel = `#${CSS.escape(current.id)}`;
      parts.unshift(sel);
      break;
    }
    if (current.classList.length > 0) {
      sel += "." + Array.from(current.classList).map((c) => CSS.escape(c)).join(".");
    }
    // 仅在兄弟节点中存在同名标签时才添加 nth-child 索引
    const parent = current.parentElement;
    if (parent) {
      const siblings = parent.querySelectorAll(`:scope > ${current.tagName.toLowerCase()}`);
      if (siblings.length > 1 || current.classList.length === 0) {
        const idx = Array.from(siblings).indexOf(current) + 1;
        sel += `:nth-child(${idx})`;
      }
    }
    parts.unshift(sel);
    current = current.parentElement;
  }

  return parts.join(" > ");
}

// 向上遍历 DOM 树，查找最近的标记为幻灯片的祖先元素
function findSlideAncestor(el: Element, marker: string): Element | null {
  let current: Element | null = el;
  while (current) {
    if (current.getAttribute(marker) === "slide") return current;
    if (current.classList.contains("slide")) return current;
    current = current.parentElement;
    if (current === document.body || current === document.documentElement) break;
  }
  return null;
}

// 根据元素在 DOM 中的位置推断其所属的幻灯片 ID
// 优先级：1) 元素自身是幻灯片  2) 查找祖先幻灯片  3) 回退到第一张幻灯片或 "slide-0"
function findSlideId(
  el: Element,
  marker: string,
  slides: HtpManifest["slides"],
): string {
  // 检查元素自身是否被标记为幻灯片
  if (el.getAttribute(marker) === "slide" || el.classList.contains("slide")) {
    const existing = slides.find((s) => s.selector === buildSelector(el));
    if (existing) return existing.id;
  }

  // 向上查找祖先幻灯片元素
  const slideEl = findSlideAncestor(el, marker);
  if (slideEl) {
    const sel = buildSelector(slideEl);
    const existing = slides.find((s) => s.selector === sel);
    if (existing) return existing.id;
    // 回退：使用元素 id 或选择器字符串作为幻灯片标识
    const slideId = slideEl.id || sel;
    return slideId;
  }

  // 最终回退：使用第一张幻灯片 ID 或默认值
  if (slides.length > 0) return slides[0].id;
  return "slide-0";
}

// ---------------------------------------------------------------------------
// 运行时工厂函数
// ---------------------------------------------------------------------------

/**
 * createRuntime
 *
 * 创建一个完整的 HtpRuntime 实例。
 * 维护内部的节点列表、幻灯片列表和动画列表，并暴露标记与查询方法。
 * 可选传入 scopeId 以创建隔离的作用域实例（供构建插件使用）。
 *
 * @param config  - 运行时配置，默认使用 DEFAULT_CONFIG
 * @param scopeId - 可选的作用域标识符
 * @returns 实现 HtpRuntime 接口的完整运行时对象
 */
function createRuntime(
  config: HtpConfig = DEFAULT_CONFIG,
  scopeId?: string,
): HtpRuntime {
  // 节点清单列表
  const nodes: HtpManifest["nodes"] = [];
  // 幻灯片列表
  const slides: HtpManifest["slides"] = [];
  // 动画列表
  const animations: HtpManifest["animations"] = [];

  // 自增 ID 计数器
  let idCounter = 0;
  // 生成唯一 ID 的辅助函数
  const nextId = (prefix: string) => `${prefix}_${++idCounter}`;

  // 获取节点的最终 ID：优先使用用户指定的 id，其次使用元素自身 id，最后自动生成
  function getNodeId(el: Element, options: { id?: string } | undefined, prefix: string): string {
    return options?.id || el.id || nextId(prefix);
  }

  // 在 DOM 元素上标记类型属性和可选的作用域属性
  function markElement(el: Element, type: HtpNodeType): void {
    el.setAttribute(config.marker.typeAttr, type);
    if (scopeId) {
      el.setAttribute(config.marker.scopeAttr, scopeId);
    }
  }

  // 将目标解析为 CSS 选择器字符串
  function resolveSelector(target: Target): string {
    if (typeof target === "string") return target;
    const els = resolveElements(target);
    if (els.length === 0) return "";
    return buildSelector(els[0]);
  }

  const rt: HtpRuntime = {
    // 合并局部配置
    configure(partial) {
      config = deepMerge(config, partial);
    },

    // 标记幻灯片
    slide(target, options) {
      const els = resolveElements(target);
      els.forEach((el) => {
        const id = getNodeId(el, options, "slide");
        markElement(el, "slide");
        const sel = options?.id ? buildSelector(el) : resolveSelector(target);
        // 避免重复添加同一幻灯片
        if (!slides.find((s) => s.id === id)) {
          slides.push({ id, selector: sel, order: options?.order, scopeId });
        }
      });
      return new HtpSelection(els);
    },

    // 标记文本节点
    text(target, options) {
      const els = resolveElements(target);
      els.forEach((el) => {
        const id = getNodeId(el, options, "text");
        markElement(el, "text");
        const slideId = findSlideId(el, config.marker.typeAttr, slides);
        const sel = buildSelector(el);
        if (!nodes.find((n) => n.id === id)) {
          nodes.push({
            id,
            type: "text",
            selector: sel,
            slideId,
            scopeId,
            editable: options?.textMode !== "image",
            textMode: options?.textMode,
          });
        }
      });
      return new HtpSelection(els);
    },

    // 标记表格节点
    table(target, options) {
      const els = resolveElements(target);
      els.forEach((el) => {
        const id = getNodeId(el, options, "table");
        markElement(el, "table");
        const slideId = findSlideId(el, config.marker.typeAttr, slides);
        const sel = buildSelector(el);
        if (!nodes.find((n) => n.id === id)) {
          nodes.push({
            id,
            type: "table",
            selector: sel,
            slideId,
            scopeId,
          });
        }
      });
      return new HtpSelection(els);
    },

    // 标记图片节点
    image(target, options) {
      const els = resolveElements(target);
      els.forEach((el) => {
        const id = getNodeId(el, options, "image");
        markElement(el, "image");
        const slideId = findSlideId(el, config.marker.typeAttr, slides);
        const sel = buildSelector(el);
        if (!nodes.find((n) => n.id === id)) {
          nodes.push({
            id,
            type: "image",
            selector: sel,
            slideId,
            scopeId,
          });
        }
      });
      return new HtpSelection(els);
    },

    // 标记回退节点
    fallback(target, options) {
      const els = resolveElements(target);
      els.forEach((el) => {
        const id = getNodeId(el, options, "fallback");
        markElement(el, "fallback");
        const slideId = findSlideId(el, config.marker.typeAttr, slides);
        const sel = buildSelector(el);
        if (!nodes.find((n) => n.id === id)) {
          nodes.push({
            id,
            type: "fallback",
            selector: sel,
            slideId,
            scopeId,
          });
        }
      });
      return new HtpSelection(els);
    },

    // 为目标元素注册动画效果
    animate(target, options) {
      const els = resolveElements(target);
      els.forEach((el) => {
        // 查找或创建该元素对应的清单节点
        let node = nodes.find((n) => n.selector === buildSelector(el));
        if (!node) {
          const slideId = findSlideId(el, config.marker.typeAttr, slides);
          node = {
            id: el.id || nextId("node"),
            type: "fallback", // 默认节点类型
            selector: buildSelector(el),
            slideId,
            scopeId,
          };
          nodes.push(node);
        }

        animations.push({
          nodeId: node.id,
          effect: options.effect,
          trigger: options.trigger,
          duration: options.duration,
          delay: options.delay,
          easing: options.easing,
          order: options.order,
          from: options.from,
          to: options.to,
          fallback: options.fallback,
        });
      });
      return new HtpSelection(els);
    },

    // 自动检测页面中的幻灯片、文本、图片和表格元素
    auto(options) {
      const slideSel = options?.slideSelector ?? ".slide";
      const slideEls = document.querySelectorAll(slideSel);

      slideEls.forEach((el) => {
        if (!el.getAttribute(config.marker.typeAttr)) {
          rt.slide(el);
        }
      });

      // 确保至少存在一张幻灯片
      if (slideEls.length === 0 && slides.length === 0) {
        rt.slide(document.body);
      }

      if (options?.images !== false) {
        document.querySelectorAll("img").forEach((el) => {
          if (!el.getAttribute(config.marker.typeAttr)) {
            rt.image(el);
          }
        });
      }

      if (options?.tables !== false) {
        document.querySelectorAll("table").forEach((el) => {
          if (!el.getAttribute(config.marker.typeAttr)) {
            rt.table(el);
          }
        });
      }

      // 自动标记文本元素：仅标记包含直接文本内容且不包含块级子元素的叶子节点
      const textSel =
        options?.textSelectors ?? "h1,h2,h3,h4,h5,h6,p,li,span,div";
      document.querySelectorAll(textSel).forEach((el) => {
        // 跳过已标记的元素
        if (el.getAttribute(config.marker.typeAttr)) return;
        // 跳过包含块级子元素的容器节点（它们不是文本叶子节点）
        const hasBlockChild = Array.from(el.children).some(
          (c) => getComputedStyle(c).display === "block" || getComputedStyle(c).display === "flex",
        );
        const hasDirectText = Array.from(el.childNodes).some(
          (n) => n.nodeType === Node.TEXT_NODE && (n.textContent?.trim().length ?? 0) > 0,
        );
        if (hasDirectText && !hasBlockChild) {
          rt.text(el);
        }
      });
    },

    // 标记运行时已就绪，将清单写入全局对象并可选执行回调
    ready(options) {
      const readyKey = config.globals.ready;
      // 在标记就绪之前先将清单写入全局变量
      const manifest = rt.getManifest();
      (window as any)[config.globals.manifest] = manifest;

      if (options?.callback) {
        options.callback().then(() => {
          (window as any)[readyKey] = true;
        });
      } else {
        (window as any)[readyKey] = true;
      }
    },

    // 构建并返回当前的完整清单数据
    getManifest() {
      const manifest: HtpManifest = {
        version: "0.0.1",
        createdAt: new Date().toISOString(),
        deck: {
          width: 13.333,
          height: 7.5,
          unit: "in",
          layout: "LAYOUT_WIDE",
        },
        slides,
        nodes,
        animations,
      };
      return manifest;
    },

    // 播放动画：通过添加 CSS 类名触发动画预览
    play() {
      // Phase 4：基于 CSS 类名的简易动画预览实现
      animations.forEach((anim) => {
        const node = nodes.find((n) => n.id === anim.nodeId);
        if (!node) return;
        const el = document.querySelector(node.selector);
        if (!el) return;
        el.classList.add("htp-anim-playing");
        el.classList.add(`htp-anim-${anim.effect}`);
      });
    },

    // 暂停动画：移除所有动画相关的 CSS 类名
    pause() {
      animations.forEach((anim) => {
        const node = nodes.find((n) => n.id === anim.nodeId);
        if (!node) return;
        const el = document.querySelector(node.selector);
        if (!el) return;
        el.classList.remove("htp-anim-playing", ...Array.from(el.classList).filter((c) => c.startsWith("htp-anim-")));
      });
    },

    // 跳转到动画时间轴的指定进度（Phase 4 占位）
    seek(_t: number) {
      // Phase 4：定位到动画时间轴的特定进度位置
    },

    // 创建具有独立作用域的运行时副本
    _withScope(id: string): HtpRuntime {
      return createRuntime(config, id);
    },
  };

  return rt;
}

// ---------------------------------------------------------------------------
// 全局单例
// ---------------------------------------------------------------------------

// 全局默认运行时实例
export const htp: HtpRuntime = createRuntime();

export { createRuntime };
