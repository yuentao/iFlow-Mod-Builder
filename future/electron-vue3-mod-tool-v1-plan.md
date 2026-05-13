# iFlow Mod 打包工具 v1.0 方案

> 基于 Tauri + Vue3 的 GUI 打包工具，让 Mod 开发更简单

---

## 一、项目概述

### 1.1 背景

当前 `build-mod.js` 是一个命令行打包工具，使用门槛较高。为了降低 Mod 开发者的使用成本，计划开发一个基于 Tauri + Vue3 的图形界面打包工具。

### 1.2 目标

- **降低使用门槛**：通过 GUI 替代命令行，让非技术用户也能轻松打包 Mod
- **提升开发效率**：提供可视化配置等功能
- **统一开发体验**：与 iFlow Settings Editor 保持一致的设计风格
- **跨平台支持**：Windows / macOS / Linux

### 1.3 核心功能

1. **导入 code.js**
   - 选择/拖拽 `code.js` 文件
   - 自动创建 Mod 项目工作区

2. **mod.json 表单化创建**
   - 通过表单填写所有配置字段
   - 实时验证（必填项、格式校验）
   - Mod 类型选择（追加代码/前置代码/完全替换/补丁模式）
   - 分类和标签管理
   - 自动生成合法的 `mod.json`

3. **一键打包**
   - 选择输出目录
   - 自定义输出文件名
   - 打包进度显示
   - 完成后自动打开文件夹

4. **打包历史与日志**
   - 打包日志查看
   - 快速重新打包

5. **高级选项**
   - 压缩级别选择
   - 是否跳过验证
   - 命令行参数配置（兼容原脚本）

---

## 二、技术架构

### 2.1 技术栈

| 技术 | 版本 | 用途 | 选型理由 |
|------|------|------|----------|
| Tauri | ^2.0.0 | 桌面应用框架 | 体积小、安全性高、Rust 后端性能优异、跨平台支持完善 |
| Vue3 | ^3.4.0 | 前端框架 | 组合式 API、TypeScript 支持、生态成熟、学习成本低 |
| Vite | ^5.0.0 | 构建工具 | 开发体验极佳、HMR 快速、生产构建优化、Tauri 官方推荐 |
| TypeScript | ^5.3.0 | 类型安全 | 类型安全、代码提示、降低维护成本 |
| @vitejs/plugin-vue | ^6.0.6 | Vite Vue 插件 | Vue 3 SFC 编译支持 |
| archiver | ^7.0.1 | zip 打包（复用现有） | 成熟的 Node.js zip 库，支持流式压缩和进度追踪 |
| adm-zip | ^0.5.16 | zip 验证（复用现有） | 验证 zip 包内容完整性 |
| concurrently | ^8.2.2 | 并行运行命令 | 开发时同时运行 Vite 和 Tauri 命令 |

### 2.2 项目结构

```
iflow-mod-gui/
├── src-tauri/                    # Tauri Rust 后端
│   ├── Cargo.toml               # Rust 项目配置
│   ├── tauri.conf.json          # Tauri 应用配置
│   ├── build.rs                 # 构建脚本
│   ├── src/
│   │   ├── main.rs              # 应用入口
│   │   ├── commands/            # Tauri Commands
│   │   │   ├── mod.rs           # 命令模块导出
│   │   │   ├── build.rs         # 打包相关命令
│   │   │   ├── file.rs          # 文件操作命令
│   │   │   └── settings.rs      # 设置相关命令
│   │   ├── models/              # 数据模型
│   │   │   ├── mod.rs
│   │   │   ├── mod_config.rs    # Mod 配置模型
│   │   │   └── build_config.rs  # 打包配置模型
│   │   ├── services/            # 业务逻辑
│   │   │   ├── mod.rs
│   │   │   ├── packager.rs      # 打包服务
│   │   │   ├── validator.rs     # 验证服务
│   │   │   └── settings.rs      # 设置服务
│   │   └── error.rs             # 错误处理
│   └── icons/                   # 应用图标
│       ├── 32x32.png
│       ├── 128x128.png
│       └── icon.icns            # macOS 图标
│
├── src/                         # Vue 3 前端
│   ├── main.ts                  # 应用入口
│   ├── App.vue                  # 根组件
│   ├── vite-env.d.ts            # Vite 类型声明
│   ├── assets/                  # 静态资源
│   │   ├── styles/              # 全局样式
│   │   │   ├── main.scss
│   │   │   ├── variables.scss
│   │   │   └── mixins.scss
│   │   └── images/              # 图片资源
│   │       ├── logo.png
│   │       └── icons/
│   ├── components/              # 公共组件
│   │   ├── common/              # 通用组件
│   │   │   ├── AppHeader.vue    # 应用标题栏
│   │   │   ├── AppNav.vue       # 导航菜单
│   │   │   ├── FileDropZone.vue # 文件拖拽区域
│   │   │   └── ProgressBar.vue  # 进度条组件
│   │   ├── mod/                 # Mod 相关组件
│   │   │   ├── ModCard.vue      # Mod 信息卡片
│   │   │   ├── ModForm.vue      # Mod 配置表单
│   │   │   └── TypeSelector.vue # 类型选择器
│   │   └── build/               # 打包相关组件
│   │       ├── BuildConfig.vue  # 打包配置面板
│   │       ├── BuildProgress.vue# 打包进度面板
│   │       └── BuildResult.vue  # 打包结果展示
│   ├── views/                   # 页面视图
│   │   ├── HomeView.vue         # 首页（导入 code.js）
│   │   ├── EditorView.vue       # 编辑页（mod.json 编辑）
│   │   ├── BuildView.vue        # 打包页
│   │   └── SettingsView.vue     # 设置页
│   ├── stores/                  # Pinia 状态管理
│   │   ├── mod.ts               # Mod 相关状态
│   │   ├── build.ts             # 打包相关状态
│   │   └── settings.ts          # 设置相关状态
│   ├── composables/             # 组合式函数
│   │   ├── useModImport.ts      # Mod 导入逻辑
│   │   ├── useBuild.ts          # 打包逻辑
│   │   └── useFileDialog.ts     # 文件对话框封装
│   ├── router/                  # 路由配置
│   │   └── index.ts
│   ├── types/                   # TypeScript 类型定义
│   │   ├── mod.d.ts
│   │   ├── build.d.ts
│   │   └── settings.d.ts
│   └── utils/                   # 工具函数
│       ├── validation.ts        # 验证工具
│       ├── format.ts            # 格式化工具
│       └── constants.ts         # 常量定义
│
├── public/                      # 公共静态资源
│   ├── favicon.ico
│   └── iflow-logo.svg
│
├── dist/                        # 构建输出目录（自动生成）
├── node_modules/               # 依赖（自动生成）
├── package.json                # Node.js 项目配置
├── package-lock.json           # 依赖锁定文件
├── tsconfig.json               # TypeScript 配置
├── tsconfig.node.json          # Node.js TypeScript 配置
├── vite.config.ts              # Vite 配置
├── tailwind.config.js          # Tailwind CSS 配置（如使用）
├── index.html                  # HTML 入口
└── README.md                   # 项目文档
```

### 2.3 目录说明

