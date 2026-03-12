<template>
  <div class="panel-container">
    <div class="panel">
      <h1>Panel Principal</h1>
      <h2>Bienvenido: {{ user.usuario }}</h2>
      <h3>Rol: {{ user.rol }}</h3>
      <div class="menu">
        <h3>Menú</h3>
        <!--incidencias-->
        <button v-if="puedeIncidencias" @click="$router.push('/incidencias')">Gestión de Incidencias</button>
        <!--reservas Button-->
        <button v-if="puedeReservas" @click="$router.push('/reservas')"> Reservar Espacios</button>
        <!--resolver lo vean solo admin y tic-->
        <button v-if="puedeResolver" @click="$router.push('/resolver')">Resolver Incidencias</button>
        <!--mantenimiento solo admin -->
        <button v-if="esAdmin" @click="$router.push('/mantenimiento')">Mantenimiento</button>
      </div>
      <button class="logout" @click="logout">Cerrar sesión</button>
    </div>
  </div>
</template>
<script>
export default {
  name: "PanelAdmin",
  data() {
    return {
      user: {}
    };
  },
  computed: {
    esAdmin() {
      return this.user.rol === "Administrador";
    },
     //filtramos por con rol quien puede ver una funcionalidad o otra
    puedeIncidencias() {
      return ["Administrador", "Tecnico TIC", "Profesor", "Alumno"]
        .includes(this.user.rol);
    },
   //solo admin tic y profe q pueden reservar 
    puedeReservas() {
      return ["Administrador", "Tecnico TIC", "Profesor"]
        .includes(this.user.rol);
    },
//en resolver solo el tic t admin
    puedeResolver() {
      return ["Administrador", "Tecnico TIC"]
        .includes(this.user.rol);
    }
  },
  mounted() {
    const userStorage = localStorage.getItem("user");
    if (!userStorage) {
      this.$router.push("/");
      return;
    }
    this.user = JSON.parse(userStorage);
    console.log("USER PANEL:", this.user);
  },
  methods: {
    //cerrar
    logout() {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      this.$router.push("/");
    }
  }
};
</script>
<style scoped> 
.panel-container { 
  min-height: 100vh; 
  width: 100%; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  background: linear-gradient(135deg, #3a7bd5, #00d2ff); 
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; } 
  .panel { 
    background: white; 
    padding: 40px; 
    border-radius: 18px; 
    width: 90%; 
    max-width: 650px; 
    text-align: center; 
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15); } 
    .panel h1 { 
      margin-bottom: 20px; 
      color: #333; }
    .menu { 
      margin-top: 20px; } 
      .menu button { 
      width: 80%; 
      padding: 14px; 
      margin: 10px auto; 
      border: none; 
      border-radius: 10px; 
      font-size: 16px; 
      cursor: pointer; 
      background: #4e73df; 
      color: white; 
      transition: 0.3s; } 
      .menu button:hover { 
        background: #2e59d9; } 
      .logout {
      margin-top: 30px; 
      width: 80%; 
      padding: 14px; 
      border: none; 
      border-radius: 10px; 
      font-size: 16px; 
      cursor: pointer; 
      background: #e74a3b; 
      color: white; 
      transition: 0.3s; } 
      .logout:hover { 
        background: #c0392b;
         }
         
</style>