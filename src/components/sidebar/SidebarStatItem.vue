<script setup>
import AppIcon from '@/components/common/AppIcon.vue'

// 사이드바에 표시할 거
defineProps({
  icon: {
    type: String,
    required: true,
  },
  iconColor: {
    type: String,
    default: 'deepGray',
  },
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
})
</script>

<template>
  <div class="stat-item">
    <span class="stat-item__icon">
      <AppIcon :name="icon" :color="iconColor" :size="16" />
    </span>
    <div class="stat-item__body">
      <p class="stat-item__label">{{ label }}</p>
      <p class="stat-item__value">{{ value }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../../assets/styles/variables' as v;

.stat-item {
  display: flex;
  align-items: center;
  gap: v.$spacing-sm;
  padding: v.$spacing-sm;
  border-radius: v.$radius-lg;
  border: 1px solid var(--gray-200);
  background-color: v.$color-card-bg;

  &__icon {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__body {
    min-width: 0;
  }

  &__label {
    margin: 0;
    font-size: 0.75rem;
    color: v.$color-text-muted;
    white-space: nowrap;
  }

  &__value {
    margin: 2px 0 0;
    font-size: 1rem;
    font-weight: 700;
    color: v.$color-text;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
