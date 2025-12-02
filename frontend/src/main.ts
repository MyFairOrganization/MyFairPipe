import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { startRedditor } from "./redditor.ts"

const app = createApp(App)

app.use(router)

app.mount('#app')

startRedditor(60_000)
