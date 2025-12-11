<template>
  <div 
    @click="navegar"
    class="block p-4 rounded-xl border transition-all group relative cursor-pointer hover:scale-105" 
    :class="classes"
  >
    <!-- Badge de notificação -->
    <span 
      v-if="badge && badge > 0" 
      class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse z-10"
    >
      {{ badge > 99 ? '99+' : badge }}
    </span>
    <Icon :name="icon" :class="iconClass" class="mb-2 group-hover:scale-110 transition-transform" size="28" />
    <p class="text-white font-medium text-sm">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  to: string
  icon: string
  label: string
  classes: string
  iconClass: string
  badge?: number
}

const props = defineProps<Props>()
const router = useRouter()

const navegar = async () => {
  console.log('Clicou no card:', props.label, '- Navegando para:', props.to)
  try {
    await navigateTo(props.to, { replace: false, external: false })
    console.log('Navegação concluída')
  } catch (error) {
    console.error('Erro ao navegar:', error)
  }
}
</script>
