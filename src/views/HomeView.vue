<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/common/AppButton.vue'
import useDashboardRealtime from '@/core/api/dashboard/useDashboardRealtime'
import GlobalStatusDoughnutChart from '@/components/charts/GlobalStatusDoughnutChart.vue'
import RegionBarChart from '@/components/charts/RegionBarChart.vue'
import AlertStackBarChart from '@/components/charts/AlertStackBarChart.vue'
import TotalAlertLineChart from '@/components/charts/TotalAlertLineChart.vue'
import SidebarStatItem from '@/components/sidebar/SidebarStatItem.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import useIncidentSnapshot from '@/core/capture/useIncidentSnapshot'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '@/stores/dashboardStore'

const AUTO_CAPTURE_THRESHOLD = 125

const router = useRouter()
const { isPending, isError } = useDashboardRealtime()

const dashboardStore = useDashboardStore()
const {
  globalStatus: rawGlobalStatus,
  regionStats: rawRegionStats,
  alertTrend: rawAlertTrend,
} = storeToRefs(dashboardStore)

const globalStatus = computed(() => {
  return (
    rawGlobalStatus.value ?? {
      uptime: 0,
      normalCount: 0,
      warningCount: 0,
      criticalCount: 0,
    }
  )
})

const regionStats = computed(() => {
  return rawRegionStats.value ?? []
})

const alertTrend = computed(() => {
  return rawAlertTrend.value ?? []
})

const uptimeDisplay = computed(() => {
  return `${globalStatus.value.uptime.toFixed(1)}%`
})

const totalErrorCount = computed(() => {
  return regionStats.value.reduce((sum, stat) => sum + stat.errorCount, 0)
})

const topErrorRegion = computed(() => {
  if (regionStats.value.length === 0) return '-'

  return regionStats.value.reduce((topStat, stat) =>
    stat.errorCount > topStat.errorCount ? stat : topStat,
  ).region
})

const activeAlertCount = computed(() => {
  return globalStatus.value.warningCount + globalStatus.value.criticalCount
})

const errorIconColor = computed(() => (totalErrorCount.value > 0 ? 'red' : 'green'))
const alertIconColor = computed(() => (activeAlertCount.value > 0 ? 'orange' : 'green'))

// app-main 영역을 캡처 대상으로 정하기 | 그냥 그래프만 지정하니까 다 잘림.
const dashboardLayoutRef = ref(null)
const captureTargetRef = computed(() => dashboardLayoutRef.value?.appMain)
const { isCapturing, captureManually, maybeAutoCapture } = useIncidentSnapshot(captureTargetRef)

// 실시간으로 갱신되는 총 에러 발생량을 감시하다가, 리밋값 넘으면 자동으로 캡처
watch(totalErrorCount, (value) => {
  maybeAutoCapture(value, AUTO_CAPTURE_THRESHOLD)
})
</script>

<template>
  <DashboardLayout ref="dashboardLayoutRef">
    <template #sidebar>
      <SidebarStatItem
        icon="activity"
        icon-color="navy"
        label="전체 가동률"
        :value="uptimeDisplay"
      />
      <SidebarStatItem
        icon="alertTriangle"
        :icon-color="errorIconColor"
        label="총 에러 발생량"
        :value="`${totalErrorCount}건`"
      />
      <SidebarStatItem
        icon="report"
        icon-color="deepGray"
        label="최대 에러 발생 국가"
        :value="topErrorRegion"
      />
      <SidebarStatItem
        icon="bellRing"
        :icon-color="alertIconColor"
        label="활성 경보 수"
        :value="`${activeAlertCount}건`"
      />

      <div class="sidebar-capture">
        <AppButton theme="gray" size="small" :text="isCapturing ? '캡처 중...' : '장애 스냅샷 찍기'" :disabled="isCapturing" @click="captureManually(totalErrorCount)" />
        <AppButton theme="gray" size="small" text="로그 확인하기" @click="router.push({ name: 'logs' })" />
      </div>
    </template>

    <p v-if="isPending" class="dashboard-message">대시보드 정보를 불러오는 중입니다.</p>
    <p v-else-if="isError" class="dashboard-message">대시보드 정보를 불러오지 못했습니다.</p>

    <!-- 요기 -->
    <div v-else class="charts-grid">
      <section class="chart-panel chart-panel--status">
        <h2 class="chart-panel__title">글로벌 가동률 / 장애 스코어</h2>
        <div class="chart-panel__body">
          <GlobalStatusDoughnutChart :data="globalStatus" />
        </div>
      </section>

      <section class="chart-panel chart-panel--region">
        <h2 class="chart-panel__title">국가별 목표 허용 에러 수 & 에러 수</h2>
        <div class="chart-panel__body">
          <RegionBarChart :data="regionStats" />
        </div>
      </section>

      <section class="chart-panel chart-panel--total">
        <h2 class="chart-panel__title">알림 총계 추이</h2>
        <div class="chart-panel__body">
          <TotalAlertLineChart :data="alertTrend" />
        </div>
      </section>

      <section class="chart-panel chart-panel--trend">
        <h2 class="chart-panel__title">시간대별 알림 발생 추이 (최근 24시간)</h2>
        <div class="chart-panel__body">
          <AlertStackBarChart :data="alertTrend" />
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>

<style lang="scss" scoped>
@use '../assets/styles/variables' as v;

.dashboard-message {
  margin: auto;
  color: v.$color-text-muted;
}

.sidebar-capture {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: v.$spacing-sm;
}

.charts-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  grid-template-rows: 1fr 1fr;
  gap: v.$spacing-lg;
}

.chart-panel {
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background-color: v.$color-card-bg;
  border: 1px solid v.$color-border;
  border-radius: v.$radius-lg;
  padding: v.$spacing-md v.$spacing-lg;

  &--status {
    grid-column: 1;
    grid-row: 1;
  }

  &--region {
    grid-column: 2;
    grid-row: 1;
  }

  &--total {
    grid-column: 1;
    grid-row: 2;
  }

  &--trend {
    grid-column: 2;
    grid-row: 2;
  }

  &__title {
    flex-shrink: 0;
    margin: 0 0 v.$spacing-sm;
    font-size: 0.95rem;
    font-weight: 700;
    color: v.$color-text;
  }

  &__body {
    flex: 1;
    min-height: 0;
    position: relative;
  }
}
</style>
