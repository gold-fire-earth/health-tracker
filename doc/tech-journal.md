# 技术选型与实现日志

本文档按时间顺序记录 Health Tracker 从零到部署的每一步技术决策和实现过程。

---

## 一、项目起源

### 需求背景

用户想要一个个人饮食记录工具，用于减脂期管理热量摄入。核心要求：

- **离线优先**：不开流量也能用，数据存在自己手机里
- **多端独立**：分享给朋友用，每人数据互不可见
- **移动端友好**：主要在手机上使用
- **国内可访问**：GFW 环境下能打开
- **入门级运维**：用户不是前端开发，越简单越好

### 为什么不做 App？

APK 需要 Android Studio 打包、签名、分发更新。PWA 方案更轻：一个网址就能用，浏览器自动缓存，还能添加到手机主屏幕，体验接近原生 App。

---

## 二、技术选型

### 2.1 前端框架：React 18 + TypeScript

| 对比方案 | 选择 | 原因 |
|---------|------|------|
| React vs Vue | React | 生态更大，Hooks 模式直观 |
| React vs 纯 HTML | React | 状态管理需求高（多页面、多数据交叉） |
| JS vs TS | TypeScript | 类型检查能在编译时发现错误，尤其数据模型修改时 |

### 2.2 构建工具：Vite 5

不用 CRA（Create React App，已停止维护），不用 Webpack（配置复杂）。Vite 的特点：

- 开发服务器秒启动（ESBuild 预构建）
- HMR（热模块替换）极快
- 生产构建用 Rollup，产物干净
- 配置简单，一个 `base: './'` 就解决多平台部署的相对路径问题

### 2.3 样式：Tailwind CSS 3

不用组件库（Ant Design 等太重型），直接用 Tailwind 原子类：

- 不写 CSS 文件，样式直接写在 JSX 的 className 里
- 设计一致性：颜色、间距、圆角都用预设 token
- 生产构建时自动摇树，删掉没用到的样式
- 灵活：想做自定义卡片、环形进度条完全自由

项目自定义了几个常用组件（在 `index.css` 里用 `@apply`）：

```css
.card       → 白色圆角卡片 + 阴影 + 内边距
.btn-primary → 绿色按钮
.btn-ghost  → 幽灵按钮
.input-field → 统一表单样式
```

### 2.4 状态管理：Zustand

| 对比方案 | 选择 | 原因 |
|---------|------|------|
| Redux | ❌ | 模板代码太多，本项目体量不需要 |
| Context API | ❌ | 多 store 时容易嵌套过深，性能也不好 |
| Zustand | ✅ | API 极简，一个 `create` 搞定，支持多个独立 store |

项目分了 4 个 store：

```
recipeStore    → 食谱 CRUD + 预设数据播种
foodLogStore   → 每日饮食记录 + 份量调整
activityLogStore → 运动记录
goalStore      → 身体数据 + 热量目标计算
```

### 2.5 本地数据库：Dexie.js（IndexedDB）

这是最关键的决策。用户要求离线、数据私有、多端独立。

| 对比方案 | 选择 | 原因 |
|---------|------|------|
| 云端数据库 | ❌ | 需要后端、用户注册、服务器运维 |
| localStorage | ❌ | 只能存字符串，容量 5MB，不够存历史饮食数据 |
| IndexedDB 原生 API | ❌ | 回调地狱，查询复杂 |
| Dexie.js | ✅ | Promise 风格 API，支持复合索引、排序、过滤 |

Dexie 是一个轻量封装，把 IndexedDB 变成了类似 SQL 的体验：

```typescript
// 按日期 + 餐段查饮食记录
db.foodLogs.where('[date+mealType]').equals(['2026-06-20', 'lunch']).toArray()

// 查所有早餐食谱
db.recipes.where('mealType').equals('breakfast').sortBy('name')
```

数据库设计了 5 张表：

| 表 | 用途 | 关键索引 |
|---|------|---------|
| `recipes` | 140 个预设 + 用户自建食谱 | mealType, category, name |
| `foodLogs` | 每顿饭吃了什么 | [date+mealType] 复合索引 |
| `activityLogs` | 运动记录 | date |
| `userProfile` | 身高体重目标（单条） | — |
| `dailyTargets` | 每天自动计算的热量目标 | date |

### 2.6 图表：Recharts

仪表盘需要环形进度条（今日热量）、宏量营养素进度条。Recharts 基于 React + SVG，不需要外部依赖（不像 ECharts 需要额外引入），也足够轻量。

### 2.7 PWA：手写 manifest.json

