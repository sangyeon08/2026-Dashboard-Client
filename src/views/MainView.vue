<script setup>
import { useRouter } from 'vue-router'
import AppIcon from '@/components/common/AppIcon.vue'
import AppButton from '@/components/common/AppButton.vue'

// 버튼 클릭 시 화면을 전환하기 위해 라우터 인스턴스
const router = useRouter()

const goToSnapshots = () => {
  router.push({ name: 'snapshots' })
}

const goToDashboard = () => {
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <main class="main-screen">
    <AppIcon name="dashboard" color="wine" :size="48" />
    <h1>Dashboard</h1>

    <div class="menu">
      <AppButton theme="gray" size="large" text="장애 스냅샷 보기" @click="goToSnapshots" />
      <AppButton theme="primary" size="large" text="대시보드 보기" @click="goToDashboard" />
    </div>
  </main>
</template>

<style lang="scss" scoped>
@use '../assets/styles/variables' as v;

.main-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: v.$spacing-md;
  background-color: v.$color-page-bg;

  h1 {
    margin: 0 0 v.$spacing-md;
    color: v.$color-text;
  }
}

.menu {
  display: flex;
  gap: v.$spacing-md;
}
</style>
