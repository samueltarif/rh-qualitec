<template>
  <div class="card mb-8">
    <h2 class="text-xl font-bold text-gray-800 mb-4">Ações Rápidas</h2>
    <div class="grid md:grid-cols-4 gap-4">
      <UIButton
        theme="employee"
        variant="primary"
        icon-left="heroicons:clock"
        full-width
        @click="$emit('registrar-ponto')"
      >
        Registrar Ponto
      </UIButton>
      
      <UIButton
        theme="employee"
        variant="secondary"
        icon-left="heroicons:calendar"
        full-width
        @click="$emit('solicitar-ferias')"
      >
        Solicitar Férias
      </UIButton>
      
      <UIButton
        theme="employee"
        variant="secondary"
        icon-left="heroicons:document-text"
        full-width
        @click="$emit('ver-holerite')"
      >
        Ver Holerite
      </UIButton>
      
      <UIButton
        theme="employee"
        variant="secondary"
        icon-left="heroicons:paper-airplane"
        full-width
        @click="$emit('nova-solicitacao')"
      >
        Nova Solicitação
      </UIButton>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  'registrar-ponto': []
  'solicitar-ferias': []
  'ver-holerite': []
  'nova-solicitacao': []
}>()
</script>
