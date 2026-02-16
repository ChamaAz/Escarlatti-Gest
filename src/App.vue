<script setup>
import { ref } from 'vue'
import Login from './components/Login.vue'
import AdminPanel from './components/AdminPanel.vue'

const usuarioGlobal = ref(null)

const manejarLogin = (user) => {
  usuarioGlobal.value = user
}

const logout = () => {
  usuarioGlobal.value = null
}
</script>

<template>
  <div>
    <Login
      v-if="!usuarioGlobal"
      @login-exitoso="manejarLogin"
    />
    <AdminPanel
      v-else
      :usuario="usuarioGlobal"
      @logout="logout"
    />
  </div>
</template>
