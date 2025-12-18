# 下载管理器浏览器插件

一款基于 Vue 3 + TypeScript + ElementPlus 开发的现代科技风浏览器下载管理器插件，支持多主题切换、多语言适配，具备完整的下载管理核心功能。

## ✨ 功能特性

### 核心功能
- ✅ **下载列表管理**：展示所有下载项（名称、大小、进度、状态、时间、存储路径）
- ✅ **下载控制**：暂停/继续、取消、删除、重试、打开文件/文件夹
- ✅ **筛选/排序**：按状态、文件类型、时间/大小排序
- ✅ **搜索功能**：模糊搜索下载项名称
- ✅ **下载设置**：自定义下载路径、限速设置、同时下载任务数限制
- ✅ **通知提醒**：下载完成后自动通知

### 界面特性
- 🎨 **现代科技风**：深色基调，霓虹蓝/青色调，磨砂玻璃质感
- 🎭 **多主题切换**：科技蓝、赛博紫、暗夜黑、极简白
- 🌍 **多语言支持**：中文（简/繁）、英文、日文
- ✨ **流畅动效**：Animate.css 动效，进度条流光效果，卡片悬浮交互

## 🛠️ 技术栈

- **构建工具**：Vite 5.x
- **前端框架**：Vue 3 (Composition API)
- **类型系统**：TypeScript (严格模式)
- **UI 组件库**：ElementPlus
- **样式方案**：Less（模块化、变量化）
- **动效库**：Animate.css
- **状态管理**：Pinia
- **国际化**：vue-i18n
- **浏览器 API**：Chrome Extensions API (Manifest V3)

## 📁 项目结构

```
未命名文件夹/
├── public/                 # 静态资源
│   ├── manifest.json       # 浏览器插件清单文件
│   └── icons/             # 插件图标
├── src/
│   ├── background/        # 后台服务脚本
│   │   └── index.ts       # Service Worker
│   ├── components/        # Vue 组件
│   │   └── DownloadItem.vue
│   ├── locales/           # 多语言包
│   │   ├── zh-CN.ts       # 简体中文
│   │   ├── zh-TW.ts       # 繁体中文
│   │   ├── en.ts          # 英文
│   │   └── ja.ts          # 日文
│   ├── router/            # 路由配置
│   │   └── index.ts
│   ├── store/             # Pinia 状态管理
│   │   ├── download.ts    # 下载管理 Store
│   │   └── settings.ts    # 设置管理 Store
│   ├── styles/            # 样式文件
│   │   ├── variables.less  # Less 变量（主题配置）
│   │   └── main.less      # 全局样式
│   ├── types/             # TypeScript 类型定义
│   │   └── download.ts
│   ├── utils/             # 工具函数
│   │   ├── download.ts    # 下载相关工具
│   │   ├── i18n.ts        # 国际化工具
│   │   ├── theme.ts       # 主题管理工具
│   │   └── storage.ts     # 存储工具
│   ├── views/             # 页面视图
│   │   ├── DownloadList.vue
│   │   └── Settings.vue
│   ├── App.vue            # 根组件
│   └── main.ts            # 应用入口
├── index.html             # HTML 入口文件
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 配置
└── README.md              # 项目说明
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.x
- npm >= 8.x 或 yarn >= 1.22.x

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 开发模式

```bash
npm run dev
# 或
yarn dev
```

开发模式会在 `http://localhost:5173` 启动开发服务器。

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

构建完成后，产物会输出到 `dist` 目录。

## 📦 浏览器安装

### Chrome / Edge

1. 打开浏览器，访问 `chrome://extensions/`（Edge 访问 `edge://extensions/`）
2. 开启右上角的「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择项目的 `dist` 目录
5. 插件安装完成

### Firefox

1. 打开浏览器，访问 `about:debugging#/runtime/this-firefox`
2. 点击「临时载入附加组件」
3. 选择项目的 `dist/manifest.json` 文件
4. 插件安装完成

## ⌨️ 快捷键

- `Ctrl+J` (Mac: `Command+J`)：打开下载管理器

## 🎨 主题说明

### 预设主题

1. **科技蓝**（默认）：深色背景 + 霓虹蓝主色调
2. **赛博紫**：深色背景 + 紫色主色调
3. **暗夜黑**：纯黑背景 + 白色主色调
4. **极简白**：浅色背景 + 蓝色主色调

### 自定义主题

主题通过 Less 变量系统实现，修改 `src/styles/variables.less` 中的 CSS 变量即可自定义主题。

## 🌍 语言支持

- 简体中文 (zh-CN)
- 繁體中文 (zh-TW)
- English (en)
- 日本語 (ja)

语言切换即时生效，设置会持久化存储。

## 📝 开发说明

### 代码规范

- 使用 ESLint + Prettier 进行代码格式化
- Vue 组件遵循单文件组件规范
- TypeScript 严格模式，完整类型定义
- 组件命名使用 PascalCase，文件命名使用 kebab-case

### 主题系统

主题系统基于 CSS 变量实现，通过修改 `data-theme` 属性切换主题。主题变量定义在 `src/styles/variables.less` 中。

### 国际化

使用 `vue-i18n` 实现多语言支持，语言包存放在 `src/locales` 目录下。新增语言需要：

1. 在 `src/locales` 目录下创建语言文件
2. 在 `src/utils/i18n.ts` 中注册新语言
3. 在设置页面添加语言选项

### 下载管理

下载管理通过 Chrome Downloads API 实现，后台 Service Worker 监听下载事件，popup 页面实时同步状态。

## 🔧 配置说明

### manifest.json

浏览器插件清单文件，定义了插件的权限、入口文件等信息。

### vite.config.ts

Vite 构建配置，包含：
- 浏览器插件特殊打包逻辑
- Less 预处理器配置
- 路径别名配置

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 反馈

如有问题或建议，请提交 Issue。

