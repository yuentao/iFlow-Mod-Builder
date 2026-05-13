<template>
  <div class="home-view">
    <div class="welcome-section animate-fade-in-up">
      <h2 class="welcome-title">欢迎使用 iFlow Mod 打包工具</h2>
      <p class="welcome-desc">选择 Mod 项目目录或导入 code.js 文件，开始创建你的 Mod</p>
    </div>

    <!-- Drop zone -->
    <div
      class="drop-zone"
      :class="{ 'drop-zone--active': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="handleSelectDirectory"
    >
      <div class="drop-zone-content">
        <FolderOpen size="40" class="drop-zone-icon" />
        <div class="drop-zone-text">
          <p class="drop-zone-title">点击选择 Mod 项目目录</p>
          <p class="drop-zone-hint">或拖拽目录到这里，自动识别 mod.json 和 code.js</p>
        </div>
      </div>
    </div>

    <!-- Or separator -->
    <div class="separator">
      <span class="separator-text">或者</span>
    </div>

    <!-- Import single code.js -->
    <div class="import-actions animate-fade-in-up" style="animation-delay: 0.1s">
      <button class="btn btn-secondary" @click="handleSelectFile">
        <FileCode size="14" />
        选择 code.js 文件
      </button>
    </div>

    <!-- Current workspace info -->
    <div v-if="modStore.isCodeImported" class="workspace-info animate-fade-in-up" style="animation-delay: 0.15s">
      <div class="card">
        <div class="workspace-card-header">
          <Folder size="20" class="workspace-icon" />
          <span class="workspace-path">{{ modStore.workDir || modStore.codePath }}</span>
        </div>
        <div class="workspace-card-body">
          <div class="workspace-detail">
            <span class="workspace-label">code.js</span>
            <span class="workspace-value">{{ codeFileSize }}</span>
          </div>
          <div v-if="modStore.config.name" class="workspace-detail">
            <span class="workspace-label">Mod 名称</span>
            <span class="workspace-value">{{ modStore.config.name }}</span>
          </div>
        </div>
        <div class="workspace-card-actions">
          <button class="btn btn-primary" @click="goToEditor">
            配置 Mod
            <ArrowRight size="14" />
          </button>
          <button v-if="modStore.isConfigComplete" class="btn btn-secondary" @click="goToBuild">
            去打包
          </button>
          <button class="btn btn-icon" title="清除" @click="clearWorkspace">
            <Delete size="16" style="color: var(--danger)" />
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { FolderOpen, FileCode, Folder, ArrowRight, Delete } from '@icon-park/vue-next'
import { useModStore } from '@/stores/mod'
import { tauriInvoke, selectDirectory, selectFile, isTauri } from '@/utils/tauri'
import { formatFileSize } from '@/utils/format'

const router = useRouter()
const modStore = useModStore()
const isDragging = ref(false)

const codeFileSize = computed(() => {
  return formatFileSize(new TextEncoder().encode(modStore.codeContent).length)
})

async function handleSelectDirectory() {
  if (isTauri) {
    const dir = await selectDirectory()
    if (dir) await loadFromDirectory(dir)
  } else {
    const input = document.createElement('input')
    input.type = 'file'
    input.webkitdirectory = true
    input.onchange = async () => {
      const files = input.files
      if (files && files.length > 0) {
        let codeFile: File | null = null
        let modJsonFile: File | null = null
        for (const f of files) {
          if (f.name === 'code.js') codeFile = f
          if (f.name === 'mod.json') modJsonFile = f
        }
        if (codeFile) {
          const content = await codeFile.text()
          modStore.importCode(codeFile.webkitRelativePath, content)
          if (modJsonFile) {
            try { modStore.loadFromModJson(JSON.parse(await modJsonFile.text())) } catch { /* ignore */ }
          }
          router.push('/editor')
        }
      }
    }
    input.click()
  }
}

async function handleSelectFile() {
  if (isTauri) {
    const file = await selectFile([{ name: 'JavaScript', extensions: ['js'] }])
    if (file) {
      try {
        const content = await tauriInvoke<string>('read_file', { path: file })
        modStore.importCode(file, content)
        router.push('/editor')
      } catch (e) {
        console.error('读取文件失败:', e)
      }
    }
  } else {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.js'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (file) {
        const content = await file.text()
        modStore.importCode(file.name, content)
        router.push('/editor')
      }
    }
    input.click()
  }
}

