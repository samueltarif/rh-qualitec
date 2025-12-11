<template>
  <div class="overflow-x-auto -mx-3 sm:mx-0 rounded-lg" style="-webkit-overflow-scrolling: touch;">
    <table class="w-full min-w-[600px] sm:min-w-0">
      <thead>
        <tr class="border-b border-gray-200 bg-gray-50">
          <th
            v-for="column in columns"
            :key="column.key"
            :class="[
              'px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap',
              column.align === 'center' && 'text-center',
              column.align === 'right' && 'text-right',
              column.width && `w-${column.width}`,
              column.hideOnMobile && 'hidden sm:table-cell',
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
          :class="{ 'cursor-pointer active:bg-gray-100': clickable }"
          @click="clickable && $emit('row-click', row)"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            :class="[
              'px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm',
              column.align === 'center' && 'text-center',
              column.align === 'right' && 'text-right',
              column.hideOnMobile && 'hidden sm:table-cell',
            ]"
          >
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
        <tr v-if="!data || data.length === 0">
          <td :colspan="columns.length" class="px-3 sm:px-4 py-6 sm:py-8 text-center text-gray-500">
            <slot name="empty">
              <div class="flex flex-col items-center gap-2">
                <Icon name="heroicons:inbox" class="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" />
                <span class="text-sm sm:text-base">{{ emptyText }}</span>
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
  hideOnMobile?: boolean
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
