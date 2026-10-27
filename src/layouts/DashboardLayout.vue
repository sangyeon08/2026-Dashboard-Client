<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/common/AppIcon.vue'

const navItems = [
  { name: 'dashboard', label: '대시보드', icon: 'chart' },
  { name: 'snapshots', label: '장애 스냅샷', icon: 'camera' },
]

// 장애 스냅샷이 app-main 영역을 캡처할 수 있게 밖으로 노출
const appMain = ref(null)
defineExpose({ appMain })
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <RouterLink :to="{ name: 'main' }" class="app-header__brand">
        <AppIcon name="dashboard" color="wine" :size="24" />
        <span class="app-header__title">Dashboard</span>
      </RouterLink>
    </header>

    <div class="app-body">
      <aside class="app-sidebar">
        <nav class="app-sidebar__nav">
          <RouterLink
            v-for="item in navItems"
            :key="item.name"
            :to="{ name: item.name }"
            custom
            v-slot="{ isActive, navigate, href }"
          >
            <a
              :href="href"
              class="app-sidebar__nav-item"
              :class="{ 'app-sidebar__nav-item--active': isActive }"
              @click="navigate"
            >
              <AppIcon :name="item.icon" :color="isActive ? 'wine' : 'deepGray'" :size="18" />
              <span>{{ item.label }}</span>
            </a>
          </RouterLink>
        </nav>

        <template v-if="$slots.sidebar">
          <div class="app-sidebar__divider" />

          <div class="app-sidebar__status">
            <p class="app-sidebar__status-title">실시간 현황</p>
            <div class="app-sidebar__status-list">
              <slot name="sidebar" />
            </div>
          </div>
        </template>
      </aside>

      <main class="app-main" ref="appMain">
        <slot />
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../assets/styles/variables' as v;

.app-shell {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: v.$color-page-bg;
}

.app-header {
  flex-shrink: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 v.$spacing-lg;
  background-color: v.$color-card-bg;
  border-bottom: 1px solid v.$color-border;

  &__brand {
    display: flex;
    align-items: center;
    gap: v.$spacing-sm;
  }

  &__title {
    font-size: 1.05rem;
    font-weight: 700;
    color: v.$color-text;
  }
}

.app-body {
  flex: 1;
  min-height: 0;
  display: flex;
}

.app-sidebar {
  flex-shrink: 0;
  width: 260px;
  display: flex;
  flex-direction: column;
  gap: v.$spacing-md;
  padding: v.$spacing-lg v.$spacing-md;
  background-color: var(--gray-50);
  border-right: 2px solid var(--gray-200);
  overflow-y: auto;

  &__nav {
    display: flex;
    flex-direction: column;
    gap: 0;
    border: 1px solid var(--gray-200);
  }

  &__nav-item {
    display: flex;
    align-items: center;
    gap: v.$spacing-sm;
    padding: 10px 12px;
    border-radius: 0;
    border-bottom: 1px solid var(--gray-200);
    font-size: 0.9rem;
    font-weight: 500;
    color: v.$color-text-muted;
    background-color: v.$color-card-bg;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: var(--gray-100);
    }

    &--active {
      background-color: var(--gray-200);
      color: v.$color-text;
      font-weight: 700;
      border-left: 4px solid v.$color-text-muted;
    }
  }

  &__divider {
    height: 2px;
    background-color: var(--gray-300);
    margin: 4px 0;
  }

  &__status {
    display: flex;
    flex-direction: column;
    gap: v.$spacing-sm;
    min-height: 0;
  }

  &__status-title {
    margin: 0;
    font-size: 0.8rem;
    font-weight: 600;
    color: v.$color-text-muted;
  }

  &__status-list {
    display: flex;
    flex-direction: column;
    gap: v.$spacing-sm;
  }
}

.app-main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: v.$spacing-lg;
  overflow: hidden;
}
</style>
