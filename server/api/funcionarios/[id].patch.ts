import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  try {
    console.log('✏️ Atualizando funcionário ID:', id)

    // Função para converter strings vazias em null
    const cleanValue = (value: any) => {
      if (value === '' || value === undefined) return null
      return value
    }

    // Construir objeto apenas com campos que foram enviados e são válidos
    const dadosParaAtualizar: any = {}

    // Campos obrigatórios - só atualiza se tiver valor válido
    if (body.nome_completo && body.nome_completo.trim()) {
      dadosParaAtualizar.nome_completo = body.nome_completo.trim()
    }
    
    if (body.cpf) {
      dadosParaAtualizar.cpf = body.cpf
    }
    
    if (body.email_login) {
      dadosParaAtualizar.email_login = body.email_login
    }

    // Campos opcionais
    if (body.rg !== undefined) dadosParaAtualizar.rg = cleanValue(body.rg)
    if (body.data_nascimento !== undefined) dadosParaAtualizar.data_nascimento = cleanValue(body.data_nascimento)
    if (body.sexo !== undefined) dadosParaAtualizar.sexo = cleanValue(body.sexo)
    if (body.telefone !== undefined) dadosParaAtualizar.telefone = cleanValue(body.telefone)
    if (body.email_pessoal !== undefined) dadosParaAtualizar.email_pessoal = cleanValue(body.email_pessoal)
    if (body.empresa_id !== undefined) dadosParaAtualizar.empresa_id = cleanValue(body.empresa_id)
    if (body.departamento_id !== undefined) dadosParaAtualizar.departamento_id = cleanValue(body.departamento_id)
    if (body.cargo_id !== undefined) dadosParaAtualizar.cargo_id = cleanValue(body.cargo_id)
    if (body.jornada_trabalho_id !== undefined) dadosParaAtualizar.jornada_trabalho_id = cleanValue(body.jornada_trabalho_id)
    if (body.responsavel_id !== undefined) dadosParaAtualizar.responsavel_id = cleanValue(body.responsavel_id)
    if (body.tipo_contrato !== undefined) dadosParaAtualizar.tipo_contrato = cleanValue(body.tipo_contrato)
    if (body.data_admissao !== undefined) dadosParaAtualizar.data_admissao = cleanValue(body.data_admissao)
    if (body.matricula !== undefined) dadosParaAtualizar.matricula = cleanValue(body.matricula)
    if (body.senha !== undefined) dadosParaAtualizar.senha = body.senha
    if (body.tipo_acesso !== undefined) dadosParaAtualizar.tipo_acesso = body.tipo_acesso || 'funcionario'
    if (body.status !== undefined) dadosParaAtualizar.status = body.status || 'ativo'
    if (body.salario_base !== undefined) dadosParaAtualizar.salario_base = cleanValue(body.salario_base) || 0
    if (body.numero_dependentes !== undefined) dadosParaAtualizar.numero_dependentes = cleanValue(body.numero_dependentes) || 0
    if (body.tipo_salario !== undefined) dadosParaAtualizar.tipo_salario = body.tipo_salario || 'mensal'
    if (body.banco !== undefined) dadosParaAtualizar.banco = cleanValue(body.banco)
    if (body.agencia !== undefined) dadosParaAtualizar.agencia = cleanValue(body.agencia)
    if (body.conta !== undefined) dadosParaAtualizar.conta = cleanValue(body.conta)
    if (body.tipo_conta !== undefined) dadosParaAtualizar.tipo_conta = cleanValue(body.tipo_conta)
    if (body.forma_pagamento !== undefined) dadosParaAtualizar.forma_pagamento = cleanValue(body.forma_pagamento)
    if (body.beneficios !== undefined) dadosParaAtualizar.beneficios = body.beneficios || null
    if (body.descontos_personalizados !== undefined) dadosParaAtualizar.descontos_personalizados = body.descontos_personalizados || null
    if (body.pis_pasep !== undefined) dadosParaAtualizar.pis_pasep = cleanValue(body.pis_pasep)

    console.log('📝 Campos a atualizar:', Object.keys(dadosParaAtualizar))

    // @ts-ignore - Supabase types issue with dynamic updates
    const { data, error } = await supabase
      .from('funcionarios')
      // @ts-ignore
      .update(dadosParaAtualizar as any)
      .eq('id', id as string)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao atualizar funcionário:', error)
      throw error
    }

    const funcionario = data as any

    console.log('✅ Funcionário atualizado:', funcionario?.id)

    return {
      success: true,
      data: funcionario
    }
  } catch (error: any) {
    console.error('❌ Erro:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao atualizar funcionário'
    })
  }
})