不用 `vite-plugin-pwa`（版本兼容问题，Vite 8 不兼容），直接手写 manifest.json + index.html meta 标签。核心配置：

```json
{
  "display": "standalone",    // 全屏无浏览器 chrome
  "orientation": "portrait",  // 竖屏
  "theme_color": "#4ADE80",   // 状态栏颜色
  "background_color": "#F0FDF4"
}
```

---

## 三、核心算法

### 3.1 TDEE 热量计算

采用 **Mifflin-St Jeor 公式**，是目前公认最准确的静息代谢估算公式：

```typescript
// 男性
BMR = 10 × 体重(kg) + 6.25 × 身高(cm) - 5 × 年龄 - 161 + 166
// 女性（项目使用通用近似）
BMR = 10 × 体重(kg) + 6.25 × 身高(cm) - 5 × 年龄 + 5

// 每日总消耗
TDEE = BMR × 活动系数

// 目标热量
减脂: TDEE - 500
保持: TDEE
增肌: TDEE + 300
```

活动系数分为 5 档：1.2（久坐）→ 1.9（高强度体力劳动）。

### 3.2 宏量营养素分配

根据目标自动调整三大营养素比例：

| 目标 | 蛋白质 | 碳水 | 脂肪 |
|------|--------|------|------|
| 减脂 | 40% | 30% | 30% |
| 保持 | 30% | 40% | 30% |
| 增肌 | 35% | 35% | 30% |

减脂期高蛋白是为了保护肌肉不流失。

### 3.3 运动消耗

采用 MET（代谢当量）法，比用户自己瞎填准确：

```typescript
消耗热量 = MET × 体重(kg) × 时长(小时)
```

预设了 13 种运动：跑步 8.3、快走 5.0、游泳 7.0、跳绳 11.0、力量训练 5.5、HIIT 8.0 等。

---

## 四、功能实现

### 4.1 仪表盘

环形热量进度条用纯 SVG 画圈 + `stroke-dashoffset` 动画。低于目标绿色，超过目标橙色提醒。三个宏量进度条（蛋白质蓝、碳水琥珀、脂肪粉）并排显示。

四个餐段汇总卡片和运动消耗一目了然，底部显示"还能吃多少"的剩余热量。

### 4.2 饮食记录

日期左右切换，四个餐段卡片分别显示。每个食物条目可以 ±0.5 调整份量。两个操作入口：

- **食谱选择**：从 140 个预设食谱 + 自己建的食谱里挑，支持类别下拉和多选
- **快速记录**：直接填名称和热量，适合公司食堂、外卖这种没有预设食谱的

### 4.3 在线搜索（OpenFoodFacts）

输入 ≥ 2 个字符后自动搜索 OpenFoodFacts 开放数据库（法国非营利组织，免费无 API Key）。400ms 防抖，直接从前端调用，不经过后端代理。

返回结果按 100g 的营养数据录入，支持一键添加到当日记录。

### 4.4 食谱系统

140 个预设食谱涵盖日常饮食：早点 20 个、主食 10 个、肉类 14 个、家常菜 26 个、蔬菜 10 个、火锅 8 个、快餐 8 个、包装食品 8 个、水果 14 个、零食甜品 12 个、饮品 10 个。

11 个菜系分类，餐段和类别两个下拉筛选。用户可自建食谱（不能删除预设）。

### 4.5 食谱播种策略

首次运行 `bulkAdd` 全部 140 个预设。后续运行检查是否有新增预设（按名称去重），只添加缺失的。DB 版本升级时自动回填 category 字段。

### 4.6 设置页

填写身高/体重/年龄/性别/活动量/目标，实时计算并显示 BMR、TDEE、目标热量、三大营养素目标。

---

## 五、颜色系统

用户要求"浅绿活力"配色，制定了完整的颜色系统：

| Token | 色值 | 用途 |
|-------|------|------|
| `primary-400` | `#4ADE80` | 主色调，按钮、选中态 |
| `energy-500` | `#F97316` | 热量数字，橙色醒目 |
| `protein` | 蓝色系 | 蛋白质进度条 |
| `carbs` | 琥珀系 | 碳水进度条 |
| `fat` | 粉色系 | 脂肪进度条 |

整体背景 `#F0FDF4` 浅绿，卡片白色。暗色模式暂未实现。

---

## 六、移动端适配

### 6.1 安全区域

iPhone X 以上的刘海屏需要用 `env(safe-area-inset-*)` 预留安全距离：

```css
.safe-bottom { padding-bottom: env(safe-area-inset-bottom, 16px); }
.safe-top    { padding-top: env(safe-area-inset-top, 0px); }
```

