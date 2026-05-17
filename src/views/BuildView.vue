<template>
  <div class="build-view">
    <!-- No config warning -->
    <div v-if="!modStore.isCodeImported" class="empty-state animate-fade-in">
      <Caution size="48" style="color: var(--warning)" />
      <p class="empty-text">请先在首页导入 code.js 文件</p>
      <button class="btn btn-primary" @click="$router.push('/')">前往首页</button>
    </div>

    <div v-else class="build-content">
      <!-- Mod Info Card -->
      <div class="card animate-fade-in-up">
        <div class="card-title"><Tag size="16" /> Mod 信息</div>
        <div class="info-grid">
          <div class="info-item"><span class="info-label">名称</span><span class="info-value">{{ modConfig.name }}</span></div>
          <div class="info-item"><span class="info-label">版本</span><span class="info-value">{{ modConfig.version }}</span></div>
          <div class="info-item"><span class="info-label">ID</span><span class="info-value mono">{{ modConfig.id }}</span></div>
          <div class="info-item"><span class="info-label">类型</span><span class="info-value">{{ getTypeLabel(modConfig.type) }}</span></div>
        </div>
      </div>

      <!-- Output Settings Card -->
      <div class="card animate-fade-in-up" style="animation-delay: 0.05s">
        <div class="card-title"><FolderOpen size="16" /> 输出设置</div>
        <div class="form-group">
          <label class="form-label">输出目录</label>
          <div class="input-with-btn">
            <input v-model="buildConfig.outputPath" class="form-input mono" placeholder="~/dist" />
            <button class="btn btn-secondary btn-sm" @click="selectOutputDir">浏览</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">文件名</label>
          <input v-model="buildConfig.fileName" class="form-input mono" placeholder="my-mod-v1.0.0.iflow-mod" />
        </div>
        <div class="form-group">
          <label class="form-label">压缩级别</label>
          <div class="radio-group">
            <label v-for="c in COMPRESS_LEVELS" :key="c.value" class="radio-item" :class="{ active: buildConfig.compressLevel === c.value }">
              <input type="radio" :value="c.value" v-model="buildConfig.compressLevel" />
              <div><span class="radio-label">{{ c.label }}</span><span class="radio-desc">{{ c.description }}</span></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Options Card -->
      <div class="card animate-fade-in-up" style="animation-delay: 0.1s">
        <div class="card-title"><Setting size="16" /> 选项</div>
        <div class="option-row">
          <span class="option-label">打包后验证包内容</span>
          <label class="toggle-switch"><input type="checkbox" v-model="buildConfig.validateAfterBuild" /><span class="toggle-slider"></span></label>
        </div>
        <div class="option-row">
          <span class="option-label">完成后打开文件夹</span>
          <label class="toggle-switch"><input type="checkbox" v-model="buildConfig.openAfterBuild" /><span class="toggle-slider"></span></label>
        </div>
      </div>

      <!-- Build Progress Card -->
      <div v-if="isBuilding || buildResult" class="card animate-fade-in-up">
        <div class="card-title"><Puzzle size="16" /> 打包进度</div>
        <template v-if="isBuilding">
          <div class="progress-info">
            <span>{{ currentFile }}</span>
            <span>{{ progress }}%</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" :style="{ width: progress + '%' }"></div></div>
        </template>
        <template v-if="buildResult">
          <div class="result-grid">
            <div class="info-item"><span class="info-label">状态</span><span class="info-value" :class="buildResult.success ? 'text-success' : 'text-danger'">{{ buildResult.success ? '成功' : '失败' }}</span></div>
            <div class="info-item"><span class="info-label">输出路径</span><span class="info-value mono">{{ buildResult.outputPath }}</span></div>
            <div class="info-item"><span class="info-label">文件数量</span><span class="info-value">{{ buildResult.fileCount }}</span></div>
            <div class="info-item"><span class="info-label">文件大小</span><span class="info-value">{{ formatFileSize(buildResult.fileSize) }}</span></div>
          </div>
          <div v-if="buildResult.error" class="form-error" style="margin-top: var(--space-sm)">{{ buildResult.error }}</div>
        </template>
      </div>

      <!-- Actions -->
      <div class="build-actions">
        <button class="btn btn-secondary" @click="$router.push('/editor')">返回编辑</button>
        <button class="btn btn-primary" @click="confirmBuild" :disabled="isBuilding || !modStore.isConfigComplete">
          <Puzzle size="14" />
          {{ isBuilding ? '打包中...' : '开始打包' }}
        </button>
      </div>
    </div>

    <!-- Confirm Dialog -->
    <div v-if="showConfirm" class="modal-overlay" @click.self="showConfirm = false">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">确认打包</span>
          <button class="btn-icon" @click="showConfirm = false"><CloseSmall size="16" /></button>
        </div>
        <div class="modal-body">即将打包: {{ modConfig.name }} v{{ modConfig.version }}</div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showConfirm = false">取消</button>
          <button class="btn btn-primary" @click="startBuild">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Caution, Tag, FolderOpen, Setting, Puzzle, CloseSmall } from '@icon-park/vue-next'
