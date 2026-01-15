<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar Desktop -->
    <LayoutSidebar :user="user" :is-admin="isAdmin" />

    <!-- Conteúdo Principal -->
    <div class="lg:pl-72">
      <!-- Header Mobile -->
      <header class="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div class="flex items-center justify-between px-4 py-3">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold">RH</span>
            </div>
            <span class="font-bold text-gray-800">Sistema RH</span>
          </div>
          <button 
            @click="mobileMenuOpen = true"
            class="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg class="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </header>

      <!-- Menu Mobile -->
      <LayoutMobileMenu 
        :open="mobileMenuOpen" 
        :user="user" 
        :is-admin="isAdmin"
        @close="mobileMenuOpen = false"
      />

      <!-- Conteúdo da Página -->
      <main class="p-4 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, isAdmin } = useAuth()
const mobileMenuOpen = ref(false)
</script>
