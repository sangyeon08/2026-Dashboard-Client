<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
})

const GRAPH_AREA_HEIGHT = 200
const BAR_GAP = 6
// 막대와 툴팁 사이 여백
const TOOLTIP_MARGIN = 8

// x축 라벨도 다 적으면 24개라 겹치니까 3칸마다만.
const X_AXIS_LABEL_INTERVAL = 3

const SERIES = [
  { key: 'critical', label: 'Critical', className: 'critical' },
  { key: 'warning', label: 'Warning', className: 'warning' },
  { key: 'info', label: 'Info', className: 'info' },
]

const maxTotal = computed(() =>
  Math.max(1, ...props.data.map((d) => d.critical + d.warning + d.info)),
)

const graphArea = ref(null)
const graphAreaWidth = ref(0)
const updateGraphAreaWidth = () => {
  if (graphArea.value) {
    graphAreaWidth.value = graphArea.value.getBoundingClientRect().width
  }
}
const resizeObserver = new ResizeObserver(updateGraphAreaWidth)
watch(graphArea, (el) => {
  if (el) resizeObserver.observe(el)
})
onUnmounted(() => resizeObserver.disconnect())

// critical -> warning -> info 순서로 아래서부터 쌓기.
const bars = computed(() => {
  const n = props.data.length
  if (n === 0 || graphAreaWidth.value === 0) return []

  const groupWidth = graphAreaWidth.value / n
  const barWidth = Math.max(1, groupWidth - BAR_GAP)

  return props.data.map((item, i) => {
    const groupX = i * groupWidth
    const total = item.critical + item.warning + item.info

    let stackTop = GRAPH_AREA_HEIGHT
    const segments = SERIES.map((series) => {
      const height = (item[series.key] / maxTotal.value) * GRAPH_AREA_HEIGHT
      stackTop -= height
      return { ...series, value: item[series.key], y: stackTop, height }
    })

    return {
      time: item.time,
      index: i,
      total,
      groupX,
      groupWidth,
      x: groupX + BAR_GAP / 2,
      barWidth,
      top: stackTop,
      segments,
    }
  })
})

// hover된 막대
const hoveredIndex = ref(-1)
const onHover = (index) => {
  hoveredIndex.value = index
}
const onLeave = () => {
  hoveredIndex.value = -1
}

const hoveredBar = computed(() =>
  hoveredIndex.value === -1 ? null : (bars.value[hoveredIndex.value] ?? null),
)

// x축 라벨은 3시간 간격 데이터만 남기기
const xAxisLabels = computed(() => props.data.filter((_, i) => i % X_AXIS_LABEL_INTERVAL === 0))
</script>

<template>
  <div class="alert-stack-bar-chart">
    <p v-if="data.length === 0" class="empty-message">표시할 데이터가 없습니다.</p>

    <template v-else>
      <div class="chart-row">
        <div class="guide-text-wrapper">
          <span class="guide-text">{{ maxTotal.toLocaleString() }}</span>
          <span class="guide-text">{{ Math.round(maxTotal / 2).toLocaleString() }}</span>
          <span class="guide-text">0</span>
        </div>

        <div class="graph-area" ref="graphArea">
          <svg class="lines">
            <line x1="0" :x2="graphAreaWidth" y1="0" y2="0" class="guide-line" />
            <line
              x1="0"
              :x2="graphAreaWidth"
              :y1="GRAPH_AREA_HEIGHT / 2"
              :y2="GRAPH_AREA_HEIGHT / 2"
              class="guide-line"
            />
          </svg>

          <svg class="graph">
            <g v-for="bar in bars" :key="bar.time">
              <rect
                class="bar-background"
                :class="{ hovered: hoveredIndex === bar.index }"
                :x="bar.groupX"
                y="0"
                :width="bar.groupWidth"
                :height="GRAPH_AREA_HEIGHT"
                @mouseenter="onHover(bar.index)"
                @mouseleave="onLeave"
              />
              <rect
                v-for="segment in bar.segments"
                :key="segment.key"
                class="bar"
                :class="`bar--${segment.className}`"
                :x="bar.x"
                :y="segment.y"
                :width="bar.barWidth"
                :height="segment.height"
              />
            </g>
          </svg>

          <div
            v-if="hoveredBar"
            class="tooltip"
            :style="{
              left: `${hoveredBar.x + hoveredBar.barWidth / 2}px`,
              top: `${hoveredBar.top - TOOLTIP_MARGIN}px`,
            }"
          >
              <div class="tooltip-contents">
                <div class="label">{{ hoveredBar.time }}</div>
                <div v-for="segment in hoveredBar.segments" :key="segment.key" class="row">
                  <span class="row__label">
                    <i class="row__dot" :class="`row__dot--${segment.className}`"></i>
                    {{ segment.label }}
                  </span>
                  <span class="row__value">{{ segment.value.toLocaleString() }}건</span>
                </div>
                <div class="row row--total">
                  <span class="row__label">합계</span>
                  <span class="row__value">{{ hoveredBar.total.toLocaleString() }}건</span>
                </div>
              </div>
          </div>
        </div>
      </div>

      <div class="x-axis">
        <span v-for="item in xAxisLabels" :key="item.time" class="x-axis__label">
          {{ item.time }}
        </span>
      </div>

      <div class="legend">
        <span v-for="series in SERIES" :key="series.key" class="legend__item">
          <i class="legend__box" :class="`legend__box--${series.className}`"></i>{{ series.label }}
        </span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.alert-stack-bar-chart {
  width: 100%;
  height: 100%;
  font-family: dotum, '돋움', sans-serif;
}

