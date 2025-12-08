import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { colaboradores_ids, parcela, ano } = body

    if (!colaboradores_ids || !Array.isArray(colaboradores_ids) || colaboradores_ids.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'IDs dos colaboradores são obrigatórios'
      })
    }

    const supabase = await serverSupabaseClient(event)

    let total_gerados = 0
    let total_enviados = 0
    let total_erros = 0
    const erros: any[] = []

    // Processar cada colaborador individualmente
    for (const colaborador_id of colaboradores_ids) {
      try {
        // Buscar dados do colaborador
        const { data: colaborador, error: errorColab } = await supabase
          .from('colaboradores')
          .select('*')
          .eq('id', colaborador_id)
          .single()

        if (errorColab || !colaborador) {
          throw new Error(`Colaborador ${colaborador_id} não encontrado`)
        }

        // Pegar email (prioriza corporativo, depois pessoal)
        const emailColaborador = (colaborador as any).email_corporativo || (colaborador as any).email_pessoal || null
        
        if (!emailColaborador) {
          console.warn(`⚠️ Colaborador ${(colaborador as any).nome} não possui email cadastrado - gerando holerite sem envio`)
        }

        // Calcular 13º salário
        const salarioBase = parseFloat((colaborador as any).salario_base) || 0
        const mesesTrabalhados = calcularMesesTrabalhados((colaborador as any).data_admissao, ano)
        const valor13Proporcional = (salarioBase / 12) * mesesTrabalhados

        let valor13Parcela = 0
        let descontoINSS = 0
        let descontoIRRF = 0

        if (parcela === '1') {
          valor13Parcela = valor13Proporcional / 2
        } else if (parcela === '2') {
          const valor13Total = valor13Proporcional
          descontoINSS = calcularINSS(valor13Total)
          descontoIRRF = calcularIRRF(valor13Total, descontoINSS, (colaborador as any).dependentes || 0)
          
          const primeiraParcelaJaPaga = valor13Total / 2
          valor13Parcela = valor13Total - primeiraParcelaJaPaga - descontoINSS - descontoIRRF
        } else {
          valor13Parcela = valor13Proporcional
          descontoINSS = calcularINSS(valor13Parcela)
          descontoIRRF = calcularIRRF(valor13Parcela, descontoINSS, (colaborador as any).dependentes || 0)
          valor13Parcela = valor13Parcela - descontoINSS - descontoIRRF
        }

        const fgts = valor13Proporcional * 0.08

        // Verificar se já existe holerite (sem .single() para evitar erro quando não existe)
        const { data: holeritesExistentes } = await supabase
          .from('holerites')
          .select('id')
          .eq('colaborador_id', colaborador_id)
          .eq('tipo', 'decimo_terceiro')
          .eq('ano', ano)
          .eq('parcela_13', parcela)
        
        const holeriteExistente = holeritesExistentes && holeritesExistentes.length > 0 ? holeritesExistentes[0] : null

        let holeriteId: number

        if (holeriteExistente) {
          // Atualizar
          const { error: errorUpdate } = await (supabase as any)
            .from('holerites')
            .update({
              nome_colaborador: (colaborador as any).nome,
              cpf: (colaborador as any).cpf,
              cargo: (colaborador as any).cargo || '',
              departamento: (colaborador as any).departamento || '',
              salario_base: salarioBase,
              salario_bruto: valor13Proporcional,
              total_proventos: valor13Proporcional,
              inss: descontoINSS,
              irrf: descontoIRRF,
              total_descontos: descontoINSS + descontoIRRF,
              salario_liquido: valor13Parcela,
              fgts: fgts,
              meses_trabalhados: mesesTrabalhados,
              data_admissao: (colaborador as any).data_admissao || null,
              observacoes: `13º Salário - ${parcela === '1' ? '1ª Parcela' : parcela === '2' ? '2ª Parcela' : 'Parcela Integral'} - ${ano}`,
              updated_at: new Date().toISOString()
            } as any)
            .eq('id', (holeriteExistente as any).id)

          if (errorUpdate) throw errorUpdate
          holeriteId = (holeriteExistente as any).id
        } else {
          // Criar novo
          const { data: novoHolerite, error: errorInsert } = await (supabase as any)
            .from('holerites')
            .insert({
              colaborador_id: colaborador_id,
              mes: 12,
              ano: ano,
              tipo: 'decimo_terceiro',
              parcela_13: parcela,
              nome_colaborador: (colaborador as any).nome,
              cpf: (colaborador as any).cpf,
              cargo: (colaborador as any).cargo || '',
              departamento: (colaborador as any).departamento || '',
              salario_base: salarioBase,
              salario_bruto: valor13Proporcional,
              total_proventos: valor13Proporcional,
              inss: descontoINSS,
              irrf: descontoIRRF,
              total_descontos: descontoINSS + descontoIRRF,
              salario_liquido: valor13Parcela,
              fgts: fgts,
              meses_trabalhados: mesesTrabalhados,
              data_admissao: (colaborador as any).data_admissao || null,
              observacoes: `13º Salário - ${parcela === '1' ? '1ª Parcela' : parcela === '2' ? '2ª Parcela' : 'Parcela Integral'} - ${ano}`,
              created_at: new Date().toISOString()
            } as any)
            .select()
            .single()

          if (errorInsert || !novoHolerite) throw errorInsert
          holeriteId = (novoHolerite as any).id
        }

        total_gerados++

        // Enviar email (somente se o colaborador tiver email)
        if (emailColaborador) {
          try {
            const parcelaTexto = parcela === '1' ? '1ª Parcela' : parcela === '2' ? '2ª Parcela' : 'Parcela Integral'
            
            // Buscar configuração de email
            const { data: emailConfig } = await supabase
              .from('config_email_smtp')
              .select('*')
              .single()

            if (emailConfig && (emailConfig as any).email_remetente) {
              // Importar serviço de email (caminho relativo)
              const emailServiceModule = await import('../../utils/email-service')
              const EmailService = emailServiceModule.EmailService
              const emailService = new EmailService()
              
              // Inicializar com configurações
              await emailService.initialize({
                servidor_smtp: (emailConfig as any).servidor_smtp,
                porta: (emailConfig as any).porta,
                usuario_smtp: (emailConfig as any).usuario_smtp,
                senha_smtp: (emailConfig as any).senha_smtp,
                email_remetente: (emailConfig as any).email_remetente,
                nome_remetente: (emailConfig as any).nome_remetente || 'RH',
                usa_ssl: (emailConfig as any).usa_ssl || false,
                usa_tls: (emailConfig as any).usa_tls || true
              })
              
              // Enviar email
              const corpoEmail = `
                <h2>13º Salário - ${parcelaTexto}</h2>
                <p>Olá ${(colaborador as any).nome},</p>
                <p>Seu holerite de 13º salário está disponível.</p>
                <h3>Detalhes:</h3>
                <ul>
                  <li><strong>Parcela:</strong> ${parcelaTexto}</li>
                  <li><strong>Ano:</strong> ${ano}</li>
                  <li><strong>Valor Líquido:</strong> R$ ${valor13Parcela.toFixed(2)}</li>
                </ul>
                <p>Acesse o sistema para visualizar o holerite completo.</p>
              `
              
              await emailService.sendEmail({
                destinatario: emailColaborador,
                assunto: `13º Salário - ${parcelaTexto} - ${ano}`,
                corpo_html: corpoEmail,
                corpo_texto: `13º Salário - ${parcelaTexto} - ${ano}\nValor: R$ ${valor13Parcela.toFixed(2)}`
              })
              
              console.log(`✅ Email enviado para ${emailColaborador}`)
              total_enviados++
            } else {
              console.log(`⚠️ Configuração de email não encontrada`)
            }
          } catch (emailError: any) {
            console.error(`❌ Erro ao enviar email para ${emailColaborador}:`, emailError)
            // Não conta como erro total, pois o holerite foi gerado
          }
        } else {
          console.log(`⚠️ Email não enviado - colaborador ${(colaborador as any).nome} sem email cadastrado`)
        }

      } catch (error: any) {
        console.error(`Erro ao processar colaborador ${colaborador_id}:`, error)
        total_erros++
        erros.push({
          colaborador_id,
          erro: error.message
        })
      }
    }

    return {
      success: true,
      data: {
        total_gerados,
        total_enviados,
        total_erros,
        erros: total_erros > 0 ? erros : undefined
      }
    }
  } catch (error: any) {
    console.error('Erro ao gerar e enviar 13º salário:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao gerar e enviar 13º salário'
    })
  }
})

// Funções auxiliares (mesmas do gerar.post.ts)
function calcularMesesTrabalhados(dataAdmissao: string, ano: number): number {
  // Garantir parse correto da data (formato ISO: YYYY-MM-DD)
  const admissao = new Date(dataAdmissao + 'T00:00:00')
  const anoAdmissao = admissao.getFullYear()
  const mesAdmissao = admissao.getMonth() + 1
  const diaAdmissao = admissao.getDate()

  if (anoAdmissao > ano) return 0
  if (anoAdmissao < ano) return 12

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
  const faixas = [
    { limite: 1412.00, aliquota: 0.075 },
    { limite: 2666.68, aliquota: 0.09 },
    { limite: 4000.03, aliquota: 0.12 },
    { limite: 7786.02, aliquota: 0.14 },
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

  return Math.min(inss, 908.85)
}

function calcularIRRF(salarioBruto: number, inss: number, dependentes: number): number {
  const deducaoPorDependente = 189.59
  const baseCalculo = salarioBruto - inss - (dependentes * deducaoPorDependente)

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