底部导航栏加上 `.safe-bottom` 防止被 iPhone 的 Home Indicator 遮挡。

### 6.2 触控优化

- 所有可点击元素最小 44×44px（Apple HIG 标准）
- `touch-action: manipulation` 禁止双击缩放
- 输入框 `font-size: 16px` 防止 iOS 自动缩放
- `overscroll-behavior: none` 防止下拉刷新触发

### 6.3 viewport

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

`viewport-fit=cover` 让内容延伸到安全区域边缘，配合 safe-area 内边距使用。

---

## 七、部署历程

### 7.1 第一阶段：Cloudflare Pages

`npx wrangler pages deploy dist` → `health-tracker-32p.pages.dev`

问题：国内手机打不开（Cloudflare 被 GFW 干扰）。

### 7.2 第二阶段：GitHub Pages

`git push origin gh-pages` → `gold-fire-earth.github.io/health-tracker/`

发现国内手机不开代理能访问——GitHub Pages 的 CDN IP（185.199.x.x）没被墙，只有 `github.com` 域名被墙。

### 7.3 第三阶段：绑定自定义域名

用户购买 `keephealthy-wxl.top`（阿里云），添加两条 A 记录指向 GitHub Pages IP。这样用户记住的是自己的域名，随时可以换后端平台而不影响体验。

### 7.4 Gitee 镜像

国内访问更快，代码同时推送 Gitee。Gitee Pages 需要手动在网页端开通（API 不可用）。

### 7.5 最终架构

```
同一个源码 → git push 到三个平台
  ├── GitHub Pages  → keephealthy-wxl.top（主线）
  ├── Gitee Pages   → gold-fire-earth.gitee.io/health/（国内快）
  └── Cloudflare    → health-tracker-32p.pages.dev（备用）
```

---

## 八、数据库版本升级记录

| 版本 | 改动 | 迁移策略 |
|------|------|---------|
| v1 | 初始表结构，5 张表 | — |
| v2 | recipes 增加 `category` 字段 + 索引 | 自动回填：用 presetRecipes 的 name 匹配，更新 category |

Dexie 的版本升级是声明式的：在 `new Dexie()` 构造函数里加一个新的 `version(n).stores({...})`，Dexie 自动处理结构变更。

---

## 九、文件结构总览

```
health/
├── index.html              # PWA meta 标签 + 入口
├── public/
│   └── manifest.json       # PWA 配置
├── src/
│   ├── App.tsx             # 5 标签导航 + 路由
│   ├── index.css           # Tailwind + 自定义组件 + 安全区域
│   ├── db/
│   │   └── database.ts     # Dexie 表定义 + Recipe 接口
│   ├── data/
│   │   ├── presetRecipes.ts   # 140 个预设食谱
│   │   └── presetActivities.ts # 13 种运动 MET 值
│   ├── stores/
│   │   ├── recipeStore.ts
│   │   ├── foodLogStore.ts
│   │   ├── activityLogStore.ts
│   │   └── goalStore.ts
│   ├── pages/
│   │   ├── Dashboard.tsx    # 仪表盘
│   │   ├── FoodLog.tsx      # 饮食记录
│   │   ├── Activity.tsx     # 运动记录
│   │   ├── Recipes.tsx      # 食谱管理
│   │   └── Settings.tsx     # 个人设置
│   ├── components/
│   │   ├── FoodSelector.tsx # 食谱选择器（多选 + 联网搜索）
│   │   ├── CalorieRing.tsx  # 环形进度条
│   │   └── MacroBar.tsx     # 宏量进度条
│   └── utils/
│       └── tdee.ts          # TDEE 算法
├── doc/
│   ├── npm-git-guide.md     # 命令行操作指南
│   └── deploy-domain-guide.md # 部署原理与 DNS 详解
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── postcss.config.js
```

---

## 十、未实现 / 未来方向

- [ ] **暗色模式**：当前只有浅色主题
- [ ] **图表分析页**：用 Recharts 做 7 天/30 天热量趋势图、体重变化图
- [ ] **Android APK**：用 Capacitor 或 TWA（Trusted Web Activity）打包
- [ ] **Gitee Pages 自动部署**：用 Gitee Pages Pro + Gitee Actions（付费功能）
- [ ] **智能推荐**：根据历史记录自动推荐常吃的搭配
- [ ] **条码扫描**：调用手机摄像头扫描食品条形码，对接 OpenFoodFacts
- [ ] **饮水记录**：简单的每日饮水追踪
