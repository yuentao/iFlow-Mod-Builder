// Mod type definitions
export const MOD_TYPES = [
  { value: 'append', label: '追加代码', description: '在 iflow.js 末尾追加代码' },
  { value: 'prepend', label: '前置代码', description: '在 iflow.js 开头插入代码' },
  { value: 'replace', label: '完全替换', description: '完全替换 iflow.js（高风险）' },
  { value: 'patch', label: '补丁模式', description: '精确修补（未实现）' },
] as const

// Category options
export const CATEGORIES = [
  { value: 'tool', label: '工具类' },
  { value: 'theme', label: '主题类' },
  { value: 'feature', label: '功能增强' },
  { value: 'integration', label: '集成类' },
  { value: 'other', label: '其他' },
] as const

// License options
export const LICENSES = [
  { value: 'MIT', label: 'MIT' },
  { value: 'Apache-2.0', label: 'Apache-2.0' },
  { value: 'GPL-3.0', label: 'GPL-3.0' },
  { value: 'BSD-3-Clause', label: 'BSD-3-Clause' },
  { value: 'ISC', label: 'ISC' },
  { value: 'Unlicense', label: 'Unlicense' },
] as const

// Compress level options
export const COMPRESS_LEVELS = [
  { value: 'fast', label: '最快速度', description: '压缩速度最快，文件较大' },
  { value: 'standard', label: '标准', description: '平衡速度和大小' },
  { value: 'maximum', label: '最大压缩', description: '文件最小，压缩较慢' },
] as const

// Version constraint options
export const VERSION_CONSTRAINTS = [
  { value: '', label: '无约束' },
  { value: '^0.5.19', label: '兼容 0.5.x (推荐)' },
  { value: '>=0.5.19', label: '0.5.19 及以上' },
  { value: '0.5.19', label: '精确版本' },
] as const

// Default iFlow version
export const DEFAULT_IFLOW_VERSION = '0.5.19'

// File filter for code.js selection
export const JS_FILE_FILTER = {
  name: 'JavaScript',
  extensions: ['js'],
}
