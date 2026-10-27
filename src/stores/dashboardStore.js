import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

// 컴포넌트가 직접 SignalR 연결을 몰라도 되게 하는게 이 store의 역할. 딱 상태만 관리하는 ST.
export const useDashboardStore = defineStore('dashboard', () => {
  const globalStatus = ref(null)
  const regionStats = ref([])
  const alertTrend = ref([])

  const connectionState = ref('idle') // idle -> connecting -> connected / error

  // 최초 접속 시 한번에 다 받는거
  const setSnapshot = (snapshot) => {
    globalStatus.value = snapshot.globalStatus
    regionStats.value = snapshot.regionStats
    alertTrend.value = snapshot.alertTrend
  }

  const setGlobalStatus = (data) => {
    globalStatus.value = data
  }

  const setRegionStats = (data) => {
    regionStats.value = data
  }

  const setAlertTrend = (data) => {
    alertTrend.value = data
  }

  const setConnectionState = (state) => {
    connectionState.value = state
  }

  const isPending = computed(
    () => connectionState.value === 'idle' || connectionState.value === 'connecting',
  )
  const isError = computed(() => connectionState.value === 'error')

  return {
    globalStatus,
    regionStats,
    alertTrend,
    connectionState,
    setSnapshot,
    setGlobalStatus,
    setRegionStats,
    setAlertTrend,
    setConnectionState,
    isPending,
    isError,
  }
})
