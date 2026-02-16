<script setup>
import { ref, onMounted } from 'vue'

// Lista de espacios obtenidos del servidor
const espacios = ref([])

// Espacio que se está creando o editando
const nuevoEspacio = ref({
    id: '',
    nombre: '',
    ubicacion_planta: '',
    capacidad_max: 0,
    equipamiento: '',
    estado_operativo: 'true'
})

// Variable para saber si estamos editando
const modoEdicion = ref(false)


 //Cargar espacios desde la API

const cargarEspacios = async () => {
    try {
        const res = await fetch('http://100.52.46.68:3000/espacios')
        espacios.value = await res.json()
    } catch (error) {
        console.error("Error cargando espacios:", error)
    }
}


 //Cargar espacios desde la API
 //Guardar espacio (crear o actualizar)
const guardarEspacio = async () => {
    try {
        // Si NO estamos editando CREAR
        if (!modoEdicion.value) {
            // Generar ID manual
            const maxId = espacios.value.length > 0
                ? Math.max(...espacios.value.map(e => Number(e.id)))
                : 0
            nuevoEspacio.value.id = (maxId + 1).toString()
            await fetch('http://100.52.46.68:3000/espacios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoEspacio.value)
            })
        } else {
            //EDITAR POR ESTO USAMOS PUT
            await fetch(`http://100.52.46.68:3000/espacios/${nuevoEspacio.value.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoEspacio.value)
            })
            modoEdicion.value = false
        }
        //limpiamos el formulario
        nuevoEspacio.value = {
            id: '',
            nombre: '',
            ubicacion_planta: '',
            capacidad_max: 0,
            equipamiento: '',
            estado_operativo: 'true'
        }
        cargarEspacios()
    } catch (error) {
        alert("Error al guardar")
    }
}
// Cargar datos en el formulario para editar
const editarEspacio = (espacio) => {
    nuevoEspacio.value = { ...espacio }
    modoEdicion.value = true
}
 //Borrar el espacio
const borrarEspacio = async (id) => {
    //el mensaje de confirmacion
    if (confirm("¿Eliminar espacio?")) {

        await fetch(`http://100.52.46.68:3000/espacios/${id}`, {
            method: 'DELETE'
        })

        cargarEspacios()
    }
}
//cargar al iniciar
onMounted(cargarEspacios)
</script>
<template>
<div>
    <h2>Gestión de Espacios</h2>
    <!-- FORMULARIO -->
    <form @submit.prevent="guardarEspacio">
        <input v-model="nuevoEspacio.nombre" placeholder="Nombre" required />
        <input v-model="nuevoEspacio.ubicacion_planta" placeholder="Planta" required />
        <input type="number" v-model="nuevoEspacio.capacidad_max" placeholder="Capacidad" required />
        <select v-model="nuevoEspacio.estado_operativo">
            <option value="true">Operativo</option>
            <option value="false">No Operativo</option>
        </select>
        <button type="submit">
            {{ modoEdicion ? 'Actualizar' : 'Crear' }}
        </button>
    </form>
    <hr>
    <!-- TABLA -->
    <table border="1">
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Ubicación</th>
                <th>Capacidad</th>
                <th>Estado</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="espacio in espacios" :key="espacio.id">
                <td>{{ espacio.id }}</td>
                <td>{{ espacio.nombre }}</td>
                <td>{{ espacio.ubicacion_planta }}</td>
                <td>{{ espacio.capacidad_max }}</td>
                <td>
                    {{ espacio.estado_operativo === 'true' ? 'Operativo' : 'No operativo' }}
                </td>

                <td>
                    <button @click="editarEspacio(espacio)">Editar</button>
                    <button @click="borrarEspacio(espacio.id)">Borrar</button>
                </td>

            </tr>
        </tbody>

    </table>

</div>
</template>
