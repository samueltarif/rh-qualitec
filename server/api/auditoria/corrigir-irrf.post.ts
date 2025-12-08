import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

/**
 * API para corrigir divergências de IRRF entre módulos
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
  const { salario_bruto, inss, dependentes = 0, colaborador_id, mes, ano } = body

  if (!salario_bruto || inss === undefined || !colaborador_id) {
    throw createError({
      statusCode: 400,
      message: 'Salário bruto, INSS e ID do colaborador são obrigatórios',
    })
  }

  try {
    console.log(`\n${'='.repeat(80)}`)
    console.log('🔍 AUDITORIA DE IRRF - CORREÇÃO DE DIVERGÊNCIAS')
    console.log(`${'='.repeat(80)}`)
    console.log(`👤 Colaborador ID: ${colaborador_id}`)
    console.log(`💰 Salário Bruto: R$ ${salario_bruto.toFixed(2)}`)
    console.log(`💳 INSS: R$ ${inss.toFixed(2)}`)
    console.log(`👨‍👩‍👧‍👦 Dependentes: ${dependentes}`)
    console.log(`📅 Período: ${mes}/${ano}`)
    console.log(`🕐 Data/Hora: ${new Date().toLocaleString('pt-BR')}`)
    console.log(`${'='.repeat(80)}\n`)

    // FUNÇÃO OFICIAL DE CÁLCULO DE IRRF (TABELA 2024)
    const calcularIRRFOficial = (salarioBruto: number, inss: number, dependentes: number): { valor: number, detalhes: any[] } => {
      const deducaoPorDependente = 189.59
      const baseCalculo = salarioBruto - inss - (dependentes * deducaoPorDependente)
      
      const detalhes: any[] = []
      
      // Adicionar detalhes da base de cálculo
      detalhes.push({
        tipo: 'base_calculo',
        descricao: 'Cálculo da Base de IRRF',
        salario_bruto: salarioBruto,
        inss_descontado: inss,
        dependentes: dependentes,
        deducao_dependentes: dependentes * deducaoPorDependente,
        base_calculo: baseCalculo,
      })

      if (baseCalculo <= 2259.20) {
        detalhes.push({
          tipo: 'isencao',
          descricao: 'Isento de IRRF',
          base_calculo: baseCalculo,
          limite_isencao: 2259.20,
          irrf: 0,
        })
        return { valor: 0, detalhes }
      }

      let irrf = 0
      let faixaAplicada = ''
      
      if (baseCalculo <= 2826.65) {
        irrf = baseCalculo * 0.075 - 169.44
        faixaAplicada = 'De R$ 2.259,21 até R$ 2.826,65 - 7,5%'
      } else if (baseCalculo <= 3751.05) {
        irrf = baseCalculo * 0.15 - 381.44
        faixaAplicada = 'De R$ 2.826,66 até R$ 3.751,05 - 15%'
      } else if (baseCalculo <= 4664.68) {
        irrf = baseCalculo * 0.225 - 662.77
        faixaAplicada = 'De R$ 3.751,06 até R$ 4.664,68 - 22,5%'
      } else {
        irrf = baseCalculo * 0.275 - 896.00
        faixaAplicada = 'Acima de R$ 4.664,68 - 27,5%'
      }

      irrf = Math.max(0, irrf)

      detalhes.push({
        tipo: 'calculo',
        descricao: 'Cálculo do IRRF',
        faixa_aplicada: faixaAplicada,
        base_calculo: baseCalculo,
        irrf_calculado: irrf,
        irrf_final: parseFloat(irrf.toFixed(2)),
      })

      return {
        valor: parseFloat(irrf.toFixed(2)),
        detalhes,
      }
    }

    // Calcular IRRF oficial
    const irrfOficial = calcularIRRFOficial(parseFloat(salario_bruto), parseFloat(inss), parseInt(dependentes))
    const valorCorreto = irrfOficial.valor

    console.log('📊 CÁLCULO OFICIAL DO IRRF:')
    console.log(`   💰 Valor Correto: R$ ${valorCorreto.toFixed(2)}`)
    console.log('   📋 Detalhes do Cálculo:')
    irrfOficial.detalhes.forEach((detalhe, index) => {
      if (detalhe.tipo === 'base_calculo') {
        console.log(`      ${index + 1}. Base de Cálculo:`)
        console.log(`         Salário Bruto: R$ ${detalhe.salario_bruto.toFixed(2)}`)
        console.log(`         (-) INSS: R$ ${detalhe.inss_descontado.toFixed(2)}`)
        console.log(`         (-) Dependentes (${detalhe.dependentes} × R$ 189,59): R$ ${detalhe.deducao_dependentes.toFixed(2)}`)
        console.log(`         = Base IRRF: R$ ${detalhe.base_calculo.toFixed(2)}`)
      } else if (detalhe.tipo === 'isencao') {
        console.log(`      ${index + 1}. ${detalhe.descricao}`)
        console.log(`         Base (R$ ${detalhe.base_calculo.toFixed(2)}) ≤ Limite (R$ ${detalhe.limite_isencao.toFixed(2)})`)
      } else if (detalhe.tipo === 'calculo') {
        console.log(`      ${index + 1}. ${detalhe.faixa_aplicada}`)
        console.log(`         Base: R$ ${detalhe.base_calculo.toFixed(2)}`)
        console.log(`         IRRF: R$ ${detalhe.irrf_final.toFixed(2)}`)
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
        valoresAtuais.folha_detalhamento = colaboradorFolha.irrf
        
        if (Math.abs(colaboradorFolha.irrf - valorCorreto) > 0.01) {
          divergencias.push({
            modulo: 'FolhaDetalhamentoColaboradores',
            valor_atual: colaboradorFolha.irrf,
            valor_correto: valorCorreto,
            diferenca: colaboradorFolha.irrf - valorCorreto,
          })
        }
      }
    } catch (error) {
      console.log('   ⚠️  Não foi possível verificar FolhaDetalhamentoColaboradores')
    }

    // 2. Verificar no modal de edição (simulação)
    try {
      const { calcularIRRF } = await import('~/composables/useFolhaCalculos')
      const irrfModalEdicao = calcularIRRF(parseFloat(salario_bruto), parseFloat(inss), parseInt(dependentes))
      valoresAtuais.modal_edicao = irrfModalEdicao

      if (Math.abs(irrfModalEdicao - valorCorreto) > 0.01) {
        divergencias.push({
          modulo: 'FolhaModalEdicao',
          valor_atual: irrfModalEdicao,
          valor_correto: valorCorreto,
          diferenca: irrfModalEdicao - valorCorreto,
        })
      }
    } catch (error) {
      console.log('   ⚠️  Erro ao verificar FolhaModalEdicao:', error)
    }

    // 3. Verificar em holerites existentes
    const { data: holerites } = await supabase
      .from('holerites')
      .select('id, irrf, mes, ano, tipo')
      .eq('colaborador_id', colaborador_id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (holerites && holerites.length > 0) {
      holerites.forEach(holerite => {
        if (Math.abs(holerite.irrf - valorCorreto) > 0.01) {
          divergencias.push({
            modulo: 'Holerite',
            holerite_id: holerite.id,
            periodo: `${holerite.mes}/${holerite.ano}`,
            tipo: holerite.tipo,
            valor_atual: holerite.irrf,
            valor_correto: valorCorreto,
            diferenca: holerite.irrf - valorCorreto,
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
      console.log('   Todos os módulos estão calculando o IRRF corretamente.')
      
      return {
        success: true,
        divergencias_encontradas: false,
        valor_correto: valorCorreto,
        detalhes_calculo: irrfOficial.detalhes,
        valores_atuais: valoresAtuais,
        message: 'Nenhuma divergência de IRRF encontrada. Todos os cálculos estão corretos.',
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
            const novoTotalDescontos = (holerite.total_descontos - holerite.irrf) + valorCorreto
            const novoSalarioLiquido = holerite.salario_bruto - novoTotalDescontos

            // Atualizar holerite
            const { error } = await supabase
              .from('holerites')
              .update({
                irrf: valorCorreto,
                total_descontos: parseFloat(novoTotalDescontos.toFixed(2)),
                salario_liquido: parseFloat(novoSalarioLiquido.toFixed(2)),
                observacoes: (holerite.observacoes || '') + `\n\n🔧 CORREÇÃO AUTOMÁTICA DE IRRF:\nValor anterior: R$ ${div.valor_atual.toFixed(2)}\nValor corrigido: R$ ${valorCorreto.toFixed(2)}\nData da correção: ${new Date().toLocaleString('pt-BR')}`
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
      tipo: 'correcao_irrf',
      colaborador_id,
      salario_bruto: parseFloat(salario_bruto),
      inss: parseFloat(inss),
      dependentes: parseInt(dependentes),
      valor_irrf_correto: valorCorreto,
      detalhes_calculo: irrfOficial.detalhes,
      divergencias_encontradas: divergencias,
      correcoes_aplicadas: correcoes,
      valores_antes: valoresAtuais,
      executado_por: userData.id,
      executado_em: new Date().toISOString(),
    }

    console.log('\n🔧 CORREÇÕES APLICADAS:')
    if (correcoes.length > 0) {
      correcoes.forEach((corr, index) => {
        console.log(`   ${index + 1}. ${corr.modulo} (${corr.periodo}):`)
        console.log(`      IRRF: R$ ${corr.valor_anterior.toFixed(2)} → R$ ${corr.valor_corrigido.toFixed(2)}`)
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
      detalhes_calculo: irrfOficial.detalhes,
      divergencias,
      correcoes_aplicadas: correcoes,
      valores_antes: valoresAtuais,
      auditoria: registroAuditoria,
      message: `Auditoria concluída. ${divergencias.length} divergência(s) encontrada(s), ${correcoes.length} correção(ões) aplicada(s).`,
    }

  } catch (error: any) {
    console.error('Erro na auditoria de IRRF:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao executar auditoria de IRRF',
    })
  }
})