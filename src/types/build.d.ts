export type CompressLevel = 'fast' | 'standard' | 'maximum'

export interface BuildConfig {
  modPath: string
  outputPath: string
  fileName: string
  compressLevel: CompressLevel
  skipValidation: boolean
  validateAfterBuild: boolean
  openAfterBuild: boolean
}

export interface BuildProgress {
  percent: number
  file: string
  message: string
}

export interface BuildResult {
  success: boolean
  outputPath: string
  fileCount: number
  fileSize: number
  error?: string
}
