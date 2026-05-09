/**
 * ============================================================
 * iFlow Mod 示例：patch 模式
 * ============================================================
 * ⚠️  当前 Phase 1 版本暂不支持 patch 模式
 *
 * patch 模式的设计目标：
 * - 使用 unified diff 格式精确修补 iflow.js 中的特定代码段
 * - 仅修改需要的部分，不影响其他代码
 * - 便于追踪修改内容，易于回滚
 *
 * 未来计划 (Phase 2)：
 * patch.diff 文件格式示例：
 *
 *   --- a/iflow.js
 *   +++ b/iflow.js
 *   @@ -100,5 +100,10 @@
 *    // 原始代码
 *   +// 新增代码
 *    // 后续代码
 *
 * 使用说明 (待 Phase 2 实现)：
 * 1. 在 mod.json 中设置 "type": "patch"
 * 2. 提供 patch.diff 文件（而非 code.js）
 * 3. 系统将自动应用 diff 到 iflow.js
 */

console.log('[iFlow Mod] patch 模式开发预览')
console.log('[iFlow Mod] patch 功能将在 Phase 2 中实现')
console.log('[iFlow Mod] 当前请使用 append 或 prepend 模式')

// ============================================================
// 临时替代方案：在 append 模式中模拟 patch 效果
// ============================================================
// 虽然 patch 功能未实现，但可以通过 append 模式
// 在 iflow.js 末尾添加覆盖函数来实现类似效果

const __modPatchSimulator = {
  /**
   * 模拟函数替换
   * @param {string} originalFuncName - 要替换的原始函数名
   * @param {string} newFuncBody - 新函数体（作为字符串）
   * @param {object} targetScope - 目标作用域，默认为全局
   */
  patchFunction: function(originalFuncName, newFuncBody, targetScope = global) {
    try {
      // 检查原始函数是否存在
      if (typeof targetScope[originalFuncName] !== 'function') {
        console.warn(`[Mod] 函数 ${originalFuncName} 不存在，跳过 patch`)
        return false
      }

      // 保存原始函数引用（可用于调用原始实现）
      const originalFunc = targetScope[originalFuncName]

      // 使用 Function 构造函数创建新函数
      // 注意：这种方式无法访问闭包变量
      const newFunc = new Function('return ' + newFuncBody)()

      // 替换全局函数
      targetScope[originalFuncName] = function(...args) {
        // 这里可以添加前后置逻辑
        console.log(`[Mod PATCH] 调用覆盖函数: ${originalFuncName}`)

        // 调用新函数实现
        return newFunc.apply(this, args)
      }

      // 将原始函数保存在 _original_ 前缀的属性中
      targetScope['_original_' + originalFuncName] = originalFunc

      console.log(`[Mod] 成功 patch 函数: ${originalFuncName}`)
      return true
    } catch (err) {
      console.error(`[Mod] patch 函数失败: ${originalFuncName}`, err.message)
      return false
    }
  }
}

global.__MOD_PATCH_SIMULATOR__ = __modPatchSimulator

console.log('[iFlow Mod] patch 模拟器已就绪 (Phase 1 兼容方案)')
