/**
 * iFlow Darcula 主题 Mod
 * ============================================================
 * 为 iFlow CLI 终端输出启用 Darcula (IntelliJ IDEA) 配色方案
 *
 * 模式：prepend（需要先于核心模块设置主题变量）
 *
 * 配色参考：IntelliJ IDEA Darcula 主题
 * https://www.jetbrains.com/help/pycharm/settings-editor.html
 */

'use strict'

// ============================================================
// Darcula 配色常量
// ============================================================
const THEME = {
  // ANSI 256 色板索引 (16 色基础 + 216 扩展色)
  name: 'Darcula',
  version: '1.0.0',

  // 基础颜色
  background:  '\x1b[48;5;30m',     // #2B2B2B
  backgroundAlt: '\x1b[48;5;235m',  // #1E1E1E
  foreground: '\x1b[38;5;223m',     // #F8F8F2
  foregroundDim: '\x1b[38;5;250m',  // #BCBCBC

  // 文本样式
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  inverse: '\x1b[7m',
  reset: '\x1b[0m',

  // 关键字和语法高亮 (Darcula 风格)
  keyword: '\x1b[38;5;199m',       // #CC7832 (橙色 - Java 关键字)
  string: '\x1b[38;5;114m',       // #6A8759 (绿色 - 字符串)
  number: '\x1b[38;5;170m',       // #6897BB (蓝色 - 数字)
  comment: '\x1b[38;5;246m',      // #808080 (灰色 - 注释)
  function: '\x1b[38;5;75m',       // #A9B7C6 (浅灰蓝 - 函数名)
  variable: '\x1b[38;5;209m',     // #FFC66D (金色 - 变量)
  type: '\x1b[38;5;75m',          // #A9B7C6 (浅灰蓝 - 类型)

  // 状态颜色
  success: '\x1b[38;5;114m',      // #6A8759 (绿色)
  warning: '\x1b[38;5;221m',      // #FFB964 (橙色)
  error: '\x1b[38;5;167m',       // #E53935 (红色)
  info: '\x1b[38;5;75m',          // #629755 (绿色)

  // 边框和分隔线
  border: '\x1b[38;5;238m',       // #4A4A4A
  separator: '\x1b[38;5;236m',    // #3C3F41
}

// ============================================================
// 主题应用函数
// ============================================================

/**
 * 为文本应用主题样式
 * @param {string} text - 要着色的文本
 * @param {string} color - 颜色代码
 * @returns {string} 带颜色标记的文本
 */
function stylize(text, color) {
  return `${color}${text}${THEME.reset}`
}

/**
 * 创建带样式的日志函数
 */
const createStyledLogger = (prefix, color) => (...args) => {
  const formatted = args.map(arg =>
    typeof arg === 'string' ? stylize(arg, THEME.foreground) : arg
  ).join(' ')
  console.log(`${color}${THEME.bold}${prefix}${THEME.reset} ${formatted}`)
}

// ============================================================
// 应用主题到全局对象
// ============================================================

// 注册到全局对象，供其他模块使用
global.__IFLOW_THEME__ = {
  name: THEME.name,
  version: THEME.version,
  colors: THEME,
  stylize,
  stylizeSuccess: (text) => stylize(text, THEME.success),
  stylizeWarning: (text) => stylize(text, THEME.warning),
  stylizeError: (text) => stylize(text, THEME.error),
  stylizeInfo: (text) => stylize(text, THEME.info),
}

// 设置环境变量（供外部脚本检测）
process.env.IFLOW_THEME = 'darcula'
process.env.IFLOW_THEME_DARK = '1'
process.env.FORCE_COLOR = '1'
process.env.CLICOLOR = '1'
process.env.CLICOLOR_FORCE = '1'

// ============================================================
// 增强 console 输出
// ============================================================

// 保存原始方法
const _origLog = console.log
const _origError = console.error
const _origWarn = console.warn
const _origInfo = console.info

// 替换 console 方法，应用 Darcula 配色
console.log = (...args) => {
  _origLog(stylize('[iFlow]', THEME.border), ...args.map(a =>
    typeof a === 'string' ? stylize(a, THEME.foreground) : a
  ))
}

console.error = (...args) => {
  _origError(stylize('[ERR]', THEME.error), ...args.map(a =>
    typeof a === 'string' ? stylize(a, THEME.error) : a
  ))
}

console.warn = (...args) => {
  _origWarn(stylize('[WARN]', THEME.warning), ...args.map(a =>
    typeof a === 'string' ? stylize(a, THEME.warning) : a
  ))
}

console.info = (...args) => {
  _origInfo(stylize('[INFO]', THEME.info), ...args.map(a =>
    typeof a === 'string' ? stylize(a, THEME.info) : a
  ))
}

// ============================================================
// 初始化完成
// ============================================================

console.log(stylize('[Darcula Theme]', THEME.keyword), THEME.foreground + '主题已应用' + THEME.reset)
console.log(stylize('  配色方案:', THEME.dim), THEME.name, THEME.version)
console.log(stylize('  模式:    ', THEME.dim), 'prepend (深色背景优化)')
