<template>
  <UIButton
    :theme="theme"
    variant="outline"
    icon-left="heroicons:arrow-right-on-rectangle"
    :loading="isLoading"
    :class="className"
    @click="handleLogout"
  >
    {{ isLoading ? 'Saindo...' : 'Sair' }}
  </UIButton>
</template>

<script setup lang="ts">
interface Props {
  theme?: 'admin' | 'employee' | 'default'
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'default',
  className: ''
})

const { logout, isLoading } = useAppAuth()

const handleLogout = async () => {
  await logout()
}
</script>
