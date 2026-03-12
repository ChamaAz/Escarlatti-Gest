<template>
  <div class="mantenimiento-container">
<!--para facilitar la navegacion puse este button-->
    <div class="volver">
      <button @click="$router.push('/panel')">
        Volver al inicio
      </button>
    </div>
<!--bouttones de mantenimiento-->
    <h1>Mantenimiento del Sistema</h1>
    <div class="menu">
      <button @click="$router.push('/usuarios')">Gestión de Usuarios</button>
      <button @click="$router.push('/profesores')">Gestión de Profesores</button>
      <button @click="$router.push('/alumnos')">Gestión de Alumnos</button>
      <!--estos dos botones no hacen nada porque no me ha dado tiempo a terminar-->
       <button>
        Gestión de Cursos
      </button>
      <button>
        Gestión de Espacios
      </button>
      <button>
        Gestión de Horarios
      </button>

    </div>
  </div>
</template>
<script>
export default {
  name: "MantenimientoView",
  mounted() {
    const user = JSON.parse(localStorage.getItem("user"));
    //mas seguridad si no es admin no va poder acceder
    if (!user || user.rol !== "Administrador") {
      alert("No tiene permisos.");
      this.$router.push("/panel");
    }
  }
};
</script>

<style>
.mantenimiento-container{
  padding: 40px;
  text-align: center;
}
.menu{
  margin-top: 30px;
}
.menu button{
  display: block;
  width: 300px;
  margin: 12px auto;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background-color: #4e73df;
  color: white;
  font-size: 16px;
  cursor: pointer;
}
.menu button:hover{
  background-color: #2e59d9;
}
.volver{
  text-align: left;
  margin-bottom: 20px;
}
.volver button {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  background-color: #6c757d;
  color: white;
  cursor: pointer;
}
</style>