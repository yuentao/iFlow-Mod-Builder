/**
 * ============================================================
 * iFlow Mod 示例：replace 模式
 * ============================================================
 * ⚠️  警告：replace 模式会完全替换 iflow.js！
 * 仅在你完全理解 iflow.js 结构且需要彻底重构时使用。
 *
 * 适用场景：
 * - 完全重写 CLI 行为
 * - 使用自定义构建版本替换官方版本
 * - 高级定制，需要完全控制 CLI 生命周期
 *
 * 风险说明：
 * - 替换后所有官方功能可能丢失
 * - 官方更新不会自动合并
 * - 需要手动维护与官方版本的兼容性
 */

console.log('[iFlow Mod] REPLACE 模式已激活 - 完全替换 iflow.js')
console.log('[警告] 这是 replace 模式 mod，所有官方功能将被覆盖')

// ============================================================
// replace 模式使用说明：
// ============================================================
// 在 replace 模式下，你需要提供完整的 iflow.js 替代代码。
// 这通常是一个完整的 ES Module 打包文件。
//
// 推荐做法：
// 1. 先导出官方 iflow.js 作为基础
// 2. 基于导出的文件进行修改
// 3. 在 mod.json 中指定 "type": "replace"
// 4. 在 code.js 中提供完整的替换代码
//
// 示例结构：
// const replacementCode = `...完整的 iflow.js 代码...`
// module.exports = replacementCode

// ============================================================
// 示例：替换 CLI 入口行为
// ============================================================
const MOD_CLI_ENTRY = `
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// 替换后的 CLI 入口代码
// 你需要在这里提供完整的替换实现

console.log('[Mod REPLACE] 自定义 CLI 入口已加载')

// 这里是简化的示例入口
// 实际替换时请确保包含完整的原始功能
function main(args) {
  console.log('[Mod] 自定义主函数被调用，参数:', args)
  // ... 你的自定义逻辑
}

export { main }
`

// 注意：在 replace 模式下，code.js 应该包含
// 完整的可执行 JavaScript 代码或 ES Module 代码
// 此示例仅用于演示结构

console.log('[iFlow Mod] replace 模式已就绪')
console.log('[iFlow Mod] 请确保 code.js 包含完整的替换代码')