async function handleDrop(e: DragEvent) {
  isDragging.value = false
  const items = e.dataTransfer?.items
  if (!items || items.length === 0) return

  // Try webkitGetAsEntry for directory support
  const firstItem = items[0]
  const entry = firstItem.webkitGetAsEntry?.()
  if (entry?.isDirectory) {
    // Directory drop - not fully supported in web, fall back to file check
    const file = firstItem.getAsFile()
    if (file) {
      const content = await file.text()
      modStore.importCode(file.name, content)
      router.push('/editor')
    }
    return
  }

  // File drop
  const file = firstItem.getAsFile()
  if (file) {
    if (file.name.endsWith('.js') || file.name === 'code.js') {
      const content = await file.text()
      modStore.importCode(file.name, content)
      router.push('/editor')
    }
  }
}

async function loadFromDirectory(dir: string) {
  try {
    const codePath = `${dir}/code.js`
    const content = await tauriInvoke<string>('read_file', { path: codePath })
    modStore.importCode(codePath, content)
    const modJsonPath = `${dir}/mod.json`
    const exists = await tauriInvoke<boolean>('file_exists', { path: modJsonPath })
    if (exists) {
      const modJsonStr = await tauriInvoke<string>('read_file', { path: modJsonPath })
      modStore.loadFromModJson(JSON.parse(modJsonStr))
    }
    router.push('/editor')
  } catch (e) {
    console.error('导入失败:', e)
  }
}

function goToEditor() { router.push('/editor') }
function goToBuild() { router.push('/build') }
function clearWorkspace() { modStore.clearWorkspace() }
</script>

<style lang="scss" scoped>
.home-view { max-width: 640px; margin: 0 auto; }
.welcome-section { margin-bottom: var(--space-2xl); }
.welcome-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
}
.welcome-desc {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
}

.drop-zone {
  border: 2px dashed var(--border-strong);
  border-radius: var(--radius-xl);
  padding: var(--space-4xl) var(--space-2xl);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-smooth);
  background: var(--bg-card);
  &:hover { border-color: var(--accent); background: var(--accent-lighter); }
  &--active { border-color: var(--accent); background: var(--accent-light); transform: scale(1.01); }
}
.drop-zone-content { display: flex; flex-direction: column; align-items: center; gap: var(--space-lg); }
.drop-zone-icon { color: var(--accent); }
.drop-zone-title { font-size: var(--font-size-lg); font-weight: var(--font-weight-medium); color: var(--text-primary); }
.drop-zone-hint { font-size: var(--font-size-sm); color: var(--text-tertiary); margin-top: var(--space-xs); }

.separator {
  display: flex; align-items: center; margin: var(--space-xl) 0; gap: var(--space-md);
  &::before, &::after { content: ''; flex: 1; height: 1px; background: var(--border); }
}
.separator-text { font-size: var(--font-size-sm); color: var(--text-tertiary); }

.import-actions { text-align: center; }

.workspace-info { margin-top: var(--space-2xl); }
.workspace-card-header {
  display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-md);
}
.workspace-icon { color: var(--accent); }
.workspace-path { font-family: var(--font-mono); font-size: var(--font-size-sm); color: var(--text-secondary); word-break: break-all; }
.workspace-card-body { display: flex; flex-direction: column; gap: var(--space-xs); margin-bottom: var(--space-lg); }
.workspace-detail { display: flex; justify-content: space-between; align-items: center; }
.workspace-label { font-size: var(--font-size-sm); color: var(--text-secondary); }
.workspace-value { font-size: var(--font-size-sm); color: var(--text-primary); font-weight: var(--font-weight-medium); }
.workspace-card-actions { display: flex; gap: var(--space-sm); align-items: center; }

.recent-section { margin-top: var(--space-2xl); }
.section-title {
  font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold);
  color: var(--text-primary); margin-bottom: var(--space-md);
}
.recent-list { display: flex; flex-direction: column; gap: var(--space-xs); }
.recent-item {
  display: flex; align-items: center; gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md); border-radius: var(--radius);
  background: var(--bg-card); border: 1px solid var(--border-light);
  font-size: var(--font-size-sm); color: var(--text-secondary);
  transition: background var(--transition);
  &:hover { background: var(--bg-card-hover); }
}
.recent-path { flex: 1; font-family: var(--font-mono); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.recent-size { color: var(--text-tertiary); flex-shrink: 0; }
</style>
