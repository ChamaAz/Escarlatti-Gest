<template>
  <div class="incidencias-container">
    <!--mejorar la navegacion entre las paginas ponemos un button para volver al inicio-->
    <div class="volver">
      <button @click="$router.push('/panel')">Volver al Inicio</button>
    </div>
    <h2>Gestión de Incidencias</h2>
    <!-- alumno  y profesor -->
     <!--el formulario para crear una incidencia-->
    <div v-if="puedeCrear" class="formulario">
      <h3>Nueva Incidencia</h3>
      <label>Espacio:</label>
      <select v-model="nuevaIncidencia.espacio_id">
        <option disabled value="">Seleccione espacio</option>
        <option v-for="e in espacios" :key="e.id" :value="e.id">
          {{ e.nombre }}
        </option>
      </select>
      <label>Descripcion:</label>
      <textarea v-model="nuevaIncidencia.descripcion_problema" placeholder="describe el problema porfavor"></textarea>
      <button @click="crearIncidencia">Crear Incidencia</button>
    </div>
    <!-- la lista de incidencias -->
    <h3>Listado de Incidencias</h3>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Espacio</th>
          <th>Descripción</th>
          <th>Estado</th>
          <th>Reportado por</th>
          <th v-if="esAdmin">Acciones</th><!--soolo si es admin-->
          <th v-if="esAdmin">Reasignar TIC</th><!--soolo si es admin-->
        </tr>
      </thead>
      <tbody>
        <tr v-for="i in incidenciasFiltradas" :key="i.id">
          <td>{{ i.id }}</td>
          <td>{{ i.espacio_id }}</td>
          <td>{{ i.descripcion_problema }}</td>
          <td>{{ i.estado_incidencia_id }}</td>
          <td>{{ i.usuario_login }}</td>
          <!--si puede borrar las incidencias solo si el usuario es admin-->
          <td v-if="esAdmin">
            <button @click="borrarIncidencia(i.id)">Borrar</button>
          </td>
          <!--para asignar una incidencia a un tic se puede hacer solo si el user es admin-->
          <td v-if="esAdmin">
            <select :value="i.responsable_resolucion_id" @change="reasignarTIC(i, $event.target.value)">
              <option disabled value="">Seleccionar TIC</option>
              <option v-for="u in usuariosTIC" :key="u.login" :value="u.login">
                {{ u.login }}
              </option>
            </select>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
//importamos la libreria 
import axios from "axios";
export default {
  name: "IncidenciasView",
  data() {
    return {
      user: {},
      incidencias: [],
      espacios: [],
      usuariosTIC: [],

      nuevaIncidencia: {
        espacio_id: "",
        descripcion_problema: ""
      }
    };
  },

  computed: {

    //quien puede crear una incidencia
    puedeCrear() {
      return this.user.rol === "Alumno" || this.user.rol === "Profesor";
    },
    esAdmin() {
      return this.user.rol === "Administrador";
    },
    //el alumno y el profe solo pueden ver sus incidencias
    incidenciasFiltradas() {
      if (this.puedeCrear) {
        return this.incidencias.filter(i => i.usuario_login === this.user.usuario);
      }
      return this.incidencias;
    }
  },
  async mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    await this.recargarDatos();
  },
  methods: {

    authHeader() {
      return {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      };
    },
     //ahora vamos a cargar datos desde servidor
    async recargarDatos() {
      const inc = await axios.get("http://44.207.19.239:3000/incidencias?zusuario=CHA5",this.authHeader());
      this.incidencias = inc.data;
      const esp = await axios.get("http://44.207.19.239:3000/espacios?zusuario=CHA5",this.authHeader());
      this.espacios = esp.data;
      const usuarios = await axios.get("http://44.207.19.239:3000/usuarios?zusuario=CHA5",this.authHeader());
      // Solo usuarios con rol TIC real
      this.usuariosTIC = usuarios.data.filter(u => u.rol_id === "TIC2");
    },
    //crear una incidencias
    async crearIncidencia() {
      if (!this.nuevaIncidencia.espacio_id) {
        alert("Seleccione un espacio.");
        return;
      }
      if (!this.nuevaIncidencia.descripcion_problema ||
          this.nuevaIncidencia.descripcion_problema.length < 10) {
        alert("La descripción debe tener mínimo 10 caracteres.");
        return;
      }
      await axios.post(
        "http://44.207.19.239:3000/incidencias?zusuario=CHA5",
        {
          espacio_id: this.nuevaIncidencia.espacio_id,
          usuario_login: this.user.usuario,
          descripcion_problema: this.nuevaIncidencia.descripcion_problema,
          estado_incidencia_id: "ABIERTA", //CA1
          responsable_resolucion_id: null,
          comentarios_resolucion: null,
          fecha_resolucion: null,
          zfecha: new Date().toISOString(), //CA2
          zusuario: "CHA5"//
        },
        this.authHeader()
      );

      this.nuevaIncidencia = {
        espacio_id: "",
        descripcion_problema: ""
      };

      await this.recargarDatos();
    },
    //solo el admin q se puede borar una incidencias
    async borrarIncidencia(id) {
    //
      if (!confirm("¿Seguro que desea borrar la incidencia?")) 
      return;

      await axios.delete(
        `http://44.207.19.239:3000/incidencias/${id}?zusuario=CHA5`,
        this.authHeader()
      );

      await this.recargarDatos();
    },
    // REASIGNAR TIC (ADMIN)
   async reasignarTIC(incidencia, nuevoTIC) {

  try {

    await axios.put(
      `http://44.207.19.239:3000/incidencias/${incidencia.id}?zusuario=CHA5`,
      {
        id: incidencia.id,
        espacio_id: incidencia.espacio_id,
        usuario_login: incidencia.usuario_login,
        descripcion_problema: incidencia.descripcion_problema,
        estado_incidencia_id: incidencia.estado_incidencia_id,

        responsable_resolucion_id: nuevoTIC,

        comentarios_resolucion: incidencia.comentarios_resolucion,
        fecha_resolucion: incidencia.fecha_resolucion,

        //IMPORTANTE
        zfecha: new Date().toISOString(),
        zusuario: "CHA5"
      },
      this.authHeader()
    );

    await this.recargarDatos();

  } catch (error) {
    console.error("ERROR REASIGNAR:", error.response?.data);
    alert("No tiene permisos para reasignar.");
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
 .formulario {
  margin-bottom: 30px; 
  } 
  select, textarea { 
    display: block; 
    width: 100%;
    margin-bottom: 10px; 
    padding: 6px; 
    } 
  textarea { 
      min-height: 80px; 
      } 
  table {     
  width: 100%; 
  border-collapse: collapse;
   } 
   th, td { 
    border: 1px solid #ccc; 
    padding: 10px; } 
    .volver { 
      text-align: left; 
      margin-bottom: 15px; 
      } 
      .volver button { 
  padding: 6px 12px; 
  background-color: #4e73df; 
  border: none; 
  color: white; 
  border-radius: 6px; 
  cursor: pointer; 
  } 
  button { 
  margin: 2px; 
  padding: 4px 8px; 
  cursor: pointer;
   } 
   </style>