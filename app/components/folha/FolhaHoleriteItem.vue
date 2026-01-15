<template>
  <div class="p-4 hover:bg-gray-50 transition-colors">
    <div class="flex flex-col lg:flex-row lg:items-center gap-4">
      <label class="flex items-center gap-4 flex-1 cursor-pointer">
        <input 
          type="checkbox" 
          :checked="selected"
          class="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          @change="$emit('toggle', holerite.id)"
        />
        <UiAvatar :name="holerite.funcionario" />
        <div>
          <p class="font-semibold text-gray-800">{{ holerite.funcionario }}</p>
          <p class="text-sm text-gray-500">{{ holerite.cargo }}</p>
        </div>
      </label>

      <div class="flex flex-wrap items-center gap-4 lg:gap-8">
        <div class="text-center">
          <p class="text-xs text-gray-500">Bruto</p>
          <p class="font-semibold">{{ formatarMoeda(holerite.bruto) }}</p>
        </div>
        <div class="text-center">
          <p class="text-xs text-gray-500">Descontos</p>
          <p class="font-semibold text-red-600">{{ formatarMoeda(holerite.descontos) }}</p>
        </div>
        <div class="text-center">
          <p class="text-xs text-gray-500">Líquido</p>
          <p class="font-bold text-green-600">{{ formatarMoeda(holerite.liquido) }}</p>
        </div>
        <UiBadge :variant="statusVariant">{{ holerite.status }}</UiBadge>
        <div class="flex gap-2">
          <UiButton variant="ghost" size="sm" @click="$emit('edit', holerite)">✏️</UiButton>
          <UiButton variant="ghost" size="sm" @click="$emit('email', holerite)">📧</UiButton>
          <UiButton variant="ghost" size="sm" @click="$emit('download', holerite)">📄</UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Holerite {
  id: number
  funcionario: string
  cargo: string
  bruto: number
  descontos: number
  liquido: number
  status: string
}

const props = defineProps<{
  holerite: Holerite
  selected: boolean
}>()

defineEmits<{
  toggle: [id: number]
  edit: [holerite: Holerite]
  email: [holerite: Holerite]
  download: [holerite: Holerite]
}>()

const formatarMoeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const statusVariant = computed(() => {
  const variants: Record<string, 'warning' | 'info' | 'success'> = {
    'Pendente': 'warning',
    'Enviado': 'info',
    'Pago': 'success'
  }
  return variants[props.holerite.status] || 'gray'
})
</script>
