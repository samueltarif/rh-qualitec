import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'ID do holerite não fornecido'
      })
    }

    // Construir objeto de atualização apenas com campos enviados
    const dadosParaAtualizar: any = {}

    // Campos editáveis
    if (body.salario_base !== undefined) dadosParaAtualizar.salario_base = body.salario_base
    if (body.bonus !== undefined) dadosParaAtualizar.bonus = body.bonus
    if (body.horas_extras !== undefined) dadosParaAtualizar.horas_extras = body.horas_extras
    if (body.adicional_noturno !== undefined) dadosParaAtualizar.adicional_noturno = body.adicional_noturno
    if (body.adicional_periculosidade !== undefined) dadosParaAtualizar.adicional_periculosidade = body.adicional_periculosidade
    if (body.adicional_insalubridade !== undefined) dadosParaAtualizar.adicional_insalubridade = body.adicional_insalubridade
    if (body.comissoes !== undefined) dadosParaAtualizar.comissoes = body.comissoes
    if (body.inss !== undefined) dadosParaAtualizar.inss = body.inss
    if (body.irrf !== undefined) dadosParaAtualizar.irrf = body.irrf
    if (body.vale_transporte !== undefined) dadosParaAtualizar.vale_transporte = body.vale_transporte
    if (body.cesta_basica_desconto !== undefined) dadosParaAtualizar.cesta_basica_desconto = body.cesta_basica_desconto
    if (body.plano_saude !== undefined) dadosParaAtualizar.plano_saude = body.plano_saude
    if (body.plano_odontologico !== undefined) dadosParaAtualizar.plano_odontologico = body.plano_odontologico
    if (body.adiantamento !== undefined) dadosParaAtualizar.adiantamento = body.adiantamento
    if (body.faltas !== undefined) dadosParaAtualizar.faltas = body.faltas
    if (body.horas_trabalhadas !== undefined) dadosParaAtualizar.horas_trabalhadas = body.horas_trabalhadas
    if (body.observacoes !== undefined) dadosParaAtualizar.observacoes = body.observacoes
    if (body.data_pagamento !== undefined) dadosParaAtualizar.data_pagamento = body.data_pagamento
    if (body.status !== undefined) dadosParaAtualizar.status = body.status

    if (Object.keys(dadosParaAtualizar).length === 0) {
      throw createError({
        statusCode: 400,
        message: 'Nenhum campo para atualizar'
      })
    }

    // CORREÇÃO: Recalcular totais se algum valor foi alterado
    const camposQueAfetamCalculo = [
      'salario_base', 'bonus', 'horas_extras', 'adicional_noturno', 
      'adicional_periculosidade', 'adicional_insalubridade', 'comissoes',
      'inss', 'irrf', 'vale_transporte', 'cesta_basica_desconto', 
      'plano_saude', 'plano_odontologico', 'adiantamento', 'faltas'
    ]

    const precisaRecalcular = camposQueAfetamCalculo.some(campo => dadosParaAtualizar[campo] !== undefined)

    if (precisaRecalcular) {
      // Buscar dados atuais do holerite para calcular totais
      const { data: holeriteAtual } = await supabase
        .from('holerites')
        .select('*')
        .eq('id', id)
        .single()

      if (holeriteAtual) {
        // Aplicar as alterações aos dados atuais
        const dadosAtualizados = { ...holeriteAtual, ...dadosParaAtualizar }

        // Calcular totais
        const totalProventos = 
          Number(dadosAtualizados.salario_base || 0) +
          Number(dadosAtualizados.bonus || 0) +
          Number(dadosAtualizados.horas_extras || 0) +
          Number(dadosAtualizados.adicional_noturno || 0) +
          Number(dadosAtualizados.adicional_periculosidade || 0) +
          Number(dadosAtualizados.adicional_insalubridade || 0) +
          Number(dadosAtualizados.comissoes || 0)

        const totalDescontos = 
          Number(dadosAtualizados.inss || 0) +
          Number(dadosAtualizados.irrf || 0) +
          Number(dadosAtualizados.vale_transporte || 0) +
          Number(dadosAtualizados.cesta_basica_desconto || 0) +
          Number(dadosAtualizados.plano_saude || 0) +
          Number(dadosAtualizados.plano_odontologico || 0) +
          Number(dadosAtualizados.adiantamento || 0) +
          Number(dadosAtualizados.faltas || 0)

        const salarioLiquido = totalProventos - totalDescontos

        // Adicionar os totais calculados aos dados para atualizar
        dadosParaAtualizar.total_proventos = totalProventos
        dadosParaAtualizar.total_descontos = totalDescontos
        dadosParaAtualizar.salario_liquido = salarioLiquido

        console.log('🧮 Recalculando totais do holerite:', {
          id,
          totalProventos,
          totalDescontos,
          salarioLiquido,
          adiantamento: dadosAtualizados.adiantamento
        })
      }
    }

    // @ts-ignore
    const { data, error } = await supabase
      .from('holerites')
      // @ts-ignore
      .update(dadosParaAtualizar)
      .eq('id', id)
      .select(`
        *,
        funcionario:funcionarios (
          nome_completo,
          cargo:cargos (nome),
          empresa:empresas (nome_fantasia)
        )
      `)
      .single()

    if (error) {
      console.error('Erro ao atualizar holerite:', error)
      throw error
    }

    return {
      success: true,
      data
    }

  } catch (error: any) {
    console.error('Erro ao atualizar holerite:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao atualizar holerite'
    })
  }
})
