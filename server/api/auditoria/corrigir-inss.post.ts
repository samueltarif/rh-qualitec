import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

/**
 * API para corrigir divergências de INSS entre módulos
 * Implementa cálculo oficial e gera auditoria
 */
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const userId = user?.sub || user?.id

  if (!user || !userId) {
    throw createError({
      statusCode: 401,
      message: 'Não autenticado',
    })
  }

  // Verificar se é admin
  const { data: userData } = await supabase
    .from('app_users')
    .select('id, role, email')
    .eq('auth_uid', userId)
    .single()

  if (!userData || userData.role !== 'admin') {
    throw createError({
      statusCode: 403,
      message: 'Acesso negado. Apenas administradores podem executar auditoria.',
    })
  }

  const body = await readBody(event)
  const { salario_bruto, colaborador_id, mes, ano } = body

  if (!salario_bruto || !colaborador_id) {
    throw createError({
      statusCode: 400,
      message: 'Salário bruto e ID do colaborador são obrigatórios',
    })
  }

  try {
    console.log(`\n${'='.repeat(80)}`)
    console.log('🔍 AUDITORIA DE INSS - CORREÇÃO DE DIVERGÊNCIAS')
    console.log(`${'='.repeat(80)}`)
    console.log(`👤 Colaborador ID: ${colaborador_id}`)
    console.log(`💰 Salário Bruto: R$ ${salario_bruto.toFixed(2)}`)
    console.log(`📅 Período: ${mes}/${ano}`)
    console.log(`🕐 Data/Hora: ${new Date().toLocaleString('pt-BR')}`)
    console.log(`${'='.repeat(80)}\n`)

    // FUNÇÃO OFICIAL DE CÁLCULO DE INSS (TABELA 2024)
    const calcularINSSOficial = (salarioBruto: number): { valor: number, detalhes: any[] } => {
      const faixas = [
        { limite: 1412.00, aliquota: 0.075, descricao: 'Até R$ 1.412,00 - 7,5%' },
        { limite: 2666.68, aliquota: 0.09, descricao: 'De R$ 1.412,01 até R$ 2.666,68 - 9%' },
        { limite: 4000.03, aliquota: 0.12, descricao: 'De R$ 2.666,69 até R$ 4.000,03 - 12%' },
        { limite: 7786.02, aliquota: 0.14, descricao: 'De R$ 4.000,04 até R$ 7.786,02 - 14%' },
      ]

      const teto = 908.85 // Teto INSS 2024
      let inss = 0
      let salarioRestante = salarioBruto
      const detalhes: any[] = []

      for (let i = 0; i < faixas.length; i++) {
        const faixaAnterior = i > 0 ? faixas[i - 1].limite : 0
        const faixaAtual = faixas[i].limite
        const valorFaixa = Math.min(salarioRestante, faixaAtual - faixaAnterior)
        
        if (valorFaixa > 0) {
          const contribuicaoFaixa = valorFaixa * faixas[i].aliquota
          inss += contribuicaoFaixa
          
          detalhes.push({
            faixa: i + 1,
            descricao: faixas[i].descricao,
            base_calculo: valorFaixa,
            aliquota: faixas[i].aliquota,
            valor_contribuicao: contribuicaoFaixa,
          })
          
          salarioRestante -= valorFaixa
        }
        
        if (salarioRestante <= 0) break
      }

      // Aplicar teto
      const inssComTeto = Math.min(inss, teto)
      const tetoAplicado = inss > teto

      if (tetoAplicado) {
        detalhes.push({
          observacao: `Teto INSS aplicado: R$ ${teto.toFixed(2)} (calculado: R$ ${inss.toFixed(2)})`,
        })
      }

      return {
        valor: parseFloat(inssComTeto.toFixed(2)),
        detalhes,
      }
    }

    // Calcular INSS oficial
    const inssOficial = calcularINSSOficial(parseFloat(salario_bruto))
    const valorCorreto = inssOficial.valor

    console.log('📊 CÁLCULO OFICIAL DO INSS:')
    console.log(`   💰 Valor Correto: R$ ${valorCorreto.toFixed(2)}`)
    console.log('   📋 Detalhes do Cálculo:')
    inssOficial.detalhes.forEach((detalhe, index) => {
      if (detalhe.observacao) {
        console.log(`      ⚠️  ${detalhe.observacao}`)
      } else {
        console.log(`      ${index + 1}. ${detalhe.descricao}`)
        console.log(`         Base: R$ ${detalhe.base_calculo.toFixed(2)} × ${(detalhe.aliquota * 100).toFixed(1)}% = R$ ${detalhe.valor_contribuicao.toFixed(2)}`)
      }
    })

    // Buscar valores atuais nos diferentes módulos
    const valoresAtuais: any = {}
    const divergencias: any[] = []

    // 1. Verificar no cálculo da folha (se existir)
    try {
      const folhaResponse = await $fetch('/api/folha/calcular', {
        method: 'POST',
        body: { mes: mes || '01', ano: ano || '2024' }
      })
      
      const colaboradorFolha = folhaResponse.data?.folha?.find((c: any) => c.colaborador_id === colaborador_id)
      if (colaboradorFolha) {
        valoresAtuais.folha_detalhamento = colaboradorFolha.inss
        
        if (Math.abs(colaboradorFolha.inss - valorCorreto) > 0.01) {
          divergencias.push({
            modulo: 'FolhaDetalhamentoColaboradores',
            valor_atual: colaboradorFolha.inss,
            valor_correto: valorCorreto,
            diferenca: colaboradorFolha.inss - valorCorreto,
          })
        }
      }
    } catch (error) {
      console.log('   ⚠️  Não foi possível verificar FolhaDetalhamentoColaboradores')
    }

    // 2. Verificar no modal de edição (simulação)
    const { calcularINSS } = await import('~/composables/useFolhaCalculos')
    const inssModalEdicao = calcularINSS(parseFloat(salario_bruto))
    valoresAtuais.modal_edicao = inssModalEdicao

    if (Math.abs(inssModalEdicao - valorCorreto) > 0.01) {
      divergencias.push({
        modulo: 'FolhaModalEdicao',
        valor_atual: inssModalEdicao,
        valor_correto: valorCorreto,
        diferenca: inssModalEdicao - valorCorreto,
      })
    }

    // 3. Verificar em holerites existentes
    const { data: holerites } = await supabase
      .from('holerites')
      .select('id, inss, mes, ano, tipo')
      .eq('colaborador_id', colaborador_id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (holerites && holerites.length > 0) {
      holerites.forEach(holerite => {
        if (Math.abs(holerite.inss - valorCorreto) > 0.01) {
          divergencias.push({
            modulo: 'Holerite',
            holerite_id: holerite.id,
            periodo: `${holerite.mes}/${holerite.ano}`,
            tipo: holerite.tipo,
            valor_atual: holerite.inss,
            valor_correto: valorCorreto,
            diferenca: holerite.inss - valorCorreto,
          })
        }
      })
    }

    console.log('\n🔍 ANÁLISE DE DIVERGÊNCIAS:')
    console.log(`   📊 Valores Encontrados:`)
    Object.entries(valoresAtuais).forEach(([modulo, valor]) => {
      const status = Math.abs((valor as number) - valorCorreto) <= 0.01 ? '✅' : '❌'
      console.log(`      ${status} ${modulo}: R$ ${(valor as number).toFixed(2)}`)
    })

    if (divergencias.length === 0) {
      console.log('\n✅ RESULTADO: Nenhuma divergência encontrada!')
      console.log('   Todos os módulos estão calculando o INSS corretamente.')
      
      return {
        success: true,
        divergencias_encontradas: false,
        valor_correto: valorCorreto,
        detalhes_calculo: inssOficial.detalhes,
        valores_atuais: valoresAtuais,
        message: 'Nenhuma divergência de INSS encontrada. Todos os cálculos estão corretos.',
      }
    }

    console.log(`\n❌ DIVERGÊNCIAS ENCONTRADAS: ${divergencias.length}`)
    divergencias.forEach((div, index) => {
      console.log(`   ${index + 1}. ${div.modulo}:`)
      console.log(`      Atual: R$ ${div.valor_atual.toFixed(2)}`)
      console.log(`      Correto: R$ ${div.valor_correto.toFixed(2)}`)
      console.log(`      Diferença: R$ ${div.diferenca.toFixed(2)}`)
      if (div.periodo) console.log(`      Período: ${div.periodo}`)
      if (div.tipo) console.log(`      Tipo: ${div.tipo}`)
    })

    // Corrigir holerites com divergências
    const correcoes: any[] = []
    
    for (const div of divergencias) {
      if (div.modulo === 'Holerite' && div.holerite_id) {
        try {
          // Buscar holerite completo
          const { data: holerite } = await supabase
            .from('holerites')
            .select('*')
            .eq('id', div.holerite_id)
            .single()

          if (holerite) {
            // Recalcular totais
            const novoTotalDescontos = (holerite.total_descontos - holerite.inss) + valorCorreto
            const novoSalarioLiquido = holerite.salario_bruto - novoTotalDescontos

            // Atualizar holerite
            const { error } = await supabase
              .from('holerites')
              .update({
                inss: valorCorreto,
                total_descontos: parseFloat(novoTotalDescontos.toFixed(2)),
                salario_liquido: parseFloat(novoSalarioLiquido.toFixed(2)),
                observacoes: (holerite.observacoes || '') + `\n\n🔧 CORREÇÃO AUTOMÁTICA DE INSS:\nValor anterior: R$ ${div.valor_atual.toFixed(2)}\nValor corrigido: R$ ${valorCorreto.toFixed(2)}\nData da correção: ${new Date().toLocaleString('pt-BR')}`
              })
              .eq('id', div.holerite_id)

            if (!error) {
              correcoes.push({
                modulo: 'Holerite',
                holerite_id: div.holerite_id,
                periodo: div.periodo,
                valor_anterior: div.valor_atual,
                valor_corrigido: valorCorreto,
                total_descontos_anterior: holerite.total_descontos,
                total_descontos_corrigido: novoTotalDescontos,
                salario_liquido_anterior: holerite.salario_liquido,
                salario_liquido_corrigido: novoSalarioLiquido,
              })
            }
          }
        } catch (error) {
          console.error(`Erro ao corrigir holerite ${div.holerite_id}:`, error)
        }
      }
    }

    // Registrar auditoria
    const registroAuditoria = {
      tipo: 'correcao_inss',
      colaborador_id,
      salario_bruto: parseFloat(salario_bruto),
      valor_inss_correto: valorCorreto,
      detalhes_calculo: inssOficial.detalhes,
      divergencias_encontradas: divergencias,
      correcoes_aplicadas: correcoes,
      valores_antes: valoresAtuais,
      executado_por: userData.id,
      executado_em: new Date().toISOString(),
    }

    // Salvar auditoria (se houver tabela de auditoria)
    try {
      await supabase
        .from('auditoria_calculos')
        .insert(registroAuditoria)
    } catch (error) {
      console.log('   ⚠️  Tabela de auditoria não encontrada, salvando em log')
    }

    console.log('\n🔧 CORREÇÕES APLICADAS:')
    if (correcoes.length > 0) {
      correcoes.forEach((corr, index) => {
        console.log(`   ${index + 1}. ${corr.modulo} (${corr.periodo}):`)
        console.log(`      INSS: R$ ${corr.valor_anterior.toFixed(2)} → R$ ${corr.valor_corrigido.toFixed(2)}`)
        console.log(`      Total Descontos: R$ ${corr.total_descontos_anterior.toFixed(2)} → R$ ${corr.total_descontos_corrigido.toFixed(2)}`)
        console.log(`      Salário Líquido: R$ ${corr.salario_liquido_anterior.toFixed(2)} → R$ ${corr.salario_liquido_corrigido.toFixed(2)}`)
      })
    } else {
      console.log('   ℹ️  Nenhuma correção automática foi aplicada.')
      console.log('   📝 Nota: Divergências em composables precisam ser corrigidas no código.')
    }

    console.log(`\n${'='.repeat(80)}`)
    console.log('✅ AUDITORIA CONCLUÍDA')
    console.log(`${'='.repeat(80)}\n`)

    return {
      success: true,
      divergencias_encontradas: divergencias.length > 0,
      total_divergencias: divergencias.length,
      total_correcoes: correcoes.length,
      valor_correto: valorCorreto,
      detalhes_calculo: inssOficial.detalhes,
      divergencias,
      correcoes_aplicadas: correcoes,
      valores_antes: valoresAtuais,
      auditoria: registroAuditoria,
      message: `Auditoria concluída. ${divergencias.length} divergência(s) encontrada(s), ${correcoes.length} correção(ões) aplicada(s).`,
    }

  } catch (error: any) {
    console.error('Erro na auditoria de INSS:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao executar auditoria de INSS',
    })
  }
})