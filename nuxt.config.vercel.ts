// Configuração específica para Vercel - FORÇAR Node.js runtime
export default defineNuxtConfig({
  extends: './nuxt.config.ts',
  
  nitro: {
    preset: 'vercel',
    // FORÇAR Node.js runtime para evitar Edge Function
    vercel: {
      functions: {
        '.output/server/**/*.mjs': {
          runtime: 'nodejs20.x',
          maxDuration: 60
        }
      }
    },
    // Desabilitar completamente Edge Functions
    experimental: {
      wasm: false
    },
    minify: true,
    sourceMap: false,
    // Todas as rotas em Node.js
    routeRules: {
      '/**': { 
        isr: false,
        prerender: false 
      }
    }
  }
})