<script setup>
import { ref, onMounted } from 'vue'

const profesores = ref([])
const departamentos = ref([])
const roles = ref([])

const nuevoProfesor = ref({
  dni_nie: '',
  nombre: '',
  apellidos: '',
  correo_institucional: '',
  departamento_id: '',
  rol_id: 2,
  password_hash: ''
})

const cargarDatosIniciales = async () => {
  try {
    const [resProf, resDep, resRoles] = await Promise.all([
      fetch('http://100.52.46.68:3000/profesores'),
      fetch('http://100.52.46.68:3000/departamentos'),
      fetch('http://100.52.46.68:3000/roles')
    ])

    profesores.value = await resProf.json()
    departamentos.value = await resDep.json()
    roles.value = await resRoles.json()

  } catch (error) {
    console.error("Error cargando tablas:", error)
  }
}

const guardarProfesor = async () => {
//NO ESTA PERMITEDO AÑADIR  UN PROFRE CON MISMO CORREO O NIE
  const duplicado = profesores.value.find(p =>
    p.dni_nie === nuevoProfesor.value.dni_nie ||
    p.correo_institucional === nuevoProfesor.value.correo_institucional
  )//SI ES TE DA ERROR Y FUERA
  if (duplicado) {
    alert("Error: El DNI o el Correo ya existen")
    return
  }

  await fetch('http://100.52.46.68:3000/profesores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevoProfesor.value)
  })

  nuevoProfesor.value = {
    dni_nie: '',
    nombre: '',
    apellidos: '',
    correo_institucional: '',
    departamento_id: '',
    rol_id: '',
    password_hash: ''
  }

  cargarDatosIniciales()
}

const borrarDirecto = async (dni) => {
  if (!confirm("¿Seguro que quieres eliminar este profesor?")) return;
  // Preguntar qué hacer con sus reservas
  const respuesta = prompt("Si quieres cancelar sus reservas activas escribe 'CANCELAR', si quieres mantenerlas, deja vacío:");
  if (respuesta === "CANCELAR") {
    // Aquí se haría un fetch para borrar las reservas del profesor
    await fetch(`http://100.52.46.68:3000/reservas?profesor_dni=${dni}`, { method: 'DELETE' });
  }
    await fetch(`http://100.52.46.68:3000/profesores/${dni}`, { method: 'DELETE' });
  cargarDatosIniciales();
}

onMounted(cargarDatosIniciales)
</script>

<template>
  <div>
    <h3>Gestión de Profesores (H3)</h3>
  <!--FORMULARIO PARA INSERTAR PROFESORES-->
    <form @submit.prevent="guardarProfesor">
      <input v-model="nuevoProfesor.dni_nie" placeholder="DNI/NIE" required>
      <input v-model="nuevoProfesor.nombre" placeholder="Nombre" required>
      <input v-model="nuevoProfesor.apellidos" placeholder="Apellidos" required>
      <input v-model="nuevoProfesor.correo_institucional" placeholder="Correo Institucional" required>
      <select v-model="nuevoProfesor.departamento_id" required>
        <option value="" disabled>Seleccione Departamento</option>
        <option v-for="d in departamentos" :key="d.id" :value="d.id">
          {{ d.nombre }}
        </option>
      </select>

      <input v-model="nuevoProfesor.password_hash" placeholder="Contraseña" required>

      <button type="submit">Registrar Profesor</button>
    </form>

    <table border="1">
      <thead>
        <tr>
          <th>Profesor</th>
          <th>DNI</th>
          <th>Departamento</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="p in profesores" :key="p.id">
          <td>{{ p.nombre }} {{ p.apellidos }}</td>
          <td>{{ p.dni_nie }}</td>
          <td>{{ departamentos.find(d => d.id == p.departamento_id)?.nombre || 'N/A' }}</td>
          <td>
            <button @click="borrarDirecto(p.dni_nie)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

  </div>
</template>
