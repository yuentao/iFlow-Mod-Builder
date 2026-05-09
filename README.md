# iFlow Mod 开发指南

> 本指南详细介绍如何为 iFlow CLI 开发 Mod 修饰符模块。

## 目录

- [概述](#概述)
- [Mod 类型](#mod-类型)
- [快速开始](#快速开始)
- [mod.json 配置](#modjson-配置)
- [开发模式详解](#开发模式详解)
- [示例代码](#示例代码)
- [调试技巧](#调试技巧)
- [发布与分享](#发布与分享)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

---

## 概述

iFlow Mod 是 iFlow CLI 的实验性扩展系统，允许你通过修改 `iflow.js` 文件来定制 CLI 行为。Mod 以 `.iflow-mod` 包的形式分发，通过 iFlow Settings Editor GUI 导入。

```
~/.iflow/mods/iflow/
├── mods.json              # Mod 元数据清单
├── iflow.js.original     # 原始 iflow.js 备份
├── {mod-id-1}/
│   ├── mod.json           # Mod 配置
│   └── code.js           # Mod 代码
└── {mod-id-2}/
    ├── mod.json
    └── code.js
```

---

## Mod 类型

| 类型 | 说明 | 适用场景 |
|------|------|---------|
| **append** | 在 `iflow.js` 末尾追加代码 | 添加功能、拦截输出、修改行为 |
| **prepend** | 在 `iflow.js` 开头插入代码 | 初始化、设置环境变量、注册全局钩子 |
| **replace** | 完全替换 `iflow.js` | 完全重构、自定义构建版本 |
| **patch** | 差分修补（Phase 2 计划中） | 精确修改部分代码 |

### 优先级

当多个 Mod 启用时，执行顺序为：

```
prepend Mod 1 → prepend Mod 2 → ... → 原始 iflow.js → append Mod 1 → append Mod 2 → ...
```

Mod 按 `installedAt` 时间戳升序排列依次应用。

---

## 快速开始

### 1. 创建 Mod 目录结构

```
my-iflow-mod/
├── mod.json        # 必须：Mod 配置
└── code.js         # 必须：Mod 代码
```

### 2. 编写 mod.json

```json
{
  "id": "com.example.my-mod",
  "name": "我的 Mod",
  "version": "1.0.0",
  "type": "append",
  "description": "Mod 描述",
  "author": "作者名",
  "category": "customization",
  "iflowVersion": "0.5.19",
  "iflowVersionConstraint": "0.5.19+",
  "icon": "🔧",
  "tags": ["utility"],
  "license": "MIT",
  "entry": "code.js"
}
```

### 3. 编写 code.js

```javascript
// 你的 Mod 代码
console.log('[My Mod] 已加载')

// 示例：拦截 console.log
const originalLog = console.log
console.log = function(...args) {
  originalLog('[My Mod]', ...args)
}
```

### 4. 打包 Mod

使用以下命令将 Mod 目录打包为 `.iflow-mod` 文件：

```bash
# 使用 npm 脚本 (推荐)
npm run build:mod -- ./my-iflow-mod ./dist

# 或直接运行脚本
node scripts/build-mod.js ./my-iflow-mod ./dist

# 打包当前目录
npm run build:mod
```

### 5. 导入 Mod

1. 打开 iFlow Settings Editor
2. 进入 **iFlow Mod** 页面
3. 点击 **导入 Mod**
4. 选择 `.iflow-mod` 文件
5. 导入后默认 **不启用**，点击开关启用

---

## mod.json 配置

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 唯一标识符，推荐使用反域名格式 |
| `name` | string | 是 | 显示名称 |
| `version` | string | 是 | 语义化版本 (semver) |
| `type` | enum | 是 | `append` / `prepend` / `replace` / `patch` |
| `description` | string | 是 | 详细描述 |
| `author` | string | 是 | 作者名称 |
| `category` | string | 是 | 分类 |
| `iflowVersion` | string | 否 | 最低 iFlow 版本要求 |
| `iflowVersionConstraint` | string | 否 | 版本约束 |
| `icon` | string | 否 | emoji 图标 |
| `tags` | string[] | 否 | 标签 |
| `homepage` | string | 否 | 项目主页 |
| `repository` | string | 否 | 代码仓库 |
| `license` | string | 否 | 许可证 |
| `entry` | string | 否 | 入口文件名，默认 `code.js` |

### 版本约束格式

| 格式 | 示例 | 含义 |
|------|------|------|
| `X.Y.Z+` | `0.5.19+` | iFlow 版本 >= X.Y.Z |
| `X.Y.Z-` | `0.5.19-` | iFlow 版本 <= X.Y.Z |
| `X.Y.Z` | `0.5.19` | iFlow 版本 == X.Y.Z |

### 分类

推荐使用以下分类：

- `customization` - UI/外观定制
- `utility` - 工具类
- `integration` - 第三方集成
- `productivity` - 效率增强
- `experimental` - 实验性功能
- `other` - 其他

---

## 开发模式详解

### prepend 模式

**时机**：在原始 `iflow.js` 代码之前执行。

**特点**：
- 先于所有 iFlow 核心逻辑运行
- 适合初始化、全局配置、设置环境变量
- 无法访问 iFlow 内部对象（尚未加载）

**使用场景**：
- 设置 `process.env` 环境变量
- 注册全局 `process.on` 事件处理器
- 配置代理、证书路径
- 添加自定义命令别名到全局对象

```javascript
// 示例：设置 HTTP 代理
process.env.HTTPS_PROXY = 'http://127.0.0.1:7890'

// 示例：注册命令别名
global.__IFLOW_COMMAND_ALIASES__ = {
  'll': 'ls -la',
  'gs': 'git status',
}
```

### append 模式

**时机**：在原始 `iflow.js` 代码之后执行。

**特点**：
- iFlow 核心逻辑已加载完毕
- 可以访问和修改 iFlow 的全局对象
- 适合拦截方法、扩展功能、修改行为

**使用场景**：
- 拦截 `console.log` / `console.error`
- 覆盖 iFlow 内部函数
- 添加自定义 hooks 到已加载的对象
- 修改终端输出样式

```javascript
// 示例：拦截输出
const originalLog = console.log
console.log = function(...args) {
  originalLog('[MyMod]', ...args)
}
```

### replace 模式

**时机**：完全替换 `iflow.js`。

**特点**：
- 替换整个文件，官方功能全部丢失
- 需要提供完整的替代代码
- 风险最高，但灵活性最大

**使用场景**：
- 完全重构 CLI 行为
- 使用自定义构建版本
- 高级定制，需要完整控制

### patch 模式 (Phase 2 计划中)

**时机**：精确修补 `iflow.js` 中的特定行。

**特点**：
- 使用 unified diff 格式
- 仅修改需要的部分
- 便于追踪和回滚

---

## 示例代码

### 示例 1：自定义命令别名 (prepend)

```javascript
// code.js (prepend)
const aliases = {
  'll': 'ls -la',
  'gs': 'git status',
  'gp': 'git pull origin main',
  'gc': 'git commit -m',
}

global.__IFLOW_ALIASES__ = aliases
console.log(`[Alias Mod] 已加载 ${Object.keys(aliases).length} 个别名`)
```

### 示例 2：输出拦截 (append)

```javascript
// code.js (append)
const originalLog = console.log
const originalError = console.error
const logFile = require('fs').createWriteStream(
  require('path').join(process.env.HOME, '.iflow', 'mod-output.log'),
  { flags: 'a' }
)

console.log = (...args) => {
  logFile.write(args.join(' ') + '\n')
  originalLog(...args)
}

console.error = (...args) => {
  logFile.write('[ERROR] ' + args.join(' ') + '\n')
  originalError(...args)
}

console.log('[Output Log Mod] 输出日志已启用')
```

### 示例 3：深色主题 (prepend)

```javascript
// code.js (prepend)
const DARK_COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
}

global.__IFLOW_COLORS__ = DARK_COLORS
process.env.IFLOW_THEME = 'dark'
console.log(DARK_COLORS.cyan + '[Theme] 深色主题已启用' + DARK_COLORS.reset)
```

### 示例 4：HTTP 请求拦截 (append)

```javascript
// code.js (append)
const originalFetch = global.fetch

global.fetch = async function(url, options) {
  console.log(`[Fetch Mod] 请求: ${url}`)
  try {
    const response = await originalFetch(url, options)
    console.log(`[Fetch Mod] 响应: ${response.status} ${response.statusText}`)
    return response
  } catch (err) {
    console.error(`[Fetch Mod] 请求失败:`, err.message)
    throw err
  }
}
```

### 示例 5：修改 CLI 行为 (append)

```javascript
// code.js (append)
// 在 append 模式下，可以覆盖 iFlow 的某些全局函数
// 注意：这取决于 iFlow 的具体版本和内部结构

// 尝试访问 iFlow 的全局命名空间
if (global.__IFLOW__) {
  // 添加自定义命令
  global.__IFLOW__.customCommands = {
    'hello': () => console.log('Hello from Mod!'),
    'modinfo': () => console.log('My Custom Mod v1.0.0'),
  }
  console.log('[Mod] 自定义命令已注册到 __IFLOW__')
} else {
  console.log('[Mod] __IFLOW__ 全局对象不可用，将在其他时机重试')
}
```

---

## 调试技巧

### 1. 查看日志

Mod 的 `console.log` 输出会直接显示在终端中：

```bash
iflow "hello world"
# 输出: [My Mod] 已加载
# 输出: [My Mod] 执行 hello world
```

### 2. 启用详细日志

```javascript
// 在 code.js 中启用调试模式
const DEBUG = process.env.IFLOW_MOD_DEBUG === '1'

function debug(...args) {
  if (DEBUG) console.log('[DEBUG]', ...args)
}
```

```bash
# 运行 iFlow 时启用调试
IFLOW_MOD_DEBUG=1 iflow
```

### 3. 备份与恢复

启用 Mod 前，系统会自动备份原始 `iflow.js`：

```
~/.iflow/mods/iflow/iflow.js.original
```

如需恢复，执行：

```javascript
// 禁用所有 Mod 后，原始文件会自动恢复
// 或手动复制：
// cp ~/.iflow/mods/iflow/iflow.js.original /path/to/iflow.js
```

### 4. 逐步排查

如果 Mod 导致问题，按以下顺序排查：

1. **禁用所有 Mod** - 确认问题是否由 Mod 引起
2. **逐个启用 Mod** - 定位是哪个 Mod 导致问题
3. **查看 `iflow.js.original`** - 确认原始文件完整性
4. **检查 Mod 代码** - 查看语法错误
5. **检查版本兼容性** - 确认 `iflowVersionConstraint`

### 5. 使用 try-catch 保护

```javascript
// 始终用 try-catch 包裹可能出错的代码
try {
  // 你的 Mod 代码
  global.__MY_MOD__ = { initialized: true }
} catch (err) {
  console.error('[My Mod] 初始化失败:', err.message)
}
```

---

## 发布与分享

### 1. 打包 Mod

```bash
# 创建 .iflow-mod 包
cd my-mod-directory
zip -r ../my-mod-v1.0.0.iflow-mod .

# 或使用 Node.js 脚本
node -e "
const fs = require('fs')
const path = require('path')
const archiver = require('archiver')

const output = fs.createWriteStream('my-mod.iflow-mod')
const archive = archiver('zip')

archive.pipe(output)
archive.directory('./my-mod', false)
archive.finalize()
"
```

### 2. Mod 包结构

`.iflow-mod` 文件本质上是一个 ZIP 压缩包，包含：

```
my-mod/
├── mod.json          # 必须
├── code.js           # 必须
└── README.md         # 可选
```

### 3. 分发方式

- **直接分享**：上传 `.iflow-mod` 文件到 GitHub Releases
- **仓库分发**：创建 GitHub 仓库，使用 GitHub Actions 自动构建
- **私有 Mod**：仅导入到本地使用

### 4. 发布到 GitHub

```bash
# 1. 创建 GitHub Release
gh release create v1.0.0 \
  --title "My Mod v1.0.0" \
  --notes "First release of My Mod" \
  my-mod-v1.0.0.iflow-mod

# 2. 或使用 GitHub Actions 自动构建
# 在 .github/workflows/build-mod.yml 中配置
```

---

## 最佳实践

### 命名规范

- Mod ID：`com.{domain}.{name}` (反域名格式)
- Mod 名称：清晰描述功能，使用空格分隔
- 标签：小写，用 `-` 分隔

```json
{
  "id": "com.github.username.my-mod",
  "name": "My Custom Mod",
  "tags": ["customization", "dark-mode"]
}
```

### 版本管理

遵循语义化版本 (SemVer)：

- **主版本** (1.0.0 → 2.0.0)：不兼容的 API 变更
- **次版本** (1.0.0 → 1.1.0)：向后兼容的功能添加
- **修订版本** (1.0.0 → 1.0.1)：向后兼容的问题修复

### 错误处理

```javascript
// 推荐：模块化 + 错误隔离
const MOD = {
  name: 'My Mod',
  version: '1.0.0',

  init() {
    try {
      this.setup()
      this.registerHooks()
    } catch (err) {
      console.error(`[${this.name}] 初始化失败:`, err.message)
    }
  },

  setup() {
    // 设置代码
  },

  registerHooks() {
    // 注册钩子
  },
}

MOD.init()
```

### 安全性

1. **不要在 Mod 中硬编码敏感信息**（API keys、密码等）
2. **使用环境变量**存储敏感配置
3. **不要修改系统文件** - 仅操作 `~/.iflow/` 目录
4. **验证用户输入** - 如果 Mod 接受配置参数
5. **最小权限原则** - 仅请求必要的权限

### 兼容性

```javascript
// 检测 iFlow 版本
const IFLOW_VERSION = process.env.npm_package_version || 'unknown'
console.log(`[Mod] 运行在 iFlow ${IFLOW_VERSION}`)

// 根据版本选择不同的实现
if (compareVersions(IFLOW_VERSION, '1.14.0') >= 0) {
  // 使用新版本 API
} else {
  // 使用兼容模式
}
```

---

## 常见问题

### Q: Mod 导入失败？

**A**: 检查以下几点：

1. `mod.json` 是否存在且格式正确
2. `mod.json` 中 `id`、`name`、`type` 等必填字段是否完整
3. `code.js` 是否存在且语法正确
4. 压缩包是否为标准 ZIP 格式（不是 7z、RAR 等）
5. 解压后目录结构是否正确（不应包含嵌套目录）

### Q: Mod 启用后 iFlow 无法启动？

**A**: 按以下步骤修复：

1. 打开 iFlow Settings Editor
2. 进入 iFlow Mod 页面
3. 禁用所有 Mod（关闭开关）
4. 如果仍无法启动，手动恢复原始文件：
   ```bash
   cp ~/.iflow/mods/iflow/iflow.js.original /path/to/iflow.js
   ```
5. 检查出问题的 Mod 的 `code.js` 是否有语法错误

### Q: append 和 prepend 哪个更好？

**A**: 取决于你的需求：

| 需求 | 推荐模式 |
|------|---------|
| 设置环境变量 | prepend |
| 注册全局事件监听器 | prepend |
| 修改已加载对象的属性 | append |
| 拦截 console 方法 | append |
| 覆盖 iFlow 函数 | append |

### Q: 如何卸载 Mod？

**A**: 在 iFlow Settings Editor 的 iFlow Mod 页面：

1. 先**禁用**该 Mod
2. 点击 **删除** 按钮
3. 确认删除

删除后，`iflow.js` 会自动恢复到未应用该 Mod 的状态。

### Q: 多个 Mod 之间有冲突怎么办？

**A**: 冲突通常由以下原因引起：

1. **修改同一函数** - 后续 Mod 的修改会覆盖前面的
2. **依赖冲突** - 两个 Mod 依赖同一全局对象的互斥状态
3. **执行顺序** - prepend/append 顺序影响结果

**解决方案**：
- 确认 Mod 的加载顺序
- 尝试调整 Mod 的启用/禁用组合
- 联系 Mod 作者报告问题
- 在 GitHub 上提交 issue

### Q: patch 模式什么时候可用？

**A**: patch 模式计划在 Phase 2 中实现。届时将支持 unified diff 格式的差分修补，提供更精确的代码修改能力。

---

## 相关资源

- [iFlow Settings Editor GitHub](https://github.com/yuetao/iFlow-Settings-Editor-GUI)
- [iFlow CLI 官方文档](https://iflow.ai)
- [语义化版本规范](https://semver.org/lang/zh-CN/)

---

*本文档由 iFlow Settings Editor 自动生成 | 最后更新：2026-05-09*
