![](https://files.seeusercontent.com/2026/04/17/vpQ5/ffff60e1-d43e-4681-b2f1-8a90cd99.png)

# Web Relay Platform

一个基于 Next.js App Router 构建的轻量级网址代理工作台。它通过统一的 `/api/proxy` 入口中转上游请求，并提供一套适合人工调试和程序接入的前端控制台。
 

## 功能特点

- 可视化代理工作台：围绕一次完整请求的输入、执行和响应查看重新设计
- 双接口模式：保留快捷 `GET` 代理入口，同时支持结构化 `POST` 标准接口
- 本地历史记录：最近 12 条请求保存在浏览器本地，可快速回填
- 内置 API 教程：侧栏可直接查看标准请求示例、快捷链接示例和错误结构
- 响应概览：展示状态码、行数、体积，并提取安全响应头摘要
- 快捷操作：支持 `Cmd / Ctrl + Enter` 执行请求、复制代理链接、复制响应内容
- 默认请求头策略：当调用方未传 `headers`，或传入空对象 `{}` 时，会自动补充预设 `User-Agent`

## 技术栈

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Bun Test
- Lucide React

## 本地开发

安装依赖并启动开发环境：

```bash
bun install
bun dev
```

默认访问地址：

`http://localhost:3600`

常用命令：

```bash
bun test
bun run build
```

## API 概览

统一代理入口：

`/api/proxy`

支持方法：

- `GET`
- `POST`
- `PUT`
- `PATCH`
- `DELETE`

仅允许代理 `http` / `https` 目标地址。

### Quick Access: GET

适合浏览器直接访问、临时拼接和快速分享：

```txt
GET /api/proxy?url=https://example.com/data
```

完整示例：

```txt
http://your-domain.com/api/proxy?url=https://example.com/data
```

说明：

- `GET` 快捷入口只接收 `url` 查询参数
- 服务端会直接以 `GET` 方法请求目标地址
- 当没有额外请求头时，会自动补默认 `User-Agent`

### Standard API: POST

适合正式接入和自定义更多请求信息：

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

请求体字段说明：

- `url`: 必填，目标地址
- `method`: 可选，默认 `GET`
- `headers`: 可选，请求头对象
- `body`: 可选，仅在 `POST / PUT / PATCH / DELETE` 时透传

请求头规则：

- 会过滤 `host` 和 `content-length`
- 如果 `headers` 缺失，或传入空对象 `{}`，会自动补预设 `User-Agent`
- 如果 `headers` 已包含任意字段，则不会再自动补默认 `User-Agent`

### 错误返回

代理在获取到上游响应前失败时，会返回统一 JSON 结构：

```json
{
  "error": "proxy_request_failed",
  "message": "Upstream request could not be completed",
  "status": 502
}
```

常见错误类型：

- `invalid_request`: 参数无效、URL 非法、方法不支持
- `proxy_request_failed`: 上游请求失败
- `internal_error`: 非预期服务端异常

## 前端工作台说明

首页工作台主要由三部分组成：

- 左侧侧栏：查看本地历史记录，或展开 API 使用教程
- 中间控制台：编辑 URL、Method、Headers JSON 和 Body，执行代理请求
- 右侧结果区：查看状态码、响应头摘要、响应正文，并支持复制结果

交互细节：

- 历史记录保存在浏览器 `localStorage`
- 相同请求会去重并刷新时间
- 最多保留 12 条历史
- 无效 URL 和非法 Headers JSON 会在前端先拦截

## 部署

### 部署到 Vercel

1. 将项目推送到 GitHub
2. 在 Vercel 中导入仓库
3. 执行默认构建并发布

## 许可证

MIT
