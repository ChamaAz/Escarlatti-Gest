import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import AdminPanel from '../components/AdminPanel.vue'

const routes = [
  { path: '/', component: Login },
  { path: '/admin', component: AdminPanel }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router