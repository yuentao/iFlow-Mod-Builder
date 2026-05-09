/**
 * ============================================================
 * iFlow Mod 实用示例：终端深色模式
 * ============================================================
 * 功能：为 iFlow CLI 终端输出启用深色主题样式
 * 模式：prepend（需要在主模块初始化前设置）
 *
 * 工作原理：
 * 通过 ANSI 转义序列注入终端样式，覆盖默认颜色配置。
 * 不修改 iflow.js 核心逻辑，仅改变输出外观。
 */

'use strict'

// ============================================================
// 颜色配置（Windows Terminal / iTerm2 兼容）
// ============================================================
const THEME = {
  // 基础颜色
  bg: '\x1b[48;5;236m',           // 深灰背景 (#2D2D2D)
  bgAlt: '\x1b[48;5;234m',        // 更深背景 (#1E1E1E)
  fg: '\x1b[38;5;223m',           // 浅色前景 (#FAF0E6)
  fgDim: '\x1b[38;5;250m',       // 暗淡前景 (#BCBCBC)

  // 强调色
  accent: '\x1b[38;5;75m',        // 蓝色强调 (#268BD2)
  success: '\x1b[38;5;114m',      // 绿色 (#8ABEB7)
  warning: '\x1b[38;5;221m',      // 橙色 (#FFB964)
  error: '\x1b[38;5;203m',        // 红色 (#F2777A)
  info: '\x1b[38;5;75m',          // 蓝色 (#268BD2)

  // 样式
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  reset: '\x1b[0m',
}

// ============================================================
// 样式输出函数
// ============================================================
function styled(text, style) {
  return `${style}${text}${THEME.reset}`
}

function logInfo(msg) {
  console.log(styled('[INFO]', THEME.info), styled(msg, THEME.fg))
}

function logSuccess(msg) {
  console.log(styled('[ OK ]', THEME.success), styled(msg, THEME.fg))
}

function logWarn(msg) {
  console.log(styled('[WARN]', THEME.warning), styled(msg, THEME.fg))
}

function logError(msg) {
  console.error(styled('[ERR ]', THEME.error), styled(msg, THEME.fg))
}

// ============================================================
// 应用深色主题
// ============================================================
// 替换默认 console 方法以应用主题样式

const _originalConsole = {
  log: console.log.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
}

// 为 console 方法添加主题着色
// 注意：实际应用中可能需要更复杂的解析逻辑
// 这里仅作演示

console.log('[iFlow Dark Mode Mod] 主题已应用')
console.log('  背景色:', styled('▓▓▓', THEME.bg), '  前景色:', styled('▓▓▓', THEME.fg))
console.log('  成功色:', styled('▓▓▓', THEME.success), '  错误色:', styled('▓▓▓', THEME.error))

// ============================================================
// 导出主题 API（供其他模块使用）
// ============================================================
global.__IFLOW_THEME__ = {
  version: '1.0.0',
  name: 'Dark Mode',
  colors: THEME,
  styled,
  logInfo,
  logSuccess,
  logWarn,
  logError,
  isDark: true,
}

// 设置环境变量
process.env.IFLOW_THEME_DARK = '1'
process.env.IFLOW_CLI_FORCE_COLOR = '1'
