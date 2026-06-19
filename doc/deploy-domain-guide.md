# 自定义域名部署原理与配置指南

本文档用通俗语言解释：为什么你注册个域名、加几条 DNS 记录，别人就能访问你电脑上开发的 App。

**阅读前建议**：先看第〇章，理解「仓库」和「网站」的区别，再看后面的技术细节。否则容易混淆。

---

## 〇、先回答你最大的困惑：后端在哪？仓库和网站是什么关系？

### 你之前的开发经验

```
┌─────────────────────────────────────────┐
│  你的电脑                                 │
│  ┌─────────┐    ┌─────────┐             │
│  │ 前端页面  │───▶│ 后端程序  │──▶ 数据库    │
│  │ (浏览器)  │    │ (Java)   │             │
│  └─────────┘    └─────────┘             │
│       ↑              ↑                   │
│       └──────────────┘                   │
│         都在同一台电脑                      │
└─────────────────────────────────────────┘

内网其他设备访问: http://192.168.2.185:8080
```

这个模型中：
- **前端**和后端都在你的电脑上运行
- 后端是一个持续运行的进程（比如 Java 的 `main()` 方法）
- 别人通过你电脑的内网 IP 连进来
- 关掉进程，整个服务就停了

### Health Tracker 的模型：根本没有后端

```
┌──────────────────────────────────────────────────┐
│  GitHub 服务器（美国，24小时开机）                     │
│                                                    │
│  ┌──────────────────────────┐                      │
│  │  静态文件                  │                      │
│  │  ├── index.html           │                      │
│  │  ├── assets/              │                      │
│  │  │   ├── index-abc123.js  │  ← 这些就是           │
│  │  │   └── index-def456.css │    npm run build     │
│  │  └── CNAME                │    的产物             │
│  └──────────────────────────┘                      │
│                                                    │
│  GitHub 只做一件事：                                  │
│  收到 HTTP 请求 → 把文件原样发回去                       │
│  不执行任何代码，不存任何数据，就是个"文件快递员"           │
└──────────────────────────────────────────────────┘
         ↑
         │ 用户访问 keephealthy-wxl.top
         │ DNS 解析到这个服务器
         │
┌────────┴──────────────────────────────────────────┐
│  用户的手机                                          │
│  ┌──────────────────────────────────────┐          │
│  │  浏览器                                │          │
│  │  ├── 下载 index.html (一次性)           │          │
│  │  ├── 下载 index-abc123.js (一次性)      │          │
│  │  ├── 下载 index-def456.css (一次性)     │          │
│  │  │                                    │          │
│  │  ├── React 在浏览器里跑起来了            │          │
│  │  ├── 用户输入数据                        │          │
│  │  └── 存入 IndexedDB (浏览器内置数据库)    │          │
│  └──────────────────────────────────────┘          │
│                                                    │
│  所有"后端逻辑"都在浏览器里执行                         │
│  所有数据都存在用户自己手机的浏览器里                     │
└──────────────────────────────────────────────────┘
```

### 三个关键区别

**1. 没有后端进程在跑**

你之前的 Java 后端是一个持续运行的进程，监听 8080 端口等人连接。Health Tracker **没有这个进程**。GitHub Pages 只是一个"文件柜"——你请求 `index.html`，它就给你 `index.html`。它不执行任何 Java/Python/Node 代码。

那增删改查怎么做？全部在浏览器里。React 操作的是浏览器内置的 IndexedDB 数据库（类似浏览器版的 SQLite），不需要后端。

**2. 数据不经过服务器**

```
你之前的模型:
  用户填表单 → 数据发给后端 → 后端写数据库 → 返回结果给前端
  
Health Tracker:
  用户填表单 → React 直接写 IndexedDB → 完成
  （数据从头到尾都在用户自己手机里，根本没出这个浏览器）
```

你每个朋友打开 App 后，他们各自的数据存在各自的手机里。你和朋友之间看不到彼此的数据——这正是你设计时的要求。

**3. Git 仓库 ≠ 网站服务器**

这是最容易混淆的地方：

