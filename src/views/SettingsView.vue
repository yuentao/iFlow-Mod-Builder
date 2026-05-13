<template>
  <div class="settings-view">
    <!-- Build Settings Card -->
    <div class="card animate-fade-in-up">
      <div class="card-title"><Setting size="16" /> 打包设置</div>

      <div class="form-group">
        <label class="form-label">默认输出目录</label>
        <input v-model="settings.defaultOutputPath" class="form-input mono" placeholder="~/dist" />
      </div>

      <div class="form-group">
        <label class="form-label">默认压缩级别</label>
        <select v-model="settings.defaultCompressLevel" class="form-select">
          <option value="fast">快速</option>
          <option value="standard">标准</option>
          <option value="maximum">最大</option>
        </select>
      </div>

      <div class="option-row">
        <span class="option-label">完成后打开文件夹</span>
        <label class="toggle-switch"><input type="checkbox" v-model="settings.openOutputAfterBuild" /><span class="toggle-slider"></span></label>
      </div>

      <div class="option-row">
        <span class="option-label">打包后验证</span>
        <label class="toggle-switch"><input type="checkbox" v-model="settings.validateAfterBuild" /><span class="toggle-slider"></span></label>
      </div>
    </div>

    <!-- UI Settings Card -->
    <div class="card animate-fade-in-up" style="animation-delay: 0.05s">
      <div class="card-title"><Theme size="16" /> 界面设置</div>

      <div class="form-group">
        <label class="form-label">主题</label>
        <div class="radio-group">
          <label class="radio-item" :class="{ active: settings.theme === 'system' }">
            <input type="radio" value="system" v-model="settings.theme" />
            <span class="radio-label">跟随系统</span>
          </label>
          <label class="radio-item" :class="{ active: settings.theme === 'light' }">
            <input type="radio" value="light" v-model="settings.theme" />
            <span class="radio-label">浅色</span>
          </label>
          <label class="radio-item" :class="{ active: settings.theme === 'dark' }">
            <input type="radio" value="dark" v-model="settings.theme" />
            <span class="radio-label">深色</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="settings-actions animate-fade-in-up" style="animation-delay: 0.1s">
      <button class="btn btn-secondary" @click="resetSettings">恢复默认</button>
      <button class="btn btn-primary" @click="saveSettings">保存设置</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { Setting, Theme } from '@icon-park/vue-next'
import { useSettingsStore } from '@/stores/settings'
import type { Settings } from '@/types/settings'

const settingsStore = useSettingsStore()

const settings = reactive<Settings>({ ...settingsStore.settings })

// Theme changes should apply immediately
watch(() => settings.theme, (val) => settingsStore.updateSetting('theme', val))

function saveSettings() {
  for (const key of Object.keys(settings) as (keyof Settings)[]) {
    settingsStore.updateSetting(key, settings[key])
  }
}

function resetSettings() {
  settingsStore.resetToDefaults()
  Object.assign(settings, { ...settingsStore.settings })
}
</script>

<style lang="scss" scoped>
.settings-view { max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-lg); }

.option-row { display: flex; justify-content: space-between; align-items: center; padding: var(--space-sm) 0; }
.option-label { font-size: var(--font-size-sm); color: var(--text-primary); }

.settings-actions {
  display: flex; justify-content: flex-end; gap: var(--space-sm);
  padding-top: var(--space-lg); border-top: 1px solid var(--border-light);
}
</style>
