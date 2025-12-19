// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false }, // Desabilitar em produção
  
  // Nitro config FORÇANDO Node.js runtime
  nitro: {
    preset: 'vercel',
    experimental: {
      wasm: false
    },
    // FORÇAR Node.js runtime para TUDO
    vercel: {
      functions: {
        '.output/server/**/*.mjs': {
          runtime: 'nodejs20.x'
        }
      }
    },
    // Otimizações críticas para reduzir bundle
    minify: true,
    sourceMap: false,
    // Desabilitar Edge Functions completamente
    routeRules: {
      '/api/**': { 
        isr: false,
        prerender: false,
        headers: { 'cache-control': 's-maxage=0' }
      }
    }
  },
  
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

  // Vite config otimizado
  vite: {
    server: {
      watch: {
        usePolling: true
      }
    },
    build: {
      // Otimizações críticas para reduzir bundle
      rollupOptions: {
        output: {
          manualChunks: {
            // Separar dependências pesadas
            'pdf-libs': ['jspdf', 'jspdf-autotable', 'html2canvas'],
            'excel-libs': ['xlsx'],
            'email-libs': ['nodemailer'],
            'supabase': ['@supabase/supabase-js']
          }
        }
      },
      // Reduzir tamanho do bundle
      chunkSizeWarningLimit: 1000,
      sourcemap: false
    },
    optimizeDeps: {
      // Pré-bundling de dependências pesadas
      include: [
        '@supabase/supabase-js',
        'vue',
        'vue-router'
      ],
      exclude: [
        // Excluir libs pesadas do Edge Runtime
        'jspdf',
        'jspdf-autotable', 
        'html2canvas',
        'xlsx',
        'nodemailer'
      ]
    }
  },

  // Otimizações experimentais
  experimental: {
    payloadExtraction: false
  },

  // Build otimizado
  build: {
    transpile: ['@nuxtjs/supabase']
  }
})
