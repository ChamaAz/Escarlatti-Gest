<template>
  <div class="profesores-container">

    <h2>Gestión de Profesores</h2>
    <div class="volver">
      <button @click="$router.push('/panel')">
        Volver al inicio
      </button>
    </div>
    <!--nuestro formulario para crear un prof-->
    <div class="formulario">
      <input v-model="nuevo.dni_nie" placeholder="DNI" />
      <input v-model="nuevo.nombre" placeholder="Nombre" />
      <input v-model="nuevo.apellidos" placeholder="Apellidos" />
      <input v-model="nuevo.correo_institucional" placeholder="Correo Institucional" />

      <!--aqui en vez de eleger el id q no sabemos cual es ponemos un desplegable para ver los deppartamentos q hay -->
      <select v-model="nuevo.departamento_id">
        <option disabled value="">Seleccione departamento</option>
        <option v-for="d in departamentos" :key="d.id" :value="d.id">
          {{ d.nombre }}
        </option>
      </select>
      <!--al clickiar se crea el profesor-->
      <button @click="crearProfesor">
        Crear Profesor
      </button>
    </div>
    <hr />
    <!--mostramos en la tabla los profesores q hay en la
     base de datos y al momento de crear un prof se actualiza la tabla-->
    <table>
      <thead>
        <tr>
          <th>DNI</th>
          <th>Nombre</th>
          <th>Correo</th>
          <th>Departamento</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <!--un for para sacar toda la informaciion la nueva y la que esta registrada -->
        <!--muestra campos credos no todos-->
        <tr v-for="p in profesores" :key="p.dni_nie">
          <td>{{ p.dni_nie }}</td>
          <td>{{ p.nombre }} {{ p.apellidos }}</td>
          <td>{{ p.correo_institucional }}</td>
          <!--dame los nombres de los departamentos q existen-->
          <td>{{ obtenerNombreDepartamento(p.departamento_id) }}</td>
          <td>
            <!--si queremos eliminar algun prof pero hay condeciones-->
            <button @click="eliminarProfesor(p)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import axios from "axios";
export default {
  name: "GestionProfesores",
  data() {
    return {
      user: {},
      profesores: [],
      departamentos: [],
      nuevo: {
      dni_nie: "",
      nombre: "",
      apellidos: "",
      correo_institucional: "",
      departamento_id: ""
      }
    };
  },
  async mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
       //si el rol es destento a administrador no puede hacer nada osea no tiene permisos
    if (this.user?.rol !== "Administrador") {
      alert("No tiene permisos.");
      this.$router.push("/panel");
      return;
    }
    //cargamos la base de datos
    await this.cargarDepartamentos();
    await this.cargarProfesores();
  },
  methods: {
    authHeader() {
      return {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      };
    },
    //cargar datos
    async cargarProfesores() {
      try {
        const res = await axios.get("http://44.207.19.239:3000/profesores?zusuario=CHA5",this.authHeader());
        this.profesores = [...res.data];
      } catch (error) {
        console.error("Error cargando profesores:", error.response?.data);
      }
    },
    //cargar
    async cargarDepartamentos() {
      try {
        const res = await axios.get("http://44.207.19.239:3000/departamentos?zusuario=CHA5",this.authHeader());
        this.departamentos = res.data;
      } catch (error) {
        console.error("Error cargando departamentos:", error.response?.data);
      }
    },
    //para mostrar los departamentos q hay
    obtenerNombreDepartamento(id) {
      const dep = this.departamentos.find(d => d.id === id);
      return dep ? dep.nombre : id;
    },
    //si elgun campo esta vacio no se puede crearlo
    async crearProfesor() {
      if (!this.nuevo.dni_nie ||!this.nuevo.nombre ||!this.nuevo.apellidos ||!this.nuevo.correo_institucional ||!this.nuevo.departamento_id) {
        alert("Todos los campos son obligatorios.");
        return;
      }
      //no se puede crear un profesor ya existe su dni o su correo 
      const existe = this.profesores.some(p =>
        p.dni_nie.trim().toUpperCase()===this.nuevo.dni_nie.trim().toUpperCase() ||
        p.correo_institucional.trim().toLowerCase()===this.nuevo.correo_institucional.trim().toLowerCase()
      );
      //si el dni o correo existe fuera
      if (existe) {
        alert("Ya existe un profesor con ese DNI o correo.");
        return;
      }
      try {
        await axios.post("http://44.207.19.239:3000/profesores?zusuario=CHA5",
          {
            ...this.nuevo,
            rol_id: "PROF1",
            password_hash: this.nuevo.dni_nie,
            zfecha: new Date().toISOString(),
            zusuario: "CHA5"
          },
          this.authHeader()
        );
        //si el alumnos se crea correctamente muestra el alert con mensaje
        alert("Profesor creado correctamente");
        this.nuevo = {
        dni_nie: "",
        nombre: "",
        apellidos: "",
        correo_institucional: "",
        departamento_id: ""
        };
        //cargamos datos
        await this.cargarProfesores();
      } catch (error) {
        console.error(error.response?.data);
        alert("Error al crear profesor.");
      }
    },
    //nuestro metodo eliminar profe siempe pregunta por las reservas
    //si quieres eliminarlas o mantenerlas
    async eliminarProfesor(profesor) {
      const cancelarReservas = confirm("desea cancelar las reservas activas del profesor?\n\n" +
                                       "aceptar = cancelarlas\ncancelar = mantenerlas");
      //si no das a confirmar no puedes borrar nuestro profe
      if (!confirm("¿Seguro que desea eliminar el profesor?")) {
        return;
      }
      try {
        await axios.delete(
          `http://44.207.19.239:3000/profesores/${profesor.dni_nie}?zusuario=CHA5`,
          {
            ...this.authHeader(),
            data: {
            cancelarReservas,
            zfecha: new Date().toISOString(),
            zusuario: "CHA5"
            }
          }
        );
  //mensaje de confirmacion si todo ha ido bien
        alert("Profesor eliminado correctamente.");
        await this.cargarProfesores();
      } catch (error) {
        console.error(error.response?.data);
        alert("Error al eliminar profesor.");
      }
    }
  }
};
</script>
<style>
.profesores-container{
  padding: 40px;
  text-align: center;
}
.formulario input,.formulario select{
  margin: 5px;
  padding: 6px;
}
button{
  padding: 6px 10px;
  margin: 5px;
  cursor: pointer;
}
table{
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}
th, td{
  border: 1px solid #ccc;
  padding: 10px;
}
</style>