import { useModStore } from '@/stores/mod'
import { useBuildStore } from '@/stores/build'
import { buildModInBrowser } from '@/utils/builder'
import { selectDirectory, isTauri, tauriInvoke } from '@/utils/tauri'
import { formatFileSize } from '@/utils/format'
import { COMPRESS_LEVELS } from '@/utils/constants'
import type { BuildConfig, BuildResult } from '@/types/build'

const modStore = useModStore()
const buildStore = useBuildStore()

const modConfig = computed(() => modStore.generateModJson())
const isBuilding = ref(false)
const progress = ref(0)
const currentFile = ref('')
const showConfirm = ref(false)
const buildResult = ref<BuildResult | null>(null)

const buildConfig = reactive<BuildConfig>({
  modPath: '',
  outputPath: '',
  fileName: '',
  compressLevel: 'standard',
  validateAfterBuild: true,
  openAfterBuild: true,
})

// Keep modPath in sync with store, set default output path
watch(() => modStore.workDir, (dir) => {
  buildConfig.modPath = dir
  if (!buildConfig.outputPath) {
    buildConfig.outputPath = dir ? dir + '/dist' : ''
  }
}, { immediate: true })

function getTypeLabel(type: string) {
  const labels: Record<string, string> = { append: '追加代码', prepend: '前置代码', replace: '完全替换', patch: '补丁模式' }
  return labels[type] || type
}

async function selectOutputDir() {
  if (isTauri) {
    const dir = await selectDirectory()
    if (dir) buildConfig.outputPath = dir
  }
}

function confirmBuild() {
  if (!modStore.isConfigComplete) return
  buildConfig.fileName = `${modConfig.value.id}-v${modConfig.value.version}.iflow-mod`
  showConfirm.value = true
}

async function startBuild() {
  showConfirm.value = false
  isBuilding.value = true
  progress.value = 0
  currentFile.value = '准备中...'
  buildResult.value = null
  buildStore.clearLogs()

  try {
    if (isTauri) {
      // Write mod.json to disk before building (Rust backend reads it from disk)
      currentFile.value = '写入 mod.json...'
      progress.value = 5
      const modJsonPath = buildConfig.modPath + '/mod.json'
      const modJsonContent = JSON.stringify(modConfig.value, null, 2)
      await tauriInvoke('write_file', { path: modJsonPath, content: modJsonContent })

      // Tauri build is synchronous (no progress events), simulate progress
      currentFile.value = '打包中...'
      progress.value = 10
      const progressTimer = setInterval(() => {
        if (progress.value < 90) progress.value += Math.random() * 15
      }, 300)

      const result = await tauriInvoke<BuildResult>('start_build', { config: buildConfig })
      clearInterval(progressTimer)
      progress.value = 100
      currentFile.value = '完成'
      buildResult.value = result
      buildStore.setLastResult(result)
    } else {
      // Web mode: build in browser
      const result = await buildModInBrowser(
        modStore.codeContent,
        modConfig.value,
        buildConfig,
        (p: number, f: string) => { progress.value = p; currentFile.value = f; }
      )
      buildResult.value = result
      buildStore.setLastResult(result)
    }
  } catch (error: any) {
    buildResult.value = { success: false, outputPath: '', fileCount: 0, fileSize: 0, error: String(error) }
  } finally {
    isBuilding.value = false
    progress.value = 100
  }
}
</script>

<style lang="scss" scoped>
.build-view {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

// ── Empty State ──
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-4xl);
  text-align: center;
}

.empty-text {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
}

// ── Info Grid ──
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xs) var(--space-xl);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--border-light);

  &:last-child, &:nth-last-child(2) {
    border-bottom: none;
  }
}

.info-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  flex-shrink: 0;
}

.info-value {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
  text-align: right;
  margin-left: var(--space-md);
  overflow: hidden;
  text-overflow: ellipsis;
}

// ── Input with Button ──
.input-with-btn {
  display: flex;
  gap: var(--space-sm);

  .form-input {
    flex: 1;
  }
}

// ── Option Row ──
.option-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) 0;

  & + & {
    border-top: 1px solid var(--border-light);
  }
}

.option-label {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

// ── Progress ──
.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

// ── Result Grid ──
.result-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xs) var(--space-xl);
}

// ── Build Actions ──
.build-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--border-light);
}
</style>
