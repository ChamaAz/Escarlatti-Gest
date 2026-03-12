<template>
  <div class="cuadrante-container">
    <!--volvemos al inicio-->
    <div class="volver">
      <button @click="$router.push('/panel')">
        Volver al Panel
      </button>
    </div>
    <h2>Cuadrante de Reservas</h2>
    <!--filtros -->
    <div class="filtros">
      <div>
        <label>Fecha:</label>
        <input
          type="date"
          v-model="fechaSeleccionada"
          @change="cargarReservas"
        />
      </div>
      <div>
        <label>Turno:</label>
        <select v-model="turnoSeleccionado">
          <option value="D2">Mañana</option>
          <option value="T2">Tarde</option>
        </select>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Espacio</th>
          <th v-for="h in horariosFiltrados" :key="h.id">
            {{ h.nombre }}
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="e in espacios" :key="e.id">
          <td class="espacio">{{ e.nombre }}</td>
          <td
            v-for="h in horariosFiltrados"
            :key="h.id"
            :class="claseCelda(e.id, h.id)"
          >
            <!--si existe reserva -->
            <div v-if="buscarReserva(e.id, h.id)">
              {{ textoCelda(e.id, h.id) }}

              <button
                v-if="puedeBorrar(buscarReserva(e.id, h.id))"
                class="btn-borrar"
                @click.stop="borrarReserva(buscarReserva(e.id, h.id))"
              >
                X
              </button>
            </div>

            <!--si la reserva esta libre -->
            <div
              v-else
              class="clickable"
              @click="reservar(e.id, h.id)"
            >
              Libre
            </div>

          </td>
        </tr>
      </tbody>
    </table>

  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "CuadranteReservas",

  data() {
    return {
      espacios: [],
      horarios: [],
      reservas: [],
      fechaSeleccionada: new Date().toISOString().split("T")[0],
      turnoSeleccionado: "D2",
      user: {}
    };
  },
  computed: {
    horariosFiltrados() {
      return this.horarios
        .filter(h => h.turno_id === this.turnoSeleccionado)
        .sort((a, b) =>
          a.hora_inicio.localeCompare(b.hora_inicio)
        );
    }
  },
  async mounted() {
    try {

      this.user = JSON.parse(localStorage.getItem("user"));
//sacamos los urarios
      const esp = await axios.get(
        "http://44.207.19.239:3000/espacios?zusuario=CHA5"
      );
//sacamos lo horarios q hay
      const hor = await axios.get(
        "http://44.207.19.239:3000/horarios?zusuario=CHA5"
      );
      this.espacios = esp.data;
      this.horarios = hor.data;

      await this.cargarReservas();

    } catch (error) {
      console.error("Error cargando datos:", error.response?.data);
    }
  },
  methods: {
    async cargarReservas() {
      try {
     //cargar reservas 
        const res = await axios.get(
          "http://44.207.19.239:3000/reservas?zusuario=CHA5"
        );
        this.reservas = res.data.filter(
          r => r.fecha_reserva.startsWith(this.fechaSeleccionada)
        );

      } catch (error) {
        console.error("Error reservas:", error.response?.data);
      }
    },
//buscar las reservas 
    buscarReserva(espacioId, horarioId) {
      return this.reservas.find(
        r =>
          r.espacio_id === espacioId &&
          r.horario_id === horarioId &&
          r.fecha_reserva.startsWith(this.fechaSeleccionada)
      );
    },
    claseCelda(espacioId, horarioId) {
      const reserva = this.buscarReserva(espacioId, horarioId);
//si la fecha y el espacio son libre muestra LIBRE
      if (!reserva) 
      return "libre";
      if (reserva.usuario_login === this.user.usuario) {
        return "mia";
      }
      return "ocupado";
    },
    textoCelda(espacioId, horarioId) {
      const reserva = this.buscarReserva(espacioId, horarioId);
      if (!reserva) 
      return "Libre";
      if (reserva.usuario_login === this.user.usuario) {
        return "Tu reserva";
      }
      return `Ocupado (${reserva.usuario_login})`;
    },
    //reservar 
    async reservar(espacioId, horarioId) {
      //el alumno no puede hacer la reserva aunque esta controlado por rol 
      if (this.user.rol === "Alumno") {
        alert("Los alumnos no tienen permiso para realizar reservas");
        return;
      }

      //si la fecha y espacio estan reservados ya no puedes hacer tu reserva
      const existente = this.buscarReserva(espacioId, horarioId);
      if (existente) {
        alert("Conflicto de horario: ese espacio ya está reservado");
        return;
      }

      //si el espacio no esta operativo no te deja reservar
      const espacio = this.espacios.find(e => e.id === espacioId);
      if (!espacio || espacio.estado_operativo !== "true") {
        alert("Este espacio no está operativo.");
        return;
      }

      //es obligatorio indicar el motivo de la reserva y debbe tener al menos 10 caracteres
      const motivo = prompt("Introduce el motivo de la reserva");
      if (!motivo || motivo.trim().length < 10) {
        alert("El motivo debe tener al menos 10 caracteres");
        return;
      }
      try {
        //guardamos nuestra reserva en la base de datos
        await axios.post(
          "http://44.207.19.239:3000/reservas?zusuario=CHA5",
          {
            espacio_id: espacioId,
            horario_id: horarioId,
            usuario_login: this.user.usuario,
            fecha_reserva: this.fechaSeleccionada,
            motivo_reserva: motivo,
            zusuario: "CHA5"
          }
        );//cargar reservas
        await this.cargarReservas();
      } catch (error) {
        console.error("Error al reservar", error.response?.data);
        alert("No se pudo reservar");
      }
    },
    //si el usuario es admin puede borrar cualquiera reserva 
    //pero el profe y tic pueden borrar solo el suyo
    puedeBorrar(reserva) {
      if (this.user.rol === "Administrador") {
        return true;
      }
          if (
            (this.user.rol === "Profesor" || this.user.rol === "Tecnico TIC") &&
            reserva.usuario_login === this.user.usuario
          ) {
            return true;
          }

      return false;
    },
    //borrar una reserva
    async borrarReserva(reserva) {

      if (!confirm("¿Seguro que quieres borrar esta reserva?")) {
        return;
      }
          try {
            await axios.delete(
              `http://44.207.19.239:3000/reservas/${reserva.id}?zusuario=CHA5`
            );

            await this.cargarReservas();

          } catch (error) {
            console.error("Error al borrar:", error.response?.data);
            alert("No se pudo borrar la reserva.");
          }
    }
  }
};
</script>

<style>

.cuadrante-container {
  padding: 40px;
  text-align: center;
}

.volver {
  text-align: left;
  margin-bottom: 15px;
}

.volver button {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  background-color: #4e73df;
  color: white;
  cursor: pointer;
}

.volver button:hover {
  background-color: #2e59d9;
}

.filtros {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ccc;
  padding: 12px;
  transition: 0.2s;
}

.espacio {
  font-weight: bold;
}

.libre {
  background-color: #d4edda;
}

.clickable {
  cursor: pointer;
}

.libre:hover {
  background-color: #a9dfbf;
}

.ocupado {
  background-color: #f8d7da;
}

.mia {
  background-color: #ffeeba;
  font-weight: bold;
}

.btn-borrar {
  margin-left: 6px;
  border: none;
  background: red;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 6px;
}

.btn-borrar:hover {
  background: darkred;
}

</style>