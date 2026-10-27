<script setup>
// 장애 스냅샷 갤러리 화면. useIncidentSnapshot이 찍어서 업로드해둔 이미지들을 그냥 목록으로 보여주기만 함.
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import useSnapshotsQuery from '@/core/api/snapshots/useSnapshotsQuery'

const { data: snapshots, isPending, isError } = useSnapshotsQuery()

const formatCapturedAt = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('ko-KR', { hour12: false })
}

const formatSize = (bytes) => `${(bytes / 1024).toFixed(0)} KB`
</script>

<template>
  <DashboardLayout>
    <div class="snapshots-screen">
      <h1 class="snapshots-screen__title">장애 스냅샷</h1>

      <p v-if="isPending" class="snapshots-message">스냅샷 목록을 불러오는 중입니다.</p>
      <p v-else-if="isError" class="snapshots-message">스냅샷 목록을 불러오지 못했습니다.</p>
      <p v-else-if="snapshots.length === 0" class="snapshots-message">
        아직 기록된 장애 스냅샷이 없습니다.
      </p>

      <div v-else class="snapshot-grid">
        <a
          v-for="snapshot in snapshots"
          :key="snapshot.fileName"
          :href="snapshot.blobUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="snapshot-card"
          :title="`${formatCapturedAt(snapshot.capturedAt)} · ${snapshot.trigger === 'auto' ? '자동 캡처' : '수동 캡처'} · 에러 수치 ${snapshot.errorCount}건 · ${formatSize(snapshot.size)}`"
        >
          <img :src="snapshot.blobUrl" :alt="snapshot.fileName" class="snapshot-card__thumb" />
        </a>
      </div>
    </div>
  </DashboardLayout>
</template>

<style lang="scss" scoped>
@use '../assets/styles/variables' as v;

.snapshots-screen {
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  &__title {
    margin: 0 0 v.$spacing-sm;
    font-size: 1.1rem;
  }
}

.snapshots-message {
  color: v.$color-text-muted;
}

.snapshot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: v.$spacing-lg;
}

.snapshot-card {
  display: block;
  background-color: v.$color-card-bg;
  border: 1px solid v.$color-border;
  border-radius: v.$radius-md;
  overflow: hidden;

  &__thumb {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    background-color: var(--gray-50);
  }
}
</style>