```
┌─────────────────────────────────────────────┐
│  GitHub 这个平台                              │
│                                              │
│  ┌───────────────┐   ┌───────────────────┐  │
│  │ Git 仓库        │   │ GitHub Pages       │  │
│  │ (代码存储)       │   │ (网站托管)          │  │
│  │                │   │                   │  │
│  │ master 分支:    │   │ gh-pages 分支:     │  │
│  │ ├── src/       │   │ ├── index.html    │  │
│  │ ├── package.json│  │ ├── assets/       │  │
│  │ └── vite.config │   │ └── CNAME        │  │
│  │                │   │                   │  │
│  │ 这是"设计图纸"   │   │ 这是"印刷好的书"    │  │
│  │ 不能直接访问     │   │ 可以直接访问        │  │
│  └───────────────┘   └───────────────────┘  │
│                                              │
│  仓库地址: github.com/gold-fire-earth/health-tracker │
│  网站地址: keephealthy-wxl.top               │
│                                              │
│  它们是同一个平台的 两个不同功能！               │
└─────────────────────────────────────────────┘
```

**打个比方**：Git 仓库是出版社的**原稿存档室**（存源码），GitHub Pages 是**书店**（把印好的书卖给读者）。你 `git push` 是把稿件送到存档室，然后 GitHub 自动"印刷"（构建）并摆到书店货架上。读者访问 `keephealthy-wxl.top` 去的是书店，不是存档室。

### 对比总结

| | 你之前的经验 | Health Tracker |
|---|---|---|
| 后端运行在哪 | 你的电脑（本地进程） | **没有后端** |
| 数据存在哪 | 后端连接的数据库 | 用户手机浏览器 IndexedDB |
| 代码部署在哪 | 没有部署，本地跑 | GitHub Pages（文件托管） |
| 别人怎么访问 | 内网 IP + 端口 | 公网域名 → GitHub 服务器 |
| 关机后还能用吗 | 不能（进程停了） | 能（GitHub 服务器一直开着） |
| Git 仓库的角色 | 可能没用过 | 存源码 + 触发自动部署 |

---

## 一、互联网寻址是怎么工作的

### 1.1 IP 地址

互联网上的每台服务器都有一个数字地址叫 **IP 地址**，比如 `185.199.108.153`。就像每家每户的门牌号。

但你不能让用户记一串数字——这就是域名的由来。

### 1.2 DNS：互联网的电话本

**DNS（Domain Name System）** 的作用就是把好记的域名翻译成机器能懂的 IP 地址。

```
你输入 keephealthy-wxl.top
       │
       ▼
   DNS 服务器（电话本查到）
       │
       ▼
  返回 185.199.108.153
       │
       ▼
  浏览器去这个 IP 拿网页
```

整个过程你在浏览器是感知不到的，但每次打开网页都在发生。

### 1.3 DNS 记录类型

你在阿里云加的「A 记录」就是最基础的一种 DNS 记录：

| 记录类型 | 全称 | 作用 | 示例 |
|---------|------|------|------|
| **A** | Address | 域名 → IPv4 地址 | `keephealthy-wxl.top` → `185.199.108.153` |
| **AAAA** | Address v6 | 域名 → IPv6 地址 | `keephealthy-wxl.top` → `2606:50c0:8000::153` |
| **CNAME** | Canonical Name | 域名 → 另一个域名（别名） | `www.keephealthy-wxl.top` → `gold-fire-earth.github.io` |

本项目使用的是 2 条 **A 记录**，把 `keephealthy-wxl.top` 指向 GitHub 的服务器 IP。

---

## 二、GitHub Pages 是怎么托管网站的

### 2.1 免费静态网站托管

GitHub Pages 是 GitHub 提供的免费静态网站托管服务。你的 App 是纯前端（HTML + JS + CSS），不需要后端服务器，正合适。

### 2.2 部署流程（全自动）

```
你 git push 代码
       │
       ▼
GitHub Actions 或 gh-pages 分支
       │
       ▼
GitHub 把 dist/ 文件放到他们的 CDN 服务器上
       │
       ▼
分配默认域名: gold-fire-earth.github.io/health-tracker/
       │
       ▼
你绑定自定义域名: keephealthy-wxl.top
       │
       ▼
GitHub 自动申请 Let's Encrypt HTTPS 证书
```

### 2.3 gh-pages 分支的作用

