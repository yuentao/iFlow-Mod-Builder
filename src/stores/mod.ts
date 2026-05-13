import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ModConfig } from '@/types/mod'
import { isConfigValid } from '@/utils/validation'
import { DEFAULT_IFLOW_VERSION } from '@/utils/constants'

export const useModStore = defineStore('mod', () => {
  // State
  const codeContent = ref('')
  const codePath = ref('')
  const workDir = ref('')
  const config = ref<Partial<ModConfig>>({})
  const unsavedChanges = ref(false)

  // Getters
  const isCodeImported = computed(() => !!codePath.value)
  const isConfigComplete = computed(() => isConfigValid(config.value))

  // Actions
  function importCode(filePath: string, content: string) {
    codePath.value = filePath
    codeContent.value = content
    // Derive workDir from the parent directory of the file
    const pathParts = filePath.replace(/\\/g, '/').split('/')
    pathParts.pop() // remove filename
    workDir.value = pathParts.join('/')
    resetConfig()
    unsavedChanges.value = false
  }

  function resetConfig() {
    config.value = {
      id: '',
      name: '',
      version: '1.0.0',
      type: 'append',
      description: '',
      author: '',
      category: 'tool',
      iflowVersion: DEFAULT_IFLOW_VERSION,
      iflowVersionConstraint: '^0.5.19',
      icon: '',
      tags: [],
      homepage: '',
      repository: '',
      license: 'MIT',
      entry: 'code.js',
    }
  }

  function updateConfig(field: keyof ModConfig, value: unknown) {
    config.value[field] = value as never
    unsavedChanges.value = true
  }

  function generateModJson(): ModConfig {
    return {
      id: config.value.id || '',
      name: config.value.name || '',
      version: config.value.version || '1.0.0',
      type: config.value.type || 'append',
      description: config.value.description,
      author: config.value.author,
      category: config.value.category,
      iflowVersion: config.value.iflowVersion,
      iflowVersionConstraint: config.value.iflowVersionConstraint,
      icon: config.value.icon,
      tags: config.value.tags,
      homepage: config.value.homepage,
      repository: config.value.repository,
      license: config.value.license,
      entry: config.value.entry || 'code.js',
    }
  }

  function loadFromModJson(data: ModConfig) {
    config.value = { ...data }
    unsavedChanges.value = false
  }

  function clearWorkspace() {
    codeContent.value = ''
    codePath.value = ''
    workDir.value = ''
    config.value = {}
    unsavedChanges.value = false
  }

  return {
    codeContent,
    codePath,
    workDir,
    config,
    unsavedChanges,
    isCodeImported,
    isConfigComplete,
    importCode,
    resetConfig,
    updateConfig,
    generateModJson,
    loadFromModJson,
    clearWorkspace,
  }
})