import { createRouter, createWebHistory } from "vue-router";

import Login from "../components/Login.vue";
import PanelAdmin from "../components/PanelAdmin.vue";
import Reservas from "@/components/Reservas.vue";
import Incidencias from "@/components/Incidencias.vue";
import ResolverIncidencias from "@/components/ResolverIncidencias.vue";

const routes = [
  { path: "/", component: Login },
  { path: "/panel", component: PanelAdmin },
  { path: "/reservas", component: Reservas },
  { path: "/incidencias", component: Incidencias },
  { path: "/resolver", component: ResolverIncidencias },
  { path: "/mantenimiento", component: () => import("@/components/Mantenimiento.vue") },
  { path: "/usuarios", component: () => import("@/components/GestionUsuarios.vue") },
  { path: "/profesores", component: () => import("@/components/GestionProfesores.vue") },
  { path: "/alumnos", component: () => import("@/components/GestionAlumnos.vue") }
];

const router = createRouter({
  history: createWebHistory("/EScarlatti-Gest/"),
  routes
});

export default router;