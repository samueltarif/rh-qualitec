<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
// TEMPORÁRIO: Removido initAuth para debug do erro 500
// TODO: Reativar após corrigir problema de SSR

// Inicializar autenticação apenas no client-side
onMounted(async () => {
  try {
    if (process.client) {
      const { initAuth } = useAppAuth()
      await initAuth()
    }
  } catch (error) {
    console.error('Erro ao inicializar auth:', error)
  }
})
</script>
