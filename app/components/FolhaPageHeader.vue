<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-8 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink to="/admin" class="w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center hover:bg-red-800 transition-colors">
            <Icon name="heroicons:arrow-left" class="text-white" size="20" />
          </NuxtLink>
          <div>
            <h1 class="text-xl font-bold text-gray-800">Folha de Pagamento</h1>
            <p class="text-sm text-gray-500">Calcular e visualizar folha mensal</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <UIButton 
            variant="secondary" 
            icon-left="heroicons:shield-check"
            @click="$emit('abrir-auditoria-inss')"
            title="Auditoria de Impostos - Verificar e corrigir divergências de INSS e IRRF"
          >
            Auditoria Impostos
          </UIButton>
          <UIButton 
            variant="secondary" 
            icon-left="heroicons:document-text"
            @click="$emit('gerenciar-holerites')"
          >
            Gerenciar Holerites
          </UIButton>
          <UserProfileDropdown theme="admin" />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits<{
  'gerenciar-holerites': []
  'abrir-auditoria-inss': []
}>()
</script>
