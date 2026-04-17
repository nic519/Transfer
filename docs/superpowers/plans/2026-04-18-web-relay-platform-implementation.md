# Web Relay 平台改版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将项目从 Clash 订阅中转工具改造成一个支持专业控制台与双模式 API 的 Web Relay 平台。

**Architecture:** 前端在现有 Next.js 单页中重构为 50/50 双栏平台控制台，引入方法选择、请求体、开发者接入说明和本地历史记录。后端统一整理 `/api/proxy` 的入参与错误处理，保留快捷 `GET`，扩展标准 `POST`。文档与 metadata 同步更新为新的产品定位。

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS

---

### Task 1: 代理接口契约整理

**Files:**
- Modify: `src/app/api/proxy/route.ts`

- [ ] **Step 1: 写出失败前提并做现状检查**

检查当前接口实现，确认现状问题：

```ts
// 现状问题
// 1. GET/POST 都写死为 clash.meta 语义
// 2. POST 实际只会向上游发送 GET
// 3. 错误结构不统一
// 4. 响应头透传带有订阅特化语义
```

- [ ] **Step 2: 运行类型检查前置验证**

Run: `npx tsc --noEmit`
Expected: 当前项目可完成基础类型检查，作为改造前基线

- [ ] **Step 3: 最小化实现新的通用代理逻辑**

在 `src/app/api/proxy/route.ts` 中实现：

```ts
// 核心方向
// 1. 抽出 URL 校验与错误响应工具
// 2. GET: 读取 searchParams.url，转发 GET
// 3. POST: 解析 url/method/headers/body，按 method 转发
// 4. 返回上游状态码与文本响应
// 5. 失败时返回统一 JSON 错误结构
```

- [ ] **Step 4: 运行类型检查验证改动**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 5: 提交该任务**

```bash
git add src/app/api/proxy/route.ts
git commit -m "feat: generalize proxy api contract"
```

### Task 2: 首页控制台重构

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: 先确认需要替换的旧页面语义**

检查并清除以下旧内容：

```ts
// 需要移除
// - Clash Console
// - clash.yaml 示例
// - Clash 生态 Header 预设
// - 订阅中转风格文案
```

- [ ] **Step 2: 重建页面状态模型**

在 `src/app/page.tsx` 中构建新的页面状态：

```ts
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type HistoryEntry = {
  id: string;
  url: string;
  method: HttpMethod;
  headers: string;
  body: string;
  timestamp: number;
};
```

- [ ] **Step 3: 先让新交互在页面中成型**

实现以下表单与展示能力：

```ts
// 需要具备
// - Target URL
// - Method 选择器
// - Headers JSON
// - Body 输入
// - Execute 按钮
// - 响应状态/头摘要/内容预览
// - GET 快捷链接复制
// - POST 标准调用示例
```

- [ ] **Step 4: 加入本地历史记录能力**

实现 `localStorage` 历史记录逻辑：

```ts
// 规则
// - 最多 12 条
// - 组合键去重
// - 点击回填
// - 支持清空
```

- [ ] **Step 5: 完成 50/50 布局与视觉重构**

在 `src/app/page.tsx` 与 `src/app/globals.css` 中完成：

```ts
// 方向
// - 桌面端双栏 50/50
// - 左侧控制台与右侧开发者区域同级
// - 风格更接近平台工作台
// - 文案改为 Web Relay / proxy platform 语义
```

- [ ] **Step 6: 更新 metadata**

在 `src/app/layout.tsx` 中更新：

```ts
export const metadata = {
  title: "Web Relay Platform",
  description: "Professional edge-hosted web relay console and proxy API.",
};
```

- [ ] **Step 7: 运行类型检查验证页面改造**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 8: 提交该任务**

```bash
git add src/app/page.tsx src/app/layout.tsx src/app/globals.css
git commit -m "feat: redesign web relay console"
```

### Task 3: README 与产品说明同步

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 替换产品定位与使用示例**

在 `README.md` 中同步以下方向：

```md
- 从 Clash Subscription Proxy 改为 Web Relay Platform
- 保留 GET 快捷用法
- 强调 POST 为标准接口
- 示例改成通用网址代理，不再出现 clash.yaml
```

- [ ] **Step 2: 运行快速构建校验**

Run: `npm run build`
Expected: Next.js production build succeeds

- [ ] **Step 3: 提交该任务**

```bash
git add README.md
git commit -m "docs: update readme for web relay platform"
```

### Task 4: 最终验证

**Files:**
- Modify: none

- [ ] **Step 1: 运行完整验证**

Run: `npx tsc --noEmit && npm run build`
Expected: 全部通过

- [ ] **Step 2: 人工检查关键能力**

检查点：

```md
- 页面不再出现 Clash 语义
- 页面是 50/50 双栏
- POST 接口支持 method/headers/body
- 历史记录能保存与回填
- GET 快捷链接仍可生成
```

- [ ] **Step 3: 提交收尾改动**

```bash
git add .
git commit -m "feat: launch professional web relay platform"
```
