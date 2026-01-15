import { serverSupabaseServiceRole } from '#supabase/server'
import { enviarEmailCredenciais } from '../../utils/email'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event)
  const body = await readBody(event)

  try {
    const { funcionario_id } = body

    if (!funcionario_id) {
      throw new Error('ID do funcionário é obrigatório')
    }

    console.log('🔍 Buscando funcionário ID:', funcionario_id)

    // Buscar dados do funcionário usando service role (bypass RLS)
    const { data: funcionario, error }: any = await supabase
      .from('funcionarios')
      .select(`
        id,
        nome_completo,
        email_login,
        email_pessoal,
        senha,
        empresa_id,
        empresas:empresa_id(nome)
      `)
      .eq('id', funcionario_id)
      .single()

    if (error || !funcionario) {
      console.error('❌ Erro ao buscar funcionário:', error)
      throw new Error(`Funcionário não encontrado. ID: ${funcionario_id}`)
    }

    console.log('✅ Funcionário encontrado:', funcionario.nome_completo)

    // Validar se tem pelo menos um email e senha
    if ((!funcionario.email_login && !funcionario.email_pessoal) || !funcionario.senha) {
      throw new Error('Funcionário não possui email ou senha cadastrados')
    }

    // Coletar emails válidos
    const emails: string[] = []
    if (funcionario.email_login) emails.push(funcionario.email_login)
    if (funcionario.email_pessoal && funcionario.email_pessoal !== funcionario.email_login) {
      emails.push(funcionario.email_pessoal)
    }

    // Enviar email para todos os endereços
    const emailsEnviados: string[] = []
    const emailsFalhos: string[] = []

    for (const email of emails) {
      try {
        await enviarEmailCredenciais({
          para: email,
          nome: funcionario.nome_completo,
          login: funcionario.email_login,
          senha: funcionario.senha,
          empresa: funcionario.empresas?.nome || 'Sistema'
        })
        emailsEnviados.push(email)
        console.log('✅ Email enviado para:', email)
      } catch (err) {
        console.error('❌ Erro ao enviar para:', email, err)
        emailsFalhos.push(email)
      }
    }

    if (emailsEnviados.length === 0) {
      throw new Error('Não foi possível enviar o email para nenhum endereço')
    }

    return {
      success: true,
      message: `Credenciais enviadas para: ${emailsEnviados.join(', ')}`,
      emails_enviados: emailsEnviados,
      emails_falhos: emailsFalhos.length > 0 ? emailsFalhos : undefined
    }
  } catch (error: any) {
    console.error('❌ Erro ao enviar email:', error.message)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao enviar email'
    })
  }
})
