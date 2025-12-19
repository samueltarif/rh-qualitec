<script setup lang="ts">
// Redirecionar automaticamente para a página de admin
onMounted(() => {
  navigateTo('/admin')
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="text-center">
      <!-- Logo Qualitec -->
      <div class="mb-8">
        <LogoQualitec :size="300" />
      </div>
      
      <!-- Loading -->
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600 text-lg">Carregando Sistema RH...</p>
      
      <!-- Versão -->
      <p class="text-gray-400 text-sm mt-4">v2025.1 - Nuxt 4 + Supabase</p>
    </div>
  </div>
</template>
