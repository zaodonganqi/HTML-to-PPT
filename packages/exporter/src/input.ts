/**
 * ────────────────────────────────────────────────────────────────────────────────
 * 输入解析模块
 * ────────────────────────────────────────────────────────────────────────────────
 * 本模块负责将各种形式的导出输入统一解析为 Playwright 可导航的 URL。
 *
 * 支持的输入类型：
 *   1. HTTP/HTTPS URL —— 直接返回，无需额外处理
 *   2. HTML 字符串 —— 写入临时文件后启动本地服务器
 *   3. Buffer —— 解码为字符串后按 HTML 字符串处理
 *   4. 本地文件路径 —— 在文件所在目录启动本地服务器
 *   5. 本地目录路径 —— 在该目录启动本地服务器（自动查找 index.html）
 *
 * 每种路径都会返回一个 ResolvedInput 对象，其中包含：
 *   - url：Playwright 可导航的 URL
 *   - server：如果启动了本地服务器则包含其句柄（使用后须关闭）
 *   - tempFile：如果创建了临时文件则包含其路径（使用后须清理）
 * ────────────────────────────────────────────────────────────────────────────────
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { startServer, LocalServer } from "./server";

export interface ResolvedInput {
  /** Playwright 可导航的目标 URL */
  url: string;
  /** 本地服务器句柄（如果启动了本地服务器），导出完成后必须关闭 */
  server?: LocalServer;
  /** HTML 字符串写入的临时文件路径（使用后须清理） */
  tempFile?: string;
}

/**
 * ────────────────────────────────────────────────────────────────────────────────
 * 将导出输入解析为 Playwright 可导航的 URL
 * ────────────────────────────────────────────────────────────────────────────────
 * 根据输入类型自动选择解析策略：
 *   - 以 http:// 或 https:// 开头的字符串 → 直接作为 URL 返回
 *   - 以 "<" 开头的字符串 → 视为 HTML 字符串，写入临时文件并启动服务器
 *   - Buffer 类型 → 解码后递归处理
 *   - 文件/目录路径 → 启动本地静态文件服务器
 *
 * 如果输入无法解析为有效的 URL 或文件路径，将抛出异常。
 * ────────────────────────────────────────────────────────────────────────────────
 */
export async function resolveInput(
  input: string | Buffer,
  cwd?: string,
): Promise<ResolvedInput> {
  const workingDir = cwd || process.cwd();

  // 情况 1：HTTP/HTTPS URL
  if (typeof input === "string" && /^https?:\/\//i.test(input)) {
    return { url: input };
  }

  // 情况 2：HTML 字符串（以 "<" 开头）
  if (typeof input === "string" && input.trim().startsWith("<")) {
    const tmpDir = path.join(os.tmpdir(), "htp-export-" + Date.now());
    fs.mkdirSync(tmpDir, { recursive: true });
    const tmpFile = path.join(tmpDir, "index.html");
    fs.writeFileSync(tmpFile, input, "utf-8");
    const server = await startServer(tmpDir);
    return { url: server.url, server, tempFile: tmpFile };
  }

  // 情况 3：Buffer 输入
  if (Buffer.isBuffer(input)) {
    const str = input.toString("utf-8");
    if (str.trim().startsWith("<")) {
      return resolveInput(str, cwd);
    }
    throw new Error("Buffer input must be an HTML string");
  }

  // 情况 4：本地文件路径
  const resolvedPath = path.isAbsolute(input)
    ? input
    : path.resolve(workingDir, input);

  let stat: fs.Stats;
  try {
    stat = fs.statSync(resolvedPath);
  } catch {
    throw new Error(`Input not found: ${resolvedPath}`);
  }

  let serveDir: string;
  if (stat.isDirectory()) {
    serveDir = resolvedPath;
  } else if (stat.isFile()) {
    serveDir = path.dirname(resolvedPath);
  } else {
    throw new Error(`Unsupported input: ${resolvedPath}`);
  }

  const server = await startServer(serveDir);
  return { url: server.url, server };
}
