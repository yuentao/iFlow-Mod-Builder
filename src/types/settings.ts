export type CompressLevel = 'fast' | 'standard' | 'maximum'

export interface Settings {
  defaultOutputPath: string
  defaultCompressLevel: CompressLevel
  openOutputAfterBuild: boolean
  validateAfterBuild: boolean
  theme: 'light' | 'dark' | 'system'
}

export const DEFAULT_SETTINGS: Settings = {
  defaultOutputPath: '~/dist',
  defaultCompressLevel: 'standard',
  openOutputAfterBuild: true,
  validateAfterBuild: true,
  theme: 'system',
}