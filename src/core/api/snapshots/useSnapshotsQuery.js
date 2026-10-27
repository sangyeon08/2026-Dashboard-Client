import { useQuery } from '@tanstack/vue-query'

const fetchSnapshots = async () => {
  const response = await fetch('/api/snapshots')

  if (!response.ok) {
    throw new Error('장애 스냅샷 목록을 불러오지 못했습니다.')
  }

  return response.json()
}

// 지금까지 기록된 스샷 목록 조회
const useSnapshotsQuery = () => {
  return useQuery({
    queryKey: ['snapshots'],
    queryFn: fetchSnapshots,
  })
}

export default useSnapshotsQuery
