# iFlow Mod 打包工具 v1.0

基于 Tauri + Vue3 的图形界面打包工具，用于打包 iFlow Mod。

## 功能特性

- 📂 导入 code.js 文件
- ✏️ 可视化编辑 mod.json 配置
- 📦 一键打包生成 .iflow-mod 文件
- 📊 打包进度实时显示
- 🎨 现代化 UI 设计

## 技术栈

- **Tauri 2.0**: 桌面应用框架
- **Vue 3**: 前端框架
- **TypeScript**: 类型安全
- **Element Plus**: UI 组件库
- **Vite**: 构建工具
- **Pinia**: 状态管理

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run tauri:dev
```

### 构建生产版本

```bash
npm run tauri:build
```

## 项目结构

```
iflow-mod-gui/
├── src-tauri/                    # Rust 后端
│   ├── src/
│   │   ├── main.rs              # 应用入口
│   │   ├── commands/            # Tauri Commands
│   │   ├── models/              # 数据模型
│   │   └── services/            # 业务逻辑
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/                         # Vue 3 前端
│   ├── views/                   # 页面视图
│   ├── components/              # 组件
│   ├── stores/                  # Pinia 状态管理
│   ├── router/                  # 路由配置
│   ├── types/                   # TypeScript 类型
│   └── utils/                   # 工具函数
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 使用流程

1. **首页**: 导入 code.js 文件
2. **编辑页**: 填写 mod.json 配置信息
3. **打包页**: 配置打包选项并开始打包
4. **设置页**: 配置默认选项

## 打包输出

打包后的文件格式为 `.iflow-mod`（本质是 zip 文件），可在 iFlow Settings Editor 中导入安装。

## 注意事项

- 确保 Rust 工具链已安装
- 确保 Node.js 版本 >= 16
- 首次运行可能需要下载依赖

## 许可证

MIT
