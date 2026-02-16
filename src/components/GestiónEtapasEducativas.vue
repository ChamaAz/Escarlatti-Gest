<script setup>
import { ref, onMounted } from 'vue'

const etapas = ref([])
const cursos = ref([]) // Para validar borrado de etapas con cursos asociados

const nuevoEtapa = ref({ id: '', nombre: '' })
const modoEdicion = ref(false)

// Cargar datos desde la API
const cargarDatos = async () => {
  try {
    const [resEt, resCur] = await Promise.all([
      fetch('http://100.52.46.68:3000/etapas'),
      fetch('http://100.52.46.68:3000/cursos')
    ])
    etapas.value = await resEt.json()
    cursos.value = await resCur.json()
  } catch (error) {
    console.error("Error cargando etapas:", error)
  }
}

// Guardar etapa (crear o actualizar)
const guardarEtapa = async () => {
  try {
    if (!modoEdicion.value) {
      const maxId = etapas.value.length > 0 ? Math.max(...etapas.value.map(e => Number(e.id))) : 0
      nuevoEtapa.value.id = (maxId + 1).toString()

      await fetch('http://100.52.46.68:3000/etapas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoEtapa.value)
      })
    } else {
      await fetch(`http://100.52.46.68:3000/etapas/${nuevoEtapa.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoEtapa.value)
      })
      modoEdicion.value = false
    }

    nuevoEtapa.value = { id: '', nombre: '' }
    cargarDatos()
  } catch (error) {
    alert("Error guardando etapa")
  }
}

// Editar etapa
const editarEtapa = (etapa) => {
  nuevoEtapa.value = { ...etapa }
  modoEdicion.value = true
}

// Borrar etapa
const borrarEtapa = async (id) => {
  const tieneCursos = cursos.value.some(c => Number(c.etapa_id) === Number(id))
  if (tieneCursos) {
    alert("No se puede borrar: existen cursos asociados a esta etapa.")
    return
  }

  if (confirm("¿Eliminar etapa?")) {
    await fetch(`http://100.52.46.68:3000/etapas/${id}`, { method: 'DELETE' })
    cargarDatos()
  }
}

onMounted(cargarDatos)
</script>

<template>
  <div>
    <h2>Gestión de Etapas Educativas (H8)</h2>
    <form @submit.prevent="guardarEtapa">
      <input v-model="nuevoEtapa.nombre" placeholder="Nombre de la etapa" required />
      <button type="submit">{{ modoEdicion ? 'Actualizar' : 'Crear' }}</button>
    </form>
    <hr>
    <table border="1">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="e in etapas" :key="e.id">
          <td>{{ e.id }}</td>
          <td>{{ e.nombre }}</td>
          <td>
            <button @click="editarEtapa(e)">Editar</button>
            <button @click="borrarEtapa(e.id)">Borrar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
