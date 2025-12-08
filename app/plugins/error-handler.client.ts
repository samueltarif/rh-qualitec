/**
 * Plugin global para captura de erros não tratados
 * Captura erros do Vue, Promise rejections e erros de runtime
 */

export default defineNuxtPlugin((nuxtApp) => {
  const { logError, showErrorNotification } = useErrorHandler()

  // Capturar erros do Vue
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    console.error('🔴 [VUE ERROR]', {
      error,
      component: instance?.$options?.name || 'Unknown',
      info,
    })

    logError(error, `Vue Error: ${info}`)
    
    // Não mostrar notificação para erros de desenvolvimento
    if (process.env.NODE_ENV !== 'development') {
      showErrorNotification(error, 'Erro na interface. Recarregue a página.')
    }
  }

  // Capturar Promise rejections não tratadas
  if (process.client) {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🔴 [UNHANDLED PROMISE]', event.reason)
      
      logError(event.reason, 'Unhandled Promise Rejection')
      
      // Prevenir erro padrão do navegador
      event.preventDefault()
      
      showErrorNotification(
        event.reason,
        'Erro ao processar operação. Tente novamente.'
      )
    })

    // Capturar erros de runtime
    window.addEventListener('error', (event) => {
      console.error('🔴 [RUNTIME ERROR]', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      })

      logError(event.error, 'Runtime Error')
    })
  }

  // Hook para erros de fetch
  nuxtApp.hook('app:error', (error) => {
    console.error('🔴 [APP ERROR]', error)
    logError(error, 'App Error')
  })

  console.log('✅ Error handler plugin initialized')
})
