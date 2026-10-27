import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import './assets/styles/base.css'

import App from './App.vue'
import router from './router'

// Vue 애플리케이션을 만들기!
const app = createApp(App)

// 여러 컴포넌트가 함께 쓰는 상태 저장소 Pinia를 등록 -> api에서 가져온 걸 pinia에 저장하고 컴포넌트들이 그 값을 가져다가 씀.
app.use(createPinia())

app.use(router)
// API 요청의 로딩, 오류, 캐시를 관리하는 Vue Query를 등록. pinia랑 다른 역할임!
app.use(VueQueryPlugin)

app.mount('#app')
