<script setup>
import { usuarioGlobal, logoutUsuario } from '../store.js'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const usuario = computed(() => usuarioGlobal.value || {})

// Permisos según rol (como pide el PDF)
const puedeCrearIncidencias = computed(() =>
  ['ADMIN1', 'TIC', 'PROF1', 'ALUM'].includes(usuario.value.rol_id)
)

const puedeReservarEspacios = computed(() =>
  ['ADMIN1', 'PROF1'].includes(usuario.value.rol_id)
)

const puedeResolverIncidencias = computed(() =>
  ['ADMIN1', 'TIC'].includes(usuario.value.rol_id)
)

const puedeMantenimiento = computed(() =>
  usuario.value.rol_id === 'ADMIN1'
)

const logout = () => {
  logoutUsuario()
  router.push('/')
}
</script>

<template>
  <div class="admin-container">

    <h2>Panel de Administración</h2>

    <p>
      Usuario: {{ usuario.login }} |
      Rol: {{ usuario.rol_id }} |
      Estado: {{ usuario.estado_id }}
    </p>

    <button @click="logout">Cerrar sesión</button>

    <div class="secciones">

      <div v-if="puedeCrearIncidencias">
        <h3>Creación de Incidencias</h3>
      </div>

      <div v-if="puedeReservarEspacios">
        <h3>Reserva de Espacios</h3>
      </div>

      <div v-if="puedeResolverIncidencias">
        <h3>Resolución de Incidencias</h3>
      </div>

      <div v-if="puedeMantenimiento">
        <h3>Mantenimiento</h3>
      </div>

    </div>

  </div>
</template>

<style scoped>
.admin-container {
  max-width: 800px;
  margin: auto;
  padding: 2rem;
}

.secciones > div {
  border: 1px solid #ccc;
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 10px;
}

button {
  margin-bottom: 1rem;
}
</style>