<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="modelValue" 
        class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        @click.self="closeOnBackdrop && $emit('update:modelValue', false)"
      >
        <div :class="['bg-white rounded-2xl w-full overflow-hidden', maxWidth, maxHeight]">
          <!-- Header -->
          <div class="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-800">{{ title }}</h2>
            <button 
              @click="$emit('update:modelValue', false)"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div :class="['overflow-y-auto', contentPadding]" :style="{ maxHeight: contentMaxHeight }">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="border-t p-6 flex justify-end gap-3">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title: string
  maxWidth?: string
  maxHeight?: string
  contentPadding?: string
  contentMaxHeight?: string
  closeOnBackdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: 'max-w-lg',
  maxHeight: 'max-h-[90vh]',
  contentPadding: 'p-6',
  contentMaxHeight: 'calc(90vh - 180px)',
  closeOnBackdrop: true
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
