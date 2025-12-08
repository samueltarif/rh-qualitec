import { serverSupabaseClient } from '#supabase/server'
import nodemailer from 'nodemailer'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const body = await readBody(event)

  const { colaborador_id, mes, ano, dados_temporarios } = body

  if (!colaborador_id || !mes || !ano) {
    throw createError({
      statusCode: 400,
      message: 'Colaborador, mês e ano são obrigatórios'
    })
  }

  try {
    // Buscar dados do colaborador
    const { data: colaborador, error: colaboradorError } = await client
      .from('colaboradores')
      .select('nome, email_corporativo, email_pessoal')
      .eq('id', colaborador_id)
      .single()

    if (colaboradorError || !colaborador) {
      throw createError({
        statusCode: 404,
        message: 'Colaborador não encontrado'
      })
    }

    const colabData = colaborador as any
    const emailDestino = colabData.email_corporativo || colabData.email_pessoal

    if (!emailDestino) {
      throw createError({
        statusCode: 400,
        message: 'Colaborador não possui email cadastrado'
      })
    }

    let holeriteData: any

    // Se recebeu dados temporários, usar eles
    if (dados_temporarios) {
      console.log('📧 Usando dados temporários para envio de email')
      holeriteData = dados_temporarios
    } else {
      // Caso contrário, buscar holerite salvo no banco
      console.log('📧 Buscando holerite salvo no banco')
      const { data: holerite, error: holeriteError } = await client
        .from('holerites')
        .select('*')
        .eq('colaborador_id', colaborador_id)
        .eq('mes', mes)
        .eq('ano', ano)
        .single()

      if (holeriteError || !holerite) {
        throw createError({
          statusCode: 404,
          message: 'Holerite não encontrado. Gere o holerite primeiro ou forneça os dados temporários.'
        })
      }

      holeriteData = holerite
    }

    // Buscar configuração de email
    const { data: configEmail } = await client
      .from('config_email_smtp')
      .select('*')
      .single()

    const configData = configEmail as any

    // Usar configuração do banco ou fallback para Gmail da Qualitec
    let transportConfig
    let remetenteNome = 'Sistema RH Qualitec'
    let remetenteEmail = process.env.GMAIL_EMAIL || 'qualitecinstrumentosdemedicao@gmail.com'

    if (configData && configData.smtp_host) {
      // Usar configuração do banco de dados
      transportConfig = {
        host: configData.smtp_host,
        port: configData.smtp_port,
        secure: configData.smtp_secure,
        auth: {
          user: configData.smtp_user,
          pass: configData.smtp_password,
        },
      }
      remetenteNome = configData.remetente_nome || remetenteNome
      remetenteEmail = configData.remetente_email || remetenteEmail
    } else {
      // Usar Gmail da Qualitec como fallback
      const gmailEmail = process.env.GMAIL_EMAIL
      const gmailPassword = process.env.GMAIL_APP_PASSWORD

      if (!gmailEmail || !gmailPassword) {
        throw createError({
          statusCode: 400,
          message: 'Configuração de email não encontrada. Configure o SMTP ou as variáveis de ambiente GMAIL_EMAIL e GMAIL_APP_PASSWORD.'
        })
      }

      transportConfig = {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: gmailEmail,
          pass: gmailPassword,
        },
      }
    }

    // Criar transporter
    const transporter = nodemailer.createTransport(transportConfig)

    // Formatar valores
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value || 0)
    }

    const nomeMes = (mes: number) => {
      const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                     'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
      return meses[mes - 1]
    }

    // Montar email HTML
    const htmlEmail = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .holerite-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .valor-destaque { font-size: 32px; font-weight: bold; color: #667eea; margin: 20px 0; }
          .linha { display: flex; justify-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .linha:last-child { border-bottom: none; }
          .label { color: #666; }
          .valor { font-weight: bold; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Holerite Disponível</h1>
            <p>${nomeMes(mes)}/${ano}</p>
          </div>
          <div class="content">
            <p>Olá, <strong>${colabData.nome}</strong>!</p>
            <p>Seu holerite referente a <strong>${nomeMes(mes)}/${ano}</strong> está disponível.</p>
            
            <div class="holerite-box">
              <h3 style="margin-top: 0; color: #667eea;">Resumo do Pagamento</h3>
              
              <div class="linha">
                <span class="label">Salário Base:</span>
                <span class="valor">${formatCurrency(holeriteData.salario_base)}</span>
              </div>
              
              <div class="linha">
                <span class="label">Total Proventos:</span>
                <span class="valor" style="color: green;">${formatCurrency(holeriteData.total_proventos)}</span>
              </div>
              
              <div class="linha">
                <span class="label">INSS:</span>
                <span class="valor" style="color: #e74c3c;">-${formatCurrency(holeriteData.inss)}</span>
              </div>
              
              <div class="linha">
                <span class="label">IRRF:</span>
                <span class="valor" style="color: #e74c3c;">-${formatCurrency(holeriteData.irrf)}</span>
              </div>
              
              <div class="linha">
                <span class="label">Total Descontos:</span>
                <span class="valor" style="color: #e74c3c;">-${formatCurrency(holeriteData.total_descontos)}</span>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #667eea;">
                <p style="margin: 0; color: #666;">Valor Líquido a Receber</p>
                <div class="valor-destaque">${formatCurrency(holeriteData.salario_liquido)}</div>
              </div>
            </div>
            
            <p style="margin-top: 30px;">Para visualizar o holerite completo, acesse o portal do funcionário.</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/employee" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Acessar Portal
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
            <p>© ${new Date().getFullYear()} - Sistema de RH</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Enviar email
    await transporter.sendMail({
      from: `"${remetenteNome}" <${remetenteEmail}>`,
      to: emailDestino,
      subject: `Holerite ${nomeMes(mes)}/${ano} - ${colabData.nome}`,
      html: htmlEmail,
    })

    return {
      success: true,
      message: `Holerite enviado para ${emailDestino}`,
      email: emailDestino
    }
  } catch (error: any) {
    console.error('Erro ao enviar holerite por email:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao enviar email'
    })
  }
})
