<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-4xl w-full">
      <!-- Card Principal -->
      <div class="card text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-4">
          Sistema RH Qualitec
        </h1>
        <p class="text-gray-600 mb-6">
          Teste de Configuração do Tailwind CSS
        </p>
        
        <!-- Badges de Status -->
        <div class="flex gap-2 justify-center mb-6">
          <span class="badge badge-success">✓ Tailwind CSS</span>
          <span class="badge badge-info">✓ Nuxt 4</span>
          <span class="badge badge-warning">✓ Supabase</span>
        </div>
      </div>

      <!-- Grid de Testes -->
      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <!-- Card Admin -->
        <div class="card bg-red-50 border-2 border-red-200">
          <div class="flex items-center gap-3 mb-4">
            <Icon name="heroicons:shield-check" class="text-red-700" size="32" />
            <h2 class="text-xl font-bold text-red-800">Área Admin</h2>
          </div>
          <p class="text-gray-700 mb-4">
            Interface administrativa com tema vermelho
          </p>
          <button class="admin-btn-primary w-full">
            Acessar Admin
          </button>
        </div>

        <!-- Card Employee -->
        <div class="card bg-blue-50 border-2 border-blue-200">
          <div class="flex items-center gap-3 mb-4">
            <Icon name="heroicons:user-circle" class="text-blue-900" size="32" />
            <h2 class="text-xl font-bold text-blue-900">Área Funcionário</h2>
          </div>
          <p class="text-gray-700 mb-4">
            Portal do funcionário com tema azul
          </p>
          <button class="employee-btn-primary w-full">
            Acessar Portal
          </button>
        </div>
      </div>

      <!-- Teste de Cores Customizadas -->
      <div class="card">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Cores Customizadas</h3>
        
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <!-- Admin Colors -->
          <div class="text-center">
            <div class="w-full h-16 bg-admin-primary rounded-lg mb-2"></div>
            <p class="text-sm text-gray-600">admin-primary</p>
          </div>
          <div class="text-center">
            <div class="w-full h-16 bg-admin-secondary rounded-lg mb-2"></div>
            <p class="text-sm text-gray-600">admin-secondary</p>
          </div>
          <div class="text-center">
            <div class="w-full h-16 bg-admin-accent rounded-lg mb-2"></div>
            <p class="text-sm text-gray-600">admin-accent</p>
          </div>
          
          <!-- Employee Colors -->
          <div class="text-center">
            <div class="w-full h-16 bg-employee-primary rounded-lg mb-2"></div>
            <p class="text-sm text-gray-600">employee-primary</p>
          </div>
          <div class="text-center">
            <div class="w-full h-16 bg-employee-secondary rounded-lg mb-2"></div>
            <p class="text-sm text-gray-600">employee-secondary</p>
          </div>
          <div class="text-center">
            <div class="w-full h-16 bg-employee-accent rounded-lg mb-2"></div>
            <p class="text-sm text-gray-600">employee-accent</p>
          </div>
        </div>
      </div>

      <!-- Teste de Ícones -->
      <div class="card mt-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Ícones (Nuxt Icon)</h3>
        <div class="flex gap-6 justify-center items-center">
          <Icon name="heroicons:home" size="32" class="text-gray-600" />
          <Icon name="heroicons:user" size="32" class="text-gray-600" />
          <Icon name="heroicons:cog" size="32" class="text-gray-600" />
          <Icon name="heroicons:bell" size="32" class="text-gray-600" />
          <Icon name="heroicons:document-text" size="32" class="text-gray-600" />
          <Icon name="heroicons:calendar" size="32" class="text-gray-600" />
        </div>
      </div>

      <!-- Links de Teste -->
      <div class="card mt-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4 text-center">Testes de Configuração</h3>
        <div class="flex gap-4 justify-center">
          <NuxtLink to="/test-supabase" class="employee-btn-secondary">
            🔌 Testar Supabase
          </NuxtLink>
        </div>
      </div>

      <!-- Status -->
      <div class="text-center mt-8">
        <p class="text-sm text-gray-500">
          ✅ Tailwind CSS configurado e funcionando!
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Página de teste do Tailwind CSS
</script>
