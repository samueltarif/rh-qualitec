<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="closeOnBackdrop && close()"></div>
      <div :class="modalClasses">
        <!-- Header -->
        <div v-if="title || $slots.header" class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <slot name="header">
            <h3 class="text-xl font-bold text-gray-800">{{ title }}</h3>
          </slot>
          <button v-if="showClose" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" @click="close">
            <Icon name="heroicons:x-mark" size="24" />
          </button>
        </div>
        
        <!-- Body -->
        <div class="p-6">
          <slot />
        </div>
        
        <!-- Footer -->
        <div v-if="$slots.footer" class="border-t border-gray-200 px-6 py-4">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showClose?: boolean
  closeOnBackdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showClose: true,
  closeOnBackdrop: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
}>()

const modalClasses = computed(() => {
  const base = 'relative bg-white rounded-xl shadow-xl mx-4 max-h-[90vh] overflow-y-auto'
  const sizes = {
    sm: 'w-full max-w-md',
    md: 'w-full max-w-lg',
    lg: 'w-full max-w-2xl',
    xl: 'w-full max-w-4xl',
    full: 'w-full max-w-6xl',
  }
  return [base, sizes[props.size]].join(' ')
})

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>
