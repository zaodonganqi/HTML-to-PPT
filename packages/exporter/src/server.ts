/**
 * ────────────────────────────────────────────────────────────────────────────────
 * 本地静态文件服务器模块
 * ────────────────────────────────────────────────────────────────────────────────
 * 为导出流程提供轻量级的 HTTP 静态文件服务。当输入源是本地文件或目录时，
 * 本模块会启动一个临时的 HTTP 服务器，使 Playwright 浏览器能够加载页面
 * 及其所有关联资源（CSS、JS、图片、字体等）。
 *
 * 特性：
 *   - 自动 MIME 类型映射，支持常见前端资源格式
 *   - 端口冲突时自动递增查找可用端口
 *   - 目录路径自动查找 index.html
 *   - 跨域头设置（Access-Control-Allow-Origin: *）
 * ────────────────────────────────────────────────────────────────────────────────
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";

export interface LocalServer {
  /** 服务器监听的完整 URL */
  url: string;
  /** 服务器监听的端口号 */
  port: number;
  /** 关闭服务器并释放端口 */
  close: () => Promise<void>;
}

// MIME 类型映射表：文件扩展名 → HTTP Content-Type
const MIME_MAP: Record<string, string> = {
  ".html": "text/html",
  ".htm": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".xml": "application/xml",
  ".txt": "text/plain",
};

/**
 * 根据文件路径获取对应的 MIME 类型。
 * 如果扩展名不在映射表中，返回 application/octet-stream。
 */
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_MAP[ext] || "application/octet-stream";
}

/**
 * ────────────────────────────────────────────────────────────────────────────────
 * 启动本地静态文件服务器
 * ────────────────────────────────────────────────────────────────────────────────
 * 在指定目录上启动一个 HTTP 静态文件服务器。如果首选端口被占用，
 * 会自动递增尝试下一个端口号。服务器绑定到 127.0.0.1 地址。
 *
 * 请求处理：
 *   - 目录路径自动重定向到 index.html
 *   - 设置 CORS 头允许跨域访问
 *   - 禁用缓存以便开发调试
 *
 * @param rootDir 要提供静态文件服务的根目录
 * @param preferredPort 首选端口号（被占用时自动递增查找）
 * @returns 返回包含 url、port 和 close 方法的 LocalServer 对象
 * ────────────────────────────────────────────────────────────────────────────────
 */
export function startServer(rootDir: string, preferredPort?: number): Promise<LocalServer> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const urlPath = new URL(req.url || "/", "http://localhost").pathname;
      let filePath = path.join(rootDir, urlPath);

      // 目录路径 → 尝试 index.html
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }

      // 文件不存在时返回 404
      if (!fs.existsSync(filePath)) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
        return;
      }

      const mime = getMimeType(filePath);
      const content = fs.readFileSync(filePath);
      res.writeHead(200, {
        "Content-Type": mime,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
      });
      res.end(content);
    });

    server.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        // 端口被占用 → 尝试下一个端口
        const nextPort = (preferredPort || 3456) + 1;
        server.close();
        startServer(rootDir, nextPort).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });

    const port = preferredPort || 3456;
    server.listen(port, "127.0.0.1", () => {
      resolve({
        url: `http://127.0.0.1:${port}`,
        port,
        close: () =>
          new Promise<void>((res) => {
            server.close(() => res());
          }),
      });
    });
  });
}
