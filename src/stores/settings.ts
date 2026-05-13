import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Settings } from '@/types/settings'
import { DEFAULT_SETTINGS } from '@/types/settings'

const STORAGE_KEY = 'iflow-mod-settings'

function loadFromLocalStorage(): Settings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_SETTINGS }
}

function saveToLocalStorage(settings: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // ignore
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>(loadFromLocalStorage())

  async function init() {
    // Try Tauri store first, fallback to localStorage
    settings.value = loadFromLocalStorage()
  }

  function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    settings.value[key] = value
    saveToLocalStorage(settings.value)
  }

  function resetToDefaults() {
    settings.value = { ...DEFAULT_SETTINGS }
    saveToLocalStorage(settings.value)
  }

  return {
    settings,
    init,
    updateSetting,
    resetToDefaults,
  }
})