<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
  <!-- 현재 URL에 연결된 화면을 표시. 그니까 지금은 HomeView! -->
</template>

<style>
* {
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100%;
  margin: 0;
}

body {
  font-family:
    'Roboto',
    -apple-system,
    BlinkMacSystemFont,
    'Malgun Gothic',
    sans-serif;
  background-color: var(--gray-25);
  color: var(--gray-900);
}

a {
  text-decoration: none;
  color: inherit;
}
</style>
