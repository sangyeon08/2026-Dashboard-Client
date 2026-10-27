<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
})

const GRAPH_AREA_HEIGHT = 200
const TOOLTIP_MARGIN = 8
const X_AXIS_LABEL_INTERVAL = 3
const Y_AXIS_OFFSET_PERCENT = 12

const totals = computed(() => props.data.map((item) => item.critical + item.warning + item.info))

// 데이터가 쏠려있을 때 y축이 0부터 시작하면 공간이 낭비됨, 실제 데이터 범위에 맞춰 축을 잡음
const dataMin = computed(() => (totals.value.length > 0 ? Math.min(...totals.value) : 0))
const dataMax = computed(() => (totals.value.length > 0 ? Math.max(...totals.value) : 1))
const dataRange = computed(() => dataMax.value - dataMin.value || 1)

const guideTop = computed(() => dataMax.value + (dataRange.value * Y_AXIS_OFFSET_PERCENT) / 100)
const guideBottom = computed(() =>
  Math.max(0, dataMin.value - (dataRange.value * Y_AXIS_OFFSET_PERCENT) / 100),
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

const points = computed(() => {
  const n = props.data.length
  if (n === 0 || graphAreaWidth.value === 0) return []

  const groupWidth = graphAreaWidth.value / n

  const pxUnit = GRAPH_AREA_HEIGHT / (guideTop.value - guideBottom.value)

  return props.data.map((item, i) => {
    const total = totals.value[i]
    const x = groupWidth * i + groupWidth / 2
    const y = GRAPH_AREA_HEIGHT - (total - guideBottom.value) * pxUnit

    return { time: item.time, total, x, y }
  })
})

// 점들을 이어서 꺾은선으로
const linePath = computed(() => points.value.map((p) => `${p.x},${p.y}`).join(' '))

// hover된 포인트 - 실패.
const hoveredIndex = ref(-1)
const onHover = (index) => {
  hoveredIndex.value = index
}
const onLeave = () => {
  hoveredIndex.value = -1
}

const hoveredPoint = computed(() =>
  hoveredIndex.value === -1 ? null : points.value[hoveredIndex.value],
)

// x축 라벨은 3시간 간격 데이터만 남기기
const xAxisLabels = computed(() => props.data.filter((_, i) => i % X_AXIS_LABEL_INTERVAL === 0))
</script>

<template>
  <div class="total-alert-line-chart">
    <p v-if="data.length === 0" class="empty-message">표시할 데이터가 없습니다.</p>

    <template v-else>
      <div class="chart-row">
        <div class="guide-text-wrapper">
          <span class="guide-text">{{ Math.round(guideTop).toLocaleString() }}</span>
          <span class="guide-text">
            {{ Math.round((guideTop + guideBottom) / 2).toLocaleString() }}
          </span>
          <span class="guide-text">{{ Math.round(guideBottom).toLocaleString() }}</span>
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
            <g class="series">
              <polyline v-if="points.length > 0" :points="linePath" class="line" />
              <circle
                v-for="(point, i) in points"
                :key="`point-shadow-${i}`"
                class="point-shadow"
                :class="{ hovered: hoveredIndex === i }"
                :cx="point.x"
                :cy="point.y"
                r="10"
              />
              <circle
                v-for="(point, i) in points"
                :key="`point-${i}`"
                class="point"
                :class="{ hovered: hoveredIndex === i }"
                :cx="point.x"
                :cy="point.y"
                :r="hoveredIndex === i ? 5 : 4"
              />
            </g>

            <rect
              v-for="(point, i) in points"
              :key="`hover-area-${i}`"
              class="hover-area"
              :x="point.x - graphAreaWidth / data.length / 2"
              y="0"
              :width="graphAreaWidth / data.length"
              :height="GRAPH_AREA_HEIGHT"
              @mouseenter="onHover(i)"
              @mouseleave="onLeave"
            />
          </svg>

          <div
            v-if="hoveredPoint"
            class="tooltip"
            :style="{
              left: `${hoveredPoint.x}px`,
              top: `${hoveredPoint.y - TOOLTIP_MARGIN}px`,
            }"
          >
              <div class="tooltip-contents">
                <div class="label">{{ hoveredPoint.time }}</div>
                <div class="value">{{ hoveredPoint.total.toLocaleString() }}건</div>
              </div>
          </div>
        </div>
      </div>

      <div class="x-axis">
        <span v-for="item in xAxisLabels" :key="item.time" class="x-axis__label">
          {{ item.time }}
        </span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.total-alert-line-chart {
  width: 100%;
  height: 100%;
  font-family: dotum, '돋움', sans-serif;
  position: relative;
  left: -8px;
  top: 8px;
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

.line {
  fill: transparent;
  stroke: #e53935;
  stroke-width: 2px;
}

.point {
  fill: #e53935;
  stroke: #ffffff;
  stroke-width: 1.5px;
}

.point-shadow {
  fill: transparent;
}

.point-shadow.hovered {
  fill: rgba(229, 57, 53, 0.15);
}

.hover-area {
  fill: transparent;
}

.tooltip {
  position: absolute;
  transform: translate(-50%, -100%);
  width: 80px;
  margin-left: 0;
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

.x-axis {
  margin-left: 48px;
  padding-top: 4px;
  border-top: 1px solid #cccccc;
  display: flex;
}

.x-axis__label {
  /* 라벨 하나가 원래 X_AXIS_LABEL_INTERVAL칸 몫의 너비를 차지하고, 그 칸의 맨 앞(=해당 시간의 포인트 위치)에 왼쪽 정렬 */
  flex: 3 0 0;
  min-width: 0;
  text-align: left;
  font-size: 10px;
  color: #888888;
}
</style>
