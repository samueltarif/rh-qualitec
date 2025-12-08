<template>
  <section class="space-y-4">
    <h3 class="font-semibold text-gray-700 border-b pb-2">Informações Básicas</h3>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Categoria <span class="text-red-500">*</span></label>
      <select v-model="form.categoria_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" :class="{ 'border-red-500 bg-red-50': erros.categoria_id }" required>
        <option value="">Selecione uma categoria...</option>
        <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nome }}</option>
      </select>
      <p v-if="erros.categoria_id" class="text-sm text-red-600 mt-1">{{ erros.categoria_id }}</p>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Tipo <span class="text-red-500">*</span></label>
      <input v-model="form.nome" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" :class="{ 'border-red-500 bg-red-50': erros.nome }" placeholder="Ex: Atestado Médico" required maxlength="200">
      <p v-if="erros.nome" class="text-sm text-red-600 mt-1">{{ erros.nome }}</p>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
      <textarea v-model="form.descricao" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none" placeholder="Breve descrição do tipo de documento" maxlength="500"></textarea>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  form: { categoria_id: string; nome: string; descricao: string }
  categorias: any[]
  erros: { categoria_id: string; nome: string }
}>()
</script>
