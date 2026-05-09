/**
 * ============================================================
 * iFlow Mod 示例：prepend 模式
 * ============================================================
 * 适用场景：在 iflow.js 加载前执行初始化代码，设置全局钩子或修改配置。
 * 工作原理：将此代码插入到 iflow.js 开头，在原始代码之前执行。
 *
 * 安装后：在 ~/.iflow/mods/iflow/{mod-id}/ 目录下，
 * 启用时此文件内容会被插入到 iflow.js 开头。
 */

// ============================================================
// 示例 1：全局配置修改
// ============================================================
console.log('[iFlow Mod] prepend 模式初始化中...')

// 设置环境变量（必须在主模块加载前生效）
process.env.IFLOW_MOD_PREPEND_ACTIVE = 'true'

// 示例：设置自定义代理
// process.env.HTTPS_PROXY = 'http://127.0.0.1:7890'
// process.env.HTTP_PROXY = 'http://127.0.0.1:7890'

// ============================================================
// 示例 2：注册全局 hooks
// ============================================================
const MOD_HOOKS = {
  onCliStart: () => {
    console.log('[Mod Hook] CLI 启动')
  },
  onCliExit: (code) => {
    console.log(`[Mod Hook] CLI 退出，退出码: ${code}`)
  },
  onBeforeCommand: (cmd) => {
    // 在执行命令前调用
    console.log(`[Mod Hook] 即将执行命令: ${cmd}`)
  },
  onAfterCommand: (cmd, result) => {
    // 在执行命令后调用
    console.log(`[Mod Hook] 命令执行完成: ${cmd}`)
  }
}

// 将 hooks 注册到全局对象
global.__IFLOW_MOD_HOOKS__ = MOD_HOOKS

// ============================================================
// 示例 3：全局错误处理
// ============================================================
process.on('uncaughtException', (err) => {
  console.error('[Mod Error] 未捕获的异常:', err.message)
  // 可选：将错误信息发送到远程日志服务
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Mod Error] 未处理的 Promise 拒绝:', reason)
})

// ============================================================
// 示例 4：自定义命令别名
// ============================================================
const COMMAND_ALIASES = {
  'll': 'ls -la',
  'gs': 'git status',
  'gp': 'git pull'
}

global.__IFLOW_COMMAND_ALIASES__ = COMMAND_ALIASES

// ============================================================
// 示例 5：修改 PATH
// ============================================================
const EXTRA_PATHS = [
  path.join(process.env.HOME || process.env.USERPROFILE, '.local', 'bin'),
  path.join(process.env.HOME || process.env.USERPROFILE, '.iflow', 'bin')
]

const currentPath = process.env.PATH || ''
EXTRA_PATHS.forEach(p => {
  if (!currentPath.split(path.delimiter).includes(p)) {
    process.env.PATH = p + path.delimiter + currentPath
  }
})

console.log('[iFlow Mod] prepend 模式初始化完成')
