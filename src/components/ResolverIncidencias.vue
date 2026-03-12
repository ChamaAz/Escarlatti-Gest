<template>
  <div class="incidencias-container">

    <!-- BOTÓN VOLVER -->
    <div class="volver">
      <button @click="$router.push('/panel')">
        Volver al Panel
      </button>
    </div>

    <h2>Resolver Incidencias</h2>

    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Espacio</th>
          <th>Descripción</th>
          <th>Estado</th>
          <th>Reportado por</th>
          <th>Responsable</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="i in incidencias" :key="i.id">

          <td>{{ i.id }}</td>
          <td>{{ i.espacio_id }}</td>
          <td>{{ i.descripcion_problema }}</td>
          <td>{{ i.estado_incidencia_id }}</td>
          <td>{{ i.usuario_login }}</td>
          <td>{{ i.responsable_resolucion_id || "-" }}</td>

          <td>

            <!-- PASAR A EN PROCESO -->
            <button
              v-if="i.estado_incidencia_id === 'ABIERTA'"
              @click="cambiarEstado(i, 'EN PROCESO')"
            >
              En Proceso
            </button>

            <!-- RESOLVER -->
            <button
              v-if="i.estado_incidencia_id === 'EN PROCESO'"
              @click="resolverIncidencia(i)"
            >
              Resolver
            </button>

          </td>

        </tr>
      </tbody>
    </table>

  </div>
</template>

<script>
import axios from "axios";

export default {

  name: "ResolverIncidencias",

  data() {
    return {
      user: {},
      incidencias: []
    };
  },

  async mounted() {

    this.user = JSON.parse(localStorage.getItem("user"));

    // Seguridad: solo TIC o ADMIN pueden entrar
    if (!["Tecnico TIC", "Administrador"].includes(this.user.rol)) {
      alert("No tiene permisos.");
      this.$router.push("/panel");
      return;
    }

    await this.cargarIncidencias();
  },

  methods: {

    authHeader() {
      return {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      };
    },

    async cargarIncidencias() {
      const res = await axios.get(
        "http://44.207.19.239:3000/incidencias?zusuario=CHA5",
        this.authHeader()
      );
      this.incidencias = res.data;
    },
    // CAMBIAR A EN PROCESO
    async cambiarEstado(incidencia, nuevoEstado) {
      try {
        await axios.put(
          `http://44.207.19.239:3000/incidencias/${incidencia.id}?zusuario=CHA5`,
          {
            ...incidencia,
            estado_incidencia_id: nuevoEstado,
            responsable_resolucion_id: this.user.usuario,
            zfecha: new Date().toISOString(),
            zusuario: "CHA5"
          },
          this.authHeader()
        );

        await this.cargarIncidencias();

      } catch (error) {
        alert("No tiene permisos para cambiar el estado.");
      }
    },
    // RESOLVER (CA3 obligatorio)
  async resolverIncidencia(incidencia) {
  const comentario = prompt("Comentario de resolución:");
  if (!comentario || comentario.trim().length === 0) {
    alert("Debe introducir comentario.");
    return;
  }
  try {

    const payload = {
      estado_incidencia_id: "RESUELTA",
      responsable_resolucion_id: this.user.usuario,
      comentarios_resolucion: comentario,
      fecha_resolucion: new Date().toISOString(),
      zfecha: new Date().toISOString(),
      zusuario: "CHA5"
    };

    await axios.put(
      `http://44.207.19.239:3000/incidencias/${incidencia.id}?zusuario=CHA5`,
      payload,
      this.authHeader()
    );

    await this.cargarIncidencias();

    alert("Incidencia resuelta correctamente.");

  } catch (error) {

    console.error("ERROR REAL:", error.response?.data);
    alert("El backend está bloqueando la resolución.");

  }
}

  }
};
</script>

<style scoped>
.incidencias-container {
  padding: 40px;
  text-align: center;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  border: 1px solid #ccc;
  padding: 10px;
}

button {
  padding: 5px 10px;
  margin: 2px;
  cursor: pointer;
}

.volver {
  text-align: left;
  margin-bottom: 15px;
}
</style>