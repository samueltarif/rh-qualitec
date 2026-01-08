// Configuração otimizada para Vercel FREE Plan
// Usa Node.js runtime (50MB limite) em vez de Edge Functions (1MB limite)

export default defineNuxtConfig({
  // ✅ MUDANÇA CRÍTICA: Node.js em vez de Edge
  nitro: {
    preset: 'vercel',
    // Força Node.js runtime para todas as funções
    vercel: {
      functions: {
        // Todas as APIs usam Node.js (50MB limite)
        'api/**': { runtime: 'nodejs20.x' },
        'server/**': { runtime: 'nodejs20.x' }
      }
    },
    // Otimizações de bundle
    minify: true,
    sourceMap: false,
    // Remove dependências desnecessárias do bundle
    externals: {
      inline: [
        // Mantém apenas essenciais inline
        '@nuxt/kit',
        'defu'
      ]
    }
  },

  // ✅ Otimizações de build
  build: {
    transpile: ['@headlessui/vue']
  },

  // ✅ Webpack otimizado
  webpack: {
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10
          }
        }
      }
    }
  },

  // ✅ CSS otimizado
  css: [
    '~/assets/css/tailwind.css'
  ],

  // ✅ Modules essenciais apenas
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/supabase',
    '@nuxt/icon'
  ],

  // ✅ Runtime config otimizado
  runtimeConfig: {
    // Server-side apenas
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    jwtSecret: process.env.JWT_SECRET,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    
    // Public (client-side)
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || 'https://rh-qualitec.vercel.app'
    }
  },

  // ✅ Supabase otimizado
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/']
    }
  },

  // ✅ Tailwind otimizado
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js'
  },

  // ✅ Configuração de ícones
  icon: {
    size: '24px',
    class: 'icon',
    aliases: {
      'nuxt': 'logos:nuxt-icon'
    }
  },

  // ✅ Otimizações de produção
  experimental: {
    payloadExtraction: false,
    inlineSSRStyles: false
  },

  // ✅ Compressão e minificação
  render: {
    compressor: { threshold: 0 }
  }
})