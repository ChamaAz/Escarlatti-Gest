<script setup>
import { ref, onMounted } from 'vue'
const cursos = ref([])
const profesores = ref([])
const etapas = ref([])
const turnos = ref([])
const alumnos = ref([])
const espacios = ref([])

const cursoVerAlumnos = ref(null)
const mostrarAlumnos = ref(false)

const nuevoCurso = ref({
  id: '',
  nombre_curso: '',
  etapa_id: '',
  grupo: '',
  turno_id: '',
  anio_academico: '',
  tutor_id: '',
  aula_id: ''
})
//cargar datos de la base de datos
const cargarDatos = async () => {
  try {
    const [resCur, resProf, resEt, resTur, resAlu, resEsp] = await Promise.all([
      fetch('http://100.52.46.68:3000/cursos'),
      fetch('http://100.52.46.68:3000/profesores'),
      fetch('http://100.52.46.68:3000/etapas'),
      fetch('http://100.52.46.68:3000/turnos'),
      fetch('http://100.52.46.68:3000/alumnos'),
      fetch('http://100.52.46.68:3000/espacios')
    ])

  profesores.value = await resProf.json()//guarda profesores
  etapas.value = await resEt.json()//guarda etapas
  turnos.value = await resTur.json()// guarda turnos
  alumnos.value = await resAlu.json()// guarda alumnos
  espacios.value = await resEsp.json()// guarda espacios
  cursos.value = await resCur.json()//guarda cursoss

  } catch (error) {
    console.error("Error cargando datos:", error)
  }
}

const guardarCurso = async () => {

  // Calcular ID automáticamente
  //compruebamos si hay cursos guardados
  const maxId = cursos.value.length > 0   //curso.value es la lista de cursos que tienes
  // el map() coge todos los id de los cursos
  //Math.max(...) busca el número más grande
    ? Math.max(...cursos.value.map(c => Number(c.id)))
    : 0
  nuevoCurso.value.id = (maxId + 1).toString()
  //validar tutor único por año
  //Buscamos si ya existe un curso donde
  //El mismo profesor (tutor_id)
  //En el mismo año académico
  const tutorOcupado = cursos.value.find(c =>
    Number(c.tutor_id) === Number(nuevoCurso.value.tutor_id) &&
    c.anio_academico === nuevoCurso.value.anio_academico
  )

  if (tutorOcupado) {
    alert("Este profesor ya es tutor en ese año academico")
    return
  }
//insertamos cursoo
  try {
    const respuesta = await fetch('http://100.52.46.68:3000/cursos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoCurso.value)
    })

    if (respuesta.ok) {

      nuevoCurso.value = {
        id: '',
        nombre_curso: '',
        etapa_id: '',
        grupo: '',
        turno_id: '',
        anio_academico: '',
        tutor_id: '',
        aula_id: ''
      }

      await cargarDatos()
      alert("Curso creado")

    }

  } catch (error) {
    alert("Error de conexión")
  }
}

const verAlumnos = (curso) => {
  cursoVerAlumnos.value = curso
  mostrarAlumnos.value = true
}
const borrarCurso = async (id) => {
//SI ALGUN CURSO TIENE ALUMNOS NO SE PUEDE BORRAR
  const tieneAlumnos = alumnos.value.some(a =>
    Number(a.curso_id) === Number(id)
  )
// si hay alumnos no deja eliminar
  if (tieneAlumnos) {
    alert("No se puede borrar: tiene alumnos")
    return
  }
//mensaje de confirmacion
  if (!confirm("¿Borrar curso?")) 
  return
//borrar curso por el methodo delete
  await fetch(`http://100.52.46.68:3000/cursos/${id}`, {
    method: 'DELETE'
  })

  cargarDatos()
}
onMounted(cargarDatos)
</script>

<template>
  <div>

    <h3>Gestión de Cursos LA PARTE H5</h3>
<!--FURMULARIO PARA INSERTAR Y GUARDAR UN CURSO-->
    <form @submit.prevent="guardarCurso">

      <input v-model="nuevoCurso.nombre_curso" placeholder="Nombre" required>
      <input v-model="nuevoCurso.grupo" placeholder="Grupo" required>
      <input v-model="nuevoCurso.anio_academico" placeholder="Año" required>

      <select v-model="nuevoCurso.etapa_id" required>
        <option value="" disabled>Etapa</option>
        <option v-for="e in etapas" :key="e.id" :value="e.id">
          {{ e.nombre }}
        </option>
      </select>

      <select v-model="nuevoCurso.turno_id" required>
        <option value="" disabled>Turno</option>
        <option v-for="t in turnos" :key="t.id" :value="t.id">
          {{ t.nombre }}
        </option>
      </select>

      <select v-model="nuevoCurso.aula_id" required>
        <option value="" disabled>Aula</option>
        <option v-for="es in espacios" :key="es.id" :value="es.id">
          {{ es.nombre }}
        </option>
      </select>

      <select v-model="nuevoCurso.tutor_id" required>
        <option value="" disabled>Tutor</option>
        <option v-for="p in profesores" :key="p.id" :value="p.id">
          {{ p.nombre }} {{ p.apellidos }}
        </option>
      </select>

      <button type="submit">Registrar Curso</button>

    </form>
<!--CARGAR DATOS DESTE LA API Y MOSTRAMOS POR UNA TABLA ACTUALIZADA-->
    <table border="1">

      <thead>
        <tr>
          <th>ID</th>
          <th>Curso</th>
          <th>Año</th>
          <th>Tutor</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="c in cursos" :key="c.id">
          <td>{{ c.id }}</td>
          <td>{{ c.nombre_curso }} - {{ c.grupo }}</td>
          <td>{{ c.anio_academico }}</td>
          <td>{{ profesores.find(p => p.id == c.tutor_id)?.nombre || 'S/T' }}</td>
          <td>
            <button @click="verAlumnos(c)">Alumnos</button>
            <button @click="borrarCurso(c.id)">Borrar</button>
          </td>
        </tr>
      </tbody>

    </table>

    <div v-if="mostrarAlumnos">
      <h4>Alumnos en {{ cursoVerAlumnos?.nombre_curso }}</h4>

      <ul>
        <li
          v-for="a in alumnos.filter(a => Number(a.curso_id) === Number(cursoVerAlumnos?.id))"
          :key="a.id"
        >
          {{ a.nombre }} {{ a.apellidos }} ({{ a.nia }})
        </li>
      </ul>

      <button @click="mostrarAlumnos = false">Cerrar</button>
    </div>

  </div>
</template>
