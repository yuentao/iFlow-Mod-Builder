<template>
  <div class="editor-view">
    <!-- No code imported warning -->
    <div v-if="!modStore.isCodeImported" class="empty-state animate-fade-in">
      <Caution size="48" style="color: var(--warning)" />
      <p class="empty-text">请先在首页导入 code.js 文件</p>
      <button class="btn btn-primary" @click="$router.push('/')">前往首页</button>
    </div>

    <!-- Editor form -->
    <div v-else class="editor-content">
      <!-- Basic Info Section -->
      <div class="form-section animate-fade-in-up">
        <div class="card">
          <div class="card-title"><Edit size="16" /> 基本信息</div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">ID <span class="form-required">*</span></label>
              <input v-model="formData.id" class="form-input mono" placeholder="com.example.my-mod" @blur="validateField('id')" />
              <div v-if="errors.id" class="form-error">{{ errors.id }}</div>
            </div>
            <div class="form-group">
              <label class="form-label">名称 <span class="form-required">*</span></label>
              <input v-model="formData.name" class="form-input" placeholder="我的 Mod 名称" @blur="validateField('name')" />
              <div v-if="errors.name" class="form-error">{{ errors.name }}</div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group" style="max-width: 180px">
              <label class="form-label">版本 <span class="form-required">*</span></label>
              <input v-model="formData.version" class="form-input mono" placeholder="1.0.0" @blur="validateField('version')" />
              <div v-if="errors.version" class="form-error">{{ errors.version }}</div>
            </div>
            <div class="form-group">
              <label class="form-label">类型 <span class="form-required">*</span></label>
              <div class="radio-group">
                <label
                  v-for="t in MOD_TYPES"
                  :key="t.value"
                  class="radio-item"
                  :class="{ active: formData.type === t.value }"
                >
                  <input type="radio" :value="t.value" v-model="formData.type" :disabled="t.value === 'patch'" />
                  <div>
                    <span class="radio-label">{{ t.label }}</span>
                    <span class="radio-desc">{{ t.description }}</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">描述</label>
            <textarea v-model="formData.description" class="form-textarea" rows="3" placeholder="描述这个 Mod 的功能..."></textarea>
          </div>
        </div>
      </div>

      <!-- Advanced Settings Section -->
      <div class="form-section animate-fade-in-up" style="animation-delay: 0.1s">
        <div class="card">
          <div class="card-title"><Setting size="16" /> 高级配置</div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">作者</label>
              <input v-model="formData.author" class="form-input" placeholder="作者名" />
            </div>
            <div class="form-group">
              <label class="form-label">分类</label>
              <select v-model="formData.category" class="form-select">
                <option v-for="c in CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">iFlow 版本</label>
              <input v-model="formData.iflowVersion" class="form-input mono" />
            </div>
            <div class="form-group">
              <label class="form-label">版本约束</label>
              <select v-model="formData.iflowVersionConstraint" class="form-select">
                <option v-for="v in VERSION_CONSTRAINTS" :key="v.value" :value="v.value">{{ v.label }}</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">许可证</label>
              <select v-model="formData.license" class="form-select">
                <option v-for="l in LICENSES" :key="l.value" :value="l.value">{{ l.label }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">图标</label>
              <input v-model="formData.icon" class="form-input" placeholder="🚀 或 URL" style="max-width: 160px" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">入口文件</label>
            <input v-model="formData.entry" class="form-input mono" style="max-width: 220px" />
          </div>

          <div class="form-group">
            <label class="form-label">标签</label>
            <div class="tags-input">
              <span v-for="tag in formData.tags" :key="tag" class="tag">
                {{ tag }}
                <span class="tag-close" @click="removeTag(tag)">&times;</span>
              </span>
              <input
                v-if="tagInputVisible"
                ref="tagInputRef"
                v-model="tagInputValue"
                class="tag-inline-input"
                @keyup.enter="addTag"
                @blur="addTag"
              />
              <button v-else class="btn btn-sm btn-secondary" @click="showTagInput">+ 添加</button>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">主页</label>
              <input v-model="formData.homepage" class="form-input" placeholder="https://..." />
            </div>
            <div class="form-group">
              <label class="form-label">仓库</label>
              <input v-model="formData.repository" class="form-input" placeholder="https://..." />
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="form-actions animate-fade-in-up" style="animation-delay: 0.15s">
        <button class="btn btn-secondary" @click="resetForm">重置</button>
        <button class="btn btn-primary" @click="saveConfig" :disabled="!modStore.isCodeImported">
          保存并前往打包
          <ArrowRight size="14" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Caution, Edit, Setting, ArrowRight } from '@icon-park/vue-next'
import { useModStore } from '@/stores/mod'
import { MOD_TYPES, CATEGORIES, LICENSES, VERSION_CONSTRAINTS } from '@/utils/constants'
import { validateField as validateFieldUtil } from '@/utils/validation'
import type { ModConfig } from '@/types/mod'

const router = useRouter()
const modStore = useModStore()

const tagInputVisible = ref(false)
const tagInputValue = ref('')
const tagInputRef = ref<HTMLInputElement>()

const errors = ref<Record<string, string>>({})

const formData = reactive<Partial<ModConfig>>({
  id: '', name: '', version: '1.0.0', type: 'append', description: '',
  author: '', category: 'tool', iflowVersion: '0.5.19', iflowVersionConstraint: '^0.5.19',
  icon: '', tags: [], homepage: '', repository: '', license: 'MIT', entry: 'code.js',
})

function validateField(field: keyof ModConfig) {
  const err = validateFieldUtil(field, formData[field])
  if (err) errors.value[field] = err
  else delete errors.value[field]
}

onMounted(() => {
  if (modStore.config && Object.keys(modStore.config).length > 0) {
    Object.assign(formData, { ...modStore.config })
  }
})

watch(formData, (val) => {
  modStore.config = { ...val }
  modStore.unsavedChanges = true
}, { deep: true })

function showTagInput() {
  tagInputVisible.value = true
  nextTick(() => tagInputRef.value?.focus())
}

function addTag() {
  const tag = tagInputValue.value.trim()
  if (tag && !formData.tags?.includes(tag)) {
    formData.tags = [...(formData.tags || []), tag]
  }
  tagInputVisible.value = false
  tagInputValue.value = ''
}

function removeTag(tag: string) {
  formData.tags = formData.tags?.filter(t => t !== tag)
}

function resetForm() {
  modStore.resetConfig()
  Object.assign(formData, { ...modStore.config })
  errors.value = {}
}

function saveConfig() {
  // Validate required fields
  validateField('id')
  validateField('name')
  validateField('version')
  if (Object.keys(errors.value).length > 0) return

  modStore.config = { ...formData }
  modStore.unsavedChanges = false
  router.push('/build')
}
</script>

<style lang="scss" scoped>
.editor-view { max-width: 720px; margin: 0 auto; }

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  gap: var(--space-lg); padding: var(--space-4xl); text-align: center;
}
.empty-text { font-size: var(--font-size-lg); color: var(--text-secondary); }

.form-section { margin-bottom: var(--space-2xl); }
.form-actions {
  display: flex; justify-content: flex-end; gap: var(--space-sm);
  padding-top: var(--space-lg); border-top: 1px solid var(--border-light);
}

.tags-input {
  display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-xs); min-height: 32px;
}
.tag-inline-input {
  width: 100px; padding: 2px 8px; font-size: var(--font-size-xs);
  background: var(--control-fill); border: 1px solid var(--control-border);
  border-radius: var(--radius-sm); outline: none;
  &:focus { border-color: var(--accent); }
}
</style>
