<script setup>
import useLogsQuery from '@/core/api/logs/useLogsQuery'

const { data: logs, isPending, isError } = useLogsQuery()
</script>

<template>
  <div>
    <p v-if="isPending">불러오는 중...</p>
    <p v-else-if="isError">로그를 불러오지 못했습니다.</p>
    <p v-else-if="logs.length === 0">오늘 기록된 로그가 없습니다.</p>

    <pre v-else>{{ JSON.stringify(logs, null, 2) }}</pre>
  </div>
</template>