#### src-tauri/ - Rust 后端
- **commands/**：Tauri 命令实现，前端通过 `invoke()` 调用
- **models/**：数据结构定义（ModConfig、BuildConfig 等）
- **services/**：业务逻辑层（打包、验证、设置管理）
- **error.rs**：统一错误类型定义和处理

#### src/ - Vue 3 前端
- **views/**：页面级组件，对应路由路径
- **components/**：可复用的 UI 组件，按功能域分类
- **stores/**：Pinia 状态管理，集中管理应用状态
- **composables/**：组合式函数，封装可复用的逻辑
- **types/**：TypeScript 类型定义文件
- **utils/**：纯函数工具库

### 2.4 关键配置文件

#### package.json
```json
{
  "name": "iflow-mod-gui",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "@tauri-apps/api": "^2.0.0",
    "@tauri-apps/plugin-store": "^2.0.0",
    "archiver": "^5.3.0",
    "adm-zip": "^0.5.0"
  }
}
```

#### src-tauri/Cargo.toml
```toml
[package]
name = "iflow-mod-gui"
version = "1.0.0"
edition = "2021"

[dependencies]
tauri = { version = "2.0", features = ["fs-all", "dialog-all", "path-all"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
thiserror = "1.0"
```

#### src-tauri/tauri.conf.json
```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:5173",
    "distDir": "../dist"
  },
  "package": {
    "productName": "iFlow Mod 打包工具",
    "version": "1.0.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "fs": {
        "all": true,
        "scope": ["$HOME/*", "$DESKTOP/*", "$DOCUMENTS/*", "$DOWNLOAD/*"]
      },
      "dialog": {
        "all": true,
        "open": true,
        "save": true
      },
      "path": {
        "all": true
      }
    },
    "windows": [
      {
        "title": "iFlow Mod 打包工具",
        "width": 960,
        "height": 720,
        "minWidth": 640,
        "minHeight": 480,
        "maximizable": false,
        "resizable": true,
        "fullscreenable": false,
        "autoHideMenuBar": true
      }
    ]
  }
}
```

### 2.3 进程架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Tauri 应用架构                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    invoke/emit    ┌─────────────┐         │
│  │  Vue 3 前端  │ ◄──────────────► │  Rust 后端   │         │
│  │  (渲染进程)   │   Tauri IPC      │  (主进程)    │         │
│  └─────────────┘                  └─────────────┘         │
│         │                               │                  │
│         │                               │                  │
│         ▼                               ▼                  │
│  ┌─────────────┐                  ┌─────────────┐         │
│  │  WebView    │                  │  文件系统    │         │
│  │  浏览器引擎   │                  │  访问权限    │         │
│  └─────────────┘                  └─────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**通信机制**：
- **前端 → 后端**：`invoke('command-name', args)` 调用 Tauri Commands
- **后端 → 前端**：`emit('event-name', payload)` 发送事件（如打包进度）
- **数据序列化**：自动 JSON 序列化/反序列化，无需手动处理

### 2.4 核心依赖详解

#### Rust 后端依赖
- **tauri 2.0**：核心框架，提供 IPC、窗口管理、系统集成能力
- **serde/serde_json**：序列化/反序列化，用于前后端数据交换
- **thiserror**：简化错误处理，提供统一的错误类型定义
- **tauri-plugin-store**：配置持久化插件，替代 localStorage

#### 前端依赖
- **archiver 5.x**：Node.js 流式 zip 压缩库，支持进度追踪
- **adm-zip 0.5.x**：纯 JavaScript zip 库，用于验证包内容
- **@tauri-apps/api**：Tauri JavaScript API，用于调用后端命令
- **@tauri-apps/plugin-store**：Tauri Store 插件，用于配置持久化

---

## 三、核心功能设计

### 3.1 导入 code.js

#### 功能描述
- 用户选择或拖拽 `code.js` 文件
- 自动创建临时工作区（复制 code.js）
- 引导用户填写 mod.json 表单

#### 工作流程
```
1. 用户导入 code.js
   ↓
2. 工具创建临时工作区（内存或临时目录）
   ↓
3. 跳转到 mod.json 表单编辑页
   ↓
4. 用户填写表单 → 自动生成 mod.json
   ↓
5. 进入打包页面 → 一键打包
```

#### 界面设计
```
┌──────────────────────────────────────────────────┐
│  iFlow Mod 打包工具                    [帮助] │
├──────────────────────────────────────────────────┤
│                                                  │
│  第一步：导入 code.js                              │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  📂 选择 code.js 或 拖拽文件到这里            │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
└──────────────────────────────────────────────────┘
```

#### 数据结构
```typescript
interface ModWorkspace {
  codePath: string              // code.js 原始路径
  codeContent: string           // code.js 内容
  workDir: string               // 临时工作区路径
  modJson: Partial<ModConfig>   // 表单数据（未完成）
  createdAt: Date
}
```

### 3.2 mod.json 可视化编辑器

#### 功能描述
- 表单化编辑所有 mod.json 字段
- 实时验证和错误提示
- Mod 类型选择器（单选按钮）
- 分类下拉选择
- 标签输入（支持多个）

#### 表单字段设计

| 字段 | 类型 | 验证规则 | UI 组件 |
|------|------|---------|---------|
| id | text | 必填，唯一标识 | Input |
| name | text | 必填 | Input |
| version | text | 必填，semver 格式 | Input + 提示 |
| type | select | 必填，4 种类型 | Radio Group |
| description | textarea | 推荐填写 | Textarea |
| author | text | 推荐填写 | Input |
| category | select | 推荐填写 | Select |
| iflowVersion | text | semver 格式，默认 0.5.19 | Input |
| iflowVersionConstraint | select | 版本约束，默认当前版本 | Select |
| icon | text | emoji 或 URL | Input + Emoji Picker |
| tags | array | 字符串数组 | Tag Input |
| homepage | text | URL 格式 | Input |
| repository | text | URL 格式 | Input |
| license | select | 常见许可证，默认 MIT | Select |
| entry | text | 默认 code.js | Input |

#### 界面设计
```
┌──────────────────────────────────────────────────┐
│  Mod 配置                              [保存]          │
├──────────────────────────────────────────────────┤
│ 基本信息                                           │
│ ┌──────────────────────────────────────────────┐ │
│ │ ID:              [com.example.my-mod    ]    │ │
│ │ 名称:            [我的 Mod 名称        ]    │ │
│ │ 版本:            [1.0.0               ]    │ │
│ │ 类型:            ○ 追加代码  ○ 前置代码       │ │
│ │                   ○ 完全替换 ○ 补丁模式(未实现) │ │
│ │ 描述:            [多行文本输入框               │ │
│ │                   ...                        │ │
│ │                   ]                          │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ 高级配置                                           │
│ ┌──────────────────────────────────────────────┐ │
│ │ 作者:            [作者名              ]      │ │
│ │ 分类:            [▼ 工具类             ]      │ │
│ │ 图标:            [🚀 选择图标]               │ │
│ │ 标签:            [工具] [+ 添加]             │ │
│ │ iFlow 版本:      [0.5.19             ]      │ │
│ │ 版本约束:        [▼ 当前版本 (0.5.19+)]      │ │
│ │ 许可证:          [▼ MIT              ]      │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 3.3 一键打包

#### 功能描述
- 显示打包配置摘要
- 选择输出目录
- 实时打包进度
- 完成后打开输出文件夹
- 复制输出路径到剪贴板

#### 打包流程
```
1. 用户点击"开始打包"
   ↓
2. 验证 mod.json 完整性
   ↓
3. 收集所有文件（排除 .iflow-mod 和隐藏文件）
   ↓
4. 创建 zip 压缩包
   ↓
5. 验证包内容
   ↓
6. 完成，显示结果
```

#### 界面设计
```
┌──────────────────────────────────────────────────┐
│  打包配置                                          │
├──────────────────────────────────────────────────┤
│ Mod 信息:                                         │
│   名称: 我的 Mod                                   │
│   版本: 1.0.0                                      │
│   类型: 追加代码                                     │
│                                                  │
│ 输出设置:                                         │
│   输出目录: [~/dist/                    ] [浏览]  │
│   文件名:   my-mod-v1.0.0.iflow-mod              │
│   压缩级别: ● 标准  ○ 最大  ○ 最快               │
│                                                  │
│ 高级选项:                                         │
│   ☑ 打包后验证                                     │
│   ☑ 完成后打开文件夹                               │
│                                                  │
│        [取消]         [开始打包]                  │
└──────────────────────────────────────────────────┘
```

#### 打包进度界面
```
┌──────────────────────────────────────────────────┐
│  正在打包...                                      │
├──────────────────────────────────────────────────┤
│                                                  │
│   ⏳ 正在收集文件...                              │
│   ⏳ 正在压缩...                                   │
│   ⏳ 正在验证...                                   │
│                                                  │
│   ████████████░░░░░░  60%                       │
│                                                  │
│   已处理: 12 / 20 个文件                          │
│   当前: code.js                                   │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 3.4 设置页面

#### 功能描述
- 默认输出目录
- 默认压缩级别
- 是否自动打开输出文件夹
- 是否显示高级选项
- 主题切换（跟随系统/浅色/深色）

---

## 四、核心实现

### 4.1 IPC 通信设计

#### 4.1.1 命令定义规范

所有 Tauri Commands 遵循统一规范：

```typescript
// 统一响应格式
interface CommandResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// 统一错误码
enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  BUILD_FAILED = 'BUILD_FAILED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}
```

#### 4.1.2 打包相关命令

```typescript
// src-tauri/commands/build.rs
use tauri::State;
use crate::models::{BuildConfig, BuildResult, BuildProgress};
use crate::services::packager::Packager;

#[tauri::command]
pub async fn start_build(
    config: BuildConfig,
    state: State<'_, Packager>
) -> Result<BuildResult, String> {
    state.build(config).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn cancel_build(
    state: State<'_, Packager>
) -> Result<(), String> {
    state.cancel().await.map_err(|e| e.to_string())
}

// 事件发送（进度更新）
// state.emit("build:progress", BuildProgress { percent: 50, file: "code.js" })
```

#### 4.1.3 文件操作命令

```rust
// src-tauri/commands/file.rs
use tauri::Manager;
use std::fs;
use std::path::Path;

#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("无法读取文件: {}", e))
}

#[tauri::command]
async fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content).map_err(|e| format!("无法写入文件: {}", e))
}

#[tauri::command]
async fn file_exists(path: String) -> bool {
    Path::new(&path).exists()
}

#[tauri::command]
async fn create_directory(path: String) -> Result<(), String> {
    fs::create_dir_all(&path).map_err(|e| format!("无法创建目录: {}", e))
}

#[tauri::command]
async fn delete_directory(path: String) -> Result<(), String> {
    fs::remove_dir_all(&path).map_err(|e| format!("无法删除目录: {}", e))
}
```

#### 4.1.4 前端调用封装

```typescript
// src/utils/tauri.ts
import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'

// 统一调用封装
export async function tauriInvoke<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  try {
    return await invoke<T>(command, { args })
  } catch (error) {
    console.error(`Tauri command failed: ${command}`, error)
    throw new Error(`操作失败: ${error}`)
  }
}

// 事件监听封装
export function onBuildProgress(
  callback: (progress: number, file: string) => void
) {
  return listen<BuildProgress>('build:progress', (event) => {
    callback(event.payload.percent, event.payload.file)
  })
}
```

### 4.2 打包逻辑复用

#### 4.2.1 Rust 端打包实现

```rust
// src-tauri/services/packager.rs
use std::fs;
use std::path::{Path, PathBuf};
use tauri::Manager;
use crate::models::{BuildConfig, BuildResult, BuildProgress};

pub struct Packager {
    cancel_flag: std::sync::Arc<std::sync::Mutex<bool>>,
}

impl Packager {
    pub async fn build(&self, config: BuildConfig) -> Result<BuildResult, String> {
        // 1. 验证必需文件
        self.validate_required_files(&config.mod_path)?;

        // 2. 解析 mod.json
        let mod_json = self.parse_mod_json(&config.mod_path)?;

        // 3. 收集文件
        let files = self.collect_files(&config.mod_path)?;

        // 4. 生成输出文件名
        let output_file = format!(
            "{}-v{}.iflow-mod",
            mod_json.id, mod_json.version
        );
        let output_path = PathBuf::from(&config.output_path).join(&output_file);

        // 5. 压缩打包
        self.create_zip(&files, &output_path, config.compress_level).await?;

        // 6. 验证
        if !config.skip_validation {
            self.validate_zip(&output_path)?;
        }

        Ok(BuildResult {
            success: true,
            output_path: output_path.to_string_lossy().to_string(),
            file_count: files.len(),
        })
    }

    fn validate_required_files(&self, mod_path: &str) -> Result<(), String> {
        let path = Path::new(mod_path);
        let required = ["mod.json", "code.js"];
        
        for file in required.iter() {
            let file_path = path.join(file);
            if !file_path.exists() {
                return Err(format!("缺少必需文件: {}", file));
            }
        }
        Ok(())
    }

    fn parse_mod_json(&self, mod_path: &str) -> Result<ModConfig, String> {
        let content = fs::read_to_string(Path::new(mod_path).join("mod.json"))
            .map_err(|e| format!("无法读取 mod.json: {}", e))?;
        serde_json::from_str(&content).map_err(|e| format!("mod.json 格式错误: {}", e))
    }

    fn collect_files(&self, mod_path: &str) -> Result<Vec<FileInfo>, String> {
        let mut files = Vec::new();
        let path = Path::new(mod_path);

        for entry in fs::read_dir(path).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            let file_path = entry.path();
            
            // 跳过 .iflow-mod 文件和隐藏文件
            if file_path.file_name()
                .and_then(|n| n.to_str())
                .map(|n| n.starts_with('.') || n.ends_with(".iflow-mod"))
                .unwrap_or(false) {
                continue;
            }

            if file_path.is_file() {
                files.push(FileInfo {
                    full_path: file_path.to_string_lossy().to_string(),
                    relative_path: file_path.file_name().unwrap().to_string_lossy().to_string(),
                });
            }
        }

        Ok(files)
    }

    async fn create_zip(
        &self,
        files: &[FileInfo],
        output: &Path,
        level: CompressLevel
    ) -> Result<(), String> {
        // 使用 zip 库创建压缩包
        // 发送进度事件
        Ok(())
    }

    fn validate_zip(&self, path: &Path) -> Result<(), String> {
        // 验证 zip 包完整性
        Ok(())
    }
}
```

#### 4.2.2 前端打包调用

```typescript
// src/composables/useBuild.ts
import { ref } from 'vue'
import { tauriInvoke, onBuildProgress } from '@/utils/tauri'
import { useBuildStore } from '@/stores/build'

export function useBuild() {
  const buildStore = useBuildStore()
  const isBuilding = ref(false)
  const progress = ref(0)
  const currentFile = ref('')

  const startBuild = async (config: BuildConfig) => {
    isBuilding.value = true
    progress.value = 0
    buildStore.clearLogs()

    try {
      // 监听进度
      const unlisten = await onBuildProgress((percent, file) => {
        progress.value = percent
        currentFile.value = file
        buildStore.addLog(`正在处理: ${file}`)
      })

      // 调用打包命令
      const result = await tauriInvoke<BuildResult>('start_build', { config })

      unlisten()

      if (result.success) {
        buildStore.setLastResult(result)
        return result
      } else {
        throw new Error('打包失败')
      }
    } catch (error) {
      buildStore.addLog(`错误: ${error}`)
      throw error
    } finally {
      isBuilding.value = false
    }
  }

  return { startBuild, isBuilding, progress, currentFile }
}
```

### 4.3 状态管理 (Pinia)

#### 4.3.1 Mod Store 完整实现

```typescript
// src/stores/mod.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ModConfig } from '@/types/mod'

export const useModStore = defineStore('mod', () => {
  // State
  const codeContent = ref('')
  const codePath = ref('')
  const workDir = ref('')
  const config = ref<Partial<ModConfig>>({})
  const unsavedChanges = ref(false)

  // Getters
  const isCodeImported = computed(() => !!codePath.value)
  const isConfigValid = computed(() => {
    return config.value.id && config.value.name && config.value.version && config.value.type
  })

  // Actions
  function importCode(filePath: string, content: string) {
    codePath.value = filePath
    codeContent.value = content
    workDir.value = generateWorkDir(filePath)
    resetConfig()
    unsavedChanges.value = false
  }

  function resetConfig() {
    config.value = {
      id: '',
      name: '',
      version: '1.0.0',
      type: 'append',
      description: '',
      author: '',
      category: 'tool',
      iflowVersion: '0.5.19',
      iflowVersionConstraint: '^0.5.19',
      icon: '🚀',
      tags: [],
      homepage: '',
      repository: '',
      license: 'MIT',
      entry: 'code.js',
    }
  }

  function updateConfig(field: keyof ModConfig, value: unknown) {
    config.value[field] = value
    unsavedChanges.value = true
  }

  function generateModJson(): ModConfig {
    return {
      id: config.value.id || '',
      name: config.value.name || '',
      version: config.value.version || '1.0.0',
      type: config.value.type || 'append',
      description: config.value.description,
      author: config.value.author,
      category: config.value.category,
      iflowVersion: config.value.iflowVersion,
      iflowVersionConstraint: config.value.iflowVersionConstraint,
      icon: config.value.icon,
      tags: config.value.tags,
      homepage: config.value.homepage,
      repository: config.value.repository,
      license: config.value.license,
      entry: config.value.entry || 'code.js',
    }
  }

  return {
    codeContent,
    codePath,
    workDir,
    config,
    unsavedChanges,
    isCodeImported,
    isConfigValid,
    importCode,
    resetConfig,
    updateConfig,
    generateModJson,
  }
})
```

#### 4.3.2 Build Store 完整实现

```typescript
// src/stores/build.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { BuildResult, BuildConfig } from '@/types/build'

export const useBuildStore = defineStore('build', () => {
  const isBuilding = ref(false)
  const progress = ref(0)
  const currentFile = ref('')
  const logs = ref<string[]>([])
  const lastResult = ref<BuildResult | null>(null)

  function addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString()
    logs.value.push(`[${timestamp}] ${message}`)
  }

  function clearLogs() {
    logs.value = []
    progress.value = 0
    currentFile.value = ''
  }

  function setLastResult(result: BuildResult) {
    lastResult.value = result
  }

  async function startBuild(config: BuildConfig) {
    isBuilding.value = true
    clearLogs()
    addLog('开始打包...')

    try {
      const { tauriInvoke } = await import('@/utils/tauri')
      const result = await tauriInvoke<BuildResult>('start_build', { config })
      
      addLog(`打包完成: ${result.output_path}`)
      setLastResult(result)
      return result
    } catch (error) {
      addLog(`打包失败: ${error}`)
      throw error
    } finally {
      isBuilding.value = false
    }
  }

  return {
    isBuilding,
    progress,
    currentFile,
    logs,
    lastResult,
    addLog,
    clearLogs,
    setLastResult,
    startBuild,
  }
})
```

#### 4.3.3 Settings Store 完整实现

```typescript
// src/stores/settings.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Store } from '@tauri-apps/plugin-store'

interface Settings {
  defaultOutputPath: string
  defaultCompressLevel: 'fast' | 'standard' | 'maximum'
  openOutputAfterBuild: boolean
  validateAfterBuild: boolean
  theme: 'light' | 'dark' | 'system'
}

export const useSettingsStore = defineStore('settings', () => {
  const store = ref<Store | null>(null)
  const settings = ref<Settings>({
    defaultOutputPath: '~/dist',
    defaultCompressLevel: 'standard',
    openOutputAfterBuild: true,
    validateAfterBuild: true,
    theme: 'system',
  })

  // 初始化 Store
  async function init() {
    store.value = new Store('.settings.dat')
    const saved = await store.value.get<Settings>('settings')
    if (saved) {
      settings.value = { ...settings.value, ...saved }
    }
  }

  // 更新设置
  async function updateSetting<K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) {
    settings.value[key] = value
    await store.value?.set('settings', settings.value)
  }

  // 重置为默认
  async function resetToDefaults() {
    settings.value = {
      defaultOutputPath: '~/dist',
      defaultCompressLevel: 'standard',
      openOutputAfterBuild: true,
      validateAfterBuild: true,
      theme: 'system',
    }
    await store.value?.set('settings', settings.value)
  }

  return {
    settings,
    init,
    updateSetting,
    resetToDefaults,
  }
})
```

### 4.4 窗口配置

#### 4.4.1 主窗口配置

```json
{
  "windows": [
    {
      "title": "iFlow Mod 打包工具",
      "width": 960,
      "height": 720,
      "minWidth": 640,
      "minHeight": 480,
      "resizable": true,
      "maximizable": false,
      "minimizable": true,
      "fullscreenable": false,
      "center": true,
      "autoHideMenuBar": true,
      "decorations": true,
      "transparent": false
    }
  ]
}
```

#### 4.4.2 配置说明

| 属性 | 值 | 说明 |
|------|-----|------|
| `width/height` | 960/720 | 默认窗口尺寸 |
| `minWidth/minHeight` | 640/480 | 最小窗口尺寸，防止 UI 布局错乱 |
| `maximizable` | `false` | 禁用最大化按钮，保持界面比例 |
| `resizable` | `true` | 允许用户调整窗口大小 |
| `center` | `true` | 启动时居中显示 |
| `autoHideMenuBar` | `true` | 默认隐藏菜单栏，保持界面简洁 |
| `decorations` | `true` | 显示原生窗口边框和标题栏 |

### 4.5 路由设计

#### 4.5.1 路由配置

```typescript
// src/router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/editor',
    name: 'Editor',
    component: () => import('@/views/EditorView.vue'),
    meta: { title: '编辑' },
  },
  {
    path: '/build',
    name: 'Build',
    component: () => import('@/views/BuildView.vue'),
    meta: { title: '打包' },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
```

#### 4.5.2 路由守卫

```typescript
// 导航守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || 'iFlow Mod'} - iFlow Mod 打包工具`
  
  // 检查是否有未保存的修改
  const modStore = useModStore()
  if (modStore.unsavedChanges && to.name !== 'Editor') {
    // 可以显示确认对话框
  }
  
  next()
})
```

#### 4.5.3 路由表

| 路由 | 路径 | 组件 | 说明 |
|------|------|------|------|
| 首页 | `/` | HomeView | 导入 code.js |
| 编辑 | `/editor` | EditorView | mod.json 表单编辑 |
| 打包 | `/build` | BuildView | 打包配置和执行 |
| 设置 | `/settings` | SettingsView | 应用设置 |

### 4.6 错误处理机制

#### 4.6.1 统一错误类型

```rust
// src-tauri/error.rs
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("文件不存在: {0}")]
    FileNotFound(String),

    #[error("权限不足: {0}")]
    PermissionDenied(String),

    #[error("验证失败: {0}")]
    ValidationError(String),

    #[error("打包失败: {0}")]
    BuildError(String),

    #[error("IO 错误: {0}")]
    IoError(#[from] std::io::Error),

    #[error("JSON 解析错误: {0}")]
    JsonError(#[from] serde_json::Error),
}

pub type Result<T> = std::result::Result<T, AppError>;
```

#### 4.6.2 前端错误处理

```typescript
// src/utils/errorHandler.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function handleTauriError(error: unknown): AppError {
  if (typeof error === 'string') {
    return new AppError('UNKNOWN_ERROR', error)
  }
  
  if (error instanceof Error) {
    return new AppError('UNKNOWN_ERROR', error.message)
  }
  
  return new AppError('UNKNOWN_ERROR', '未知错误')
}

// 全局错误处理
export function setupGlobalErrorHandler() {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的 Promise  rejection:', event.reason)
    // 可以显示错误提示
  })
}
```

### 4.7 验证机制

#### 4.7.1 mod.json 验证规则

```typescript
// src/utils/validation.ts
import type { ModConfig } from '@/types/mod'

export const modConfigRules = {
  id: {
    required: true,
    pattern: /^[a-z][a-z0-9-]*(\.[a-z0-9-]+)+$/,
    message: 'ID 必须是小写字母、数字、连字符和点，且以字母开头',
  },
  name: {
    required: true,
    minLength: 1,
    maxLength: 100,
    message: '名称不能为空',
  },
  version: {
    required: true,
    pattern: /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/,
    message: '版本号必须符合 semver 格式',
  },
  type: {
    required: true,
    enum: ['append', 'prepend', 'replace', 'patch'],
    message: '请选择 Mod 类型',
  },
  iflowVersion: {
    pattern: /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/,
    message: 'iFlow 版本号必须符合 semver 格式',
  },
  homepage: {
    pattern: /^https?:\/\/.+/,
    message: '请输入有效的 URL',
  },
  repository: {
    pattern: /^https?:\/\/.+/,
    message: '请输入有效的 URL',
  },
}

export function validateModConfig(config: Partial<ModConfig>): string[] {
  const errors: string[] = []

  for (const [field, rule] of Object.entries(modConfigRules)) {
    const value = config[field as keyof ModConfig]

    if (rule.required && !value) {
      errors.push(rule.message)
      continue
    }

    if (value && rule.pattern && !rule.pattern.test(String(value))) {
      errors.push(rule.message)
    }

    if (rule.enum && !rule.enum.includes(value as string)) {
      errors.push(rule.message)
    }
  }

  return errors
}
```

### 4.8 安全考虑

#### 4.8.1 文件系统安全

- **路径验证**：所有文件路径必须经过规范化处理，防止路径遍历攻击
- **权限检查**：读写文件前检查权限
- **沙箱限制**：Tauri 配置中限制文件访问范围

```json
// src-tauri/tauri.conf.json
{
  "tauri": {
    "allowlist": {
      "fs": {
        "scope": ["$HOME/*", "$DESKTOP/*", "$DOCUMENTS/*", "$DOWNLOAD/*"],
        "all": false
      }
    }
  }
}
```

#### 4.8.2 输入验证

- 所有用户输入必须经过验证
- mod.json 内容必须符合 schema
- 防止 XSS 攻击（Vue 默认转义，但仍需注意）

#### 4.8.3 依赖安全

- 定期更新依赖版本
- 使用 `npm audit` 检查漏洞
- Rust 依赖使用 `cargo audit`

### 4.9 测试策略

#### 4.9.1 测试分层

```
┌─────────────────────────────────────────┐
│           E2E 测试（Playwright）          │
│   模拟用户操作，测试完整流程               │
├─────────────────────────────────────────┤
│          集成测试（Vitest）               │
│   测试组件交互、Store 状态、API 调用       │
├─────────────────────────────────────────┤
│          单元测试（Vitest）               │
│   测试工具函数、验证逻辑、纯函数           │
├─────────────────────────────────────────┤
│          Rust 测试（cargo test）          │
│   测试打包逻辑、文件操作、验证函数         │
└─────────────────────────────────────────┘
```

#### 4.9.2 前端测试示例

```typescript
// tests/unit/stores/mod.spec.ts
import { describe, it, expect } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useModStore } from '@/stores/mod'

describe('Mod Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should reset config to defaults', () => {
    const store = useModStore()
    store.config.id = 'test-id'
    store.resetConfig()
    expect(store.config.id).toBe('')
  })

  it('should validate config', () => {
    const store = useModStore()
    store.resetConfig()
    expect(store.isConfigValid).toBe(false)
    
    store.updateConfig('id', 'com.example.test')
    store.updateConfig('name', 'Test')
    store.updateConfig('version', '1.0.0')
    store.updateConfig('type', 'append')
    expect(store.isConfigValid).toBe(true)
  })
})
```

#### 4.9.3 Rust 测试示例

```rust
// src-tauri/services/packager.rs
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_required_files_success() {
        let packager = Packager::new();
        let result = packager.validate_required_files("./test-fixtures/valid-mod");
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_required_files_missing_mod_json() {
        let packager = Packager::new();
        let result = packager.validate_required_files("./test-fixtures/invalid-mod");
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("mod.json"));
    }
}
```

#### 4.9.4 E2E 测试场景

- 导入 code.js → 编辑 mod.json → 打包 → 验证输出
- 拖拽 code.js 文件导入
- 表单验证和错误提示
- 打包进度和结果展示

---

## 五、开发计划

### Phase 1: MVP（v1.0.0）— 4 周

**目标**：实现核心打包功能

#### 第 1 周：项目脚手架

| 任务 | 预计时间 | 优先级 | 交付物 |
|------|---------|--------|--------|
| 初始化 Tauri + Vue3 + Vite 项目 | 0.5 天 | P0 | 可运行的空项目 |
| 配置 TypeScript 和 ESLint | 0.5 天 | P0 | tsconfig.json, .eslintrc |
| 配置 Element Plus | 0.5 天 | P0 | Element Plus 可用 |
| 配置 Pinia 和 Vue Router | 0.5 天 | P0 | 路由和状态管理可用 |
| 配置 Tauri 插件（fs, dialog, store） | 0.5 天 | P0 | Tauri 命令可调用 |
| 搭建基础布局（导航 + 内容区） | 1 天 | P0 | 基础 UI 框架 |

#### 第 2 周：核心功能

| 任务 | 预计时间 | 优先级 | 交付物 |
|------|---------|--------|--------|
| Mod 目录选择（文件对话框） | 1 天 | P0 | 可选择目录 |
| code.js 读取和展示 | 0.5 天 | P0 | 显示 code.js 内容 |
| mod.json 表单编辑器 | 2 天 | P0 | 可编辑所有字段 |
| 表单验证逻辑 | 0.5 天 | P0 | 实时验证提示 |

#### 第 3 周：打包功能

| 任务 | 预计时间 | 优先级 | 交付物 |
|------|---------|--------|--------|
| Tauri Commands 实现（文件操作） | 1 天 | P0 | 文件读写命令 |
| 打包逻辑移植（build-mod.js） | 2 天 | P0 | 可打包 .iflow-mod |
| 进度事件和 UI 展示 | 1 天 | P1 | 进度条显示 |
| 打包结果展示 | 0.5 天 | P1 | 成功/失败提示 |

#### 第 4 周：测试和发布

| 任务 | 预计时间 | 优先级 | 交付物 |
|------|---------|--------|--------|
| 功能测试和 Bug 修复 | 2 天 | P0 | 稳定版本 |
| 设置页面实现 | 1 天 | P1 | 设置页面 |
| 文档编写 | 0.5 天 | P1 | README 文档 |
| 打包发布 | 0.5 天 | P1 | 安装包 |

**里程碑**：用户可以通过 GUI 完成 Mod 打包全流程

### Phase 2: 体验优化（v1.1.0）— 2 周

**目标**：提升用户体验

- 拖拽支持（code.js 文件拖拽导入）
- 打包历史记录
- 深色/浅色主题切换
- 快捷键支持

### Phase 3: 高级功能（v1.2.0）— 2 周

**目标**：专业功能

- 批量打包
- 版本管理
- 自动更新
- 插件系统

---

## 六、界面原型

> **设计规范**：本工具 UI 严格遵循 iFlow Settings Editor 的 Windows 11 Fluent Design 设计系统，确保视觉一致性和统一的产品体验。

### 6.0 设计系统规范

#### 6.0.1 色彩系统（Windows 11 Fluent Design）

**浅色模式（Light Mode）**

| 变量名 | 色值 | 用途 |
|--------|------|------|
| `--bg-primary` | `#f3f3f38e` | 主背景（Mica 半透明） |
| `--bg-secondary` | `#ffffff70` | 次级背景（卡片、面板） |
| `--bg-tertiary` | `#ebebeb` | 三级背景 |
| `--bg-elevated` | `#ffffffe3` | 悬浮 elevation（对话框、下拉菜单） |
| `--text-primary` | `#1a1a1a` | 主文字 |
| `--text-secondary` | `#5d5d5d` | 次级文字 |
| `--text-tertiary` | `#8a8a8a` | 辅助文字 |
| `--accent` | `#0078d4` | 强调色（Windows 蓝） |
| `--accent-hover` | `#106ebe` | 强调色悬停 |
| `--accent-pressed` | `#005a9e` | 强调色按下 |
| `--accent-light` | `rgba(0, 120, 212, 0.1)` | 强调色淡背景（focus ring） |
| `--border` | `#e0e0e0` | 边框色 |
| `--border-light` | `#f0f0f0` | 浅边框 |
| `--success` | `#107c10` | 成功色 |
| `--warning` | `#9d5d00` | 警告色 |
| `--danger` | `#c42b1c` | 危险色 |

**深色模式（Dark Mode）**

| 变量名 | 色值 | 用途 |
|--------|------|------|
| `--bg-primary` | `#0d0d0d` | 主背景 |
| `--bg-secondary` | `#1a1a1a` | 次级背景 |
| `--accent` | `#60cdff` | 强调色（亮蓝） |
| `--text-primary` | `#ffffff` | 主文字 |
| `--text-secondary` | `#cccccc` | 次级文字 |

#### 6.0.2 排版系统

```css
--font-family: 'Segoe UI Variable', 'Segoe UI', system-ui, -apple-system, sans-serif;
--font-mono: 'Cascadia Code', 'Consolas', monospace;

--font-size-xs: 11px;    /* 辅助标签、时间戳 */
--font-size-sm: 12px;    /* 表单标签、描述文字 */
--font-size-base: 14px;  /* 正文、输入框 */
--font-size-lg: 16px;    /* 小标题 */
--font-size-xl: 20px;    /* 页面标题 */
--font-size-2xl: 24px;   /* 大标题 */
```

#### 6.0.3 间距系统（4px 基准网格）

```css
--space-xs: 4px;    /* 紧凑间距 */
--space-sm: 8px;    /* 小间距 */
--space-md: 12px;   /* 中间距 */
--space-lg: 16px;   /* 常规间距 */
--space-xl: 20px;   /* 大间距 */
--space-2xl: 24px;  /* 超大间距 */
--space-3xl: 32px;  /* 页面边距 */
```

#### 6.0.4 圆角系统

```css
--radius-sm: 4px;    /* 小按钮、标签 */
--radius: 6px;       /* 输入框、小卡片 */
--radius-lg: 8px;    /* 卡片、面板 */
--radius-xl: 12px;   /* 对话框、大面板 */
```

#### 6.0.5 阴影系统（Layer-based Depth）

```css
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.04);
--shadow: 0 4px 8px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04);
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06);
--shadow-xl: 0 16px 32px rgba(0, 0, 0, 0.16), 0 8px 16px rgba(0, 0, 0, 0.08);
```

#### 6.0.6 组件样式规范

**按钮（Button）**

| 类型 | 背景 | 文字 | 用途 |
|------|------|------|------|
| Primary | `var(--accent)` | `#ffffff` | 主要操作 |
| Secondary | `var(--control-fill)` | `var(--text-primary)` | 次要操作 |
| Danger | `var(--danger)` | `#ffffff` | 危险操作 |

