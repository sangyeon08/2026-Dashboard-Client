<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})

const CENTER = 36
const RADIUS = 28
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const VIEW_BOX_SIZE = CENTER * 2
// 도넛 위에서 툴팁이 뜨는 간격
const TOOLTIP_MARGIN = 12

const SEGMENTS = [
  { key: 'normalCount', label: '정상', color: '#4caf50' },
  { key: 'warningCount', label: '경고', color: '#f4b400' },
  { key: 'criticalCount', label: '장애', color: '#e53935' },
]

const total = computed(
  () => props.data.normalCount + props.data.warningCount + props.data.criticalCount,
)

// 세 구간을 이어그려서 도넛으로 -> 각 구간 길이만큼 dasharray, 이전 구간 누적 길이만큼 dashoffset.. 이라는데 뭐지.
const arcs = computed(() => {
  if (total.value === 0) return []

  let cumulative = 0
  return SEGMENTS.map((segment) => {
    const value = props.data[segment.key]
    const length = (value / total.value) * CIRCUMFERENCE
    // 구간 가운데 지점 (12시 방향이 시작점이라 -90도 보정) -> 툴팁 위치
    const midAngle = ((cumulative + length / 2) / CIRCUMFERENCE) * 2 * Math.PI - Math.PI / 2
    const arc = {
      ...segment,
      value,
      percent: Math.round((value / total.value) * 100),
      strokeDasharray: `${length} ${CIRCUMFERENCE - length}`,
      strokeDashoffset: -cumulative,
      tooltipX: ((CENTER + RADIUS * Math.cos(midAngle)) / VIEW_BOX_SIZE) * 100,
      tooltipY: ((CENTER + RADIUS * Math.sin(midAngle)) / VIEW_BOX_SIZE) * 100,
    }
    cumulative += length
    return arc
  })
})

// hover된 구간
const hoveredKey = ref(null)
const onHover = (key) => {
  hoveredKey.value = key
}
const onLeave = () => {
  hoveredKey.value = null
}

const hoveredArc = computed(() => arcs.value.find((arc) => arc.key === hoveredKey.value))
</script>

<template>
  <div class="global-status-chart">
    <p v-if="total === 0" class="empty-message">표시할 데이터가 없습니다.</p>

    <template v-else>
      <div class="pie-wrapper">
        <svg class="pie-container" viewBox="0 0 72 72">
          <circle class="bg" :cx="CENTER" :cy="CENTER" :r="RADIUS" />
          <circle
            v-for="arc in arcs"
            :key="arc.key"
            class="fill"
            :class="{ hovered: hoveredKey === arc.key }"
            :cx="CENTER"
            :cy="CENTER"
            :r="RADIUS"
            :stroke="arc.color"
            :stroke-dasharray="arc.strokeDasharray"
            :stroke-dashoffset="arc.strokeDashoffset"
            transform="rotate(-90 36 36)"
            @mouseenter="onHover(arc.key)"
            @mouseleave="onLeave"
          />
          <text class="text-container" :x="CENTER" :y="CENTER">
            <tspan class="percent">{{ data.uptime.toFixed(1) }}</tspan>
            <tspan class="unit">%</tspan>
          </text>
        </svg>

        <div
          v-if="hoveredArc"
          class="tooltip"
          :style="{
            left: `${hoveredArc.tooltipX}%`,
            top: `calc(${hoveredArc.tooltipY}% - ${TOOLTIP_MARGIN}px)`,
          }"
        >
            <div class="tooltip-contents">
              <div class="label">{{ hoveredArc.label }}</div>
              <div class="value">
                {{ hoveredArc.value.toLocaleString() }}건 ({{ hoveredArc.percent }}%)
              </div>
            </div>
        </div>
      </div>

      <div class="legend">
        <div v-for="arc in arcs" :key="arc.key" class="legend__item">
          <span class="legend__dot" :style="{ backgroundColor: arc.color }" />
          <span class="legend__label">{{ arc.label }}</span>
          <span class="legend__value">{{ arc.value.toLocaleString() }}건 ({{ arc.percent }}%)</span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.global-status-chart {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  font-family: dotum, '돋움', sans-serif;
}

.empty-message {
  text-align: center;
  font-size: 12px;
  color: #999999;
}

.pie-wrapper {
  position: relative;
  width: 180px;
  height: 180px;
  flex-shrink: 0;
}

.pie-container {
  display: block;
  width: 100%;
  height: 100%;
}

.bg {
  fill: transparent;
  stroke: #f6f7f9;
  stroke-width: 12px;
}

.fill {
  fill: transparent;
  stroke-width: 12px;
  /* fill이 transparent라 안쪽 빈 공간까지 hover되지 않게, 실제 획 부분만 반응 */
  pointer-events: stroke;
}

.fill.hovered {
  stroke-width: 14px;
}

.text-container {
  pointer-events: none;
}

.text-container {
  dominant-baseline: middle;
  text-anchor: middle;
}

.text-container .percent {
  font-size: 13px;
  font-weight: 700;
  fill: #34363e;
}

.text-container .unit {
  font-size: 9px;
  font-weight: 400;
  fill: #34363e;
}

.tooltip {
  position: absolute;
  transform: translate(-50%, -100%);
  width: 80px;
  z-index: 10;
  pointer-events: none;
}

.tooltip-contents {
  background-color: #000000;
  color: #ffffff;
  padding: 4px;
  text-align: center;
}

.tooltip-contents .label {
  font-size: 11px;
  font-weight: normal;
}

.tooltip-contents .value {
  font-size: 11px;
  font-weight: bold;
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend__item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend__dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend__label {
  font-size: 12px;
  color: #666666;
  width: 28px;
}

.legend__value {
  font-size: 12px;
  color: #34363e;
  font-weight: 600;
}
</style>
