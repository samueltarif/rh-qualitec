import { serverSupabaseClient } from '#supabase/server'

/**
 * API para gerar alertas automaticamente baseado nas configurações
 * Pode ser chamada manualmente ou por um cron job
 */
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event) as any
  const alertasGerados: any[] = []

  // Buscar configurações
  const { data: config } = await client
    .from('configuracoes_notificacoes')
    .select('*')
    .limit(1)
    .single()

  if (!config) {
    return { alertas: [], message: 'Configurações não encontradas' }
  }

  // Buscar empresa
  const { data: empresa } = await client
    .from('empresas')
    .select('id')
    .limit(1)
    .single()

  const empresaId = empresa?.id

  // Buscar tipos de alertas
  const { data: tiposAlertas } = await client
    .from('tipos_alertas')
    .select('*')
    .eq('ativo', true)

  const getTipoAlerta = (codigo: string) => tiposAlertas?.find((t: any) => t.codigo === codigo)

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  // ============ DOCUMENTOS VENCENDO ============
  if (config.notificar_documentos_vencendo) {
    const dataLimite = new Date(hoje)
    dataLimite.setDate(dataLimite.getDate() + config.dias_antecedencia_documentos)

    const { data: docsVencendo } = await client
      .from('documentos_rh')
      .select(`
        id, nome, data_validade,
        colaborador:colaborador_id(id, nome)
      `)
      .lte('data_validade', dataLimite.toISOString().split('T')[0])
      .gte('data_validade', hoje.toISOString().split('T')[0])

    for (const doc of docsVencendo || []) {
      const tipoAlerta = getTipoAlerta('DOC_VENCENDO')
      if (tipoAlerta && doc.colaborador) {
        const alerta = {
          empresa_id: empresaId,
          tipo_alerta_id: tipoAlerta.id,
          colaborador_id: doc.colaborador.id,
          documento_id: doc.id,
          referencia_tipo: 'documento',
          referencia_id: doc.id,
          titulo: `Documento "${doc.nome}" vencendo`,
          mensagem: `O documento "${doc.nome}" de ${doc.colaborador.nome} vence em ${doc.data_validade}`,
          prioridade: 'media',
          data_vencimento: doc.data_validade,
        }
        alertasGerados.push(alerta)
      }
    }
  }

  // ============ DOCUMENTOS VENCIDOS ============
  const { data: docsVencidos } = await client
    .from('documentos_rh')
    .select(`
      id, nome, data_validade,
      colaborador:colaborador_id(id, nome)
    `)
    .lt('data_validade', hoje.toISOString().split('T')[0])

  for (const doc of docsVencidos || []) {
    const tipoAlerta = getTipoAlerta('DOC_VENCIDO')
    if (tipoAlerta && doc.colaborador) {
      const alerta = {
        empresa_id: empresaId,
        tipo_alerta_id: tipoAlerta.id,
        colaborador_id: doc.colaborador.id,
        documento_id: doc.id,
        referencia_tipo: 'documento',
        referencia_id: doc.id,
        titulo: `Documento "${doc.nome}" VENCIDO`,
        mensagem: `O documento "${doc.nome}" de ${doc.colaborador.nome} venceu em ${doc.data_validade}`,
        prioridade: 'alta',
        data_vencimento: doc.data_validade,
      }
      alertasGerados.push(alerta)
    }
  }

  // ============ ANIVERSÁRIOS ============
  if (config.notificar_aniversarios) {
    const dataAniversario = new Date(hoje)
    dataAniversario.setDate(dataAniversario.getDate() + config.dias_antecedencia_aniversarios)
    
    const mesAniversario = dataAniversario.getMonth() + 1
    const diaAniversario = dataAniversario.getDate()

    const { data: aniversariantes } = await client
      .from('colaboradores')
      .select('id, nome, data_nascimento')
      .eq('status', 'Ativo')

    for (const colab of aniversariantes || []) {
      if (colab.data_nascimento) {
        const nascimento = new Date(colab.data_nascimento)
        if (nascimento.getMonth() + 1 === mesAniversario && nascimento.getDate() === diaAniversario) {
          const tipoAlerta = getTipoAlerta('ANIVERSARIO')
          if (tipoAlerta) {
            const alerta = {
              empresa_id: empresaId,
              tipo_alerta_id: tipoAlerta.id,
              colaborador_id: colab.id,
              referencia_tipo: 'aniversario',
              referencia_id: colab.id,
              titulo: `Aniversário de ${colab.nome}`,
              mensagem: `${colab.nome} faz aniversário em ${diaAniversario}/${mesAniversario}`,
              prioridade: 'baixa',
              data_vencimento: dataAniversario.toISOString().split('T')[0],
            }
            alertasGerados.push(alerta)
          }
        }
      }
    }
  }

  // ============ ANIVERSÁRIOS DE EMPRESA ============
  if (config.notificar_aniversarios_empresa) {
    const dataAnivEmpresa = new Date(hoje)
    dataAnivEmpresa.setDate(dataAnivEmpresa.getDate() + config.dias_antecedencia_aniversarios_empresa)
    
    const mesAniv = dataAnivEmpresa.getMonth() + 1
    const diaAniv = dataAnivEmpresa.getDate()

    const { data: colaboradores } = await client
      .from('colaboradores')
      .select('id, nome, data_admissao')
      .eq('status', 'Ativo')

    for (const colab of colaboradores || []) {
      if (colab.data_admissao) {
        const admissao = new Date(colab.data_admissao)
        if (admissao.getMonth() + 1 === mesAniv && admissao.getDate() === diaAniv) {
          const anos = dataAnivEmpresa.getFullYear() - admissao.getFullYear()
          if (anos > 0) {
            const tipoAlerta = getTipoAlerta('ANIVERSARIO_EMPRESA')
            if (tipoAlerta) {
              const alerta = {
                empresa_id: empresaId,
                tipo_alerta_id: tipoAlerta.id,
                colaborador_id: colab.id,
                referencia_tipo: 'aniversario_empresa',
                referencia_id: colab.id,
                titulo: `${anos} anos de empresa - ${colab.nome}`,
                mensagem: `${colab.nome} completa ${anos} anos de empresa em ${diaAniv}/${mesAniv}`,
                prioridade: 'baixa',
                data_vencimento: dataAnivEmpresa.toISOString().split('T')[0],
              }
              alertasGerados.push(alerta)
            }
          }
        }
      }
    }
  }

  // ============ PERÍODO DE EXPERIÊNCIA ============
  if (config.notificar_experiencia_vencendo) {
    const { data: colaboradores } = await client
      .from('colaboradores')
      .select('id, nome, data_admissao, tipo_contrato')
      .eq('status', 'Ativo')

    for (const colab of colaboradores || []) {
      if (colab.data_admissao) {
        const admissao = new Date(colab.data_admissao)
        const fim45dias = new Date(admissao)
        fim45dias.setDate(fim45dias.getDate() + 45)
        const fim90dias = new Date(admissao)
        fim90dias.setDate(fim90dias.getDate() + 90)

        const diasPara45 = Math.ceil((fim45dias.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
        const diasPara90 = Math.ceil((fim90dias.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

        if (diasPara45 > 0 && diasPara45 <= config.dias_antecedencia_experiencia) {
          const tipoAlerta = getTipoAlerta('EXPERIENCIA_VENCENDO')
          if (tipoAlerta) {
            const alerta = {
              empresa_id: empresaId,
              tipo_alerta_id: tipoAlerta.id,
              colaborador_id: colab.id,
              referencia_tipo: 'experiencia',
              referencia_id: colab.id,
              titulo: `Experiência 45 dias - ${colab.nome}`,
              mensagem: `Período de experiência de 45 dias de ${colab.nome} termina em ${diasPara45} dias`,
              prioridade: 'alta',
              data_vencimento: fim45dias.toISOString().split('T')[0],
            }
            alertasGerados.push(alerta)
          }
        }

        if (diasPara90 > 0 && diasPara90 <= config.dias_antecedencia_experiencia) {
          const tipoAlerta = getTipoAlerta('EXPERIENCIA_VENCENDO')
          if (tipoAlerta) {
            const alerta = {
              empresa_id: empresaId,
              tipo_alerta_id: tipoAlerta.id,
              colaborador_id: colab.id,
              referencia_tipo: 'experiencia',
              referencia_id: colab.id,
              titulo: `Experiência 90 dias - ${colab.nome}`,
              mensagem: `Período de experiência de 90 dias de ${colab.nome} termina em ${diasPara90} dias`,
              prioridade: 'alta',
              data_vencimento: fim90dias.toISOString().split('T')[0],
            }
            alertasGerados.push(alerta)
          }
        }
      }
    }
  }

  // Inserir alertas (evitando duplicados)
  let inseridos = 0
  for (const alerta of alertasGerados) {
    // Verificar se já existe alerta similar não resolvido
    const { data: existente } = await client
      .from('alertas')
      .select('id')
      .eq('colaborador_id', (alerta as any).colaborador_id)
      .eq('referencia_tipo', (alerta as any).referencia_tipo)
      .eq('referencia_id', (alerta as any).referencia_id)
      .in('status', ['pendente', 'lido'])
      .limit(1)
      .single()

    if (!existente) {
      await client.from('alertas').insert(alerta)
      inseridos++
    }
  }

  return {
    total_verificados: alertasGerados.length,
    alertas_inseridos: inseridos,
    message: `${inseridos} novos alertas gerados`,
  }
})
