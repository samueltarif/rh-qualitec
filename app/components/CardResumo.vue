<template>
  <div 
    :class="[
      'rounded-lg p-4 transition-all hover:shadow-md',
      variantClasses[variant]
    ]"
  >
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium opacity-80">{{ titulo }}</p>
        <p class="text-3xl font-bold mt-1">{{ valor }}</p>
      </div>
      <div v-if="icone" :class="['rounded-full p-3', iconeBgClasses[variant]]">
        <component :is="icone" class="w-6 h-6" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  titulo: string
  valor: string | number
  variant?: 'blue' | 'green' | 'yellow' | 'red'
  icone?: any
}

withDefaults(defineProps<Props>(), {
  variant: 'blue'
})

const variantClasses = {
  blue: 'bg-blue-50 text-blue-900',
  green: 'bg-green-50 text-green-900',
  yellow: 'bg-yellow-50 text-yellow-900',
  red: 'bg-red-50 text-red-900'
}

const iconeBgClasses = {
  blue: 'bg-blue-100',
  green: 'bg-green-100',
  yellow: 'bg-yellow-100',
  red: 'bg-red-100'
}
</script>
