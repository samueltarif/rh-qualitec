<template>
  <div class="relative" ref="dropdownRef">
    <!-- Avatar Button -->
    <button
      @click="toggleDropdown"
      class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      :class="{ 'bg-gray-100': isOpen }"
    >
      <!-- Avatar -->
      <div 
        class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
        :class="theme === 'admin' ? 'bg-red-700' : 'bg-blue-900'"
      >
        {{ initials }}
      </div>
      
      <!-- Nome e Email (desktop) -->
      <div class="hidden md:block text-left">
        <p class="text-sm font-semibold text-gray-800">{{ currentUser?.nome }}</p>
        <p class="text-xs text-gray-500">{{ currentUser?.email }}</p>
      </div>
      
      <!-- Chevron -->
      <Icon 
        name="heroicons:chevron-down" 
        class="text-gray-500 transition-transform"
        :class="{ 'rotate-180': isOpen }"
        size="20"
      />
    </button>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
      >
        <!-- Header do Dropdown -->
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <div 
              class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
              :class="theme === 'admin' ? 'bg-red-700' : 'bg-blue-900'"
            >
              {{ initials }}
            </div>
            <div class="flex-1">
              <p class="font-semibold text-gray-800">{{ currentUser?.nome }}</p>
              <p class="text-sm text-gray-500">{{ currentUser?.email }}</p>
            </div>
          </div>
        </div>

        <!-- Informações do Usuário -->
        <div class="p-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Role:</span>
            <span 
              class="badge"
              :class="theme === 'admin' ? 'badge-error' : 'badge-info'"
            >
              {{ currentUser?.role }}
            </span>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Status:</span>
            <span class="badge badge-success">
              {{ currentUser?.ativo ? 'Ativo' : 'Inativo' }}
            </span>
          </div>
          
          <div v-if="currentUser?.ultimo_acesso" class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Último acesso:</span>
            <span class="text-sm text-gray-800">
              {{ formatDate(currentUser.ultimo_acesso) }}
            </span>
          </div>
        </div>

        <!-- Ações -->
        <div class="p-4 border-t border-gray-200">
          <LogoutButton :theme="theme" class-name="w-full" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface Props {
  theme?: 'admin' | 'employee' | 'default'
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'default'
})

const { currentUser } = useAppAuth()
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement>()

// Iniciais do nome
const initials = computed(() => {
  if (!currentUser.value?.nome) return '?'
  
  const names = currentUser.value.nome.split(' ')
  if (names.length === 1) {
    return names[0].substring(0, 2).toUpperCase()
  }
  
  return (names[0][0] + names[names.length - 1][0]).toUpperCase()
})

// Toggle dropdown
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

// Fechar dropdown ao clicar fora
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

// Formatar data
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
