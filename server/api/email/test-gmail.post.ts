/**
 * Endpoint para testar a configuração do Gmail
 * POST /api/email/test-gmail
 */
import { initializeEmailService, getEmailService } from '../../utils/email-service'

export default defineEventHandler(async (event) => {
  try {
    console.log('🧪 Testando configuração do Gmail...')

    // Inicializar serviço
    const inicializado = await initializeEmailService()
    
    if (!inicializado) {
      return {
        success: false,
        message: '❌ Falha ao inicializar serviço de e-mail',
        details: 'Verifique se as credenciais estão corretas no .env'
      }
    }

    // Obter serviço
    const emailService = await getEmailService()

    // Enviar e-mail de teste
    const config = useRuntimeConfig()
    const emailDestino = config.gmailEmail

    const sucesso = await emailService.enviar({
      destinatario: emailDestino,
      assunto: '✅ Teste de Configuração - RH Qualitec',
      corpo_html: `
        <h2>Teste de Configuração de E-mail</h2>
        <p>Se você recebeu este e-mail, a configuração do Gmail está funcionando corretamente!</p>
        <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Este é um e-mail automático de teste do sistema RH Qualitec.
        </p>
      `,
      corpo_texto: 'Teste de configuração de e-mail - Se você recebeu este e-mail, está funcionando!'
    })

    if (sucesso) {
      return {
        success: true,
        message: '✅ E-mail de teste enviado com sucesso!',
        details: `Verifique sua caixa de entrada em ${emailDestino}`,
        timestamp: new Date().toISOString()
      }
    } else {
      return {
        success: false,
        message: '❌ Erro ao enviar e-mail de teste',
        details: 'Verifique os logs do servidor para mais detalhes'
      }
    }
  } catch (error: any) {
    console.error('❌ Erro ao testar Gmail:', error)
    return {
      success: false,
      message: '❌ Erro ao testar configuração',
      error: error.message || 'Erro desconhecido'
    }
  }
})
