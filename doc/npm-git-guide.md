# 命令行操作指南

本文档记录 Health Tracker 项目开发中用到的所有命令，方便你独立维护。

---

## 一、npm 相关

### 1.1 安装依赖

```bash
# 首次 clone 项目后执行
npm install

# 国内网络慢的话，先切镜像源再装
npm config set registry https://registry.npmmirror.com
npm install
```

`npm install` 读取 `package.json` 里的依赖列表，下载到 `node_modules/` 目录。

### 1.2 启动开发服务器

```bash
npm run dev
```

本质是执行 `vite` 命令。启动后：
- 浏览器打开 `http://localhost:5173`
- 修改源码自动热更新（HMR），不用手动刷新

如果想让同 WiFi 下的手机也能访问：

```bash
npx vite --host 0.0.0.0
```

终端会打印出局域网地址（如 `http://192.168.2.185:5173`），手机浏览器打开即可。

### 1.3 生产构建

```bash
npm run build
```

本质是先 `tsc` 做类型检查，再 `vite build` 打包。产物在 `dist/` 目录，就是最终部署到服务器上的那几个文件。

### 1.4 本地预览生产版本

```bash
npm run preview
```

用生产方式跑 `dist/` 目录，检查打包后的效果。

---

## 二、Git 相关

### 2.1 初始化仓库

```bash
git init                       # 把当前目录变成 git 仓库
git add -A                     # 暂存所有文件
git commit -m "feat: xxx"     # 提交，-m 后面写提交信息
```

### 2.2 关联远程仓库

```bash
git remote add origin https://github.com/你的用户名/仓库名.git
git branch -M master           # 确保主分支叫 master（或 main）
git push -u origin master      # 首次推送并建立追踪
```

之后只需 `git push` 即可。

### 2.3 日常提交流程

```bash
git status                     # 看哪些文件改过
git add src/某文件.tsx          # 暂存你要提交的文件
git commit -m "fix: 修复了xxx"  # 提交
git push                       # 推送到 GitHub
```

### 2.4 常用 git 操作

```bash
git log --oneline              # 看提交历史
git diff                       # 看改了啥还没暂存
git checkout -- 文件名          # 撤销某个文件的修改
git reset --soft HEAD~1        # 撤销最近一次 commit（改动保留）
```

---

## 三、如何用命令行创建远程仓库（gh CLI）

**这就是你问的核心问题：我为什么不用打开 GitHub 网页就能建仓库？**

答案是 GitHub 官方提供的命令行工具 `gh`（GitHub CLI）。它的能力等价于网页端操作，但全程在终端完成。

### 3.1 安装 gh

Windows：
```bash
winget install --id GitHub.cli
```

macOS：
```bash
brew install gh
```

### 3.2 登录 GitHub

```bash
gh auth login
```

交互式选择：
1. GitHub.com
2. HTTPS
3. Login with a web browser

浏览器会弹出 GitHub 授权页面，确认即完成。

### 3.3 核心命令

```bash
# 看当前登录的是谁
gh auth status

# 创建仓库并推送当前目录的代码
gh repo create 仓库名 --public --source=. --remote=origin --push

# --public      公开仓库（私人仓库用 --private）
# --source=.    以当前目录作为源码
# --remote=origin  自动设置远程别名
# --push        创建完成后立刻推送
```

这个一条命令等价于：
1. 打开 github.com/new
2. 填写仓库名
3. 勾选 Public
4. 点 Create
5. 回到终端 `git remote add origin ...`
6. `git push -u origin master`

全部自动化了。

### 3.4 其他常用 gh 命令

```bash
gh repo view 仓库名            # 在浏览器打开仓库
gh issue create                # 创建 Issue
gh pr create                   # 创建 Pull Request
```

---

## 四、Cloudflare Pages 部署（wrangler）

### 4.1 安装 wrangler

```bash
npm install -D wrangler
```

作为开发依赖安装，不打包进生产代码。

### 4.2 登录 Cloudflare

```bash
npx wrangler login
```

浏览器弹出 Cloudflare 授权页，确认后终端自动完成认证。

### 4.3 创建 Pages 项目

```bash
npx wrangler pages project create health-tracker --production-branch=master
```

只需要执行一次。创建后 Cloudflare 分配一个永久域名（如 `health-tracker-32p.pages.dev`）。

### 4.4 部署

```bash
# 先构建
npm run build

# 再部署 dist 目录
npx wrangler pages deploy dist --project-name=health-tracker
```

每次更新代码后执行这两步即可。

### 4.5 自动部署（CI/CD）

如果想每次 `git push` 自动部署，去 Cloudflare Dashboard：
1. Workers & Pages → health-tracker → Settings → Builds & Deployments
2. Connect Git → 选 GitHub 仓库
3. Build command: `npm run build`
4. Output directory: `dist`
5. Save

之后每次 push 到 master，Cloudflare 自动拉代码构建部署。

---

## 五、命令速查表

| 做什么 | 命令 |
|---|---|
| 装依赖 | `npm install` |
| 启动开发 | `npm run dev` |
| 手机同看 | `npx vite --host 0.0.0.0` |
| 打包构建 | `npm run build` |
| 提交代码 | `git add -A && git commit -m "msg" && git push` |
| 看改了啥 | `git status` |
| gh 登录 | `gh auth login` |
| 建仓库+推送 | `gh repo create 名 --public --source=. --remote=origin --push` |
| wrangler 登录 | `npx wrangler login` |
| 创建 Pages | `npx wrangler pages project create 名 --production-branch=master` |
| 部署 | `npm run build && npx wrangler pages deploy dist --project-name=名` |
