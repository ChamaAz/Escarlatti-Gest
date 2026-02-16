<script setup>
import { ref, onMounted } from 'vue'

const roles = ref([])
const usuarios = ref([]) //Para validar si hay usuarios con ese rol

const nuevoRol = ref({
  id: '',
  nombre: '',
  permite_reserva: false,
  permite_crear_incidencia: true,
  permite_resolver_incidencia: false
})

const modoEdicion = ref(false)

const cargarRoles = async () => {
  try {
    const [resRoles, resUsuarios] = await Promise.all([
      fetch('http://100.52.46.68:3000/roles'),
      fetch('http://100.52.46.68:3000/usuarios')
    ])
    roles.value = await resRoles.json()
    usuarios.value = await resUsuarios.json()
  } catch (e) {
    console.error("Error cargando roles", e)
  }
}
const guardarRol = async () => {
  try {
    if (!modoEdicion.value) {
      const maxId = roles.value.length > 0 ? Math.max(...roles.value.map(r => Number(r.id))) : 0
      nuevoRol.value.id = (maxId + 1).toString()
      await fetch('http://100.52.46.68:3000/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoRol.value)
      })
    } else {
      await fetch(`http://100.52.46.68:3000/roles/${nuevoRol.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoRol.value)
      })
      modoEdicion.value = false
    }

    nuevoRol.value = {
      id: '',
      nombre: '',
      permite_reserva: false,
      permite_crear_incidencia: true,
      permite_resolver_incidencia: false
    }

    cargarRoles()
  } catch (e) {
    alert("Error guardando rol")
  }
}

const editarRol = (rol) => {
  nuevoRol.value = { ...rol }
  modoEdicion.value = true
}

const borrarRol = async (id) => {
  const tieneUsuarios = usuarios.value.some(u => Number(u.rol_id) === Number(id))
  if (tieneUsuarios) {
    alert("No se puede borrar: hay usuarios asignados a este rol")
    return
  }

  if (confirm("¿Eliminar rol?")) {
    await fetch(`http://100.52.46.68:3000/roles/${id}`, { method: 'DELETE' })
    cargarRoles()
  }
}

onMounted(cargarRoles)
</script>

<template>
  <div>
    <h2>Gestión de Roles (H11)</h2>
    <!-- Formulario -->
    <form @submit.prevent="guardarRol">
      <input v-model="nuevoRol.nombre" placeholder="Nombre del rol" required />
      <label>
        <input type="checkbox" v-model="nuevoRol.permite_reserva" />
        Permite Reservar Aula
      </label>
      <label>
        <input type="checkbox" v-model="nuevoRol.permite_crear_incidencia" />
        Permite Crear Incidencia
      </label>
      <label>
        <input type="checkbox" v-model="nuevoRol.permite_resolver_incidencia" />
        Permite Resolver Incidencia
      </label>
      <button type="submit">{{ modoEdicion ? 'Actualizar' : 'Crear' }}</button>
    </form>

    <hr>

    <!-- Tabla de roles -->
    <table border="1">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Reservar Aula</th>
          <th>Crear Incidencia</th>
          <th>Resolver Incidencia</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in roles" :key="r.id">
          <td>{{ r.id }}</td>
          <td>{{ r.nombre }}</td>
          <td>{{ r.permite_reserva ? 'Sí' : 'No' }}</td>
          <td>{{ r.permite_crear_incidencia ? 'Sí' : 'No' }}</td>
          <td>{{ r.permite_resolver_incidencia ? 'Sí' : 'No' }}</td>
          <td>
            <button @click="editarRol(r)">Editar</button>
            <button @click="borrarRol(r.id)">Borrar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
