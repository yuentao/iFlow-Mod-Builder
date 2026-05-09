/**
 * iFlow Mod Template - code.js
 * ============================================================
 * 这是模板 Mod 的默认入口文件。
 *
 * 当前模式：append
 *
 * 目录结构说明：
 * ├── mod.json           ← Mod 配置文件
 * ├── code.js           ← 本文件（入口）
 * ├── README.md         ← 开发指南
 * ├── CODE-APPEND.js    ← append 模式示例
 * ├── CODE-PREPEND.js   ← prepend 模式示例
 * ├── CODE-REPLACE.js   ← replace 模式示例
 * ├── CODE-PATCH.js     ← patch 模式示例（Phase 1 未实现）
 * └── CODE-EXAMPLE-DARKMODE.js  ← 实用示例：深色模式
 *
 * 使用方式：
 * 1. 复制此目录作为新 Mod 的起点
 * 2. 修改 mod.json 中的 id、name、version 等信息
 * 3. 编辑 code.js 或选择合适的示例文件重命名使用
 * 4. 打包为 .iflow-mod 文件导入
 */

// ============================================================
// 在此编写你的 Mod 代码
// ============================================================

console.log('[iFlow Mod Template] 已加载')

// 示例代码：记录启动时间
const startTime = Date.now()

// 示例代码：注册到全局对象
global.__IFLOW_MOD_TEMPLATE__ = {
  name: 'iFlow Mod Template',
  version: '1.0.0',
  loadedAt: new Date().toISOString(),
  startTime,
}

// 示例代码：添加命令别名（prepend 模式更合适）
// global.__IFLOW_COMMAND_ALIASES__ = global.__IFLOW_COMMAND_ALIASES__ || {}
// Object.assign(global.__IFLOW_COMMAND_ALIASES__, {
//   'mod:info': 'echo "Mod info"',
// })

console.log('[iFlow Mod Template] 初始化完成')
