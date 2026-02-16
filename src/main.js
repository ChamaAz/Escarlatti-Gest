import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'

const app = createApp(App)

// Configurar axios global
const api = axios.create({
  baseURL: 'http://localhost:3000'
})

// Hacerlo disponible en toda la app
app.config.globalProperties.$api = api

app.mount('#app')