- 圆角：`var(--radius)` (6px)
- 内边距：`8px 16px`
- 字体大小：`var(--font-size-sm)` (12px)
- 字重：500
- 过渡：`all var(--transition)` (0.15s ease)

**输入框（Input）**

- 背景：`var(--control-fill)`
- 边框：`1px solid var(--border)`
- 圆角：`var(--radius)` (6px)
- 内边距：`var(--space-sm) var(--space-md)` (8px 12px)
- 字体：`var(--font-mono)` (Cascadia Code)
- Focus 状态：`border-color: var(--accent)`, `box-shadow: 0 0 0 3px var(--accent-light)`

**卡片（Card）**

- 背景：`var(--bg-secondary)`
- 边框：`1px solid var(--border-light)`
- 圆角：`var(--radius-lg)` (8px)
- 内边距：`var(--space-lg)` (16px)
- 阴影：`var(--shadow-sm)` (hover 时)

**开关（Toggle Switch）**

- 关闭状态：背景 `var(--toggle-off)`, 滑块 `var(--toggle-thumb)`
- 开启状态：背景 `var(--toggle-on)`, 边框 `var(--toggle-on-border)`

#### 6.0.7 布局规范

- **应用布局**：Flexbox 垂直布局（sidebar + content）
- **侧边栏宽度**：220px（展开）/ 52px（收起）
- **内容区内边距**：`var(--space-3xl) var(--space-2xl)` (32px 24px)
- **最大内容宽度**：1200px（居中）

