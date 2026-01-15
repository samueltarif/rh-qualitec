import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)
    const body = await readBody(event)
    
    // Parâmetros opcionais
    const { 
      periodo_inicio, 
      periodo_fim, 
      funcionario_ids, // Se vazio, gera para todos
      recriar = false // Se true, recria holerites mesmo que já existam
    } = body

    // Buscar funcionários ativos
    let query = supabase
      .from('funcionarios')
      .select('id, nome_completo, salario_base, empresa_id, cargo_id, departamento_id, numero_dependentes')
      .eq('status', 'ativo')

    if (funcionario_ids && funcionario_ids.length > 0) {
      query = query.in('id', funcionario_ids)
    }

    const { data: funcionarios, error: funcError } = await query

    if (funcError) throw funcError

    if (!funcionarios || funcionarios.length === 0) {
      return {
        success: false,
        message: 'Nenhum funcionário ativo encontrado'
      }
    }

    console.log('👥 Funcionários encontrados:', funcionarios.length)
    console.log('💰 Salários:', funcionarios.map((f: any) => ({ nome: f.nome_completo, salario: f.salario_base })))

    // Definir período se não foi fornecido
    const hoje = new Date()
    const inicio = periodo_inicio || `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-01`
    const fim = periodo_fim || `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-15`

    console.log('📅 Período:', { inicio, fim })

    // Gerar holerites para cada funcionário
    const holeritesCriados = []
    const erros = []

    for (const func of funcionarios) {
      try {
        console.log(`\n🔄 Processando funcionário: ${(func as any).nome_completo}`)
        
        // Verificar se já existe holerite para este período
        const { data: existente } = await supabase
          .from('holerites')
          .select('id')
          .eq('funcionario_id', (func as any).id)
          .eq('periodo_inicio', inicio)
          .eq('periodo_fim', fim)
          .maybeSingle()

        if (existente && !recriar) {
          console.log(`⚠️ Holerite já existe para ${(func as any).nome_completo}`)
          erros.push({
            funcionario: (func as any).nome_completo,
            erro: 'Holerite já existe para este período'
          })
          continue
        }
        
        // Se recriar = true e existe, excluir o antigo
        if (existente && recriar) {
          console.log(`🔄 Recriando holerite para ${(func as any).nome_completo}`)
          await supabase
            .from('holerites')
            .delete()
            .eq('id', (existente as any).id)
        }

        // Calcular valores
        const salarioBase = (func as any).salario_base || 0
        
        // Cálculo CORRETO do INSS 2024 (tabela progressiva)
        const baseINSS = salarioBase
        let inss = 0
        let aliquotaEfetiva = 0
        
        if (baseINSS <= 1412.00) {
          inss = baseINSS * 0.075
          aliquotaEfetiva = 7.5
        } else if (baseINSS <= 2666.68) {
          inss = 1412.00 * 0.075
          inss += (baseINSS - 1412.00) * 0.09
          aliquotaEfetiva = (inss / baseINSS) * 100
        } else if (baseINSS <= 4000.03) {
          inss = 1412.00 * 0.075
          inss += (2666.68 - 1412.00) * 0.09
          inss += (baseINSS - 2666.68) * 0.12
          aliquotaEfetiva = (inss / baseINSS) * 100
        } else {
          inss = 1412.00 * 0.075
          inss += (2666.68 - 1412.00) * 0.09
          inss += (4000.03 - 2666.68) * 0.12
          inss += (baseINSS - 4000.03) * 0.14
          aliquotaEfetiva = (inss / baseINSS) * 100
          
          if (inss > 908.85) {
            inss = 908.85
            aliquotaEfetiva = (inss / baseINSS) * 100
          }
        }
        
        inss = Math.round(inss * 100) / 100
        aliquotaEfetiva = Math.round(aliquotaEfetiva * 100) / 100
        
        // ========================================
        // CÁLCULO OFICIAL DE IRRF - BRASIL 2026
        // ========================================
        const numeroDependentes = (func as any).numero_dependentes || 0
        const deducaoDependentes = numeroDependentes * 189.59
        const baseIRRF = salarioBase - inss - deducaoDependentes
        
        console.log(`   💰 Base IRRF: R$ ${baseIRRF.toFixed(2)} (Bruto: ${salarioBase} - INSS: ${inss} - Dep: ${deducaoDependentes})`)
        console.log(`   👨‍👩‍👧‍👦 Dependentes: ${numeroDependentes}`)
        
        let irrf = 0
        let aliquotaIRRF = 0
        let faixaIRRF = 'Isento'
        
        // ========================================
        // REGRA 1: ISENÇÃO REAL até R$ 2.428,80 (Receita Federal 2026)
        // ========================================
        if (baseIRRF <= 2428.80) {
          irrf = 0
          aliquotaIRRF = 0
          faixaIRRF = 'Isento (até R$ 2.428,80)'
          console.log(`   ✅ ISENTO - Base IRRF: R$ ${baseIRRF.toFixed(2)} ≤ R$ 2.428,80`)
        }
        // ========================================
        // REGRA 2: FAIXA DE TRANSIÇÃO COM REDUTOR (R$ 2.428,81 a R$ 7.350,00)
        // ========================================
        else if (baseIRRF <= 7350.00) {
          // Calcular IR pela tabela progressiva normal
          let irrfTabela = 0
          let aliquotaTabelaNominal = 0
          
          if (baseIRRF <= 2259.20) {
            irrfTabela = 0
            aliquotaTabelaNominal = 0
          } else if (baseIRRF <= 2826.65) {
            irrfTabela = (baseIRRF * 0.075) - 169.44
            aliquotaTabelaNominal = 7.5
          } else if (baseIRRF <= 3751.05) {
            irrfTabela = (baseIRRF * 0.15) - 381.44
            aliquotaTabelaNominal = 15
          } else if (baseIRRF <= 4664.68) {
            irrfTabela = (baseIRRF * 0.225) - 662.77
            aliquotaTabelaNominal = 22.5
          } else {
            irrfTabela = (baseIRRF * 0.275) - 896.00
            aliquotaTabelaNominal = 27.5
          }
          
          // Aplicar redutor progressivo baseado na isenção real
          const fatorReducao = (baseIRRF - 2428.80) / (7350.00 - 2428.80)
          irrf = irrfTabela * fatorReducao
          aliquotaIRRF = baseIRRF > 0 ? (irrf / baseIRRF) * 100 : 0
          faixaIRRF = `Transição c/ Redutor (${(fatorReducao * 100).toFixed(1)}% do IR ${aliquotaTabelaNominal}%)`
          
          console.log(`   🟡 TRANSIÇÃO COM REDUTOR`)
          console.log(`      Base IRRF: R$ ${baseIRRF.toFixed(2)}`)
          console.log(`      IR Tabela (${aliquotaTabelaNominal}%): R$ ${irrfTabela.toFixed(2)}`)
          console.log(`      Fator Redução: ${(fatorReducao * 100).toFixed(1)}%`)
          console.log(`      IR Final: R$ ${irrf.toFixed(2)}`)
        }
        // ========================================
        // REGRA 3: ACIMA DE R$ 7.350,00 - Tabela Progressiva Normal
        // ========================================
        else {
          if (baseIRRF <= 2259.20) {
            irrf = 0
            aliquotaIRRF = 0
            faixaIRRF = 'Isento'
          } else if (baseIRRF <= 2826.65) {
            irrf = (baseIRRF * 0.075) - 169.44
            aliquotaIRRF = 7.5
            faixaIRRF = '7,5%'
          } else if (baseIRRF <= 3751.05) {
            irrf = (baseIRRF * 0.15) - 381.44
            aliquotaIRRF = 15
            faixaIRRF = '15%'
          } else if (baseIRRF <= 4664.68) {
            irrf = (baseIRRF * 0.225) - 662.77
            aliquotaIRRF = 22.5
            faixaIRRF = '22,5%'
          } else {
            irrf = (baseIRRF * 0.275) - 896.00
            aliquotaIRRF = 27.5
            faixaIRRF = '27,5%'
          }
          
          console.log(`   🔴 TABELA NORMAL - Faixa: ${faixaIRRF} | IRRF: R$ ${irrf.toFixed(2)}`)
        }
        
        // Arredondar e garantir que não seja negativo
        irrf = Math.max(0, Math.round(irrf * 100) / 100)
        aliquotaIRRF = Math.round(aliquotaIRRF * 100) / 100
        
        // Calcular totais
        const totalDescontos = inss + irrf
        const salarioLiquido = salarioBase - totalDescontos

        // Criar holerite
        const { data: holerite, error: holeriteError } = await supabase
          .from('holerites')
          .insert({
            funcionario_id: (func as any).id,
            periodo_inicio: inicio,
            periodo_fim: fim,
            data_pagamento: fim,
            salario_base: salarioBase,
            inss: inss,
            base_inss: baseINSS,
            aliquota_inss: aliquotaEfetiva,
            irrf: irrf,
            base_irrf: baseIRRF,
            aliquota_irrf: aliquotaIRRF,
            faixa_irrf: faixaIRRF,
            total_proventos: salarioBase,
            total_descontos: totalDescontos,
            salario_liquido: salarioLiquido,
            status: 'gerado',
            observacoes: 'Holerite gerado automaticamente pelo sistema'
          } as any)
          .select()
          .single()

        if (holeriteError) throw holeriteError

        console.log(`✅ Holerite criado com sucesso para ${(func as any).nome_completo}`)
        console.log(`   Salário: R$ ${salarioBase.toFixed(2)} | INSS: R$ ${inss.toFixed(2)} | IRRF: R$ ${irrf.toFixed(2)} | Líquido: R$ ${salarioLiquido.toFixed(2)}`)

        holeritesCriados.push({
          funcionario: (func as any).nome_completo,
          holerite_id: (holerite as any).id
        })

      } catch (error: any) {
        console.error(`❌ Erro ao gerar holerite para ${(func as any).nome_completo}:`, error.message)
        erros.push({
          funcionario: (func as any).nome_completo,
          erro: error.message
        })
      }
    }

    return {
      success: true,
      message: `${holeritesCriados.length} holerite(s) gerado(s) com sucesso`,
      total_gerados: holeritesCriados.length,
      total_erros: erros.length,
      holerites: holeritesCriados,
      erros: erros.length > 0 ? erros : undefined
    }

  } catch (error: any) {
    console.error('Erro ao gerar holerites:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao gerar holerites'
    })
  }
})