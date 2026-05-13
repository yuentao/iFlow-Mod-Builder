import type { ModConfig } from '@/types/mod'

interface ValidationRule {
  required?: boolean
  pattern?: RegExp
  minLength?: number
  maxLength?: number
  enum?: string[]
  message: string
}

export const modConfigRules: Record<string, ValidationRule> = {
  id: {
    required: true,
    pattern: /^[a-z][a-z0-9-]*(\.[a-z0-9-]+)+$/,
    message: 'ID 必须是小写字母、数字、连字符和点，格式如 com.example.my-mod',
  },
  name: {
    required: true,
    minLength: 1,
    maxLength: 100,
    message: '名称不能为空',
  },
  version: {
    required: true,
    pattern: /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/,
    message: '版本号必须符合 semver 格式（如 1.0.0）',
  },
  type: {
    required: true,
    enum: ['append', 'prepend', 'replace', 'patch'],
    message: '请选择 Mod 类型',
  },
  iflowVersion: {
    pattern: /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/,
    message: 'iFlow 版本号必须符合 semver 格式',
  },
  homepage: {
    pattern: /^https?:\/\/.+/,
    message: '请输入有效的 URL',
  },
  repository: {
    pattern: /^https?:\/\/.+/,
    message: '请输入有效的 URL',
  },
}

export function validateField(field: keyof ModConfig, value: unknown): string | null {
  const rule = modConfigRules[field]
  if (!rule) return null

  const strValue = value == null ? '' : String(value)

  if (rule.required && !strValue) {
    return rule.message
  }

  if (strValue && rule.pattern && !rule.pattern.test(strValue)) {
    return rule.message
  }

  if (strValue && rule.minLength && strValue.length < rule.minLength) {
    return `至少 ${rule.minLength} 个字符`
  }

  if (strValue && rule.maxLength && strValue.length > rule.maxLength) {
    return `最多 ${rule.maxLength} 个字符`
  }

  if (rule.enum && strValue && !rule.enum.includes(strValue)) {
    return rule.message
  }

  return null
}

export function validateModConfig(config: Partial<ModConfig>): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const field of Object.keys(modConfigRules) as (keyof ModConfig)[]) {
    const error = validateField(field, config[field])
    if (error) {
      errors[field] = error
    }
  }

  return errors
}

export function isConfigValid(config: Partial<ModConfig>): boolean {
  const requiredFields: (keyof ModConfig)[] = ['id', 'name', 'version', 'type']
  return requiredFields.every(field => {
    const value = config[field]
    if (!value) return false
    const error = validateField(field, value)
    return !error
  })
}
