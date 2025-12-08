<template>
  <div class="space-y-4">
    <div class="grid md:grid-cols-2 gap-4">
      <!-- Vale Transporte -->
      <div class="p-4 border border-gray-200 rounded-lg">
        <div class="flex items-center justify-between mb-3">
          <label class="font-medium text-gray-700">Vale Transporte (VT)</label>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" :checked="modelValue.recebe_vt" @change="update('recebe_vt', ($event.target as HTMLInputElement).checked)" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-700"></div>
          </label>
        </div>
        <div v-if="modelValue.recebe_vt">
          <label class="block text-sm text-gray-600 mb-1">Valor do VT</label>
          <UIInput :model-value="modelValue.valor_vt" @update:model-value="update('valor_vt', Number($event))" type="number" step="0.01" min="0" />
        </div>
      </div>
      <!-- Vale Alimentação -->
      <div class="p-4 border border-gray-200 rounded-lg">
        <div class="flex items-center justify-between mb-3">
          <label class="font-medium text-gray-700">Vale Alimentação (VA)</label>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" :checked="modelValue.recebe_va" @change="update('recebe_va', ($event.target as HTMLInputElement).checked)" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-700"></div>
          </label>
        </div>
        <div v-if="modelValue.recebe_va">
          <label class="block text-sm text-gray-600 mb-1">Valor do VA</label>
          <UIInput :model-value="modelValue.valor_va" @update:model-value="update('valor_va', Number($event))" type="number" step="0.01" min="0" />
        </div>
      </div>
    </div>
    <div class="grid md:grid-cols-2 gap-4">
      <!-- Vale Refeição -->
      <div class="p-4 border border-gray-200 rounded-lg">
        <div class="flex items-center justify-between mb-3">
          <label class="font-medium text-gray-700">Vale Refeição (VR)</label>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" :checked="modelValue.recebe_vr" @change="update('recebe_vr', ($event.target as HTMLInputElement).checked)" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-700"></div>
          </label>
        </div>
        <div v-if="modelValue.recebe_vr">
          <label class="block text-sm text-gray-600 mb-1">Valor do VR</label>
          <UIInput :model-value="modelValue.valor_vr" @update:model-value="update('valor_vr', Number($event))" type="number" step="0.01" min="0" />
        </div>
      </div>
      <!-- VA/VR Combinado -->
      <div class="p-4 border border-gray-200 rounded-lg">
        <div class="flex items-center justify-between mb-3">
          <label class="font-medium text-gray-700">VA/VR Combinado</label>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" :checked="modelValue.recebe_va_vr" @change="update('recebe_va_vr', ($event.target as HTMLInputElement).checked)" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-700"></div>
          </label>
        </div>
        <div v-if="modelValue.recebe_va_vr">
          <label class="block text-sm text-gray-600 mb-1">Valor do VA/VR</label>
          <UIInput :model-value="modelValue.valor_va_vr" @update:model-value="update('valor_va_vr', Number($event))" type="number" step="0.01" min="0" />
        </div>
      </div>
    </div>
    <div class="grid md:grid-cols-2 gap-4">
      <!-- Plano de Saúde -->
      <div class="p-4 border border-gray-200 rounded-lg">
        <div class="flex items-center justify-between">
          <label class="font-medium text-gray-700">Plano de Saúde</label>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" :checked="modelValue.plano_saude" @change="update('plano_saude', ($event.target as HTMLInputElement).checked)" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-700"></div>
          </label>
        </div>
      </div>
      <!-- Plano Odontológico -->
      <div class="p-4 border border-gray-200 rounded-lg">
        <div class="flex items-center justify-between">
          <label class="font-medium text-gray-700">Plano Odontológico</label>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" :checked="modelValue.plano_odonto" @change="update('plano_odonto', ($event.target as HTMLInputElement).checked)" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-700"></div>
          </label>
        </div>
      </div>
    </div>
    <div class="p-4 border border-gray-200 rounded-lg">
      <div class="flex items-center justify-between">
        <div>
          <label class="font-medium text-gray-700">Desconto INSS Padrão</label>
          <p class="text-sm text-gray-500">Usar cálculo padrão de INSS</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" :checked="modelValue.desconto_inss_padrao" @change="update('desconto_inss_padrao', ($event.target as HTMLInputElement).checked)" class="sr-only peer">
          <div class="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-700"></div>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: Record<string, any> }>()
const emit = defineEmits<{ 'update:modelValue': [value: Record<string, any>] }>()

const update = (key: string, value: any) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>
