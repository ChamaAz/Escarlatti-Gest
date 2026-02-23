<script setup>
import { onMounted } from 'vue'
import { cargarUsuario } from './store.js'

onMounted(() => {
  cargarUsuario()
})
</script>

<template>
  <router-view />
</template>