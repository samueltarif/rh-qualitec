<script setup lang="ts">
// Redirecionar automaticamente para a página de admin
definePageMeta({
  middleware: 'auth'
})

// Redirecionar para admin
await navigateTo('/admin')
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
      <p class="text-gray-600">Carregando...</p>
    </div>
  </div>
</template>
