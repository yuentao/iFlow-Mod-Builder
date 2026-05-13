/**
 * Browser-based Mod builder
 * Generates .iflow-mod (zip) files in the browser using JSZip.
 * Used when running in web mode (without Tauri).
 */
import JSZip from 'jszip'
import type { ModConfig } from '@/types/mod'
import type { BuildConfig, BuildResult } from '@/types/build'

/**
 * Build a .iflow-mod file in the browser and trigger download.
 */
export async function buildModInBrowser(
  codeContent: string,
  modConfig: ModConfig,
  buildConfig: BuildConfig,
  onProgress: (percent: number, file: string) => void
): Promise<BuildResult> {
  try {
    // 1. Validate required fields
    const requiredFields = ['id', 'name', 'version', 'type'] as const
    for (const field of requiredFields) {
      if (!modConfig[field]) {
        return {
          success: false,
          outputPath: '',
          fileCount: 0,
          fileSize: 0,
          error: `mod.json 缺少必填字段: ${field}`,
        }
      }
    }

    onProgress(10, '验证配置...')

    // 2. Collect files to include in the zip
    const files: { name: string; content: string }[] = []

    // Add mod.json
    const modJsonStr = JSON.stringify(modConfig, null, 2)
    files.push({ name: 'mod.json', content: modJsonStr })

    onProgress(20, '收集文件...')

    // Add code.js (or custom entry)
    const entryFile = modConfig.entry || 'code.js'
    files.push({ name: entryFile, content: codeContent })

    onProgress(30, '创建压缩包...')

    // 3. Create zip
    const zip = new JSZip()
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      zip.file(file.name, file.content)

      const percent = 30 + Math.round(((i + 1) / files.length) * 50)
      onProgress(percent, `压缩: ${file.name}`)
    }

    onProgress(85, '生成文件...')

    // 4. Generate zip blob
    const compressionLevel = buildConfig.compressLevel === 'fast' ? 1
      : buildConfig.compressLevel === 'maximum' ? 9 : 6

    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: compressionLevel },
    }, (metadata) => {
      const percent = 85 + Math.round(metadata.percent * 0.1)
      onProgress(Math.min(percent, 95), '生成压缩包...')
    })

    onProgress(95, '验证包内容...')

    // 5. Validate (basic check: can we read it back?)
    if (!buildConfig.skipValidation) {
      try {
        const verifyZip = new JSZip()
        const verifyResult = await verifyZip.loadAsync(blob)
        const fileNames = Object.keys(verifyResult.files)
        if (!fileNames.includes('mod.json')) {
          return {
            success: false,
            outputPath: '',
            fileCount: 0,
            fileSize: 0,
            error: '包验证失败: 缺少 mod.json',
          }
        }
        const entry = modConfig.entry || 'code.js'
        if (!fileNames.includes(entry)) {
          return {
            success: false,
            outputPath: '',
            fileCount: 0,
            fileSize: 0,
            error: `包验证失败: 缺少 ${entry}`,
          }
        }
      } catch (e) {
        return {
          success: false,
          outputPath: '',
          fileCount: 0,
          fileSize: 0,
          error: '包验证失败: zip 文件损坏',
        }
      }
    }

    onProgress(100, '完成')

    // 6. Trigger download
    const outputFileName = buildConfig.fileName || `${modConfig.id}-v${modConfig.version}.iflow-mod`
    downloadBlob(blob, outputFileName)

    return {
      success: true,
      outputPath: outputFileName,
      fileCount: files.length,
      fileSize: blob.size,
    }
  } catch (error: any) {
    return {
      success: false,
      outputPath: '',
      fileCount: 0,
      fileSize: 0,
      error: String(error?.message || error),
    }
  }
}

/**
 * Trigger browser file download from a Blob.
 */
function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
