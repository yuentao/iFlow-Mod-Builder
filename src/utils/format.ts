import type { ModConfig } from '@/types/mod'

// Generate output filename from mod config
export function generateOutputFilename(config: ModConfig): string {
  const id = config.id.replace(/\./g, '-').replace(/^-/, '')
  return `${id}-v${config.version}.iflow-mod`
}

// Format file size to human-readable string
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)
  return `${size} ${units[i]}`
}

// Format timestamp to locale string
export function formatTimestamp(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// Generate a default mod ID from a name
export function generateModId(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '')
  return `com.example.${slug}`
}
