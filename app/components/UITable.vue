<template>
  <div class="overflow-x-auto">
    <table class="w-full">
      <thead>
        <tr class="border-b border-gray-200">
          <th
            v-for="column in columns"
            :key="column.key"
            :class="[
              'px-4 py-3 text-left text-sm font-semibold text-gray-700',
              column.align === 'center' && 'text-center',
              column.align === 'right' && 'text-right',
              column.width && `w-${column.width}`,
            ]"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in data"
          :key="row.id || index"
          class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
          :class="{ 'cursor-pointer': clickable }"
          @click="clickable && $emit('row-click', row)"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            :class="[
              'px-4 py-3 text-sm',
              column.align === 'center' && 'text-center',
              column.align === 'right' && 'text-right',
            ]"
          >
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
        <tr v-if="!data || data.length === 0">
          <td :colspan="columns.length" class="px-4 py-8 text-center text-gray-500">
            <slot name="empty">
              <div class="flex flex-col items-center gap-2">
                <Icon name="heroicons:inbox" size="40" class="text-gray-300" />
                <span>{{ emptyText }}</span>
              </div>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
interface Column {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  width?: string
}

interface Props {
  columns: Column[]
  data: Record<string, any>[]
  clickable?: boolean
  emptyText?: string
}

withDefaults(defineProps<Props>(), {
  clickable: false,
  emptyText: 'Nenhum registro encontrado',
})

defineEmits<{
  'row-click': [row: Record<string, any>]
}>()
</script>
