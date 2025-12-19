/**
 * Configuração específica para build no Vercel
 * Otimizações para evitar erros FUNCTION_INVOCATION_FAILED
 */

export default {
  // Configurações de build otimizadas
  build: {
    // Reduzir tamanho do bundle
    extractCSS: true,
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },
  },
  
  // Configurações específicas do Nitro para Vercel
  nitro: {
    // Usar preset padrão do Vercel (Node.js)
    preset: 'vercel',
    
    // Configurações de runtime
    experimental: {
      wasm: false, // Desabilitar WASM para compatibilidade
    },
    
    // Otimizações de bundle
    minify: true,
    
    // Configurações de memória
    node: {
      // Aumentar limite de memória se necessário
      options: ['--max-old-space-size=1024']
    },
    
    // Configurações de timeout
    vercel: {
      functions: {
        maxDuration: 60, // 60 segundos máximo
      },
    },
  },
  
  // Configurações de CSS
  css: {
    // Otimizar CSS para produção
    extract: true,
  },
  
  // Configurações de TypeScript
  typescript: {
    // Verificação de tipos mais rápida
    typeCheck: false,
  },
}