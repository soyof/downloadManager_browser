# 构建说明

## 开发环境搭建

1. **安装 Node.js**
   - 确保 Node.js 版本 >= 16.x
   - 推荐使用 nvm 管理 Node.js 版本

2. **安装依赖**
   ```bash
   npm install
   ```

3. **准备图标文件**
   - 在 `public/icons/` 目录下放置以下图标：
     - `icon16.png` (16x16)
     - `icon48.png` (48x48)
     - `icon128.png` (128x128)
   - 如果没有图标文件，插件仍可运行，但浏览器会显示默认图标

## 开发

```bash
npm run dev
```

开发服务器会在 `http://localhost:5173` 启动。

**注意**：由于这是浏览器插件项目，开发模式主要用于调试 Vue 组件。实际测试需要在浏览器中加载插件。

## 构建生产版本

```bash
npm run build
```

构建完成后，产物在 `dist` 目录：

```
dist/
├── manifest.json          # 插件清单文件
├── index.html            # popup 页面入口
├── background/
│   └── index.js          # 后台服务脚本
├── assets/               # 静态资源（JS、CSS、图片等）
└── icons/                # 图标文件（从 public 复制）
```

## 在浏览器中加载插件

### Chrome / Edge

1. 打开 `chrome://extensions/` (Edge: `edge://extensions/`)
2. 开启右上角「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择项目的 `dist` 目录
5. 插件安装完成

### Firefox

1. 打开 `about:debugging#/runtime/this-firefox`
2. 点击「临时载入附加组件」
3. 选择 `dist/manifest.json` 文件
4. 插件安装完成

## 打包发布

### Chrome Web Store

1. 构建项目：`npm run build`
2. 压缩 `dist` 目录为 ZIP 文件
3. 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
4. 上传 ZIP 文件并填写相关信息

### Firefox Add-ons

1. 构建项目：`npm run build`
2. 压缩 `dist` 目录为 ZIP 文件
3. 访问 [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
4. 上传 ZIP 文件并填写相关信息

## 常见问题

### 1. 构建失败：找不到模块

确保已安装所有依赖：
```bash
npm install
```

### 2. TypeScript 类型错误

确保安装了 `@types/chrome`：
```bash
npm install --save-dev @types/chrome
```

### 3. 插件无法加载

- 检查 `dist/manifest.json` 是否存在
- 检查 `dist/background/index.js` 是否存在
- 查看浏览器控制台错误信息

### 4. 图标不显示

确保 `public/icons/` 目录下有图标文件，构建时会自动复制到 `dist/icons/`

## 调试技巧

1. **查看后台脚本日志**
   - Chrome: `chrome://extensions/` → 找到插件 → 点击「检查视图：Service Worker」

2. **查看 popup 页面日志**
   - 右键点击插件图标 → 「检查弹出内容」

3. **查看下载 API**
   - 在后台脚本中使用 `console.log` 输出下载信息

4. **热重载**
   - 修改代码后，在浏览器中重新加载插件（点击插件的刷新按钮）

