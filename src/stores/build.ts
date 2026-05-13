import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { BuildResult, BuildProgress } from '@/types/build'

export const useBuildStore = defineStore('build', () => {
  const isBuilding = ref(false)
  const progress = ref(0)
  const currentFile = ref('')
  const logs = ref<string[]>([])
  const lastResult = ref<BuildResult | null>(null)
  const buildHistory = ref<BuildResult[]>([])

  function addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    logs.value.push(`[${timestamp}] ${message}`)
  }

  function clearLogs() {
    logs.value = []
    progress.value = 0
    currentFile.value = ''
  }

  function setProgress(p: BuildProgress) {
    progress.value = p.percent
    currentFile.value = p.file
  }

  function setLastResult(result: BuildResult) {
    lastResult.value = result
    if (result.success) {
      buildHistory.value.unshift(result)
      // Keep only last 20 entries
      if (buildHistory.value.length > 20) {
        buildHistory.value = buildHistory.value.slice(0, 20)
      }
    }
  }

  function resetBuild() {
    isBuilding.value = false
    progress.value = 0
    currentFile.value = ''
    lastResult.value = null
  }

  return {
    isBuilding,
    progress,
    currentFile,
    logs,
    lastResult,
    buildHistory,
    addLog,
    clearLogs,
    setProgress,
    setLastResult,
    resetBuild,
  }
})
