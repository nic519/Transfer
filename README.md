# Web Relay Platform

一个基于 Next.js 构建的轻量级网址代理平台。它适合部署在 Vercel、Cloudflare 等边缘网络环境中，通过平台代理访问目标网址，并同时提供：

- 面向人工调试的可视化控制台
- 面向第三方程序的标准化代理 API

这个项目不再面向 Clash 订阅链接等特定用途，而是一个更通用、更专业的网址代理平台。

## 功能特点

- 双模式接入：保留快捷 `GET` 入口，同时以结构化 `POST` 作为标准接口
- 可视化控制台：支持填写目标 URL、Method、Headers、Body 并查看上游响应
- 本地历史记录：最近请求保存在浏览器本地，可一键回填
- 通用错误结构：便于脚本和程序统一处理失败响应
- 轻量部署：适合直接部署到 Vercel 等平台

## 快速开始

### 本地运行

```bash
bun install
bun dev
```

默认访问地址：

`http://localhost:3600`

## API 使用方式

### 1. Quick Access: GET

适合浏览器直接访问、简单脚本拼接和临时调试：

```txt
http://your-domain.com/api/proxy?url=https://example.com/data
```

### 2. Standard API: POST

推荐正式接入使用，适合传递更多配置：

```http
POST /api/proxy
Content-Type: application/json
```

```json
{
  "url": "https://example.com/data",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer token"
  },
  "body": ""
}
```

### 错误返回示例

当代理在获取到上游响应前失败时，会返回统一 JSON 结构：

```json
{
  "error": "proxy_request_failed",
  "message": "Upstream request could not be completed",
  "status": 502
}
```

## 技术栈

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Bun

## 部署

### 部署到 Vercel

1. 将项目推送到 GitHub
2. 在 Vercel 中导入仓库
3. 点击部署

## 许可证

MIT
