<script setup>
import { ref, onMounted } from 'vue'

// Lista de estados existentes
const estados = ref([])
// Lista de usuarios para validar relaciones con estados
const usuarios = ref([])

// Estado que estamos creando o editando
const nuevoEstado = ref({
  id: '',
  nombre: '',
  permite_acceso: true // Por defecto CA1: permite acceso al crear
})

// Variable para saber si estamos editando
const modoEdicion = ref(false)

// Usuario actualmente conectado (simulación para CA2)
const usuarioConectado = ref({
  id: 1,
  login: 'admin1',
  estado_id: 1
})

// ============================================================
// Cargar datos de la API
// ============================================================
const cargarDatos = async () => {
  try {
    const [resEst, resUsu] = await Promise.all([
      fetch('http://100.52.46.68:3000/estados_usuario'),
      fetch('http://100.52.46.68:3000/usuarios')
    ])
    estados.value = await resEst.json()
    usuarios.value = await resUsu.json()
  } catch (e) {
    console.error("Error cargando estados:", e)
  }
}

// ============================================================
// Guardar estado (crear o actualizar)
// ============================================================
const guardarEstado = async () => {
  try {
    if (!modoEdicion.value) {
      // Crear nuevo estado
      const maxId = estados.value.length > 0 
        ? Math.max(...estados.value.map(e => Number(e.id))) 
        : 0
      nuevoEstado.value.id = (maxId + 1).toString()

      await fetch('http://100.52.46.68:3000/estados_usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoEstado.value)
      })
    } else {
      // Actualizar estado existente
      await fetch(`http://100.52.46.68:3000/estados_usuario/${nuevoEstado.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoEstado.value)
      })
      // CA2: expulsar usuario conectado si su estado ya no permite acceso
      const estadoActualizado = { ...nuevoEstado.value }
      if (!estadoActualizado.permite_acceso && usuarioConectado.value.estado_id == estadoActualizado.id) {
        alert("Has sido expulsado: tu estado de usuario no permite acceso")
        window.location.href = '/login' // redirige al login
      }

      modoEdicion.value = false
    }

    // Limpiar formulario
    nuevoEstado.value = { id: '', nombre: '', permite_acceso: true }
    cargarDatos()
  } catch (e) {
    alert("Error guardando estado")
  }
}

// Cargar datos de un estado en el formulario para editar
const editarEstado = (estado) => {
  nuevoEstado.value = { ...estado }
  modoEdicion.value = true
}
// Borrar estado (validando si hay usuarios asociados)
const borrarEstado = async (id) => {
  const tieneUsuarios = usuarios.value.some(u => Number(u.estado_id) === Number(id))
  if (tieneUsuarios) {
    alert("No se puede borrar: hay usuarios con este estado")
    return
  }
  if (confirm("¿Eliminar estado?")) {
    await fetch(`http://100.52.46.68:3000/estados_usuario/${id}`, { method: 'DELETE' })
    cargarDatos()
  }
}

// Cargar estados al iniciar
onMounted(cargarDatos)

</script>

<template>
  <div>
    <h2>Gestión de Estados de Usuario (H7)</h2>
    <!-- FORMULARIO CREAR/EDITAR -->
    <form @submit.prevent="guardarEstado">
      <input v-model="nuevoEstado.nombre" placeholder="Nombre del estado" required />
      <label>
        <input type="checkbox" v-model="nuevoEstado.permite_acceso" />
        Permite Acceso
      </label>
      <button type="submit">{{ modoEdicion ? 'Actualizar' : 'Crear' }}</button>
    </form>

    <hr>

    <!-- TABLA DE ESTADOS -->
    <table border="1">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Permite Acceso</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="e in estados" :key="e.id">
          <td>{{ e.id }}</td>
          <td>{{ e.nombre }}</td>
          <td>{{ e.permite_acceso ? 'Sí' : 'No' }}</td>
          <td>
            <button @click="editarEstado(e)">Editar</button>
            <button @click="borrarEstado(e.id)">Borrar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
