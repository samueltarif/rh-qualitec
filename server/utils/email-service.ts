import nodemailer from 'nodemailer'

interface EmailConfig {
  servidor_smtp: string
  porta: number
  usuario_smtp: string
  senha_smtp: string
  email_remetente: string
  nome_remetente: string
  usa_ssl: boolean
  usa_tls: boolean
}

interface EmailData {
  destinatario: string
  assunto: string
  corpo_html: string
  corpo_texto?: string
  cc?: string[]
  bcc?: string[]
}

/**
 * Serviço para envio de e-mails
 */
export class EmailService {
  private transporter: any = null
  private config: EmailConfig | null = null

  /**
   * Inicializa o serviço com configurações SMTP
   */
  async initialize(config: EmailConfig) {
    this.config = config

    this.transporter = nodemailer.createTransport({
      host: config.servidor_smtp,
      port: config.porta,
      secure: config.usa_ssl, // true para 465, false para outros portos
      auth: {
        user: config.usuario_smtp,
        pass: config.senha_smtp
      },
      tls: {
        rejectUnauthorized: false // Para desenvolvimento
      }
    })

    // Testar conexão
    try {
      await this.transporter.verify()
      console.log('✅ Conexão SMTP verificada com sucesso')
      return true
    } catch (error) {
      console.error('❌ Erro ao verificar conexão SMTP:', error)
      return false
    }
  }

  /**
   * Envia um e-mail
   */
  async enviar(email: EmailData): Promise<boolean> {
    if (!this.transporter || !this.config) {
      console.error('❌ EmailService não inicializado')
      return false
    }

    try {
      const mailOptions = {
        from: `${this.config.nome_remetente} <${this.config.email_remetente}>`,
        to: email.destinatario,
        subject: email.assunto,
        html: email.corpo_html,
        text: email.corpo_texto || email.assunto,
        cc: email.cc?.join(','),
        bcc: email.bcc?.join(',')
      }

      const info = await this.transporter.sendMail(mailOptions)
      console.log('✅ E-mail enviado:', info.messageId)
      return true
    } catch (error) {
      console.error('❌ Erro ao enviar e-mail:', error)
      return false
    }
  }

  /**
   * Envia múltiplos e-mails
   */
  async enviarLote(emails: EmailData[]): Promise<number> {
    let enviados = 0

    for (const email of emails) {
      const sucesso = await this.enviar(email)
      if (sucesso) {
        enviados++
      }
      // Aguarda 1 segundo entre envios para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return enviados
  }

  /**
   * Processa variáveis no template
   */
  static processarTemplate(template: string, variaveis: Record<string, any>): string {
    let resultado = template

    for (const [chave, valor] of Object.entries(variaveis)) {
      const regex = new RegExp(`{{${chave}}}`, 'g')
      resultado = resultado.replace(regex, String(valor || ''))
    }

    return resultado
  }
}

// Instância global
let emailService: EmailService | null = null

/**
 * Obtém a instância do serviço de e-mail
 */
export async function getEmailService(): Promise<EmailService> {
  if (!emailService) {
    emailService = new EmailService()
  }
  return emailService
}

/**
 * Inicializa o serviço com configurações do banco ou .env
 */
export async function initializeEmailService() {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceKey = config.supabaseServiceKey

    if (!serviceKey) {
      console.warn('⚠️ Service key não configurada')
      return false
    }

    const headers = { 
      'Authorization': `Bearer ${serviceKey}`, 
      'apikey': serviceKey 
    }

    // Buscar primeira empresa
    const empresa = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/empresa?select=id&limit=1`,
      { headers }
    )

    if (!empresa || empresa.length === 0) {
      console.warn('⚠️ Nenhuma empresa encontrada')
      return false
    }

    // Tentar buscar configurações SMTP do banco
    let smtpConfig: EmailConfig | null = null
    
    try {
      const smtp = await $fetch<any[]>(
        `${supabaseUrl}/rest/v1/configuracoes_smtp?empresa_id=eq.${empresa[0].id}&select=*`,
        { headers }
      )

      if (smtp && smtp.length > 0 && smtp[0].ativo) {
        smtpConfig = smtp[0]
      }
    } catch (error) {
      console.warn('⚠️ Erro ao buscar SMTP do banco, tentando .env')
    }

    // Se não encontrou no banco, usar variáveis de ambiente
    if (!smtpConfig) {
      const gmailEmail = config.gmailEmail
      const gmailPassword = config.gmailAppPassword

      if (!gmailEmail || !gmailPassword) {
        console.warn('⚠️ SMTP não configurado no banco nem no .env')
        return false
      }

      smtpConfig = {
        servidor_smtp: 'smtp.gmail.com',
        porta: 587,
        usuario_smtp: gmailEmail,
        senha_smtp: gmailPassword,
        email_remetente: gmailEmail,
        nome_remetente: 'RH Qualitec',
        usa_ssl: false,
        usa_tls: true
      }

      console.log('✅ Usando configurações de Gmail do .env')
    }

    const service = await getEmailService()
    return await service.initialize(smtpConfig)
  } catch (error) {
    console.error('❌ Erro ao inicializar serviço de e-mail:', error)
    return false
  }
}
