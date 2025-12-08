// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    '@nuxt/icon'
  ],

  // Supabase Config
  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    redirect: false,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/login', '/'],
    },
    cookieOptions: {
      maxAge: 60 * 60 * 8, // 8 hours
      sameSite: 'lax',
      secure: false // set to true in production with HTTPS
    },
    clientOptions: {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      }
    }
  },

  // Runtime Config
  runtimeConfig: {
    // Variáveis privadas (server-side only)
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    
    // Gmail Configuration
    gmailEmail: process.env.GMAIL_EMAIL,
    gmailAppPassword: process.env.GMAIL_APP_PASSWORD,
    emailJobsToken: process.env.EMAIL_JOBS_TOKEN,
    
    // Variáveis públicas (expostas no client)
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    }
  },

  // CSS Global
  css: ['~/assets/css/tailwind.css'],

  // Vite config para Windows
  vite: {
    server: {
      watch: {
        usePolling: true
      }
    }
  }
})
