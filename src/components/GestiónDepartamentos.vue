<script setup>
import { ref, onMounted } from 'vue'
// Lista de departamentos
const departamentos = ref([])
// Profesores para validar borrado
const profesores = ref([])
// Nuevo departamento 
const nuevoDepartamento = ref({id: '',nombre: ''})
const modoEdicion = ref(false)
 //Cargar datos desde la APIs
const cargarDatos = async () => {
    try {
        const resDep = await fetch('http://100.52.46.68:3000/departamentos')
        departamentos.value = await resDep.json()
        const resProf = await fetch('http://100.52.46.68:3000/profesores')
        profesores.value = await resProf.json()
    } catch (error) {
        console.error("Error cargando datos:", error)
    }
}
 //Guardar departamento
const guardarDepartamento = async () => {
    try {
        if (!modoEdicion.value) {
            // Calcular ID manual
            const maxId = departamentos.value.length > 0
                ? Math.max(...departamentos.value.map(d => Number(d.id)))
                : 0
            nuevoDepartamento.value.id = (maxId + 1).toString()
            await fetch('http://100.52.46.68:3000/departamentos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoDepartamento.value)
            })
        } else {
            //actualizaramos departamento usamos para ello methodo PUT
            await fetch(`http://100.52.46.68:3000/departamentos/${nuevoDepartamento.value.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoDepartamento.value)
            })
            modoEdicion.value = false
        }

        nuevoDepartamento.value = { id: '', nombre: '' }
        cargarDatos()
    } catch (error) {
        alert("Error guardando departamento")
    }
}
//Borrar departamento
const borrarDepartamento = async (id) => {
    //validacion: no borrar si tiene profesores asociados
    const tieneProfesores = profesores.value.some(p => Number(p.departamento_id) === Number(id))
    if (tieneProfesores) {
        alert("No se puede eliminar: existen profesores asociados a este departamento.")
        return
    }
//el mensaje de conformacion 
    if (confirm("¿Eliminar departamento?")) {
        await fetch(`http://100.52.46.68:3000/departamentos/${id}`, { method: 'DELETE' })
        cargarDatos()
    }
}

 //Editar departamento

const editarDepartamento = (dep) => {nuevoDepartamento.value = { ...dep }
    modoEdicion.value = true
}
onMounted(cargarDatos)
</script>

<template>
<div>
    <h2>Gestión de Departamentos LA PARTE H10 </h2>
    <!-- FORMULARIO -->
    <form @submit.prevent="guardarDepartamento">
        <input v-model="nuevoDepartamento.nombre" placeholder="Nombre del Departamento" required>
        <button type="submit">{{ modoEdicion ? 'Actualizar' : 'Crear' }}</button>
    </form>
    <hr>
 <!--ACTUALIZAR LA TABLA--------------------------------------------------------------------------------------------- -->
    <!--  NUESTRA TABLA -->
    <table border="1">
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="d in departamentos" :key="d.id">
                <td>{{ d.id }}</td>
                <td>{{ d.nombre }}</td>
                <td>
                    <button @click="editarDepartamento(d)">Editar</button>
                    <button @click="borrarDepartamento(d.id)">Borrar</button>
                </td>
            </tr>
        </tbody>
    </table>
</div>
</template>