#### 6.0.8 动画规范

```css
--transition-fast: 0.1s ease;
--transition: 0.15s ease;
--transition-smooth: 0.2s cubic-bezier(0.4, 0, 0.2, 1);

/* 页面进入动画 */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeInDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
```

---

### 6.1 主界面布局（首页）

```
┌──────────────────────────────────────────────────────────────────────────┐
│  iFlow Mod 打包工具                                                [─][□][×] │
├──────────────────────────────────────────────────────────────────────────┤
│  [🏠 首页]  [📝 编辑]  [📦 打包]  [⚙ 设置]                               │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  欢迎使用 iFlow Mod 打包工具                                               │
│                                                                          │
│  第一步：导入 code.js                                                      │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                                                                   │   │
│  │              📂 点击选择 code.js 或拖拽文件到这里                     │   │
│  │                                                                   │   │
│  │              支持 .js 文件，自动识别 code.js 入口                    │   │
│  │                                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  最近项目                                                                 │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  📁 my-mod-1              v1.0.0    2 分钟前    [打开] [打包]     │   │
│  │  📁 my-mod-2              v2.1.0    1 小时前    [打开] [打包]     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

**设计要点**：

- **标题栏**：自定义 TitleBar，包含应用名称和窗口控制按钮（最小化/最大化/关闭）
- **导航栏**：侧边导航，图标 + 文字，当前页面高亮（accent 色背景 + accent 色图标）
- **内容区**：`padding: 32px 24px`，`background: var(--bg-primary)`
- **拖拽区域**：卡片样式，`border: 2px dashed var(--border)`，hover 时边框变为 `var(--accent)`，背景变为 `var(--accent-light)`
- **最近项目列表**：卡片列表，每项包含图标、名称、版本、时间和操作按钮

**交互细节**：
- 拖拽文件进入区域时，边框高亮为 accent 色，背景显示淡 accent 色
- 卡片 hover 时显示 `var(--shadow-sm)` 阴影
- 导航项 hover 时背景变为 `var(--control-fill-hover)`
- 页面元素依次 `fadeInUp` 动画进入（stagger delay）

---

### 6.2 编辑界面布局（mod.json 编辑器）

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Mod 配置                                                      [保存]     │
├──────────────────────────────────────────────────────────────────────────┤
│  [🏠] [📝 编辑] [📦 打包]  [⚙ 设置]                                      │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 基本信息                                                           │   │
│  │                                                                   │   │
│  │  ID *              [com.example.my-mod____________________]      │   │
│  │  名称 *            [我的 Mod 名称______________________________]   │   │
│  │  版本 *            [1.0.0_____________________________]         │   │
│  │  类型 *            ○ 追加代码    ○ 前置代码    ○ 完全替换         │   │
│  │                    ○ 补丁模式（未实现）                              │   │
│  │                                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 高级配置                                                           │   │
│  │                                                                   │   │
│  │  描述              [___________________________________________]   │   │
│  │                   [___________________________________________]   │   │
│  │                                                                   │   │
│  │  作者              [________________]    分类  [▼ 工具类  ]      │   │
│  │  iFlow 版本        [0.5.19___________]    图标  [🚀  ]           │   │
│  │  许可证            [▼ MIT                ]   标签  [工具  +]     │   │
│  │                                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

**设计要点**：

- **页面标题**：左侧显示 "Mod 配置"，右侧放置主操作按钮 `[保存]`（btn-primary）
- **表单分组**：使用 Card 组件包裹，Card 标题使用 `card-title` 样式
- **必填标识**：字段标签后跟红色 `*`（`--danger` 色）
- **输入框**：`var(--control-fill)` 背景，`var(--radius)` 圆角，focus 时 accent 色边框 + `accent-light` 光晕
- **单选按钮组**：Mod 类型选择，横向排列，选中状态 accent 色圆点 + accent 色文字
- **下拉选择**：自定义箭头图标（SVG），hover/focus 同输入框
- **标签输入**：Tag 样式，`background: var(--accent-light)`, `color: var(--accent)`

**表单验证**：
- 实时验证，错误时输入框边框变为 `var(--danger)`
- 错误提示文字：`var(--danger)`，`font-size: var(--font-size-xs)`

---

### 6.3 打包界面布局

```
┌──────────────────────────────────────────────────────────────────────────┐
│  打包 Mod                                                               │
├──────────────────────────────────────────────────────────────────────────┤
│  [🏠] [📝 编辑] [📦 打包]  [⚙ 设置]                                      │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Mod 信息                                                                │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  名称: 我的 Mod             版本: 1.0.0         类型: 追加代码     │   │
│  │  ID: com.example.my-mod                                           │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  输出设置                                                                │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  输出目录  [~/dist/                                    ] [浏览...] │   │
│  │  文件名    [my-mod-v1.0.0.iflow-mod___________________]          │   │
│  │  压缩级别  ● 标准    ○ 最大压缩    ○ 最快速度                       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  选项                                                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  ☑ 打包后验证包内容                                                 │   │
│  │  ☑ 完成后打开输出文件夹                                             │   │
│  │  ☑ 复制输出路径到剪贴板                                             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  打包进度                                                           │   │
│  │  [████████████████████████──────────] 75%                          │   │
│  │  正在打包: utils/helpers.js                                         │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│              [取消]              [开始打包]                               │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

