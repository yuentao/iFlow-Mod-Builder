# iFlow Mod 项目

## 项目概述

iFlow Mod 打包工具，用于将 iFlow CLI 扩展（Mod）目录打包为 `.iflow-mod` 文件（本质是 zip 格式）。打包后的文件可通过 iFlow Settings Editor 导入安装。

## 项目结构

```
iflow-mod/
├── build-mod.js           # 打包脚本（主入口）
├── package.json
├── AGENTS.md
├── iflow.js_bak           # iFlow CLI 主程序备份（参考）
├── iflow-mod-template/    # Mod 开发模板
│   ├── mod.json           # Mod 配置文件
│   ├── code.js            # 默认入口文件
│   ├── CODE-APPEND.js     # append 模式示例
│   ├── CODE-PREPEND.js    # prepend 模式示例
│   ├── CODE-REPLACE.js    # replace 模式示例
│   ├── CODE-PATCH.js      # patch 模式示例（Phase 1 未实现）
│   └── CODE-EXAMPLE-DARKMODE.js  # 深色模式示例
└── example-iflow-dark-mode/  # 深色主题 Mod 示例
    ├── mod.json
    └── code.js
```

## 快速开始

**安装依赖**
```
npm install
```

**打包 Mod**
```
npm run build:mod                                    # 打包当前目录
npm run build:mod -- ./my-mod                        # 打包指定目录
npm run build:mod -- ./my-mod ./dist                 # 指定输出目录
```

## Mod 配置文件 (mod.json)

必填字段：`id`、`name`、`version`、`type`

可选字段：`description`、`author`、`category`、`iflowVersion`、`iflowVersionConstraint`、`icon`、`tags`、`homepage`、`repository`、`license`、`entry`

**示例：**
```json
{
  "id": "com.example.my-first-mod",
  "name": "My First iFlow Mod",
  "version": "1.0.0",
  "type": "append",
  "description": "描述",
  "author": "Your Name",
  "iflowVersion": "1.14.0",
  "icon": "🚀",
  "tags": ["example"],
  "license": "MIT",
  "entry": "code.js"
}
```

## Mod 类型 (type)

| 类型 | 说明 | 适用场景 |
|------|------|----------|
| `append` | 在 `iflow.js` **末尾**追加代码 | 输出拦截、环境变量注入、劫持 console |
| `prepend` | 在 `iflow.js` **开头**插入代码 | 全局配置、全局 hooks、命令别名、PATH 修改 |
| `replace` | **完全替换** `iflow.js` | 完全重构 CLI 行为（⚠️ 风险高） |
| `patch` | 使用 unified diff 精确修补（**Phase 1 未实现**） | 计划 Phase 2 支持 |

## 打包流程

`build-mod.js` 执行以下步骤：

1. 检查 Mod 目录和必需文件（`mod.json`、`code.js`）
2. 解析 `mod.json`，验证必填字段
3. 收集目录中所有文件（跳过 `.iflow-mod` 和隐藏文件）
4. 使用 `archiver` 打包为 zip（`{modId}-v{version}.iflow-mod`）
5. 使用 `adm-zip` 验证包内容完整性

## 开发 Mod

### 步骤

1. 复制 `iflow-mod-template/` 目录作为起点
2. 修改 `mod.json` 中的 `id`、`name`、`version`
3. 编辑 `code.js` 或选择合适的示例文件重命名使用
4. 运行 `npm run build:mod -- ./your-mod` 打包
5. 在 iFlow Settings Editor 中导入生成的 `.iflow-mod` 文件

### 全局对象 API

Mod 可通过全局对象与 iFlow 交互：

| 全局对象 | 用途 |
|----------|------|
| `global.__IFLOW_THEME__` | 主题配置（颜色、样式函数） |
| `global.__IFLOW_MOD_HOOKS__` | CLI 生命周期钩子 |
| `global.__IFLOW_COMMAND_ALIASES__` | 命令别名映射 |
| `global.__MOD_PATCH_SIMULATOR__` | patch 模拟器（Phase 1 兼容方案） |

### 环境变量

Mod 可设置以下环境变量：

| 变量 | 说明 |
|------|------|
| `IFLOW_THEME` | 当前主题名称 |
| `IFLOW_THEME_DARK` | 深色模式标志 |
| `FORCE_COLOR` / `CLICOLOR` / `CLICOLOR_FORCE` | 强制终端颜色输出 |
| `IFLOW_MOD_ACTIVE` | Mod 激活标志 |

## 依赖

- **archiver** — zip 打包
- **adm-zip** — zip 内容验证

## 注意事项

- `.iflow-mod` 文件本质是 zip 格式，可用任意 zip 工具解压查看
- patch 模式目前未实现，可用 `append` 模式 + `__MOD_PATCH_SIMULATOR__` 模拟
- replace 模式会完全覆盖原始 `iflow.js`，风险较高