```
master 分支（源码）              gh-pages 分支（部署产物）
├── src/                        ├── index.html
├── package.json                ├── assets/
├── vite.config.ts              │   ├── index-abc123.js
└── node_modules/               │   └── index-def456.css
                                └── CNAME
```

- **master**：你的 TypeScript/React 源码
- **gh-pages**：`npm run build` 之后的 `dist/` 目录内容，加上 `CNAME` 文件

CNAME 文件里只有一行：`keephealthy-wxl.top`。GitHub Pages 读到这个文件就知道"有人用自定义域名访问我了，我得响应"。

### 2.4 GitHub Pages 怎么识别你的域名

```
用户访问 keephealthy-wxl.top
       │
       ▼
DNS 解析 → 185.199.108.153（GitHub 的服务器）
       │
       ▼
浏览器请求头里带: Host: keephealthy-wxl.top
       │
       ▼
GitHub 服务器查 CNAME 文件 → 匹配！
       │
       ▼
返回 gh-pages 分支的 index.html
```

**关键点**：GitHub 一台服务器托管了几百万个网站。区分是哪个网站的，靠的就是 HTTP 请求头里的 `Host` 字段。你的 CNAME 文件告诉 GitHub "有访问 keephealthy-wxl.top 的请求就找我"。

---

## 三、完整的请求链路

用手机打开 `https://keephealthy-wxl.top` 发生了什么：

```
1. DNS 查询
   手机 → 就近 DNS 服务器 → 递归查询 → 阿里云 DNS
                                │
   阿里云返回你配的 A 记录: 185.199.108.153
                                │
   手机收到 IP，建立连接

2. TLS 握手（HTTPS）
   手机 ←→ GitHub 服务器
   GitHub 出示 Let's Encrypt 签发的证书（包含 keephealthy-wxl.top）
   手机验证证书 → 加密通道建立

3. HTTP 请求
   手机发送:
     GET / HTTP/1.1
     Host: keephealthy-wxl.top

4. GitHub 路由
   GitHub 查 CNAME → 找到 gh-pages 分支 → 返回 index.html

5. 浏览器渲染
   解析 HTML → 加载 JS/CSS → React 启动 → 显示你的 App
```

---

## 四、多平台部署架构总览

你的 App 现在部署在三个平台：

| 平台 | URL | DNS 配置 | 备注 |
|------|-----|---------|------|
| **GitHub Pages** | `keephealthy-wxl.top` | A 记录指向 GitHub IP | 自有域名，最终入口 |
| GitHub Pages | `gold-fire-earth.github.io/health-tracker/` | GitHub 自动 | 默认域名 |
| Cloudflare Pages | `health-tracker-32p.pages.dev` | Cloudflare 自动 | 被 GFW 干扰 |
| Gitee Pages | `gold-fire-earth.gitee.io/health/` | Gitee 自动 | 国内访问快 |

所有平台的代码都来自同一个 `gh-pages` 分支，只是推送的目标不同。

### 推送到不同平台

```bash
# GitHub Pages（最常用）
git push origin gh-pages

# Gitee Pages（国内镜像）
git push gitee gh-pages

# Cloudflare Pages
npm run build && npx wrangler pages deploy dist --project-name=health-tracker
```

---

## 五、域名配置操作步骤

### 5.1 注册域名

1. 在阿里云/腾讯云等平台搜索你想要的域名
2. 付款购买（一般几十块一年）
3. `.top` 域名比较便宜，但也有被部分平台限制的风险（这次 Cloudflare 就拒绝了 `.top`）

### 5.2 配置 DNS（本次操作的核心）

1. 打开阿里云域名控制台
2. 找到 `keephealthy-wxl.top` → 解析设置
3. 添加 A 记录：

| 记录类型 | 主机记录 | 记录值 | TTL |
|---------|---------|--------|-----|
| A | @ | 185.199.108.153 | 600 |
| A | @ | 185.199.109.153 | 600 |

- **主机记录填 @** 代表"直接用根域名，不要 www 前缀"
- **TTL = 600 秒** 意思是 DNS 缓存 10 分钟，修改后最多 10 分钟全球生效

### 5.3 在 GitHub Pages 绑定域名

这一步通过 `gh` CLI 完成（本项目中已执行）：

