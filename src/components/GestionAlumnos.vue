<script setup>
import { ref, onMounted } from 'vue'

const alumnos = ref([])
const cursos = ref([])
const nuevoAlumno = ref({
  nia: '',
  nombre: '',
  apellidos: '',
  curso_id: '',
  correo_electronico: '',
  tutor_legal_contacto: '',
  estado_id: 1 //CA1: por defecto Activo
})
//cargar datos de la base de datos de alumnos y cursos
const cargarDatos = async () => {
  try {
    const [resAlu, resCur] = await Promise.all([
      fetch('http://100.52.46.68:3000/alumnos'),
      fetch('http://100.52.46.68:3000/cursos')
    ])

    alumnos.value = await resAlu.json()
    cursos.value = await resCur.json()

  } catch (error) {
    console.error("Error al cargar datos:", error)
  }
}
//osea verificar duplicado
//verificar si existe algun alumno con mismo nia o mismo correo
//guardar alumno
const guardarAlumno = async () => {
  const existe = alumnos.value.find(a =>
    a.nia === nuevoAlumno.value.nia ||
    a.correo_electronico === nuevoAlumno.value.correo_electronico
  )
  if (existe) {
    alert("Error: Ya existe un alumno con ese NIA o correo.")
    return
  }

  try {
    //METHODO POST PARA INSERTAR UN NUEVO ALUMNO
    const respuesta = await fetch('http://100.52.46.68:3000/alumnos', {method: 'POST',headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoAlumno.value)})
    if (respuesta.ok) {
      nuevoAlumno.value = {
        nia: '',
        nombre: '',
        apellidos: '',
        curso_id: '',
        correo_electronico: '',
        tutor_legal_contacto: '',
        estado_id: 1 //POR DEFECTO ACTIVO
      }
   // CARGAR DATOS DE LA BASE DE DATOS
      await cargarDatos()
      alert("Alumno insertado con exito")
    }
  } catch (error) {
    alert("Error de conexión")
  }
}

const borrarAlumno = async (nia) => {
//EL MENSAJE DE CONFIRMACION
  if (!confirm("¿Eliminar alumno?")) return
//EL METHOD DELETE PARA ELIMINAR EL ALUMNO
  try {
    await fetch(`http://100.52.46.68:3000/alumnos/${nia}`, {method: 'DELETE'})
//RECARGAR LA BASE DE DATOS
    cargarDatos()
  } catch (error) {
    console.error(error)
  }
}
onMounted(cargarDatos)
</script>
<template>
  <div>
    <h3>Gestión de Alumnos LA PARTE H4</h3>
   <!--FORMULARIO PARA INSERTAR ALUMNOS A LA BASE DE DATOS-->
    <form @submit.prevent="guardarAlumno">
      <input v-model="nuevoAlumno.nia" placeholder="NIA" required>
      <input v-model="nuevoAlumno.nombre" placeholder="Nombre" required>
      <input v-model="nuevoAlumno.apellidos" placeholder="Apellidos" required>
      <input v-model="nuevoAlumno.correo_electronico" placeholder="Correo" required>
      <input v-model="nuevoAlumno.tutor_legal_contacto" placeholder="Tutor Legal" required>
      <!--SELECCIONAR EL NOMBRE DEL CURSO-->
      <select v-model="nuevoAlumno.curso_id" required>
        <option value="" disabled>Seleccione Curso</option>
        <option v-for="c in cursos" :key="c.id" :value="c.id">
          {{ c.nombre_curso }}
        </option>
      </select>
      <label>
        <input
          type="checkbox"
          :checked="Number(nuevoAlumno.estado_id) === 1"
          @change="nuevoAlumno.estado_id = $event.target.checked ? 1 : 2"
        >
        Activo
      </label>
      <button type="submit">Registrar Alumno</button>
    </form>

    <table border="1">
      <thead>
        <tr>
          <th>NIA</th>
          <th>Alumno</th>
          <th>Curso</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="a in alumnos" :key="a.id">
          <td>{{ a.nia }}</td>
          <td>{{ a.nombre }} {{ a.apellidos }}</td>
          <td>{{ cursos.find(c => c.id == a.curso_id)?.nombre_curso || 'N/A' }}</td>
          <td>{{ Number(a.estado_id) === 1 ? 'Activo' : 'Inactivo' }}</td>
          <td>
            <button @click="borrarAlumno(a.nia)">Eliminar Alumno</button>
          </td>
        </tr>
      </tbody>
    </table>

  </div>
</template>
