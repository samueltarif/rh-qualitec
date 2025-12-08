<template>
  <UIButton
    theme="admin"
    variant="secondary"
    icon-left="heroicons:briefcase"
    @click="$emit('click')"
  >
    Cargos
  </UIButton>
</template>

<script setup lang="ts">
defineEmits<{
  'click': []
}>()
</script>