**设计要点**：

- **Mod 信息卡片**：只读展示，使用 `bg-tertiary` 背景区分
- **输出设置卡片**：文件路径选择器 + 文件名输入框 + 压缩级别单选
- **选项卡片**：Checkbox 样式，使用 Toggle Switch 组件
- **进度卡片**：打包时显示，包含进度条（accent 色）和当前文件名称
- **操作按钮**：底部右侧对齐，Primary 按钮强调主操作

**进度条样式**：
```css
.progress-bar {
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  overflow: hidden;

  .progress-fill {
    height: 100%;
    background: var(--accent);
    transition: width 0.2s ease;
  }
}
```

---

## 七、技术细节

### 7.1 打包进度实现

由于 archiver 库不提供进度事件，需要通过 Tauri 事件发送进度：

```typescript
async function buildWithProgress(
  files: FileInfo[],
  outputPath: string,
  onProgress: (progress: number, currentFile: string) => void
) {
  const total = files.length
  let processed = 0

  const output = fs.createWriteStream(outputPath)
  const archive = archiver('zip', { zlib: { level: 9 } })

  archive.on('entry', (entry) => {
    processed++
    onProgress(processed / total, entry.name)
  })

  archive.pipe(output)
  files.forEach(file => archive.file(file.fullPath, { name: file.relativePath }))
  await archive.finalize()

  return new Promise((resolve, reject) => {
    output.on('close', resolve)
    output.on('error', reject)
  })
}
```

