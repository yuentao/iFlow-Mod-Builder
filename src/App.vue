<template>
  <div class="app-container" :data-theme="theme">
    <header class="top-bar">
      <div class="top-bar-brand">
        <img src="/iflow-logo.svg" alt="iFlow" class="brand-logo" />
        <span class="brand-title">iFlow Mod</span>
      </div>

      <nav class="step-nav">
        <template v-for="(item, index) in navItems" :key="item.path">
          <router-link
            :to="item.path"
            class="step-item"
            :class="{ active: $route.path === item.path, completed: isVisited(item.path) }"
          >
            <span class="step-dot">
              <svg v-if="isVisited(item.path)" class="step-check" viewBox="0 0 16 16" fill="none">
                <path d="M3.5 8.5L6.5 11.5L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span v-else class="step-num">{{ index + 1 }}</span>
            </span>
            <span class="step-label">{{ item.label }}</span>
          </router-link>
          <span v-if="index < navItems.length - 1" class="step-connector" :class="{ completed: isVisited(navItems[index + 1].path) || $route.path === navItems[index + 1].path }" />
        </template>
      </nav>

      <div class="top-bar-footer">
        <span class="app-version">v1.0.0</span>
      </div>
    </header>

    <main class="main-content">
      <div class="content-body">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'

const route = useRoute()
const settingsStore = useSettingsStore()

// Reactive system dark mode detection
const systemDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)
let mediaQuery: MediaQueryList | null = null
function onMediaChange(e: MediaQueryListEvent) { systemDark.value = e.matches }

onMounted(() => {
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', onMediaChange)
})
onUnmounted(() => { mediaQuery?.removeEventListener('change', onMediaChange) })

const theme = ref('light')
function updateTheme() {
  theme.value = settingsStore.settings.theme === 'system'
    ? (systemDark.value ? 'dark' : 'light')
    : settingsStore.settings.theme
}

// Watch for settings or system changes
import { watch } from 'vue'
watch([() => settingsStore.settings.theme, systemDark], updateTheme, { immediate: true })

const navItems = [
  { path: '/', label: '首页' },
  { path: '/editor', label: '编辑' },
  { path: '/build', label: '打包' },
  { path: '/settings', label: '设置' },
]

const routeOrder = ['/', '/editor', '/build', '/settings']

function isVisited(path: string): boolean {
  const currentIdx = routeOrder.indexOf(route.path)
  const targetIdx = routeOrder.indexOf(path)
  return targetIdx < currentIdx
}
</script>

<style lang="scss" scoped>
.app-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);
}

// ── Top Bar ──
.top-bar {
  display: flex;
  align-items: center;
  height: 56px;
  min-height: 56px;
  padding: 0 var(--space-2xl);
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border-light);
  user-select: none;
  gap: var(--space-xl);
  backdrop-filter: blur(20px);
}

.top-bar-brand {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-shrink: 0;
}

.brand-logo {
  width: 22px;
  height: 22px;
}

.brand-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  white-space: nowrap;
  letter-spacing: -0.01em;
}

// ── Step Navigation ──
.step-nav {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.step-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 6px 12px;
  border-radius: var(--radius-lg);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-smooth);
  white-space: nowrap;

  &:hover:not(.active) {
    background: var(--sidebar-item-hover);
    .step-dot { border-color: var(--accent); }
    .step-label { color: var(--text-primary); }
  }
}

.step-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid var(--border-strong);
  background: transparent;
  transition: all var(--transition-smooth);
  flex-shrink: 0;
}

.step-num {
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  color: var(--text-tertiary);
  line-height: 1;
}

.step-check {
  width: 14px;
  height: 14px;
  color: var(--text-on-accent);
}

.step-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-normal);
  transition: all var(--transition-smooth);
}

// ── Connector ──
.step-connector {
  width: 48px;
  height: 2px;
  background: var(--border);
  border-radius: 1px;
  flex-shrink: 0;
  transition: background var(--transition-smooth);

  &.completed {
    background: var(--accent);
  }
}

// ── Completed step ──
.step-item.completed {
  .step-dot {
    background: var(--accent);
    border-color: var(--accent);
  }

  .step-label {
    color: var(--text-primary);
    font-weight: var(--font-weight-medium);
  }
}

// ── Active step ──
.step-item.active {
  .step-dot {
    background: var(--accent);
    border-color: var(--accent);
    box-shadow: 0 0 0 4px var(--accent-light);
  }

  .step-label {
    color: var(--sidebar-item-active-text);
    font-weight: var(--font-weight-semibold);
  }
}

// ── Footer ──
.top-bar-footer {
  flex-shrink: 0;
}

.app-version {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

// ── Main Content ──
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.content-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-3xl) var(--space-2xl);
}

.page-enter-active { animation: fadeInUp var(--transition-smooth) ease; }
.page-leave-active { animation: fadeIn var(--transition-fast) ease reverse; }
</style>
