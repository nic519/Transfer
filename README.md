# Clash Subscription Proxy (Clash 订阅中转服务)

这是一个基于 Next.js 开发的轻量级订阅中转服务，专门用于解决某些订阅链接在特定环境下（如 Cloudflare 节点）无法访问或被屏蔽的问题。项目支持部署在 Vercel 等平台。

## ✨ 功能特点

- **多协议支持**: 同时支持 `GET` 和 `POST` 接口请求。
- **可视化界面**: 提供简洁的前端界面，支持输入目标 URL 进行即时测试。
- **自定义 Header**: 允许在测试时通过 JSON 格式添加自定义请求头（如 `User-Agent` 等）。
- **快速部署**: 完美兼容 Vercel，一键部署即可获得全球分发的中转地址。
- **Bun 驱动**: 使用 Bun 作为包管理器和运行环境，性能卓越。

## 🚀 快速开始

### 本地运行

1. **安装依赖**:
   ```bash
   bun install
   ```

2. **启动开发服务器**:
   ```bash
   bun dev
   ```

3. **访问**:
   打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 接口使用

#### 1. GET 请求 (最常用)
直接将目标订阅链接作为参数拼接：
`http://your-domain.com/api/proxy?url=https://target-subscription.com/clash.yaml`

#### 2. POST 请求 (高级用法)
用于需要发送自定义 Header 的场景：
- **Endpoint**: `/api/proxy`
- **Body (JSON)**:
  ```json
  {
    "url": "https://target-subscription.com/clash.yaml",
    "headers": {
      "User-Agent": "Clash/1.0",
      "Custom-Header": "YourValue"
    }
  }
  ```

## 🛠 技术栈

- **框架**: Next.js (App Router)
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **运行环境**: Bun
- **部署平台**: Vercel

## 📄 部署到 Vercel

1. 将代码推送到 GitHub。
2. 在 Vercel 后台关联此仓库。
3. 点击 **Deploy** 即可完成。

## 📝 许可证

MIT
