<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// Inicializar autenticação ao carregar a aplicação
const { initAuth } = useAppAuth()

onMounted(async () => {
  await initAuth()
})
</script>
