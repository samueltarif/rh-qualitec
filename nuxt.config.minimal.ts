// Configuração mínima para debug do erro 500
export default defineNuxtConfig({
  nitro: {
    preset: 'vercel'
  },
  modules: [],
  css: [],
  runtimeConfig: {
    public: {}
  }
})