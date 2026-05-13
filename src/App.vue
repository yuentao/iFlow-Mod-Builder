<template>
  <div class="app-container" :data-theme="theme">
    <aside class="sidebar">
      <div class="sidebar-header">
        <img src="/iflow-logo.svg" alt="iFlow" class="sidebar-logo" />
        <span class="sidebar-title">iFlow Mod</span>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: $route.path === item.path }"
        >
          <component :is="item.icon" size="16" />
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="app-version">v1.0.0</div>
      </div>
    </aside>

    <main class="main-content">
      <header class="content-header">
        <h1 class="page-title">{{ currentPageTitle }}</h1>
        <div class="header-actions">
          <slot name="header-actions" />
        </div>
      </header>

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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Dashboard, Edit, Puzzle, Setting } from '@icon-park/vue-next'
import { useSettingsStore } from '@/stores/settings'

const route = useRoute()
const settingsStore = useSettingsStore()

const theme = computed(() => settingsStore.settings.theme === 'system'
  ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  : settingsStore.settings.theme
)

const navItems = [
  { path: '/', label: '首页', icon: Dashboard },
  { path: '/editor', label: '编辑', icon: Edit },
  { path: '/build', label: '打包', icon: Puzzle },
  { path: '/settings', label: '设置', icon: Setting },
]

const pageTitles: Record<string, string> = {
  '/': '首页',
  '/editor': 'Mod 配置',
  '/build': '打包',
  '/settings': '设置',
}

const currentPageTitle = computed(() => pageTitles[route.path] || 'iFlow Mod')
</script>

<style lang="scss" scoped>
.app-container {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);
}

.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  user-select: none;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-xl) var(--space-lg);
  height: var(--header-height);
}

.sidebar-logo {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-nav {
  flex: 1;
  padding: var(--space-sm) var(--space-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  transition: all var(--transition);
  cursor: pointer;

  &:hover {
    background: var(--sidebar-item-hover);
    color: var(--text-primary);
  }

  &.active {
    background: var(--sidebar-item-active-bg);
    color: var(--sidebar-item-active-text);
    font-weight: var(--font-weight-medium);
  }

  .nav-label {
    white-space: nowrap;
  }
}

.sidebar-footer {
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--sidebar-border);
}

.app-version {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg) var(--space-2xl);
  height: var(--header-height);
  min-height: var(--header-height);
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
}

.page-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  line-height: var(--line-height-tight);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.content-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-3xl) var(--space-2xl);
}

.page-enter-active { animation: fadeInUp var(--transition-smooth) ease; }
.page-leave-active { animation: fadeIn var(--transition-fast) ease reverse; }
</style>
