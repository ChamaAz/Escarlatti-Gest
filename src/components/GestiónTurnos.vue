<script setup>
import { ref, onMounted } from 'vue'

// Lista de turnos
const turnos = ref([])

// Cursos (para validar eliminación)
const cursos = ref([])

// Turno que estamos creando o editando
const nuevoTurno = ref({
  id: '',
  nombre: ''
})

// Modo edición
const modoEdicion = ref(false)
// Cargar datos de turnos y cursos desde la API
const cargarDatos = async () => {
  try {
    const [resTurnos, resCursos] = await Promise.all([
      fetch('http://100.52.46.68:3000/turnos'),
      fetch('http://100.52.46.68:3000/cursos')
    ])
    if (!resTurnos.ok || !resCursos.ok) throw new Error("Error al obtener datos")
    
    turnos.value = await resTurnos.json()
    cursos.value = await resCursos.json()
  } catch (error) {
    console.error("Error cargando datos:", error)
    alert("Error cargando turnos o cursos")
  }
}

// Guardar turno (crear o actualizar)
const guardarTurno = async () => {
  try {
    if (!nuevoTurno.value.nombre.trim()) {
      alert("El nombre no puede estar vacío")
      return
    }

    if (!modoEdicion.value) {
      // Calcular ID automáticamente
      const maxId = turnos.value.length > 0
        ? Math.max(...turnos.value.map(t => Number(t.id)))
        : 0
      nuevoTurno.value.id = (maxId + 1).toString()

      const res = await fetch('http://100.52.46.68:3000/turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoTurno.value)
      })

      if (!res.ok) throw new Error("Error creando turno")
    } else {
      // Actualizar
      const res = await fetch(`http://100.52.46.68:3000/turnos/${nuevoTurno.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoTurno.value)
      })

      if (!res.ok) throw new Error("Error actualizando turno")
      modoEdicion.value = false
    }

    // Limpiar formulario
    nuevoTurno.value = { id: '', nombre: '' }

    // Recargar datos y esperar
    await cargarDatos()
  } catch (error) {
    console.error(error)
    alert(error.message)
  }
}
// Editar turno
const editarTurno = (turno) => {
  nuevoTurno.value = { ...turno }
  modoEdicion.value = true
}

// Borrar turno (validación: no borrar si hay cursos)
const borrarTurno = async (id) => {
  const tieneCursos = cursos.value.some(c => Number(c.turno_id) === Number(id))
  if (tieneCursos) {
    alert("No se puede eliminar: existen cursos asociados a este turno")
    return
  }

  if (confirm("¿Eliminar turno?")) {
    try {
      const res = await fetch(`http://100.52.46.68:3000/turnos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error("Error eliminando turno")
      await cargarDatos()
    } catch (error) {
      console.error(error)
      alert(error.message)
    }
  }
}

// Cargar datos al montar el componente
onMounted(cargarDatos)
</script>

<template>
  <div>
    <h2>Gestión de Turnos (H9)</h2>

    <!-- FORMULARIO CREAR/EDITAR -->
    <form @submit.prevent="guardarTurno">
      <input
        v-model="nuevoTurno.nombre"
        placeholder="Nombre del Turno"
        required
      />
      <button type="submit">{{ modoEdicion ? 'Actualizar' : 'Crear' }}</button>
    </form>

    <hr>

    <!-- TABLA DE TURNOS -->
    <table border="1">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in turnos" :key="t.id">
          <td>{{ t.id }}</td>
          <td>{{ t.nombre }}</td>
          <td>
            <button @click="editarTurno(t)">Editar</button>
            <button @click="borrarTurno(t.id)">Borrar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
