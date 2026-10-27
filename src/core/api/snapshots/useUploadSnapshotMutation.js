import { useMutation } from '@tanstack/vue-query'

// 스샷 업로드. 수동 캡처 버튼 또는 자동 임계값 트리거에서 호출.
const uploadSnapshot = async ({ file, trigger, errorCount }) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('trigger', trigger) // 'manual' | 'auto'
  formData.append('errorCount', errorCount)

  const response = await fetch('/api/snapshots', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || '스냅샷 업로드 실패')
  }

  return response.json()
}

// GET 아니라 POST니까 useQuery 말고 useMutation. 캐싱 대상이 아니라 "실행하는" 요청이라서. 능동태 ST.
const useUploadSnapshotMutation = () => {
  return useMutation({
    mutationFn: uploadSnapshot,
  })
}

export default useUploadSnapshotMutation
