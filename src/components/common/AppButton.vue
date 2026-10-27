<script setup>
defineProps({
  text: { type: String, required: true },
  theme: { type: String, default: 'gray' },
  size: { type: String, default: 'small' },
  disabled: { type: Boolean, default: false },
})
</script>

<template>
  <button type="button" class="btn" :class="[`btn--${theme}`, `btn--${size}`]" :disabled="disabled">
    {{ text }}
  </button>
</template>

<style scoped>
.btn {
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  background-color: var(--base-white);
  color: var(--gray-900);
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
}

.btn:hover:not(:disabled) {
  background-color: var(--gray-100);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--small {
  padding: 6px 10px;
  font-size: 0.8rem;
}

.btn--large {
  padding: 10px 20px;
  font-size: 1rem;
}

.btn--primary {
  background-color: var(--primary-400);
  border-color: var(--primary-400);
  color: var(--base-white);
}

.btn--primary:hover:not(:disabled) {
  background-color: var(--primary-400);
  filter: brightness(0.92);
}
</style>
