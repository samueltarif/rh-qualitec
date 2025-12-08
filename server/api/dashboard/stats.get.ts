/**
 * API para buscar estatísticas do dashboard admin
 */
export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceKey = config.supabaseServiceKey

    if (!serviceKey) {
      throw createError({ statusCode: 500, message: 'Service key não configurada' })
    }

    const headers = { 'Authorization': `Bearer ${serviceKey}`, 'apikey': serviceKey }

    // Buscar dados em paralelo
    const [
      colaboradoresRes,
      usuariosRes,
      departamentosRes,
      cargosRes,
    ] = await Promise.all([
      $fetch<any[]>(`${supabaseUrl}/rest/v1/colaboradores?select=id,nome,status,data_nascimento,data_admissao,data_desligamento,salario,created_at`, { headers }),
      $fetch<any[]>(`${supabaseUrl}/rest/v1/app_users?select=id,nome,email,role,ativo,ultimo_acesso,created_at`, { headers }),
      $fetch<any[]>(`${supabaseUrl}/rest/v1/departamentos?select=id,nome,ativo`, { headers }),
      $fetch<any[]>(`${supabaseUrl}/rest/v1/cargos?select=id,nome,nivel,ativo`, { headers }),
    ])

    const colaboradores = colaboradoresRes || []
    const usuarios = usuariosRes || []
    const departamentos = departamentosRes || []
    const cargos = cargosRes || []

    // Calcular estatísticas
    const hoje = new Date()
    const mesAtual = hoje.getMonth()
    const proximoMes = (mesAtual + 1) % 12
    const anoAtual = hoje.getFullYear()

    // Colaboradores ativos
    const colaboradoresAtivos = colaboradores.filter(c => c.status === 'Ativo')
    const colaboradoresAfastados = colaboradores.filter(c => c.status === 'Afastado')
    const colaboradoresInativos = colaboradores.filter(c => c.status === 'Inativo' || c.status === 'Desligado')

    // Custo folha mensal (soma dos salários)
    const custoFolhaMensal = colaboradoresAtivos.reduce((acc, c) => acc + (parseFloat(c.salario) || 0), 0)

    // Taxa de rotatividade (desligados nos últimos 12 meses / média de colaboradores)
    const umAnoAtras = new Date(anoAtual - 1, mesAtual, hoje.getDate())
    const desligadosUltimoAno = colaboradores.filter(c => {
      if (!c.data_desligamento) return false
      const dataDesligamento = new Date(c.data_desligamento)
      return dataDesligamento >= umAnoAtras
    }).length
    const mediaColaboradores = colaboradores.length || 1
    const taxaRotatividade = ((desligadosUltimoAno / mediaColaboradores) * 100).toFixed(1)

    // Aniversariantes do mês atual
    const aniversariantesMes = colaboradoresAtivos.filter(c => {
      if (!c.data_nascimento) return false
      const dataNasc = new Date(c.data_nascimento + 'T00:00:00')
      return dataNasc.getMonth() === mesAtual
    }).map(c => ({
      id: c.id,
      nome: c.nome,
      dia: new Date(c.data_nascimento + 'T00:00:00').getDate(),
    })).sort((a, b) => a.dia - b.dia)

    // Aniversariantes do próximo mês
    const aniversariantesProximoMes = colaboradoresAtivos.filter(c => {
      if (!c.data_nascimento) return false
      const dataNasc = new Date(c.data_nascimento + 'T00:00:00')
      return dataNasc.getMonth() === proximoMes
    }).map(c => ({
      id: c.id,
      nome: c.nome,
      dia: new Date(c.data_nascimento + 'T00:00:00').getDate(),
    })).sort((a, b) => a.dia - b.dia)

    // Últimas atividades (usuários com último acesso)
    const ultimasAtividades = usuarios
      .filter(u => u.ultimo_acesso)
      .sort((a, b) => new Date(b.ultimo_acesso).getTime() - new Date(a.ultimo_acesso).getTime())
      .slice(0, 10)
      .map(u => ({
        id: u.id,
        nome: u.nome,
        email: u.email,
        role: u.role,
        ultimo_acesso: u.ultimo_acesso,
      }))

    // Alertas de conformidade
    const alertas: Array<{ tipo: 'warning' | 'error' | 'info'; mensagem: string }> = []

    // Verificar colaboradores sem documentos (simplificado)
    if (colaboradoresAtivos.length > 0) {
      alertas.push({ tipo: 'info', mensagem: `${colaboradoresAtivos.length} colaboradores ativos no sistema` })
    }

    if (colaboradoresAfastados.length > 0) {
      alertas.push({ tipo: 'warning', mensagem: `${colaboradoresAfastados.length} colaborador(es) afastado(s)` })
    }

    // Verificar aniversariantes hoje
    const aniversariantesHoje = aniversariantesMes.filter(a => a.dia === hoje.getDate())
    if (aniversariantesHoje.length > 0) {
      alertas.push({ tipo: 'info', mensagem: `🎂 Hoje é aniversário de: ${aniversariantesHoje.map(a => a.nome).join(', ')}` })
    }

    // Novos colaboradores no mês
    const novosNoMes = colaboradores.filter(c => {
      if (!c.data_admissao) return false
      const dataAdm = new Date(c.data_admissao)
      return dataAdm.getMonth() === mesAtual && dataAdm.getFullYear() === anoAtual
    }).length

    if (novosNoMes > 0) {
      alertas.push({ tipo: 'info', mensagem: `${novosNoMes} novo(s) colaborador(es) admitido(s) este mês` })
    }

    return {
      success: true,
      data: {
        // Contadores principais
        totalUsuarios: usuarios.length,
        usuariosAtivos: usuarios.filter(u => u.ativo).length,
        totalColaboradores: colaboradores.length,
        colaboradoresAtivos: colaboradoresAtivos.length,
        colaboradoresAfastados: colaboradoresAfastados.length,
        colaboradoresInativos: colaboradoresInativos.length,
        totalDepartamentos: departamentos.filter(d => d.ativo).length,
        totalCargos: cargos.filter(c => c.ativo).length,
        
        // Métricas financeiras
        custoFolhaMensal,
        
        // Métricas de RH
        taxaRotatividade: parseFloat(taxaRotatividade),
        novosNoMes,
        
        // Aniversariantes
        aniversariantesMes,
        aniversariantesProximoMes,
        
        // Atividades
        ultimasAtividades,
        
        // Alertas
        alertas,
        
        // Meta info
        mesAtualNome: new Date(anoAtual, mesAtual).toLocaleDateString('pt-BR', { month: 'long' }),
        proximoMesNome: new Date(anoAtual, proximoMes).toLocaleDateString('pt-BR', { month: 'long' }),
      }
    }
  } catch (error: any) {
    console.error('[DASHBOARD STATS] Erro:', error.message || error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Erro ao buscar estatísticas' 
    })
  }
})
