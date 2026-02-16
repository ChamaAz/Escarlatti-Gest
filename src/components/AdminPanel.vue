<script setup>
import { ref } from 'vue'
import Profesores from './GestionProfesores.vue'
import Alumnos from './GestionAlumnos.vue'
import Cursos from './GestionCursos.vue'
import Espacios from './GestionEspacios.vue'
import Departamentos from './GestiónDepartamentos.vue'
import Roles from './Roles.vue'
import Estados from './GestiónEstados.vue'
import Etapas from './GestiónEtapasEducativas.vue'
import Turnos from './GestiónTurnos.vue'
const props = defineProps(['usuario'])
const emit = defineEmits(['logout'])
// Variable para controlar qué sección vemos
const seccionActual = ref('menu')
//funciones de navegación
const irAMenu = () => seccionActual.value = 'menu'
const irAProfesores = () => seccionActual.value = 'profesores'
const irAAlumnos = () => seccionActual.value = 'alumnos'
const irACursos = () => seccionActual.value = 'cursos'
const irAEspacios = () => seccionActual.value = 'espacios'
const irADepartamentos = () => seccionActual.value = 'departamentos'
const irARoles = () => seccionActual.value = 'roles'
const irAEstados = () => seccionActual.value = 'estados'
const irAEtapas = () => seccionActual.value = 'etapas'
const irATurnos = () => seccionActual.value = 'turnos'
//funciones de servicios H2
const crearIncidencia = () => console.log("Crear Incidencia")
const reservarAula = () => console.log("Reservar Aula")
const resolverIncidencia = () => console.log("Resolver Incidencias")
</script>
<template>
  <div>
    <header>
      <h3>Bienvenido, {{ usuario.login }}</h3>
      <div>
        <button v-if="seccionActual !== 'menu'" @click="irAMenu">Volver al Panel</button>
        <button @click="$emit('logout')">Cerrar Sesión</button>
      </div>
    </header>

    <!-- Menú principal -->
    <div v-if="seccionActual === 'menu'">
      <section v-if="usuario">
        <h4>Servicios Generales</h4>
        <button @click="crearIncidencia">Crear Incidencia</button>
      </section>

      <section v-if="[1,2,4].includes(Number(usuario.rol_id))">
        <h4>Gestión de Espacios</h4>
        <button @click="reservarAula">Reservar Aula</button>
      </section>

      <section v-if="[1,4].includes(Number(usuario.rol_id))">
        <h4>Mantenimiento TIC</h4>
        <button @click="resolverIncidencia">Resolver Incidencias</button>
      </section>
   <hr>
      <section v-if="Number(usuario.rol_id) === 1">
        <h4>Administración del Centro</h4>
        <button @click="irAProfesores">Profesores (H3)</button>
        <button @click="irAAlumnos">Alumnos (H4)</button>
        <button @click="irACursos">Cursos (H5)</button>
        <button @click="irAEspacios">Espacios (H6)</button>
        <button @click="irADepartamentos">Departamentos (H 10)</button>
        <button @click="irARoles">Roles (H 11)</button>
        <button @click="irAEstados">Estados (H 7)</button>
        <button @click="irAEtapas">Etapas (H 8)</button>
        <button @click="irATurnos">Turnos (H 9)</button>
      </section>
    </div>

    <!-- Secciones CRUD -->
    <div v-else-if="seccionActual === 'profesores'">
      <Profesores />
    </div>
    <div v-else-if="seccionActual === 'alumnos'">
      <Alumnos />
    </div>
    <div v-else-if="seccionActual === 'cursos'">
      <Cursos />
    </div>
    <div v-else-if="seccionActual === 'espacios'">
      <Espacios />
    </div>
      <div v-else-if="seccionActual === 'departamentos'">
      <Departamentos />
    </div>
     <div v-else-if="seccionActual === 'roles'">
      <Roles />
    </div>

    <div v-else-if="seccionActual === 'etapas'">
      <Etapas />
    </div>

    <div v-else-if="seccionActual === 'estados'">
      <Estados />
    </div>

    <div v-else-if="seccionActual === 'turnos'">
      <Turnos />
    </div>
  </div>
</template>
