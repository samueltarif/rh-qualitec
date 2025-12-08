import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  try {
    // Buscar colaborador_id do usuário
    const { data: appUserData } = await client
      .from('app_users')
      .select('colaborador_id')
      .eq('auth_uid', user.id)
      .single()

    const appUser = appUserData as any

    if (!appUser?.colaborador_id) {
      return {
        banco_horas: '00:00',
        dias_ferias: 0,
        solicitacoes_pendentes: 0,
        documentos_novos: 0,
        comunicados_nao_lidos: 0
      }
    }

    const colaboradorId = appUser.colaborador_id

    // Buscar dados do colaborador
    const { data: colaboradorData } = await client
      .from('colaboradores')
      .select('empresa_id, data_admissao')
      .eq('id', colaboradorId)
      .single()

    const colaborador = colaboradorData as any

    // Calcular dias de férias disponíveis
    let diasFerias = 0
    if (colaborador?.data_admissao) {
      const admissao = new Date(colaborador.data_admissao)
      const hoje = new Date()
      const mesesTrabalhados = Math.floor((hoje.getTime() - admissao.getTime()) / (1000 * 60 * 60 * 24 * 30))
      diasFerias = Math.min(30, Math.floor(mesesTrabalhados * 2.5))
    }

    // Buscar férias já utilizadas
    const { data: feriasUsadas } = await client
      .from('ferias')
      .select('dias_gozo')
      .eq('colaborador_id', colaboradorId)
      .in('status', ['Aprovada', 'Em_Andamento', 'Concluida'])

    const diasUsados = (feriasUsadas || []).reduce((acc: number, f: any) => acc + (f.dias_gozo || 0), 0)
    diasFerias = Math.max(0, diasFerias - diasUsados)

    // Buscar solicitações pendentes
    const { count: solicitacoesPendentes } = await client
      .from('solicitacoes_funcionario')
      .select('id', { count: 'exact', head: true })
      .eq('colaborador_id', colaboradorId)
      .in('status', ['Pendente', 'Em_Analise'])

    // Buscar documentos novos (últimos 30 dias)
    const trintaDiasAtras = new Date()
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30)
    
    const { count: documentosNovos } = await client
      .from('documentos_funcionario')
      .select('id', { count: 'exact', head: true })
      .eq('colaborador_id', colaboradorId)
      .eq('disponivel_para_funcionario', true)
      .gte('created_at', trintaDiasAtras.toISOString())

    // Buscar comunicados não lidos
    let comunicadosNaoLidos = 0
    if (colaborador?.empresa_id) {
      const { data: comunicados } = await client
        .from('comunicados')
        .select('id')
        .eq('empresa_id', colaborador.empresa_id)
        .eq('ativo', true)

      const { data: lidos } = await client
        .from('comunicados_lidos')
        .select('comunicado_id')
        .eq('colaborador_id', colaboradorId)

      const lidosIds = new Set((lidos || []).map((l: any) => l.comunicado_id))
      comunicadosNaoLidos = (comunicados || []).filter((c: any) => !lidosIds.has(c.id)).length
    }

    // Calcular banco de horas (simplificado)
    const { data: bancoHoras } = await client
      .from('banco_horas')
      .select('tipo, horas')
      .eq('colaborador_id', colaboradorId)

    let totalMinutos = 0
    for (const bh of (bancoHoras || []) as any[]) {
      const match = bh.horas?.match(/(\d+):(\d+)/)
      if (match) {
        const minutos = parseInt(match[1]) * 60 + parseInt(match[2])
        if (bh.tipo === 'credito') totalMinutos += minutos
        else if (bh.tipo === 'debito' || bh.tipo === 'compensacao') totalMinutos -= minutos
      }
    }

    const horasBanco = Math.floor(Math.abs(totalMinutos) / 60)
    const minutosBanco = Math.abs(totalMinutos) % 60
    const sinalBanco = totalMinutos < 0 ? '-' : ''

    return {
      banco_horas: `${sinalBanco}${String(horasBanco).padStart(2, '0')}:${String(minutosBanco).padStart(2, '0')}`,
      dias_ferias: diasFerias,
      solicitacoes_pendentes: solicitacoesPendentes || 0,
      documentos_novos: documentosNovos || 0,
      comunicados_nao_lidos: comunicadosNaoLidos
    }
  } catch (e: any) {
    console.error('Erro ao buscar estatísticas:', e)
    throw createError({ statusCode: 500, message: e.message || 'Erro ao buscar estatísticas' })
  }
})
