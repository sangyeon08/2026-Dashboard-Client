import { useQuery } from '@tanstack/vue-query'

const fetchLogs = async () => {
  const response = await fetch('/api/logs')

  if (!response.ok) {
    throw new Error('로그 목록을 불러오지 못했습니다.')
  }

  return response.json()
}

// 오늘 날짜 파티션 로그 조회. LogsController의 GetLogs 기본값(date 미지정 = 오늘)을 그대로 씀.
const useLogsQuery = () => {
  return useQuery({
    queryKey: ['logs'],
    queryFn: fetchLogs,
  })
}

export default useLogsQuery