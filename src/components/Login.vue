<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginUsuario } from '../store.js'

const usuario = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

const login = async () => {
  error.value = ''

  try {
    const res = await fetch('http://100.27.173.196:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: usuario.value,
        password: password.value,
        zusuario: 'CHA5'
      })
    })

    const data = await res.json()
    console.log('Respuesta API:', data)

    if (res.ok) {
      const usuarioData = Array.isArray(data) ? data[0] : data

      loginUsuario(usuarioData)

      router.push('/admin')
    } else {
      error.value = data.error || 'Credenciales incorrectas'
    }

  } catch (e) {
    console.error(e)
    error.value = 'Error de conexión'
  }
}
</script>

<template>
  <div class="login-container">
    <h2>Login</h2>

    <input v-model="usuario" placeholder="Usuario" />
    <input v-model="password" type="password" placeholder="Password" />

    <button @click="login">Entrar</button>

    <p v-if="error" style="color:red">{{ error }}</p>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 300px;
  margin: auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 10px;
  text-align: center;
}

input {
  display: block;
  width: 100%;
  margin: 0.5rem 0;
  padding: 0.5rem;
}

button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
}
</style>