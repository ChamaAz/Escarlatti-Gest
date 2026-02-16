<script setup>
import { ref, onMounted } from 'vue'

// Lista de roles
const roles = ref([])
// Usuarios para validar borrado (si es necesario)
const usuarios = ref([])

// Nuevo rol o edición
const nuevoRol = ref({
    id: '',
    nombre: '',
    permiteAcceso: true // True = puede acceder, False = no puede
})

const modoEdicion = ref(false)

/**
 * Cargar datos
 */
const cargarDatos = async () => {
    try {
        const resRoles = await fetch('http://100.52.46.68:3000/roles')
        roles.value = await resRoles.json()

        const resUsuarios = await fetch('http://100.52.46.68:3000/usuarios')
        usuarios.value = await resUsuarios.json()
    } catch (error) {
        console.error("Error cargando datos:", error)
    }
}

/**
 * Guardar rol
 */
const guardarRol = async () => {
    try {
        if (!modoEdicion.value) {
            // Calcular ID
            const maxId = roles.value.length > 0
                ? Math.max(...roles.value.map(r => Number(r.id)))
                : 0
            nuevoRol.value.id = (maxId + 1).toString()

            await fetch('http://100.52.46.68:3000/roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoRol.value)
            })
        } else {
            // Actualizar rol
            await fetch(`http://100.52.46.68:3000/roles/${nuevoRol.value.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoRol.value)
            })
            modoEdicion.value = false
        }

        nuevoRol.value = { id: '', nombre: '', permiteAcceso: true }
        cargarDatos()
    } catch (error) {
        alert("Error guardando rol")
    }
}

/**
 * Borrar rol
 */
const borrarRol = async (id) => {
    // Validación: no borrar si hay usuarios asociados
    const tieneUsuarios = usuarios.value.some(u => Number(u.rol_id) === Number(id))
    if (tieneUsuarios) {
        alert("No se puede eliminar: existen usuarios con este rol.")
        return
    }

    if (confirm("¿Eliminar rol?")) {
        await fetch(`http://100.52.46.68:3000/roles/${id}`, { method: 'DELETE' })
        cargarDatos()
    }
}

/**
 * Editar rol
 */
const editarRol = (rol) => {
    nuevoRol.value = { ...rol }
    modoEdicion.value = true
}

onMounted(cargarDatos)
</script>

<template>
<div>
    <h2>Gestión de Roles de Usuario (H11)</h2>

    <!-- FORMULARIO -->
    <form @submit.prevent="guardarRol">
        <input v-model="nuevoRol.nombre" placeholder="Nombre del Rol" required>
        <label>
            <input type="checkbox" v-model="nuevoRol.permiteAcceso">
            Permite Acceso
        </label>
        <button type="submit">{{ modoEdicion ? 'Actualizar' : 'Crear' }}</button>
    </form>

    <hr>

    <!-- TABLA -->
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
            <tr v-for="r in roles" :key="r.id">
                <td>{{ r.id }}</td>
                <td>{{ r.nombre }}</td>
                <td>{{ r.permiteAcceso ? 'Sí' : 'No' }}</td>
                <td>
                    <button @click="editarRol(r)">Editar</button>
                    <button @click="borrarRol(r.id)">Borrar</button>
                </td>
            </tr>
        </tbody>
    </table>
</div>
</template>
