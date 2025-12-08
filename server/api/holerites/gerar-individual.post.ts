import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const body = await readBody(event)

  const { colaborador_id, mes, ano } = body

  if (!colaborador_id || !mes || !ano) {
    throw createError({
      statusCode: 400,
      message: 'Colaborador, mês e ano são obrigatórios'
    })
  }

  try {
    // Buscar dados do colaborador com cargo e departamento
    const { data: colaborador, error: colaboradorError } = await client
      .from('colaboradores')
      .select(`
        *,
        cargo:cargos(nome),
        departamento:departamentos!colaboradores_departamento_id_fkey(nome)
      `)
      .eq('id', colaborador_id)
      .single()

    if (colaboradorError || !colaborador) {
      console.error('❌ Erro ao buscar colaborador:', colaboradorError)
      throw createError({
        statusCode: 404,
        message: 'Colaborador não encontrado'
      })
    }

    console.log('✅ Colaborador encontrado:', (colaborador as any).nome)

    // Calcular valores do holerite
    const colabData = colaborador as any
    const salarioBase = colabData.salario || 0
    
    // Calcular INSS progressivo
    const calcularINSS = (salario: number) => {
      const faixas = [
        { limite: 1412.00, aliquota: 0.075 },
        { limite: 2666.68, aliquota: 0.09 },
        { limite: 4000.03, aliquota: 0.12 },
        { limite: 7786.02, aliquota: 0.14 },
      ]

      let inss = 0
      let salarioRestante = salario

      for (let i = 0; i < faixas.length; i++) {
        const faixaAnterior = i > 0 ? faixas[i - 1].limite : 0
        const faixaAtual = faixas[i].limite
        const valorFaixa = Math.min(salarioRestante, faixaAtual - faixaAnterior)
        
        if (valorFaixa > 0) {
          inss += valorFaixa * faixas[i].aliquota
          salarioRestante -= valorFaixa
        }
        
        if (salarioRestante <= 0) break
      }

      return Math.min(inss, 908.85)
    }

    // Calcular IRRF progressivo
    const calcularIRRF = (salario: number, inss: number, dependentes: number) => {
      const deducaoPorDependente = 189.59
      const baseCalculo = salario - inss - (dependentes * deducaoPorDependente)

      if (baseCalculo <= 2259.20) return 0

      const faixas = [
        { limite: 2259.20, aliquota: 0, deducao: 0 },
        { limite: 2826.65, aliquota: 0.075, deducao: 169.44 },
        { limite: 3751.05, aliquota: 0.15, deducao: 381.44 },
        { limite: 4664.68, aliquota: 0.225, deducao: 662.77 },
        { limite: Infinity, aliquota: 0.275, deducao: 896.00 },
      ]

      for (const faixa of faixas) {
        if (baseCalculo <= faixa.limite) {
          return Math.max(0, baseCalculo * faixa.aliquota - faixa.deducao)
        }
      }

      return 0
    }

    const inss = calcularINSS(salarioBase)
    const irrf = calcularIRRF(salarioBase, inss, colabData.dependentes || 0)
    const fgts = salarioBase * 0.08
    const totalDescontos = inss + irrf
    const salarioLiquido = salarioBase - totalDescontos

    // Verificar se já existe holerite para este período
    const { data: holeristeExistente, error: holeriteError } = await client
      .from('holerites')
      .select('id')
      .eq('colaborador_id', colaborador_id)
      .eq('mes', mes)
      .eq('ano', ano)
      .eq('tipo', 'mensal')
      .maybeSingle()

    if (holeriteError) {
      console.error('⚠️ Erro ao buscar holerite existente:', holeriteError)
    }

    if (holeristeExistente) {
      // Atualizar holerite existente
      const holeristeData = holeristeExistente as any
      const colabData = colaborador as any
      const updateData: any = {
        nome_colaborador: colabData.nome || 'Não informado',
        cpf: colabData.cpf || '',
        cargo: colabData.cargo?.nome || 'Não informado',
        departamento: colabData.departamento?.nome || 'Não informado',
        salario_base: salarioBase,
        total_proventos: salarioBase,
        salario_bruto: salarioBase,
        inss,
        irrf,
        fgts,
        total_descontos: totalDescontos,
        salario_liquido: salarioLiquido,
        banco: colabData.banco || null,
        agencia: colabData.agencia || null,
        conta: colabData.conta || null,
        data_admissao: colabData.data_admissao || null,
        observacoes: `Salário Mensal - ${mes}/${ano}`,
        gerado_em: new Date().toISOString(),
      }

      console.log('📝 Atualizando holerite existente:', holeristeData.id)

      const { error: updateError } = await client
        .from('holerites')
        .update(updateData)
        .eq('id', holeristeData.id)

      if (updateError) {
        console.error('❌ Erro ao atualizar holerite:', updateError)
        throw createError({
          statusCode: 500,
          message: `Erro ao atualizar holerite: ${updateError.message}`
        })
      }

      console.log('✅ Holerite atualizado com sucesso')

      return {
        success: true,
        message: 'Holerite atualizado com sucesso',
        holerite_id: holeristeData.id,
        email: colabData.email
      }
    } else {
      // Criar novo holerite
      const colabData = colaborador as any
      const insertData: any = {
        colaborador_id,
        mes,
        ano,
        tipo: 'mensal',
        // Dados obrigatórios do colaborador
        nome_colaborador: colabData.nome || 'Não informado',
        cpf: colabData.cpf || '',
        cargo: colabData.cargo?.nome || 'Não informado',
        departamento: colabData.departamento?.nome || 'Não informado',
        // Valores
        salario_base: salarioBase,
        total_proventos: salarioBase,
        salario_bruto: salarioBase,
        inss,
        irrf,
        fgts,
        total_descontos: totalDescontos,
        salario_liquido: salarioLiquido,
        // Dados bancários
        banco: colabData.banco || null,
        agencia: colabData.agencia || null,
        conta: colabData.conta || null,
        // Informações adicionais
        data_admissao: colabData.data_admissao || null,
        observacoes: `Salário Mensal - ${mes}/${ano}`,
        status: 'gerado',
        gerado_em: new Date().toISOString(),
      }

      console.log('📝 Criando novo holerite com dados:', {
        nome: insertData.nome_colaborador,
        cpf: insertData.cpf,
        cargo: insertData.cargo,
        salario_bruto: insertData.salario_bruto,
      })

      // @ts-ignore
      const { data: novoHolerite, error: insertError } = await client
        .from('holerites')
        .insert(insertData)
        .select()
        .single()

      if (insertError) {
        console.error('❌ Erro ao inserir holerite:', insertError)
        throw createError({
          statusCode: 500,
          message: `Erro ao criar holerite: ${insertError.message}`
        })
      }

      const novoHoleriteData = novoHolerite as any

      console.log('✅ Holerite criado com sucesso:', novoHoleriteData.id)

      return {
        success: true,
        message: 'Holerite gerado com sucesso',
        holerite_id: novoHoleriteData.id,
        email: colabData.email
      }
    }
  } catch (error: any) {
    console.error('❌ Erro ao gerar holerite individual:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao gerar holerite'
    })
  }
})

