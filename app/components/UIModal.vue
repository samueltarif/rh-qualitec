<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div class="absolute inset-0 bg-black/50" @click="closeOnBackdrop && close()"></div>
      <div :class="modalClasses">
        <!-- Header Responsivo -->
        <div v-if="title || $slots.header" class="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-lg sm:rounded-t-xl z-10">
          <slot name="header">
            <h3 class="text-lg sm:text-xl font-bold text-gray-800 pr-2">{{ title }}</h3>
          </slot>
          <button v-if="showClose" class="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0" @click="close">
            <Icon name="heroicons:x-mark" size="20" class="sm:w-6 sm:h-6" />
          </button>
        </div>
        
        <!-- Body Responsivo -->
        <div class="p-4 sm:p-6 overflow-y-auto">
          <slot />
        </div>
        
        <!-- Footer Responsivo -->
        <div v-if="$slots.footer" class="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
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
  const base = 'relative bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col'
  const sizes = {
    sm: 'max-w-[95vw] sm:max-w-md',
    md: 'max-w-[95vw] sm:max-w-lg',
    lg: 'max-w-[95vw] sm:max-w-2xl',
    xl: 'max-w-[95vw] sm:max-w-4xl',
    full: 'max-w-[98vw] sm:max-w-6xl lg:max-w-7xl',
  }
  return [base, sizes[props.size]].join(' ')
})

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>
