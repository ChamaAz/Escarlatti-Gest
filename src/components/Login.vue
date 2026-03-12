<template>
  <div class="login-container">
    <div class="login-card">
      <!--nuestro login-->
      <h2>Iniciar sesión</h2>
      <!--accedemos con el user y pass-->
      <form @submit.prevent="loginUser">
        <input v-model="usuario" placeholder="Usuario"/>
        <input type="password" v-model="password" placeholder="Contraseña"/>
        <button type="submit">Ingresar</button>
      </form>
      <!--si los datos erroneos te devuelve el error-->
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>
<script>
import axios from "axios";
export default {
  name: "LoginView",
  data() {
    //intentos para saber cuantos ha intendado un usuario iniciar sesion
    return {
      usuario: "",
      password: "",
      error: "",
      intentosFallidos: 0
    };
  },
  methods: {
    async loginUser() {
      this.error = "";
      try {
        const res = await axios.post("http://44.207.19.239:3000/auth/login",
          {
            login: this.usuario,
            password: this.password,
            zusuario: "CHA5"
          }
        );

        //si el estado es boloqueado no permite iniciar sesion
        if (res.data.estado_id === "BLOQ1") {
          this.error = "Cuenta bloqueada. Contacte con el administrador";
          return;
        }
        //gardamos datos del usuario
        localStorage.setItem(
          "user",
          JSON.stringify({
            usuario: res.data.usuario,
            rol: res.data.rol,
            estado_id: res.data.estado_id
          })
        );
        localStorage.setItem("token", res.data.token);
        this.intentosFallidos = 0;
        this.$router.push("/panel");
      } catch (err) {
        this.intentosFallidos++;

        if (this.intentosFallidos >= 3) {
          try {
            //si el usuario ha intentado 3 veces entrar con datos erroneos se bloquea el usuario
            await axios.put(
              `http://44.207.19.239:3000/usuarios/${this.usuario}?zusuario=CHA5`,
              {
                estado_id: "BLOQ1",
                zfecha: new Date().toISOString(),
                zusuario: "CHA5"
              }
            );
       //se edita el este usuario se confegura cono bloqueado
            this.error = "Cuenta bloqueada por 3 intentos fallidos";
          } catch (e) {
            console.error("Error bloqueando usuario:", e.response?.data);
          }
        } else {
          if (err.response) {
            this.error = err.response.data.error || "Credenciales incorrectas";
          } else {
            this.error = "No se pudo conectar con el servidor";
          }
        }
      }
    }
  }
};
</script>
<style>
.login-container { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  height: 100vh; 
  background: linear-gradient(135deg, #3a7bd5, #00d2ff); 
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
 /*tarjeta*/ 
 .login-card { 
  background: #f2f2f2; 
  padding: 40px 30px; 
  border-radius: 16px; 
  box-shadow: 0 10px 25px rgba(0,0,0,0.25); 
  width: 100%; 
  max-width: 500px; 
  text-align: center; 
}
/*titulo*/ 
.login-card h2 { 
  margin-bottom: 30px; 
  color: #333; 
  font-size: 28px; 
}
/*inputs*/ 
.login-card input { 
  display: block; 
  width: 95%; 
  margin: 15px auto; 
  padding: 14px; 
  border-radius: 10px; 
  border: 1px solid #ccc; 
  font-size: 16px; 
  transition: 0.3s;
}
.login-card input:focus { 
  border-color: #4e73df; 
  box-shadow: 0 0 6px rgba(78, 115, 223, 0.4); 
  outline: none; 
}
/*button*/ 
.login-card button { 
  margin-top: 20px; 
  width: 95%; 
  padding: 14px; 
  background: #4e73df; 
  color: white; 
  font-size: 18px; 
  border: none; 
  border-radius: 10px; 
  cursor: pointer; 
  transition: 0.3s; 
}
.login-card button:hover { 
  background: #2e59d9;
} 
/*error*/ 
.error { 
  color: rgb(231, 25, 25); 
  margin-top: 20px; 
  font-weight: bold; 
}
</style>
