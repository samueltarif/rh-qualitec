// Configuração Nuxt 3 estável para Vercel
export default defineNuxtConfig({
  // Configuração básica para Vercel
  nitro: {
    preset: 'vercel'
  },

  // Modules essenciais apenas
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/supabase'
  ],

  // CSS
  css: [
    '~/assets/css/tailwind.css'
  ],

  // Runtime config simplificado
  runtimeConfig: {
    // Server-side
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    
    // Public
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY
    }
  },

  // Supabase config
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/']
    }
  }
})