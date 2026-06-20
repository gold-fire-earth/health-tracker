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

## 一、从零讲起：你输入网址后到底发生了什么？

先把专业术语扔掉，用一个生活中的例子来理解。

### 1.1 类比：打电话订外卖

你想订一家叫"健康餐厅"的外卖。整个过程分三步：

```
第一步：拿出手机，打开通讯录 App
       │
       搜"健康餐厅"
       │
       通讯录显示：138-0000-1234
       │
       │  ← 这步就叫 DNS 查询。查完就结束了，通讯录退出。
       │
第二步：拨号 138-0000-1234
       │
       │  ← 打电话。通讯录不参与通话，它只负责查号码。
       │
第三步：电话接通，"喂，我要一份鸡胸肉沙拉"
       │
       餐厅给你做了送过来 ← 真正的服务
```

现在把角色对应到你的网站上：

| 生活中的角色 | 互联网中的角色 | 说明 |
|-------------|-------------|------|
| 通讯录 App | **DNS 服务器**（阿里云） | 负责查号码，查完就退出 |
| 通讯录里的一条记录 | **A 记录** | `keephealthy-wxl.top` → `185.199.108.153` |
| 餐厅的电话号码 | **IP 地址** `185.199.108.153` | GitHub 服务器的门牌号 |
| 拨电话通话 | **浏览器访问 IP** | 真正拿数据的过程 |
| 餐厅 | **GitHub 服务器** | 存着你的网页文件，24 小时开着 |

**核心结论：DNS 不是终点，它是路标。**

### 1.2 所以"配置 DNS"到底干了什么？

你在阿里云加的那两条 A 记录，翻译成人话就是：

> "如果有人问 keephealthy-wxl.top 在哪，告诉他去 185.199.108.153 和 185.199.109.153。"

就这一句话。阿里云的 DNS 服务器什么都不存，只存这一行"指路信息"。

你的网页文件不在阿里云，不在 DNS 服务器上，在 **GitHub 的服务器**（`185.199.108.153`）上。

### 1.3 一个常见的误解

> ❌ "访问 keephealthy-wxl.top 就是访问 DNS"

这是错的。DNS 只在你输入网址后的 **0.1 秒内** 被问到一次，然后浏览器记住结果，接下来就不再问了。你每一次打开网页，99.999% 的时间都在跟 GitHub 的服务器通信，跟 DNS 已经没有关系了。

> ✅ "访问 keephealthy-wxl.top，是先问 DNS 路怎么走，然后直接去 GitHub 服务器"

### 1.4 用你的手机实际感受一下

打开 `http://keephealthy-wxl.top`，你能看到的：
- 地址栏显示 `keephealthy-wxl.top`
- 页面内容是健康追踪 App

这个过程实际发生的：
```
你的手指点下"访问"
       │
       ▼ (约 0.05 秒)
手机问附近的 DNS："keephealthy-wxl.top 的 IP 是多少？"
       │
       ▼ (约 0.02 秒)
DNS 回答："185.199.108.153"
       │  ← DNS 任务完成，退出舞台。后面跟它没关系了。
       ▼ (约 0.2 秒)
手机连接 185.199.108.153（GitHub 在日本的 CDN 节点）
       │
       ▼ (约 0.5 秒)
GitHub 返回 index.html 和 JS/CSS 文件
       │
       ▼
浏览器渲染，你看到 App 界面
       │
       │  整个过程 DNS 只参与了开头 0.07 秒
       │  后面全部都是你和 GitHub 服务器的互动
```

### 1.5 DNS 记录类型速查

| 记录类型 | 全称 | 一句话解释 | 你用了没 |
|---------|------|----------|---------|
| **A** | Address | 域名 → 一个 IP 地址 | ✅ 用了 2 条 |
| **AAAA** | Address v6 | 域名 → 一个 IPv6 地址 | ❌ 没用 |
| **CNAME** | Canonical Name | 域名 → 另一个域名（别名） | ❌ 没用 |

你加的就是两条 A 记录：

```
keephealthy-wxl.top → 185.199.108.153
keephealthy-wxl.top → 185.199.109.153
```

两条指向同一个 GitHub 服务器的不同 IP，互为备份。坏了一条还有另一条能用。

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

**Q: "配置 DNS"是让用户访问 DNS 服务器吗？我的网站存在 DNS 上吗？**
A: 不是！这是新手最容易搞混的地方。DNS 只是一个"电话本"，翻完就放下了。你的网站文件存在 GitHub 的服务器上（`185.199.108.153`），跟 DNS 没关系。类比：你在 114 查号台登记了餐厅的电话号，顾客是给餐厅打电话订餐，不是天天打给 114 查号台。

**Q: 为什么 DNS 改了但访问不了？**
A: DNS 有缓存。Windows 上可以 `ipconfig /flushdns` 清缓存。手机可以开关飞行模式强制刷新。也可以用 `nslookup keephealthy-wxl.top` 确认当前 DNS 状态。

**Q: GitHub Pages 在国外，国内访问慢怎么办？**
A: 可以用 Gitee Pages 做国内镜像，或者用 CDN 加速。由于你有域名，随时可以切换后端平台而不影响用户。

**Q: 为什么要添加多条 A 记录？**
A: 冗余。GitHub 的几个 IP 互为备份，即使某个出故障，浏览器会自动尝试下一个。生产环境通常配 4 条，2 条也够用。

**Q: HTTP 和 HTTPS 有什么区别？**
A: HTTPS 是加密的 HTTP（多了一层 TLS 加密）。浏览器里的锁图标表示 HTTPS。GitHub Pages 免费提供 HTTPS 证书。