### 7.2 配置文件存储

使用 Tauri 插件持久化用户配置：

```typescript
// 存储结构
{
  "defaultOutputPath": "~/dist",
  "defaultCompressLevel": "standard",
  "openOutputAfterBuild": true,
  "validateAfterBuild": true,
  "theme": "system"
}
```

### 7.4 打包配置兼容性

保留对原 `build-mod.js` 命令行参数的兼容：

```typescript
interface BuildConfig {
  modPath: string
  outputPath?: string
  compressLevel?: 'fast' | 'standard' | 'maximum'
  skipValidation?: boolean
  openOutput?: boolean
}
```

---

## 八、发布计划

### 8.1 版本规划

| 版本 | 目标 | 预计时间 |
|------|------|---------|
| v1.0.0 | 核心打包功能 | 4 周 |
| v1.1.0 | 体验优化 | 2 周 |
| v1.2.0 | 高级功能 | 2 周 |
| v1.3.0 | 稳定性和性能优化 | 1 周 |

### 8.2 发布渠道

- GitHub Releases
- 自动更新（tauri-updater）
- 可选：npm 包（`iflow-mod-gui`）

### 8.3 系统要求

- Windows 10+
- macOS 10.15+
- Ubuntu 20.04+

---

## 九、风险与挑战

