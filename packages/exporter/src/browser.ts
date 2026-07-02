/**
 * 浏览器会话管理模块
 * 本模块负责 Playwright 浏览器的生命周期管理：
 *   - 启动无头 Chromium 浏览器
 *   - 配置视口和设备缩放因子
 *   - 导航到目标 URL 并等待页面就绪
 *   - 支持多种就绪策略：load、networkidle、htp-ready
 *   - 等待自定义字体加载完成
 *   - 额外的异步渲染稳定等待时间
 *
 * 导出 createBrowserSession 函数作为浏览器会话的单一入口。
 */

import { chromium, Browser, Page } from "playwright";
import type { HtpConfig } from "@htp/core";
import { DEFAULT_CONFIG } from "@htp/core";

export interface BrowserSession {
  /** Playwright 浏览器实例 */
  browser: Browser;
  /** 当前活动的页面对象 */
  page: Page;
}

export interface BrowserOptions {
  /** 浏览器视口尺寸 */
  viewport: { width: number; height: number };
  /** 页面就绪等待策略 */
  waitUntil: "load" | "networkidle" | "htp-ready";
  /** 操作超时时间（毫秒） */
  timeout: number;
  /** 用于 htp-ready 策略的就绪信号 key（挂载在 window 上的属性名） */
  readyKey: string;
}

/**
 * 创建浏览器会话并导航到目标页面
 * 启动一个无头 Chromium 浏览器，创建页面上下文，导航到指定 URL，
 * 并根据配置的等待策略等待页面就绪。
 *
 * 支持的等待策略：
 *   - "load"：等待 load 事件触发
 *   - "networkidle"：等待网络空闲（无持续请求）
 *   - "htp-ready"：等待 window 上指定 key 变为 true，同时以 networkidle 作保底
 *     如果超时仍未就绪则打印警告并继续
 *
 * 导航完成后额外等待 500ms 以确保异步渲染完全稳定。
 * 如果导航失败则自动关闭浏览器并抛出异常。
 */
export async function createBrowserSession(
  url: string,
  options: BrowserOptions,
): Promise<BrowserSession> {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const context = await browser.newContext({
    viewport: options.viewport,
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  try {
    await page.goto(url, {
      waitUntil: options.waitUntil === "htp-ready" ? "load" : options.waitUntil,
      timeout: options.timeout,
    });

    // 等待 HTP 就绪信号
    if (options.waitUntil === "htp-ready") {
      await Promise.race([
        page.waitForFunction(
          (key: string) => (window as any)[key] === true,
          options.readyKey,
          { timeout: options.timeout },
        ),
        // 同时等待网络空闲作为保底策略
        page.waitForLoadState("networkidle", { timeout: options.timeout }),
      ]).catch(() => {
        // htp-ready 始终未触发 → 以当前页面状态继续
        console.warn(`Warning: ${options.readyKey} was never set. Proceeding with current page state.`);
      });

      // 确保自定义字体已加载完成
      await page.evaluate(() => document.fonts?.ready).catch(() => {});
    }

    // 额外的稳定等待时间，保证异步渲染完全结束
    await page.waitForTimeout(500);
  } catch (err) {
    await browser.close();
    throw err;
  }

  return { browser, page };
}
