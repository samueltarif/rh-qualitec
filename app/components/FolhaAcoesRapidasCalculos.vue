<template>
  <div class="card bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <Icon name="heroicons:bolt" class="text-purple-700" size="24" />
      Ações Rápidas - Cálculos Especiais
    </h3>
    
    <div class="grid md:grid-cols-4 gap-4">
      <!-- Gerar Adiantamento -->
      <div class="bg-white rounded-lg p-4 border-2 border-emerald-200 hover:border-emerald-400 transition-all hover:shadow-md cursor-pointer">
        <div class="flex items-start gap-3">
          <div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="heroicons:banknotes" class="text-emerald-700" size="24" />
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-gray-800 mb-1">Adiantamento</h4>
            <p class="text-xs text-gray-600 mb-3">Gere adiantamento salarial (dia 20)</p>
            <UIButton 
              theme="admin" 
              variant="success" 
              size="sm"
              icon-left="heroicons:currency-dollar"
              class="w-full"
              @click="$emit('abrir-modal-adiantamento')"
            >
              Gerar Adiantamento
            </UIButton>
          </div>
        </div>
      </div>

      <!-- Gerar Férias -->
      <div class="bg-white rounded-lg p-4 border-2 border-green-200 hover:border-green-400 transition-all hover:shadow-md cursor-pointer">
        <div class="flex items-start gap-3">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="heroicons:sun" class="text-green-700" size="24" />
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-gray-800 mb-1">Gerar Férias</h4>
            <p class="text-xs text-gray-600 mb-3">Calcule férias individuais ou em lote</p>
            <NuxtLink to="/ferias">
              <UIButton 
                theme="admin" 
                variant="success" 
                size="sm"
                icon-left="heroicons:arrow-right"
                class="w-full"
              >
                Acessar Férias
              </UIButton>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Gerar 13º -->
      <div class="bg-white rounded-lg p-4 border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-md cursor-pointer">
        <div class="flex items-start gap-3">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="heroicons:gift" class="text-blue-700" size="24" />
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-gray-800 mb-1">Gerar 13º Salário</h4>
            <p class="text-xs text-gray-600 mb-3">Calcule 13º salário (1ª e 2ª parcela)</p>
            <UIButton 
              theme="admin" 
              variant="primary" 
              size="sm"
              icon-left="heroicons:calculator"
              class="w-full"
              @click="$emit('abrir-modal-13-salario')"
            >
              Calcular 13º
            </UIButton>
          </div>
        </div>
      </div>

      <!-- Simular Rescisão -->
      <div class="bg-white rounded-lg p-4 border-2 border-amber-200 hover:border-amber-400 transition-all hover:shadow-md cursor-pointer">
        <div class="flex items-start gap-3">
          <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="heroicons:document-minus" class="text-amber-700" size="24" />
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-gray-800 mb-1">Simular Rescisão</h4>
            <p class="text-xs text-gray-600 mb-3">Simule rescisão contratual</p>
            <UIButton 
              theme="admin" 
              variant="warning" 
              size="sm"
              icon-left="heroicons:calculator"
              class="w-full"
              @click="$emit('abrir-modal-rescisao')"
            >
              Simular Rescisão
            </UIButton>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 p-3 bg-purple-100 rounded-lg">
      <p class="text-xs text-purple-800 flex items-start gap-2">
        <Icon name="heroicons:information-circle" size="16" class="mt-0.5 flex-shrink-0" />
        <span>
          <strong>Dica:</strong> Use estas ferramentas para cálculos especiais além da folha mensal regular. 
          Férias, 13º salário e rescisões têm regras específicas de cálculo.
        </span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Emits para comunicação com o componente pai
defineEmits<{
  'abrir-modal-adiantamento': []
  'abrir-modal-13-salario': []
  'abrir-modal-rescisao': []
}>()
</script>
