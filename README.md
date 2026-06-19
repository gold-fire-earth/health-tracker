# Health Tracker — 饮食活动追踪

个人的日常饮食与活动消耗记录工具，短期目标减脂，长期增肌塑形保持健康。

## 技术栈

| 层 | 选型 | 说明 |
|---|---|---|
| 框架 | React 18 + TypeScript | 组件化、类型安全 |
| 构建 | Vite 5 | 秒级冷启动、HMR |
| 样式 | Tailwind CSS 3 | 移动端优先、原子化 CSS |
| 状态管理 | Zustand | 轻量无 Provider，store 内聚 |
| 本地数据库 | IndexedDB (Dexie.js) | 浏览器内置 NoSQL，数据存设备本地，离线可用 |
| 图表 | Recharts | 进度环、宏量营养素柱状图 |
| 图标 | Emoji | 零依赖，跨平台一致 |

不依赖任何后端服务，所有数据存储在浏览器 IndexedDB 中，隐私安全。

## 数据持久化方案

```
┌──────────────┐     ┌──────────────┐     ┌────────────────┐
│  Zustand     │ ──▶ │  Dexie.js    │ ──▶ │  IndexedDB     │
│  (内存状态)   │ ◀── │  (ORM 封装)   │ ◀── │  (浏览器沙箱)    │
└──────────────┘     └──────────────┘     └────────────────┘

每次状态变更立即写入 IndexedDB
App 启动时从 IndexedDB 恢复到 Zustand
```

类比传统后端架构：
- IndexedDB ≈ SQLite（设备本地关系型/对象型存储）
- Dexie.js ≈ ORM 层（类似 Prisma/TypeORM）
- Zustand ≈ 内存缓存层（类似 Redis，但同进程）

## 项目结构

```
src/
├── db/
│   └── database.ts          # Dexie 表定义 (5 张表)
├── data/
│   ├── presetRecipes.ts     # 50 种内置食谱
│   └── presetActivities.ts  # 13 种内置运动
├── stores/
│   ├── recipeStore.ts       # 食谱 CRUD
│   ├── foodLogStore.ts      # 饮食记录
│   ├── activityLogStore.ts  # 活动记录
│   └── goalStore.ts         # 用户资料 & 每日目标
├── utils/
│   └── tdee.ts              # TDEE/BMR 计算 & 宏量分配
├── components/
│   ├── CalorieRing.tsx      # 环形卡路里进度 (SVG)
│   ├── MacroBar.tsx         # 宏量营养素进度条
│   └── FoodSelector.tsx     # 食谱选择弹窗 (搜索+筛选)
├── pages/
│   ├── Dashboard.tsx        # 今日总览
│   ├── FoodLog.tsx          # 饮食记录
│   ├── Activity.tsx         # 运动记录
│   ├── Recipes.tsx          # 食谱管理
│   └── Settings.tsx         # 个人设置 & 目标
├── App.tsx                  # 5 Tab 导航
├── main.tsx                 # 入口
└── index.css                # Tailwind + 全局样式
```

## 数据库表设计

### recipes — 食谱表
| 字段 | 类型 | 说明 |
|---|---|---|
| id | number (PK, auto) | |
| name | string | 食物名称 |
| mealType | enum | breakfast / lunch / dinner / snack |
| calories | number | 每份热量 (kcal) |
| protein | number | 蛋白质 (g) |
| carbs | number | 碳水 (g) |
| fat | number | 脂肪 (g) |
| servingSize | number | 份量数值 |
| servingUnit | string | 份量单位 (g/ml/个/碗) |
| isPreset | boolean | 是否内置预设 |

### foodLogs — 饮食记录表
| 字段 | 类型 | 说明 |
|---|---|---|
| id | number (PK) | |
| date | string | YYYY-MM-DD |
| mealType | enum | 餐段 |
| recipeId | number | 关联食谱 |
| recipeName | string | 冗余存储，删除食谱后记录不丢 |
| servings | number | 份数倍数 |
| calories/protein/carbs/fat | number | 记录时的快照值 |

### activityLogs — 活动记录表
| 字段 | 类型 | 说明 |
|---|---|---|
| id | number (PK) | |
| date | string | YYYY-MM-DD |
| activityType | string | 活动名称 |
| duration | number | 时长 (分钟) |
| caloriesBurned | number | 消耗热量 |
| note | string | 备注 |

### userProfile — 用户资料表 (单条记录)
| 字段 | 类型 |
|---|---|
| height | cm |
| weight | kg |
| age | |
| gender | male / female |
| activityLevel | 1-5 (久坐→高强度) |
| goal | lose / maintain / gain |

### dailyTargets — 每日目标表
| 字段 | 类型 |
|---|---|
| date | YYYY-MM-DD |
| calorieTarget | |
| proteinTarget | |
| carbsTarget | |
| fatTarget | |

## TDEE 计算模型

采用 **Mifflin-St Jeor** 公式：

```
男性 BMR = 10 × 体重 + 6.25 × 身高 - 5 × 年龄 + 5
女性 BMR = 10 × 体重 + 6.25 × 身高 - 5 × 年龄 - 161

TDEE = BMR × 活动系数
```

| 活动水平 | 系数 | 描述 |
|---|---|---|
| 1 | 1.2 | 久坐，几乎不运动 |
| 2 | 1.375 | 轻度，每周 1-2 次 |
| 3 | 1.55 | 中度，每周 3-5 次 |
| 4 | 1.725 | 活跃，每周 6-7 次 |
| 5 | 1.9 | 高强度，每天训练 |

**目标热量调整 & 宏量分配：**

| 目标 | 热量调整 | 蛋白质 | 碳水 | 脂肪 |
|---|---|---|---|---|
| 减脂 | TDEE - 500 | 40% | 30% | 30% |
| 保持 | TDEE | 30% | 40% | 30% |
| 增肌 | TDEE + 300 | 35% | 35% | 30% |

千卡→克转换：蛋白质/碳水 ÷ 4，脂肪 ÷ 9。

## 运动消耗计算

```
消耗(kcal) = MET × 体重(kg) × 时长(h)
```

内置 13 种运动的 MET 参考值（基于 Compendium of Physical Activities）。

## 配色

| 角色 | 色值 | Tailwind |
|---|---|---|
| 主色 | #4ADE80 | green-400 |
| 主色深 | #22C55E | green-500 |
| 背景 | #F0FDF4 | green-50 |
| 强调/热量 | #F97316 | orange-500 |
| 蛋白质 | #60A5FA | blue-400 |
| 碳水 | #FBBF24 | amber-400 |
| 脂肪 | #F472B6 | pink-400 |

## 脚本

```bash
npm install        # 安装依赖 (国内建议 registry.npmmirror.com)
npm run dev        # 启动开发服务器 → localhost:5173
npm run build      # 生产构建 → dist/
```

## 后续计划

- [ ] PWA 完整支持 (Service Worker 离线缓存)
- [ ] 体重趋势图表
- [ ] 历史周/月热量统计视图
- [ ] 数据导出 CSV
- [ ] Android APK 封装 (Tauri / Capacitor)