.empty-message {
  text-align: center;
  padding-top: 50px;
  font-size: 12px;
  color: #999999;
}

.chart-row {
  position: relative;
  width: 100%;
  height: 200px;
}

.guide-text-wrapper {
  position: absolute;
  left: 0;
  top: 0;
  width: 40px;
  height: 100%;
  text-align: right;
  padding-right: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.guide-text {
  font-size: 11px;
  color: #999999;
}

.graph-area {
  position: absolute;
  left: 48px;
  right: 0;
  top: 0;
  bottom: 0;
  border-left: 1px solid #cccccc;
}

.lines,
.graph {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.guide-line {
  stroke: #e5e5e5;
  stroke-width: 1px;
}

.bar-background {
  fill: transparent;
}

.bar-background.hovered {
  fill: #eeeeee;
}

.bar {
  pointer-events: none;
}

.bar--critical {
  fill: #e53935;
}

.bar--warning {
  fill: #f4b400;
}

.bar--info {
  fill: #4a90d9;
}

.tooltip {
  position: absolute;
  transform: translate(-50%, -100%);
  width: 100px;
  margin-left: 0;
  z-index: 10;
  pointer-events: none;
}

.tooltip-contents {
  background-color: #000000;
  color: #ffffff;
  padding: 4px 6px;
  font-size: 11px;
}

.tooltip-contents .label {
  text-align: center;
  font-weight: normal;
}

.tooltip-contents .row {
  display: flex;
  justify-content: space-between;
  gap: 4px;
}

.tooltip-contents .row--total {
  margin-top: 2px;
  padding-top: 2px;
  border-top: 1px solid #555555;
  font-weight: bold;
}

.tooltip-contents .row__value {
  font-weight: bold;
}

.row__dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 3px;
}

.row__dot--critical {
  background-color: #e53935;
}

.row__dot--warning {
  background-color: #f4b400;
}

.row__dot--info {
  background-color: #4a90d9;
}

.x-axis {
  margin-left: 48px;
  padding-top: 4px;
  border-top: 1px solid #cccccc;
  display: flex;
}

.x-axis__label {
  /* 라벨 하나가 X_AXIS_LABEL_INTERVAL칸 몫의 너비를 차지하고, 그 칸의 맨 앞에 왼쪽 정렬 */
  flex: 3 0 0;
  min-width: 0;
  text-align: left;
  font-size: 10px;
  color: #333333;
}

.legend {
  margin-top: 4px;
  margin-left: 48px;
  font-size: 11px;
}

.legend__item {
  margin-right: 10px;
  color: #333333;
}

.legend__box {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 3px;
}

.legend__box--critical {
  background-color: #e53935;
}

.legend__box--warning {
  background-color: #f4b400;
}

.legend__box--info {
  background-color: #4a90d9;
}
</style>
