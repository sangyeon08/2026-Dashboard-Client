<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  color: { type: String, default: 'deepGray' },
  size: { type: Number, default: 16 },
})

const COLORS = {
  wine: '#9b2335',
  deepGray: '#4b5563',
  navy: '#1e3a5f',
  red: '#e53935',
  green: '#4caf50',
  orange: '#fb8c00',
}

const ICONS = {
  dashboard:
    '<rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="5"/><rect x="13" y="10" width="8" height="11"/><rect x="3" y="13" width="8" height="8"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  alertTriangle: '<path d="M12 3l10 18H2z"/><path d="M12 10v5"/><path d="M12 18v.5"/>',
  report: '<path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h7"/>',
  bellRing: '<path d="M6 17v-6a6 6 0 0 1 12 0v6l2 2H4z"/><path d="M10 21h4"/>',
}

const stroke = computed(() => COLORS[props.color] ?? props.color)
const paths = computed(() => ICONS[props.name] ?? '')
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    :stroke="stroke"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    v-html="paths"
  />
</template>
