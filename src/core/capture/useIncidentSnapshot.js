import { ref } from 'vue'
import html2canvas from 'html2canvas'
import useUploadSnapshotMutation from '@/core/api/snapshots/useUploadSnapshotMutation'

// 연사 캡처 방지용.
const COOLDOWN_MS = 30_000

// targetRef가 가리키는 요소를 이미지로 캡처해서 장애 스냅샷으로 업로드
const useIncidentSnapshot = (targetRef) => {
  const { mutateAsync: uploadSnapshot } = useUploadSnapshotMutation()

  const isCapturing = ref(false)
  const lastCapturedAt = ref(null)
  const lastError = ref(null)

  let lastCaptureTime = 0

  const captureNow = async (trigger, errorCount) => {
    if (!targetRef.value || isCapturing.value) return

    isCapturing.value = true
    lastError.value = null
    lastCaptureTime = Date.now()

    try { // 여기가 제일 중요. dom을 이미지로 캡처하고, blob으로 변환 후 서버에 업로드
      const canvas = await html2canvas(targetRef.value, {
        backgroundColor: '#ffffff',
        logging: false,
        scale: Math.min(window.devicePixelRatio || 1, 2),
      })

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('캡처된 이미지를 생성하지 못했습니다.')

      const file = new File([blob], `snapshot-${Date.now()}.png`, { type: 'image/png' })

      await uploadSnapshot({ file, trigger, errorCount })
      lastCapturedAt.value = new Date()
    } catch (error) {
      lastError.value = error
    } finally {
      isCapturing.value = false
    }
  }

  const captureManually = (errorCount) => captureNow('manual', errorCount)

  // 실시간 데이터가 갱신될 때마다 호출 -> 에러 수치가 리밋을 넘고, 쿨다운이 지났을 때만 자동 캡처해주기
  const maybeAutoCapture = (errorCount, threshold) => {
    if (errorCount < threshold) return
    if (Date.now() - lastCaptureTime < COOLDOWN_MS) return

    captureNow('auto', errorCount)
  }

  return {
    isCapturing,
    lastCapturedAt,
    lastError,
    captureManually,
    maybeAutoCapture,
  }
}

export default useIncidentSnapshot

// dom 요소를 이미지로 캡쳐하고 업로드. 유툽 한번만 더 보고 다시 공부.. 