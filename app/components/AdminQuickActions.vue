<template>
  <div class="card mb-8">
    <h2 class="text-xl font-bold text-gray-800 mb-4">Ações Rápidas</h2>
    <div class="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
      <UIButton
        theme="admin"
        variant="primary"
        icon-left="heroicons:users"
        full-width
        @click="$emit('colaboradores')"
      >
        Colaboradores
      </UIButton>

      <UIButton
        theme="admin"
        variant="secondary"
        icon-left="heroicons:building-office"
        full-width
        @click="$emit('departamentos')"
      >
        Departamentos
      </UIButton>

      <UIButton
        theme="admin"
        variant="secondary"
        icon-left="heroicons:briefcase"
        full-width
        @click="$emit('cargos')"
      >
        Cargos
      </UIButton>

      <UIButton
        theme="admin"
        variant="secondary"
        icon-left="heroicons:user-plus"
        full-width
        @click="$emit('novo-usuario')"
      >
        Usuários
      </UIButton>

      <UIButton
        theme="admin"
        variant="secondary"
        icon-left="heroicons:clipboard-document-list"
        full-width
        @click="$emit('documentos-rh')"
      >
        Documentos RH
      </UIButton>
      
      <UIButton
        theme="admin"
        variant="secondary"
        icon-left="heroicons:document-text"
        full-width
        @click="$emit('ver-logs')"
      >
        Ver Logs
      </UIButton>
      
      <UIButton
        theme="admin"
        variant="secondary"
        icon-left="heroicons:cog"
        full-width
        @click="$emit('configuracoes')"
      >
        Configurações
      </UIButton>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  'colaboradores': []
  'departamentos': []
  'cargos': []
  'novo-usuario': []
  'documentos-rh': []
  'ver-logs': []
  'configuracoes': []
}>()
</script>
