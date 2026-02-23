import { ref } from 'vue'

export const usuarioGlobal = ref(null)

export const loginUsuario = (datos) => {
  console.log('Datos login:', datos) // para depurar
  usuarioGlobal.value = datos
}

export const logoutUsuario = () => {
  usuarioGlobal.value = null
}