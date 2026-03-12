<template>
  <div class="usuarios-container">
      <div class="volver">
      <button @click="$router.push('/panel')">
        Volver al inicio
      </button>
    </div>
    <h2>Gestión de Usuarios</h2>
    <!--creamos nuestos usuarios-->
    <div class="form-crear">
      <h3>Crear Usuario</h3>
      <input v-model="nuevoUsuario.login" placeholder="Login" />
      <input type="password" v-model="nuevoUsuario.password" placeholder="Password" />
      <select v-model="nuevoUsuario.tipo">
        <option value="PROFESOR">Profesor</option>
        <option value="ALUMNO">Alumno</option>
      </select>
      <button @click="crearUsuario">Crear Usuario</button>
    </div>
    <!--mostramos la tabla de usuarios junto con su estado-->
    <table>
      <thead>
        <tr>
          <th>Login</th>
          <th>Rol</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in usuarios" :key="u.login">
          <td>{{ u.login }}</td>
          <td>
            <!--solo admin-->
            <select v-if="esAdmin" :value="u.rol_id" @change="cambiarRol(u, $event.target.value)">
              <option value="ADMIN1">Administrador</option>
              <option value="PROF1">Profesor</option>
              <option value="TIC2">Tecnico TIC</option>
              <option value="ALUM1">Alumno</option>
            </select>
            <span v-else>{{ u.rol_id }}</span>
          </td>
          <td>{{ u.estado_id }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "GestionUsuarios",

  data() {
    return {
      user: {},
      usuarios: [],
      //CA2
      nuevoUsuario: {
        login: "",
        password: "",
        tipo: "PROFESOR"
      }
    };
  },
  computed: {
    esAdmin() {
      return this.user.rol === "Administrador";
    }
  },
  async mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    //para mas seguridad extra
    if (!this.esAdmin) {
      alert("No tiene permisos.");
      this.$router.push("/panel");
      return;
    }

    await this.cargarUsuarios();
  },
  methods: {
    // metodo para carggar usuarios
    async cargarUsuarios() {
      try {
        const res = await axios.get("http://44.207.19.239:3000/usuarios?zusuario=CHA5",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
        this.usuarios = res.data;

      } catch (error) {
        console.error("ERROR CARGAR:", error.response?.data);
        alert("No se pudieron cargar los usuarios.");
      }
    },
    // CREAR USUARIO (CA2)
    async crearUsuario() {
      if (!this.nuevoUsuario.login || !this.nuevoUsuario.password) {
        alert("Complete todos los campos.");
        return;
      }

      //rol automatico segun el tipo
      let rolAsignado = "";
      if (this.nuevoUsuario.tipo === "PROFESOR") {
        rolAsignado = "PROF1";
      } else if (this.nuevoUsuario.tipo === "ALUMNO") {
        rolAsignado = "ALUM1";
      }
      try {
        //insertamos nuestros datos con estado activo claro
        await axios.post("http://44.207.19.239:3000/usuarios?zusuario=CHA5",
          {
            login: this.nuevoUsuario.login,
            password_hash: this.nuevoUsuario.password,
            rol_id: rolAsignado,
            estado_id: "ACT1",
            zfecha: new Date().toISOString(),
            zusuario: "CHA5"
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
        alert("Usuario creado correctamente.");

        //limpiamos nuestro formulario
        this.nuevoUsuario = {
          login: "",
          password: "",
          tipo: "PROFESOR"
        };

        await this.cargarUsuarios();

      } catch (error) {
        console.error("ERROR CREAR:", error.response?.data);
        alert("No se pudo crear el usuario.");
      }
    },
    //cambiar el rol el admin no puede cambiar su propio rol
    async cambiarRol(usuarioEditar, nuevoRol) {
      //admin no puede cambiar su propio rol
      if (usuarioEditar.login === this.user.usuario) {
        alert("No puede cambiar su propio rol");
        return;
      }
      //si el rol no es admin pues si editamos el rol 
      try {
        await axios.put(`http://44.207.19.239:3000/usuarios/${usuarioEditar.login}?zusuario=CHA5`,
          {
            ...usuarioEditar,
            rol_id: nuevoRol,
            zfecha: new Date().toISOString(),
            zusuario: "CHA5"
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
        alert("rol actualizado correctamente");

        await this.cargarUsuarios();

      } catch (error) {
        console.error("ERROR REAL:", error.response?.data);
        if (error.response?.status === 403) {
          alert("No tiene permisos");
        } else {
          alert("Error al cambiar rol.");
        }
      }
    }
  }
};
</script>

<style>
.usuarios-container {
  padding: 40px;
  text-align: center;
}
.form-crear {
  margin-bottom: 30px;
}
.form-crear input,
.form-crear select {
  display: block;
  margin: 10px auto;
  padding: 8px;
  width: 250px;
}
.form-crear button {
  padding: 8px 14px;
  cursor: pointer;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ccc;
  padding: 10px;
}
</style>