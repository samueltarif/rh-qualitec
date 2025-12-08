<template>
  <UIButton
    type="submit"
    theme="employee"
    variant="primary"
    size="lg"
    :loading="isLoading"
    :disabled="disabled || isLoading"
    :icon-left="isLoading ? undefined : 'heroicons:arrow-right-on-rectangle'"
    full-width
    class="shadow-lg hover:shadow-xl"
  >
    {{ isLoading ? 'Entrando...' : 'Entrar' }}
  </UIButton>
</template>

<script setup lang="ts">
interface Props {
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  disabled: false
})

const { isLoading } = useAppAuth()
</script>
