import { onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { HubConnectionState } from '@microsoft/signalr'
import { getDashboardConnection } from '@/core/signalr/dashboardHub'
import { useDashboardStore } from '@/stores/dashboardStore'

// HomeView가 SignalR 연결의 존재 자체를 몰라도 되게 감싸주는 컴포저블. 
const useDashboardRealtime = () => {
  const dashboardStore = useDashboardStore()
  const { isPending, isError } = storeToRefs(dashboardStore) // 그냥 꺼내면 그 순간 복사라 반응성 살리기.
  const connection = getDashboardConnection()

  // (매번 새 화살표 함수로 넘기면 off가 안 먹힘)
  const handleSnapshot = (snapshot) => dashboardStore.setSnapshot(snapshot)
  const handleGlobalStatus = (data) => dashboardStore.setGlobalStatus(data)
  const handleRegionStats = (data) => dashboardStore.setRegionStats(data)
  const handleAlertTrend = (data) => dashboardStore.setAlertTrend(data)

  const connect = async () => {
    dashboardStore.setConnectionState('connecting')

    try {
      if (connection.state === HubConnectionState.Disconnected) {
        await connection.start()
      }

      // 시작 동시에 그룹 참여 -> 그래야 스샷 찍어줌..!
      await connection.invoke('JoinDashboardGroup')
      dashboardStore.setConnectionState('connected')
    } catch (error) {
      console.error('대시보드 SignalR 연결 실패', error)
      dashboardStore.setConnectionState('error')
    }
  }

  onMounted(() => {
    connection.on('ReceiveDashboardSnapshot', handleSnapshot)
    connection.on('ReceiveGlobalStatus', handleGlobalStatus)
    connection.on('ReceiveRegionStats', handleRegionStats)
    connection.on('ReceiveAlertTrend', handleAlertTrend)

    connect()
  })

  onUnmounted(() => {
    connection.off('ReceiveDashboardSnapshot', handleSnapshot)
    connection.off('ReceiveGlobalStatus', handleGlobalStatus)
    connection.off('ReceiveRegionStats', handleRegionStats)
    connection.off('ReceiveAlertTrend', handleAlertTrend)

    if (connection.state === HubConnectionState.Connected) {
      connection.invoke('LeaveDashboardGroup').catch(() => { })
    }
  })

  return {
    isPending,
    isError,
  }
}

export default useDashboardRealtime
