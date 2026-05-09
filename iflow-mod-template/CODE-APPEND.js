/**
 * ============================================================
 * iFlow Mod 示例：append 模式
 * ============================================================
 * 适用场景：向 iflow.js 末尾追加代码，修改或扩展其行为。
 * 工作原理：在 iflow.js 末尾追加此代码，利用全局对象或 hooks 进行扩展。
 *
 * 安装后：在 ~/.iflow/mods/iflow/{mod-id}/ 目录下，
 * 启用时此文件内容会被追加到 iflow.js 末尾。
 */

// ============================================================
// 示例 1：拦截 CLI 输出
// ============================================================
// 在 append 模式下，我们可以劫持 console.log 来实现输出拦截

const __modOriginalConsoleLog = console.log.bind(console)
const __modOriginalConsoleError = console.error.bind(console)

console.log = function(...args) {
  // 示例：在所有输出前添加 [MOD] 前缀
  // 取消注释以启用：
  // __modOriginalConsoleLog('[MOD]', new Date().toISOString(), ...args)

  // 传递给原始 console
  return __modOriginalConsoleLog(...args)
}

console.error = function(...args) {
  // 示例：记录错误日志到文件
  // fs.appendFileSync(
  //   path.join(process.env.HOME || process.env.USERPROFILE, '.iflow', 'mod-error.log'),
  //   `[${new Date().toISOString()}] ${args.join(' ')}\n`
  // )
  return __modOriginalConsoleError(...args)
}

// ============================================================
// 示例 2：扩展 CLI 行为 (环境变量注入)
// ============================================================
// 在启动时注入自定义环境变量

process.env.IFLOW_MOD_ACTIVE = 'true'
process.env.IFLOW_MOD_APPEND_ACTIVE = 'true'

__modOriginalConsoleLog('[iFlow Mod] append 模式已激活 - 输出拦截已启用')
