<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
})

// 엥 뭐야 왜 안돼
// 아 되네
const METRICS = [
  {
    key: 'errorThreshold',
    label: '목표 허용 에러 수',
    unit: '건',
    className: 'metric-response',
    getValue: (item) => item.errorThreshold,
  },
  {
    key: 'errorCount',
    label: '에러 수',
    unit: '건',
    className: 'metric-error',
    getValue: (item) => item.errorCount,
  },
]

const GRAPH_AREA_HEIGHT = 200
// 막대와 툴팁 사이 여백
const TOOLTIP_MARGIN = 8

const maxValue = computed(() =>
  Math.max(1, ...props.data.flatMap((d) => [d.errorThreshold, d.errorCount])),
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

// 막대가 위로 자라는게 아니라 아래로 자람; 그래서 Y도 같이 바꿔주기!
const grown = ref(false)
const playGrowAnimation = () => {
  grown.value = false
  nextTick(() => requestAnimationFrame(() => (grown.value = true)))
}
onMounted(playGrowAnimation)
watch(() => props.data, playGrowAnimation)

const bars = computed(() => {
  const n = props.data.length
  if (n === 0 || graphAreaWidth.value === 0) return []

  const groupWidth = graphAreaWidth.value / n

  return props.data.flatMap((item, i) => {
    const groupX = i * groupWidth

    return METRICS.map((metric, mi) => {
      const slotWidth = groupWidth * 0.4
      const slotX = groupX + groupWidth * (mi === 0 ? 0.05 : 0.55)
      const barWidth = slotWidth * 0.6
      const barX = slotX + slotWidth * 0.2

      const value = metric.getValue(item)
      const ratio = grown.value ? value / maxValue.value : 0
      const height = ratio * GRAPH_AREA_HEIGHT
      const y = GRAPH_AREA_HEIGHT - height

      return {
        region: item.region,
        index: i,
        metric,
        slotX,
        slotWidth,
        barX,
        barWidth,
        y,
        height,
        value,
      }
    })
  })
})

// hover된 막대
const hovered = ref({ metric: null, index: -1 })
const onHover = (metricKey, index) => {
  hovered.value = { metric: metricKey, index }
}
const onLeave = () => {
  hovered.value = { metric: null, index: -1 }
}
const isHovered = (metricKey, index) =>
  hovered.value.metric === metricKey && hovered.value.index === index

const hoveredBar = computed(() => bars.value.find((bar) => isHovered(bar.metric.key, bar.index)))
</script>

<template>
  <div class="region-bar-chart">
    <p v-if="data.length === 0" class="empty-message">표시할 데이터가 없습니다.</p>

    <template v-else>
      <div class="legend">
        <div
          v-for="metric in METRICS"
          :key="metric.key"
          class="legend__item"
          :class="metric.className"
        >
          <span class="legend__dot" />
          <span class="legend__text">{{ metric.label }} ({{ metric.unit }})</span>
        </div>
      </div>

      <div class="chart-row">
        <div class="guide-text-wrapper">
          <span class="guide-text">{{ maxValue.toLocaleString() }}</span>
          <span class="guide-text">{{ Math.round(maxValue / 2).toLocaleString() }}</span>
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
            <g v-for="bar in bars" :key="`${bar.region}-${bar.metric.key}`">
              <rect
                class="bar-background"
                :class="{ hovered: isHovered(bar.metric.key, bar.index) }"
                :x="bar.slotX"
                y="0"
                :width="bar.slotWidth"
                :height="GRAPH_AREA_HEIGHT"
                @mouseenter="onHover(bar.metric.key, bar.index)"
                @mouseleave="onLeave"
              />
              <rect
                class="bar"
                :class="bar.metric.className"
                :x="bar.barX"
                :y="bar.y"
                :width="bar.barWidth"
                :height="bar.height"
                rx="2"
              />
            </g>
          </svg>

          <div
            v-if="hoveredBar"
            class="tooltip"
            :style="{
              left: `${hoveredBar.barX + hoveredBar.barWidth / 2}px`,
              top: `${hoveredBar.y - TOOLTIP_MARGIN}px`,
            }"
          >
              <div class="tooltip-contents">
                <div class="label">{{ hoveredBar.region }} · {{ hoveredBar.metric.label }}</div>
                <div class="value">
                  {{ hoveredBar.value.toLocaleString() }}{{ hoveredBar.metric.unit }}
                </div>
              </div>
          </div>
        </div>
      </div>

      <div class="x-axis">
        <span v-for="item in data" :key="item.region" class="x-axis__label">
          {{ item.region }}
        </span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.region-bar-chart {
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

.legend {
  padding-bottom: 10px;
  overflow: hidden;
  _zoom: 1;
}

.legend__item {
  float: left;
  margin-right: 15px;
  font-size: 12px;
}

.legend__dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 4px;
  vertical-align: middle;
}

.legend__text {
  font-size: 12px;
  color: #666666;
  vertical-align: middle;
}

.legend__item.metric-response .legend__dot {
  background-color: #1782cf;
}

.legend__item.metric-error .legend__dot {
  background-color: #f04438;
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
  rx: 2px;
  transition:
    height 0.5s cubic-bezier(0.25, 0.1, 0.25, 1),
    y 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.bar.metric-response {
  fill: #1782cf;
}

.bar.metric-error {
  fill: #f04438;
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
  overflow: hidden;
  _zoom: 1;
}

.x-axis__label {
  float: left;
  width: 25%;
  text-align: center;
  font-size: 11px;
  color: #888888;
}
</style>