### 9.1 技术风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| archiver 进度事件缺失 | 无法显示精确进度 | 按文件数估算进度 |
| Tauri 体积较大 | 安装包 > 100MB | 使用 UPX 压缩，考虑精简依赖 |
| Vue3 + Tauri 集成复杂度 | 开发周期延长 | 使用成熟脚手架（tauri-vite） |

### 9.2 产品风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 功能过于简单 | 用户不愿使用 | Phase 2/3 持续迭代 |
| 与原命令行工具差异大 | 老用户不适应 | 保持核心逻辑一致，提供 CLI 调用选项 |

---

## 十、后续迭代方向

### v2.0 构想

- **Mod 市场**：浏览和下载社区 Mod
- **协作功能**：团队共享 Mod 配置
- **CI/CD 集成**：GitHub Actions 自动打包
- **多语言支持**：英文、日文等

---

*方案版本：v1.0*  
*创建日期：2026-05-10*  
*状态：规划中*

---

## 五、开发计划

### Phase 1: MVP（v1.0.0）— 4 周

**目标**：实现核心打包功能

| 任务 | 预计时间 | 优先级 | 交付物 |
|------|---------|--------|--------|
| 项目脚手架搭建（Tauri + Vue3 + Vite） | 3 天 | P0 | 可运行的空项目 |
| 基础布局和导航 | 2 天 | P0 | 基础 UI 框架 |
| Mod 目录选择和验证 | 2 天 | P0 | 目录选择功能 |
| mod.json 可视化编辑器 | 3 天 | P0 | 表单编辑器 |
| 打包功能实现（复用 build-mod.js） | 2 天 | P0 | 可打包 .iflow-mod |
| 打包进度和结果展示 | 1 天 | P1 | 进度条和结果提示 |
| 基础设置页面 | 1 天 | P1 | 设置页面 |
| 打包测试和 Bug 修复 | 3 天 | P0 | 稳定版本 |
| 文档和发布 | 2 天 | P1 | README 和安装包 |

