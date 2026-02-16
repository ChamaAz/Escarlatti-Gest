<script setup>
import { ref } from 'vue'

const emit = defineEmits(['login-exitoso'])  // sin espacios

const usuario = ref('')
const password = ref('')
const error = ref(false)

const login = async () => {
  error.value = false
  try {
    const res = await fetch('http://100.52.46.68:3000/usuarios')
    const data = await res.json()

    const encontrado = data.find(u =>
      u.login === usuario.value &&
      u.password_hash === password.value
    )

    if (encontrado) {
      emit('login-exitoso', encontrado)  // igual que en defineEmits y App.vue
    } else {
      error.value = true
    }

  } catch (e) {
    console.error(e)
  }
}
</script>

<template>
  <div>
    <h2>Login</h2>
    <!--un formulario para acceder a la app -->
    <input v-model="usuario" placeholder="Usuario">
    <input v-model="password" type="password" placeholder="Password">
    <button @click="login">Entrar</button>

    <!-- muestra el error si hay -->
    <p v-if="error">Credenciales incorrectas</p>
  </div>
</template>