```bash
gh api -X PUT repos/gold-fire-earth/health-tracker/pages \
  -F cname="keephealthy-wxl.top" \
  -F 'source[branch]=gh-pages' \
  -F 'source[path]=/'
```

这条命令等价于：在 GitHub 仓库 Settings → Pages → Custom domain 填写域名。

### 5.4 等待 DNS 生效

```bash
# 用命令行检查 DNS 是否生效
nslookup keephealthy-wxl.top
```

如果返回 `185.199.108.153` 或 `185.199.109.153`，说明 DNS 已生效。

### 5.5 HTTPS 证书自动签发

DNS 生效后，GitHub 会自动通过 Let's Encrypt 申请 SSL 证书。这个过程可能需要几分钟到几小时。

你可以在仓库 Settings → Pages 里看到进度。完成后勾选 "Enforce HTTPS" 确保所有访问都走加密通道。

---

## 六、你必须有个域名的核心原因

### DNS 层归你控制

```
没有自有域名:
  gold-fire-earth.github.io/health-tracker/
  ↑ GitHub 拥有这个域名，你没法迁移

有自有域名:
  keephealthy-wxl.top
  ↑ 你拥有这个域名，想指向哪就指向哪
```

假设哪天 GitHub Pages 在国内访问变慢了，你只需要：
1. 把代码部署到另一个平台（如阿里云 OSS、腾讯云 COS）
2. 修改 DNS A 记录，指向新平台的服务器 IP
3. 用户感知不到任何变化——他们还是访问 `keephealthy-wxl.top`

### 品牌和信任

- `keephealthy-wxl.top` → 这是你的个人产品
- `gold-fire-earth.github.io/health-tracker/` → 这看起来像别人的项目

---

## 七、本项目实际使用的命令记录

```bash
# 1. Cloudflare Pages 创建项目（第一次）
npx wrangler pages project create health-tracker --production-branch=master

# 2. Cloudflare API 尝试添加自定义域名（失败：.top 被 Cloudflare 限制）
curl -X POST "https://api.cloudflare.com/client/v4/accounts/.../pages/projects/health-tracker/domains" \
  -H "Authorization: Bearer ..." \
  -d '{"domain":"keephealthy-wxl.top"}'
# → {"success":false,"errors":[{"message":"invalid TLD"}]}

# 3. 转到 GitHub Pages：设置自定义域名
gh api -X PUT repos/gold-fire-earth/health-tracker/pages \
  -F cname="keephealthy-wxl.top" \
  -F 'source[branch]=gh-pages' \
  -F 'source[path]=/'

# 4. HTTP → HTTPS 强制
gh api -X PUT repos/gold-fire-earth/health-tracker/pages \
  -F cname="keephealthy-wxl.top" \
  -F 'source[branch]=gh-pages' \
  -F 'source[path]=/' \
  -F https_enforced=true

# 5. 验证配置
gh api repos/gold-fire-earth/health-tracker/pages
# → {"cname":"keephealthy-wxl.top","status":"built"...}

# 6. DNS 配置（手动在阿里云控制台操作）
# 添加 A 记录: @ → 185.199.108.153
# 添加 A 记录: @ → 185.199.109.153
```

---

## 八、常见问题

**Q: 为什么 DNS 改了但访问不了？**
A: DNS 有缓存。Windows 上可以 `ipconfig /flushdns` 清缓存。手机可以开关飞行模式强制刷新。也可以用 `nslookup keephealthy-wxl.top` 确认当前 DNS 状态。

**Q: GitHub Pages 在国外，国内访问慢怎么办？**
A: 可以用 Gitee Pages 做国内镜像，或者用 CDN 加速。由于你有域名，随时可以切换后端平台而不影响用户。

**Q: 为什么要添加多条 A 记录？**
A: 冗余。GitHub 的几个 IP 互为备份，即使某个出故障，浏览器会自动尝试下一个。生产环境通常配 4 条，2 条也够用。

**Q: HTTP 和 HTTPS 有什么区别？**
A: HTTPS 是加密的 HTTP（多了一层 TLS 加密）。浏览器里的锁图标表示 HTTPS。GitHub Pages 免费提供 HTTPS 证书。
