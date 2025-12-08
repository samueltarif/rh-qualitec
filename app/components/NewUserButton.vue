<template>
  <UIButton
    theme="admin"
    variant="primary"
    icon-left="heroicons:user-plus"
    @click="$emit('click')"
  >
    Novo Usuário
  </UIButton>
</template>

<script setup lang="ts">
defineEmits<{
  'click': []
}>()
</script>
