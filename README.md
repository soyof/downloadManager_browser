# 下载管理器浏览器插件

一款功能强大、界面精美的浏览器下载管理器插件，基于 Vue 3 + TypeScript + ElementPlus 开发，提供完整的下载管理功能，支持多主题切换和多语言适配。

## ✨ 功能特性

### 核心功能

- ✅ **完整的下载管理**：统一管理所有下载任务，实时显示下载进度、速度、剩余时间
- ✅ **灵活的下载控制**：支持暂停/继续、取消、重试、删除记录或删除文件及记录
- ✅ **智能文件检测**：自动检测文件是否存在，已删除文件特殊标识，支持重新下载
- ✅ **强大的筛选排序**：按状态（全部/下载中/已完成/失败/已暂停/已取消）、文件类型筛选，支持按时间/大小排序
- ✅ **快速搜索**：实时模糊搜索文件名，快速定位目标下载项
- ✅ **分页展示**：支持自定义每页显示数量，大量下载记录也能轻松管理
- ✅ **一键操作**：快速打开文件/文件夹、复制下载链接、批量操作
- ✅ **通知提醒**：下载完成/失败时自动通知，不错过重要下载

### 界面特性

- 🎨 **现代科技风设计**：深色基调，霓虹蓝/青色调，磨砂玻璃质感，视觉体验出色
- 🎭 **多主题切换**：科技蓝、赛博紫、暗夜黑、极简白四种主题，满足不同审美需求
- 🌍 **多语言支持**：完整支持中文（简体/繁体）、英文、日文，国际化体验
- ✨ **流畅动效**：基于 Animate.css 的优雅动画效果，进度条流光效果，卡片悬浮交互
- 📱 **响应式布局**：适配不同屏幕尺寸，操作便捷流畅

## 🛠️ 技术栈

- **构建工具**：Vite 5.x
- **前端框架**：Vue 3 (Composition API)
- **类型系统**：TypeScript (严格模式)
- **UI 组件库**：ElementPlus
- **样式方案**：SCSS（模块化、变量化）
- **动效库**：Animate.css
- **状态管理**：Pinia
- **国际化**：vue-i18n
- **浏览器 API**：Chrome Extensions API (Manifest V3)

## 📁 项目结构

```
downloadManage/
├── public/                    # 静态资源
│   ├── manifest.json          # 浏览器插件清单文件
│   ├── icons/                 # 插件图标
│   └── _locales/              # 国际化消息文件
│       ├── zh_CN/             # 简体中文
│       ├── zh_TW/             # 繁体中文
│       ├── en/                # 英文
│       └── ja/                # 日文
├── src/
│   ├── background/            # 后台服务脚本
│   │   ├── index.ts           # Service Worker 入口
│   │   ├── listeners/          # 事件监听器
│   │   └── utils/              # 后台工具函数
│   ├── components/            # Vue 组件
│   │   ├── DownloadItem/      # 下载项组件
│   │   └── DownloadList/      # 下载列表组件
│   ├── i18n/                  # 国际化配置
│   │   └── index.ts
│   ├── router/                # 路由配置
│   │   └── index.ts
│   ├── store/                 # Pinia 状态管理
│   │   ├── download.ts        # 下载管理 Store
│   │   └── settings.ts        # 设置管理 Store
│   ├── styles/                # 样式文件
│   │   ├── variables.scss     # SCSS 变量（主题配置）
│   │   └── main.scss          # 全局样式
│   ├── types/                 # TypeScript 类型定义
│   │   └── download.ts
│   ├── utils/                 # 工具函数
│   │   └── downloadConverter.ts
│   ├── views/                 # 页面视图
│   │   ├── DownloadList.vue   # 下载列表页面
│   │   └── Settings.vue       # 设置页面
│   ├── App.vue                # 根组件
│   └── main.ts                # 应用入口
├── index.html                 # HTML 入口文件
├── package.json               # 项目配置
├── tsconfig.json              # TypeScript 配置
├── vite.config.ts             # Vite 配置
└── README.md                  # 项目说明
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

主题通过 SCSS 变量系统实现，修改 `src/styles/variables.scss` 中的 CSS 变量即可自定义主题。

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

主题系统基于 CSS 变量实现，通过修改 `data-theme` 属性切换主题。主题变量定义在 `src/styles/variables.scss` 中。支持：

- 4 种预设主题：科技蓝、赛博紫、暗夜黑、极简白
- 主题设置持久化存储
- 暗色模式自动适配

### 国际化

使用 `vue-i18n` 和 Chrome Extension 的 `_locales` 机制实现多语言支持。语言包存放在 `public/_locales` 目录下，使用标准的 Chrome Extension 国际化格式。新增语言需要：

1. 在 `public/_locales` 目录下创建语言文件夹（如 `fr`）
2. 创建 `messages.json` 文件，添加所有翻译键值对
3. 在设置页面添加语言选项

### 下载管理

下载管理通过 Chrome Downloads API 实现：

- 后台 Service Worker 监听 `chrome.downloads.onCreated` 和 `chrome.downloads.onChanged` 事件
- 实时同步下载状态到 popup 页面
- 支持文件存在性检测，自动标识已删除的文件
- 分页数据持久化存储，保持用户偏好设置

## 🔧 配置说明

### manifest.json

浏览器插件清单文件，定义了插件的权限、入口文件等信息。

### vite.config.ts

Vite 构建配置，包含：

- 浏览器插件特殊打包逻辑
- SCSS 预处理器配置
- 路径别名配置

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 反馈

如有问题或建议，请提交 Issue。
