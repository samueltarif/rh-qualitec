<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <NuxtLink to="/admin" class="w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center hover:bg-red-800 transition-colors">
              <Icon name="heroicons:arrow-left" class="text-white" size="20" />
            </NuxtLink>
            <div>
              <h1 class="text-xl font-bold text-gray-800">Configurações do Sistema</h1>
              <p class="text-sm text-gray-500">Gerencie as configurações do RH Qualitec</p>
            </div>
          </div>
          <UserProfileDropdown theme="admin" />
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="max-w-7xl mx-auto p-8">
      <!-- Grid de Configurações -->
      <div class="grid md:grid-cols-2 gap-6">
        <ConfigCard
          v-for="section in sections"
          :key="section.id"
          :title="section.title"
          :description="section.description"
          :icon="section.icon"
          :color="section.color"
          @click="abrirSecao(section.id)"
        />
      </div>

      <!-- Informações do Sistema -->
      <SystemInfo class="mt-8" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: false,
})

const { sections, abrirSecao } = useConfiguracoes()
</script>
