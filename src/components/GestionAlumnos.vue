<template>
  <div class="alumnos-container">
    <h2>Gestión de Alumnos</h2>
   <div class="volver">
      <button @click="$router.push('/panel')">Volver al inicio</button>
    </div>
    <!--carga masiva solo admin-->
    <div v-if="esAdmin" class="carga-masiva">
      <h3>Carga Masiva</h3>
      <input type="file" @change="cargarArchivo" accept=".csv,.xlsx" />
    </div>
    <hr />
    <!--buscador de alumnos por nia o apellido o curso-->
    <div class="buscador">
      <input v-model="busquedaNIA" placeholder="buscar por NIA" />
      <input v-model="busquedaApellido" placeholder="buscar por apellido" />
      <input v-model="busquedaCurso" placeholder="buscar por curso" />
    </div>
    <hr />
    <!--el listado de alumnos-->
    <table>
      <thead>
        <tr>
          <th>NIA</th>
          <th>Nombre</th>
          <th>Curso</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        <!--filtrar alumnos-->
        <tr v-for="a in alumnosFiltrados" :key="a.nia">
          <td>{{ a.nia }}</td>
          <td>{{ a.nombre }} {{ a.apellidos }}</td>
          <td>{{ obtenerNombreCurso(a.curso_id) }}</td>
          <td>{{ a.estado_id }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "GestionAlumnos",
  data() {
    return {
      user: {},
      alumnos: [],
      cursos: [],
      busquedaNIA: "",
      busquedaApellido: "",
      busquedaCurso: ""
    };
  },
  computed: {
    esAdmin() {
      return this.user?.rol === "Administrador";
    },
    //filtramos los alumnos 
    alumnosFiltrados() {
      return this.alumnos.filter(a =>
        (!this.busquedaNIA || a.nia.includes(this.busquedaNIA)) &&
        (!this.busquedaApellido || a.apellidos.toLowerCase().includes(this.busquedaApellido.toLowerCase())) &&
        (!this.busquedaCurso || a.curso_id.includes(this.busquedaCurso))
      );
    }
  },
  async mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    await this.cargarCursos();
    await this.cargarAlumnos();
  },
  methods: {
    authHeader() {
      return {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      };
    },
    async cargarAlumnos() {
      try {
        const res = await axios.get("http://44.207.19.239:3000/alumnos?zusuario=CHA5",this.authHeader());
        this.alumnos = [...res.data];
      } catch (error) {
        console.error("Error cargando alumnos:", error.response?.data);
      }
    },
    async cargarCursos() {
      try {
        const res = await axios.get("http://44.207.19.239:3000/cursos?zusuario=CHA5",this.authHeader());
             this.cursos = res.data;
      } catch (error) {
        console.error("Error cargando cursos:", error.response?.data);
      }
    },
    obtenerNombreCurso(id) {
      const curso = this.cursos.find(c => c.id === id);
      return curso ? curso.nombre_curso : id;
    },
    //metodo para hacer la carga masiva
    async cargarArchivo(event) {
//solo admin
      if (!this.esAdmin) {
        alert("solo el administrador puede realizar carga masiva");
        return;
      }
      const file = event.target.files[0];
      if (!file) 
      return;
      const formData = new FormData();
      formData.append("archivo", file);
      try {
        await axios.post("http://44.207.19.239:3000/alumnos/carga-masiva?zusuario=CHA5",formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
        alert("Carga masiva realizada correctamente");
        //cargar alumnos
        await this.cargarAlumnos();
      } catch (error) {
        console.error(error.response?.data);
        alert(error.response?.data?.mensaje || "Error en la carga masiva");
      }
    }
  }
};
</script>

<style>
.alumnos-container {
  padding: 40px;
  text-align: center;
}
.buscador input {
  margin: 5px;
  padding: 6px;
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
.carga-masiva {
  margin-bottom: 20px;
}
</style>