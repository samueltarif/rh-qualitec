import { serverSupabaseClient } from '#supabase/server'
import { calcularIRRF as calcularIRRFComRedutor } from '../../utils/irrf-lei-15270-2025'

/**
 * API para gerar 13º salário
 * IRRF calculado conforme Lei 15.270/2025 (válida a partir de 01/01/2026)
 * 
 * REGRA ESPECIAL PARA 13º:
 * - 1ª parcela: sem IRRF (adiantamento)
 * - 2ª parcela/integral: IRRF sobre valor total, com redutor aplicado
 * - rendimentosTributaveisNoMes deve considerar salário + 13º + outras verbas
 */
export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  
  try {
    const body = await readBody(event).catch(() => {
      throw createError({
        statusCode: 400,
        message: 'Corpo da requisição inválido',
      })
    })

    const { colaboradores_ids, parcela, ano } = body

    if (!colaboradores_ids || !Array.isArray(colaboradores_ids) || colaboradores_ids.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'IDs dos colaboradores são obrigatórios'
      })
    }

    if (!parcela || !['1', '2', 'integral', 'completo'].includes(parcela)) {
      throw createError({
        statusCode: 400,
        message: 'Parcela inválida. Valores aceitos: 1, 2, integral, completo'
      })
    }

    const anoNum = parseInt(ano)
    if (!anoNum || anoNum < 2020 || anoNum > 2100) {
      throw createError({
        statusCode: 400,
        message: 'Ano inválido. Deve ser entre 2020 e 2100.'
      })
    }

    console.log(`🎄 [13º SALÁRIO] Iniciando geração - Parcela: ${parcela}, Ano: ${ano}, Colaboradores: ${colaboradores_ids.length}`)

    const supabase = await serverSupabaseClient(event)
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('[13º SALÁRIO] Erro de autenticação:', authError)
      throw createError({
        statusCode: 401,
        message: 'Não autenticado'
      })
    }

    let total_gerados = 0
    let total_erros = 0
    const erros: any[] = []

    // Processar cada colaborador individualmente
    for (const colaborador_id of colaboradores_ids) {
      try {
        // Buscar dados completos do colaborador com cargo e departamento
        const { data: colaborador, error: errorColab } = await supabase
          .from('colaboradores')
          .select(`
            *,
            cargo:cargos(nome),
            departamento:departamentos!colaboradores_departamento_id_fkey(nome)
          `)
          .eq('id', colaborador_id)
          .eq('status', 'Ativo')
          .single()

        if (errorColab || !colaborador) {
          console.error(`Erro ao buscar colaborador ${colaborador_id}:`, errorColab)
          throw new Error(`Colaborador ${colaborador_id} não encontrado ou inativo`)
        }

        // Calcular 13º salário
        const salarioBase = parseFloat((colaborador as any).salario || 0)
        const mesesTrabalhados = calcularMesesTrabalhados((colaborador as any).data_admissao, ano)
        const valor13Proporcional = (salarioBase / 12) * mesesTrabalhados

        // Definir quais parcelas gerar
        console.log(`\n${'='.repeat(60)}`)
        console.log(`🎯 COLABORADOR: ${(colaborador as any).nome}`)
        console.log(`🎯 Parcela selecionada: "${parcela}"`)
        console.log(`${'='.repeat(60)}`)
        
        let parcelasParaGerar: Array<'1' | '2' | 'integral'> = []
        
        if (parcela === 'completo') {
          // Gerar 1ª parcela, 2ª parcela E holerite mensal
          console.log('✅ Modo COMPLETO: Gerando 1ª + 2ª + mensal')
          parcelasParaGerar = ['1', '2']
        } else if (parcela === '1') {
          // Gerar APENAS 1ª parcela
          console.log('✅ Modo 1ª PARCELA: Gerando APENAS 1ª parcela')
          parcelasParaGerar = ['1']
        } else if (parcela === '2') {
          // Gerar APENAS 2ª parcela
          console.log('✅ Modo 2ª PARCELA: Gerando APENAS 2ª parcela')
          parcelasParaGerar = ['2']
        } else if (parcela === 'integral') {
          // Gerar APENAS integral
          console.log('✅ Modo INTEGRAL: Gerando APENAS integral')
          parcelasParaGerar = ['integral']
        }
        
        console.log(`📋 Parcelas a gerar: ${parcelasParaGerar.join(', ')}`)

        // Gerar cada parcela
        for (const parcelaAtual of parcelasParaGerar) {
          let valor13Parcela = 0
          let descontoINSS = 0
          let descontoIRRF = 0
          let totalProventos = 0
          let mesHolerite = 12 // Padrão dezembro

          console.log(`\n📌 Processando parcela: ${parcelaAtual}`)

          if (parcelaAtual === '1') {
            // 1ª Parcela: 50% sem descontos (paga em novembro)
            valor13Parcela = valor13Proporcional / 2
            totalProventos = valor13Parcela
            mesHolerite = 11 // Novembro
            console.log(`   📅 Mês: Novembro (${mesHolerite})`)
            console.log(`   💰 Valor: R$ ${valor13Parcela.toFixed(2)} (50% sem descontos)`)
          } else if (parcelaAtual === '2') {
            // 2ª Parcela: Valor total - 1ª parcela - descontos
            // Os descontos incidem sobre o valor TOTAL do 13º
            const valor13Total = valor13Proporcional
            const primeiraParcela = valor13Total / 2 // 50% pago na 1ª parcela
            
            // Calcular descontos sobre o valor total
            // IMPORTANTE: Para o redutor da Lei 15.270/2025, considerar rendimentos totais do mês
            // (salário mensal de dezembro + 13º + outras verbas tributáveis)
            const rendimentosTotaisMes = salarioBase + valor13Total // Salário + 13º
            descontoINSS = calcularINSS(valor13Total)
            descontoIRRF = calcularIRRF(valor13Total, descontoINSS, (colaborador as any).dependentes || 0, rendimentosTotaisMes)
            
            // 2ª Parcela = Valor restante (50%) - Descontos
            const valorRestante = valor13Total - primeiraParcela // 50% restante
            totalProventos = valorRestante
            valor13Parcela = valorRestante - descontoINSS - descontoIRRF
            mesHolerite = 12 // Dezembro
            console.log(`   📅 Mês: Dezembro (${mesHolerite})`)
            console.log(`   💰 13º Total: R$ ${valor13Total.toFixed(2)}`)
            console.log(`   💰 1ª Parcela (já paga): R$ ${primeiraParcela.toFixed(2)}`)
            console.log(`   💰 Valor restante (2ª parcela): R$ ${valorRestante.toFixed(2)}`)
            console.log(`   💳 INSS (sobre total): R$ ${descontoINSS.toFixed(2)}`)
            console.log(`   💳 IRRF (sobre total): R$ ${descontoIRRF.toFixed(2)}`)
            console.log(`   💰 Valor líquido: R$ ${valor13Parcela.toFixed(2)}`)
          } else {
            // Integral: 100% com descontos (pago de uma vez)
            totalProventos = valor13Proporcional
            // IMPORTANTE: Para o redutor da Lei 15.270/2025, considerar rendimentos totais do mês
            const rendimentosTotaisMes = salarioBase + valor13Proporcional // Salário + 13º
            descontoINSS = calcularINSS(valor13Proporcional)
            descontoIRRF = calcularIRRF(valor13Proporcional, descontoINSS, (colaborador as any).dependentes || 0, rendimentosTotaisMes)
            valor13Parcela = valor13Proporcional - descontoINSS - descontoIRRF
            mesHolerite = 12 // Dezembro
            console.log(`   📅 Mês: Dezembro (${mesHolerite})`)
            console.log(`   💰 Valor bruto: R$ ${totalProventos.toFixed(2)}`)
            console.log(`   💳 INSS: R$ ${descontoINSS.toFixed(2)}`)
            console.log(`   💳 IRRF: R$ ${descontoIRRF.toFixed(2)}`)
            console.log(`   💰 Valor líquido: R$ ${valor13Parcela.toFixed(2)}`)
          }

          const fgts = valor13Proporcional * 0.08

          // Preparar dados do holerite
          const holeriteData = {
            colaborador_id: colaborador_id,
            mes: mesHolerite,
            ano: ano,
            tipo: 'decimo_terceiro',
            parcela_13: parcelaAtual,
            
            // Dados do colaborador (obrigatórios)
            nome_colaborador: (colaborador as any).nome,
            cpf: (colaborador as any).cpf,
            cargo: (colaborador as any).cargo?.nome || 'Não informado',
            departamento: (colaborador as any).departamento?.nome || 'Não informado',
            
            // Valores
            salario_base: salarioBase,
            salario_bruto: valor13Proporcional,
            total_proventos: totalProventos,
            inss: descontoINSS,
            irrf: descontoIRRF,
            total_descontos: descontoINSS + descontoIRRF,
            salario_liquido: valor13Parcela,
            fgts: fgts,
            
            // Dados bancários
            banco: (colaborador as any).dados_bancarios?.banco || null,
            agencia: (colaborador as any).dados_bancarios?.agencia || null,
            conta: (colaborador as any).dados_bancarios?.conta || null,
            
            // Informações adicionais
            meses_trabalhados: mesesTrabalhados,
            data_admissao: (colaborador as any).data_admissao || null,
            observacoes: `13º Salário - ${parcelaAtual === '1' ? '1ª Parcela (Adiantamento)' : parcelaAtual === '2' ? '2ª Parcela (Com Descontos)' : 'Parcela Integral'} - ${ano}\n${mesesTrabalhados} ${mesesTrabalhados === 1 ? 'Mês Trabalhado' : 'Meses Trabalhados'}`,
            status: 'gerado'
          }

          // Verificar se já existe holerite de 13º para este período
          // A constraint é: colaborador_id + mes + ano + tipo + parcela_13
          const { data: holeriteExistente } = await supabase
            .from('holerites')
            .select('id')
            .eq('colaborador_id', colaborador_id)
            .eq('mes', mesHolerite)
            .eq('ano', ano)
            .eq('tipo', 'decimo_terceiro')
            .eq('parcela_13', parcelaAtual)
            .maybeSingle()

          if (holeriteExistente) {
            // Atualizar holerite existente
            const { error: errorUpdate } = await supabase
              .from('holerites')
              .update({
                nome_colaborador: holeriteData.nome_colaborador,
                cpf: holeriteData.cpf,
                cargo: holeriteData.cargo,
                departamento: holeriteData.departamento,
                salario_base: holeriteData.salario_base,
                salario_bruto: holeriteData.salario_bruto,
                total_proventos: holeriteData.total_proventos,
                inss: holeriteData.inss,
                irrf: holeriteData.irrf,
                total_descontos: holeriteData.total_descontos,
                salario_liquido: holeriteData.salario_liquido,
                fgts: holeriteData.fgts,
                banco: holeriteData.banco,
                agencia: holeriteData.agencia,
                conta: holeriteData.conta,
                meses_trabalhados: holeriteData.meses_trabalhados,
                observacoes: holeriteData.observacoes,
                updated_at: new Date().toISOString()
              })
              .eq('id', (holeriteExistente as any).id)

            if (errorUpdate) {
              console.error(`Erro ao atualizar holerite ${holeriteExistente.id}:`, errorUpdate)
              throw errorUpdate
            }
            console.log(`   ✅ Holerite ATUALIZADO (${parcelaAtual})`)
          } else {
            // Criar novo holerite
            const { error: errorInsert } = await supabase
              .from('holerites')
              .insert({
                ...holeriteData,
                created_at: new Date().toISOString()
              })

            if (errorInsert) {
              console.error(`Erro ao inserir holerite para colaborador ${colaborador_id}:`, errorInsert)
              throw errorInsert
            }
            console.log(`   ✅ Holerite CRIADO (${parcelaAtual})`)
          }

          total_gerados++
        }

        // Gerar holerite mensal de dezembro APENAS se parcela === 'completo'
        if (parcela === 'completo') {
          console.log(`\n📌 Processando parcela: MENSAL (Salário Normal de Dezembro)`)
          // Gerar holerite mensal de dezembro (salário mensal)
          const holeriteNormalData = {
            colaborador_id: colaborador_id,
            mes: 12,
            ano: ano,
            tipo: 'mensal',
            parcela_13: null,
            
            // Dados do colaborador
            nome_colaborador: (colaborador as any).nome,
            cpf: (colaborador as any).cpf,
            cargo: (colaborador as any).cargo?.nome || 'Não informado',
            departamento: (colaborador as any).departamento?.nome || 'Não informado',
            
            // Valores do salário mensal normal
            salario_base: salarioBase,
            salario_bruto: salarioBase,
            total_proventos: salarioBase,
            inss: calcularINSS(salarioBase),
            irrf: calcularIRRF(salarioBase, calcularINSS(salarioBase), (colaborador as any).dependentes || 0),
            total_descontos: calcularINSS(salarioBase) + calcularIRRF(salarioBase, calcularINSS(salarioBase), (colaborador as any).dependentes || 0),
            salario_liquido: salarioBase - calcularINSS(salarioBase) - calcularIRRF(salarioBase, calcularINSS(salarioBase), (colaborador as any).dependentes || 0),
            fgts: salarioBase * 0.08,
            
            // Dados bancários
            banco: (colaborador as any).dados_bancarios?.banco || null,
            agencia: (colaborador as any).dados_bancarios?.agencia || null,
            conta: (colaborador as any).dados_bancarios?.conta || null,
            
            // Informações adicionais
            data_admissao: (colaborador as any).data_admissao || null,
            observacoes: `Salário Mensal - Dezembro/${ano}`,
            status: 'gerado'
          }

          // Verificar se já existe holerite mensal de dezembro
          const { data: holeriteNormalExistente } = await supabase
            .from('holerites')
            .select('id')
            .eq('colaborador_id', colaborador_id)
            .eq('mes', 12)
            .eq('ano', ano)
            .eq('tipo', 'mensal')
            .maybeSingle()

          if (holeriteNormalExistente) {
            // Atualizar holerite existente
            const { error: errorUpdateNormal } = await supabase
              .from('holerites')
              .update({
                nome_colaborador: holeriteNormalData.nome_colaborador,
                cpf: holeriteNormalData.cpf,
                cargo: holeriteNormalData.cargo,
                departamento: holeriteNormalData.departamento,
                salario_base: holeriteNormalData.salario_base,
                salario_bruto: holeriteNormalData.salario_bruto,
                total_proventos: holeriteNormalData.total_proventos,
                inss: holeriteNormalData.inss,
                irrf: holeriteNormalData.irrf,
                total_descontos: holeriteNormalData.total_descontos,
                salario_liquido: holeriteNormalData.salario_liquido,
                fgts: holeriteNormalData.fgts,
                banco: holeriteNormalData.banco,
                agencia: holeriteNormalData.agencia,
                conta: holeriteNormalData.conta,
                observacoes: holeriteNormalData.observacoes,
                updated_at: new Date().toISOString()
              })
              .eq('id', holeriteNormalExistente.id)

            if (errorUpdateNormal) {
              console.error(`Erro ao atualizar holerite mensal para colaborador ${colaborador_id}:`, errorUpdateNormal)
            } else {
              console.log(`   ✅ Holerite ATUALIZADO (MENSAL)`)
              total_gerados++
            }
          } else {
            // Criar novo holerite mensal
            const { error: errorInsertNormal } = await supabase
              .from('holerites')
              .insert({
                ...holeriteNormalData,
                created_at: new Date().toISOString()
              })

            if (errorInsertNormal) {
              console.error(`Erro ao inserir holerite mensal para colaborador ${colaborador_id}:`, errorInsertNormal)
            } else {
              console.log(`   ✅ Holerite CRIADO (MENSAL)`)
              total_gerados++
            }
          }
        }

      } catch (error: any) {
        console.error(`Erro ao gerar 13º para colaborador ${colaborador_id}:`, error)
        total_erros++
        erros.push({
          colaborador_id,
          erro: error.message
        })
      }
    }

    // Resumo final
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📊 RESUMO FINAL DA GERAÇÃO`)
    console.log(`${'='.repeat(60)}`)
    console.log(`✅ Total de holerites gerados: ${total_gerados}`)
    console.log(`❌ Total de erros: ${total_erros}`)
    if (total_erros > 0) {
      console.log(`\n⚠️ Erros encontrados:`)
      erros.forEach(e => console.log(`   - Colaborador ${e.colaborador_id}: ${e.erro}`))
    }
    console.log(`${'='.repeat(60)}\n`)

    const duration = Date.now() - startTime
    console.log(`✅ [13º SALÁRIO] Concluído em ${duration}ms - ${total_gerados} gerados, ${total_erros} erros`)

    return {
      success: true,
      data: {
        total_gerados,
        total_erros,
        erros: total_erros > 0 ? erros : undefined
      }
    }
  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error(`❌ [13º SALÁRIO] Erro após ${duration}ms:`, error.message || error)
    
    // Se já é um erro do createError, apenas repassa
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao gerar 13º salário'
    })
  }
})

// Funções auxiliares
function calcularMesesTrabalhados(dataAdmissao: string, ano: number): number {
  // Garantir parse correto da data (formato ISO: YYYY-MM-DD)
  // Adiciona T00:00:00 para evitar problemas de timezone
  const admissao = new Date(dataAdmissao + 'T00:00:00')
  const anoAdmissao = admissao.getFullYear()
  const mesAdmissao = admissao.getMonth() + 1 // 1 = janeiro, 12 = dezembro
  const diaAdmissao = admissao.getDate()

  // Se foi admitido depois do ano em questão, não tem direito
  if (anoAdmissao > ano) return 0
  
  // Se foi admitido antes do ano em questão, trabalhou o ano todo
  if (anoAdmissao < ano) return 12

  // Trabalhou parte do ano - contar de mesAdmissao até dezembro
  // Regra CLT: se admitido até dia 15, conta o mês; se após dia 15, não conta
  // Exemplo: admitido em 01/08 = agosto a dezembro = 5 meses (12 - 8 + 1)
  // Exemplo: admitido em 20/08 = setembro a dezembro = 4 meses (12 - 8)
  if (diaAdmissao <= 15) {
    return 12 - mesAdmissao + 1
  } else {
    return 12 - mesAdmissao
  }
}

function calcularINSS(salarioBruto: number): number {
  // Tabela INSS 2025 - Cálculo progressivo
  const faixas = [
    { limite: 1412.00, aliquota: 0.075 },   // Até R$ 1.412,00 - 7,5%
    { limite: 2666.68, aliquota: 0.09 },    // De R$ 1.412,01 até R$ 2.666,68 - 9%
    { limite: 4000.03, aliquota: 0.12 },    // De R$ 2.666,69 até R$ 4.000,03 - 12%
    { limite: 7786.02, aliquota: 0.14 },    // De R$ 4.000,04 até R$ 7.786,02 - 14%
  ]

  let inss = 0
  let salarioRestante = salarioBruto

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

  // Teto do INSS 2025: R$ 908,85
  return Math.round(Math.min(inss, 908.85) * 100) / 100
}

/**
 * Calcula IRRF para 13º salário usando a função central com Lei 15.270/2025
 * 
 * @param salarioBruto - Valor do 13º (base de cálculo)
 * @param inss - INSS sobre o 13º
 * @param dependentes - Número de dependentes
 * @param rendimentosTotaisMes - Rendimentos totais do mês (salário + 13º + outras verbas)
 */
function calcularIRRF(
  salarioBruto: number, 
  inss: number, 
  dependentes: number,
  rendimentosTotaisMes?: number
): number {
  // Usar a função central que implementa a Lei 15.270/2025
  const resultado = calcularIRRFComRedutor(
    salarioBruto, 
    inss, 
    dependentes, 
    rendimentosTotaisMes ?? salarioBruto
  )
  return resultado.valor
}