**里程碑**：用户可以通过 GUI 完成 Mod 打包全流程

### Phase 2: 体验优化（v1.1.0）— 2 周

**目标**：提升用户体验

- 拖拽支持
- 打包历史
- 深色/浅色主题切换

### Phase 3: 高级功能（v1.2.0）— 2 周

**目标**：专业功能

- 批量打包
- 版本管理
- 自动更新
- 插件系统

---

## 六、界面原型

### 6.1 主界面布局

```
┌─────────────────────────────────────────────────────────────┐
│  iFlow Mod 打包工具                              [─][□][×]   │
├─────────────────────────────────────────────────────────────┤
│  [🏠 首页]  [📝 编辑]  [📦 打包]       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  欢迎使用 iFlow Mod 打包工具                                  │
│                                                             │
│  第一步：导入 code.js                                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │     📂 点击选择 code.js 或 拖拽文件到这里               │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 编辑界面布局

```
┌─────────────────────────────────────────────────────────────┐
│  Mod 配置                                          [保存]   │
├─────────────────────────────────────────────────────────────┤
│  [🏠] [📝 编辑] [📦]                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 基本信息                                              │   │
│  │                                                     │   │
│  │ ID: [____________]                                  │   │
│  │ 名称: [________]                                    │   │
│  │ 版本: [________]                                    │   │
│  │ 类型: ○ 追加代码      ○ 前置代码     ○ 完全替换     │   │
│  │       ○ 补丁模式                                      │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 高级配置                                              │   │
│  │ 描述: [________________________________]             │   │
│  │ 作者: [________]  分类: [▼ 工具类]  图标: [🚀]       │   │
│  │ 标签: [工具] [+]                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 打包界面布局

```
┌─────────────────────────────────────────────────────────────┐
│  打包 Mod                                                  │
├─────────────────────────────────────────────────────────────┤
│  [🏠] [📝] [📦 打包] [📚]                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Mod 信息                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 名称: 我的 Mod     版本: 1.0.0     类型: 追加代码      │   │
│  │ ID: com.example.my-mod                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  输出设置                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 输出目录: [~/dist/                    ] [浏览...]    │   │
│  │ 文件名:   my-mod-v1.0.0.iflow-mod                   │   │
│  │ 压缩级别: ● 标准  ○ 最大压缩  ○ 最快速度              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  选项                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ☑ 打包后验证包内容                                     │   │
│  │ ☑ 完成后打开输出文件夹                                 │   │
│  │ ☑ 复制输出路径到剪贴板                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│        [取消]              [开始打包]                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 七、技术细节

### 7.1 打包进度实现

由于 archiver 库不提供进度事件，需要通过 Tauri 事件发送进度：

```typescript
async function buildWithProgress(
  files: FileInfo[],
  outputPath: string,
  onProgress: (progress: number, currentFile: string) => void
) {
  const total = files.length
  let processed = 0

  const output = fs.createWriteStream(outputPath)
  const archive = archiver('zip', { zlib: { level: 9 } })

  archive.on('entry', (entry) => {
    processed++
    onProgress(processed / total, entry.name)
  })

  archive.pipe(output)
  files.forEach(file => archive.file(file.fullPath, { name: file.relativePath }))
  await archive.finalize()

  return new Promise((resolve, reject) => {
    output.on('close', resolve)
    output.on('error', reject)
  })
}
```

### 7.2 配置文件存储

使用 Tauri 插件持久化用户配置：

```typescript
// 存储结构
{
  "defaultOutputPath": "~/dist",
  "defaultCompressLevel": "standard",
  "openOutputAfterBuild": true,
  "validateAfterBuild": true,
  "theme": "system"
}
```

### 7.4 打包配置兼容性

保留对原 `build-mod.js` 命令行参数的兼容：

```typescript
interface BuildConfig {
  modPath: string
  outputPath?: string
  compressLevel?: 'fast' | 'standard' | 'maximum'
  skipValidation?: boolean
  openOutput?: boolean
}
```

---

## 八、发布计划

### 8.1 版本规划

| 版本 | 目标 | 预计时间 |
|------|------|---------|
| v1.0.0 | 核心打包功能 | 4 周 |
| v1.1.0 | 体验优化 | 2 周 |
| v1.2.0 | 高级功能 | 2 周 |
| v1.3.0 | 稳定性和性能优化 | 1 周 |

### 8.2 发布渠道

- GitHub Releases
- 自动更新（tauri-updater）
- 可选：npm 包（`iflow-mod-gui`）

### 8.3 系统要求

- Windows 10+
- macOS 10.15+
- Ubuntu 20.04+

---

## 九、风险与挑战

### 9.1 技术风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| archiver 进度事件缺失 | 无法显示精确进度 | 按文件数估算进度 |
| Tauri 体积较大 | 安装包 > 100MB | 使用 UPX 压缩，考虑精简依赖 |
| Vue3 + Tauri 集成复杂度 | 开发周期延长 | 使用成熟脚手架（tauri-vite） |

### 9.2 产品风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 功能过于简单 | 用户不愿使用 | Phase 2/3 持续迭代 |
| 与原命令行工具差异大 | 老用户不适应 | 保持核心逻辑一致，提供 CLI 调用选项 |

---

## 十、后续迭代方向

### v2.0 构想

- **Mod 市场**：浏览和下载社区 Mod
- **协作功能**：团队共享 Mod 配置
- **CI/CD 集成**：GitHub Actions 自动打包
- **多语言支持**：英文、日文等

---

*方案版本：v1.0*  
*创建日期：2026-05-10*  
*状态：规划中*
