/**
 * Utilitário para criar notificações automáticas do sistema
 */

interface NotificationData {
  titulo: string
  mensagem: string
  tipo?: 'info' | 'success' | 'warning' | 'error'
  origem?: string
  dados?: any
  importante?: boolean
  acao_url?: string
}

/**
 * Cria uma notificação automática para o admin
 */
export async function criarNotificacaoAdmin(
  event: any,
  notificationData: NotificationData
) {
  try {
    console.log('📬 [NOTIFICACAO-AUTO] === INÍCIO DA CRIAÇÃO ===')
    console.log('📋 Dados da notificação:', JSON.stringify(notificationData, null, 2))
    
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceRoleKey = config.supabaseServiceRoleKey || config.public.supabaseKey

    console.log('🔑 Configurações Supabase:')
    console.log('   URL:', supabaseUrl ? `${String(supabaseUrl).substring(0, 30)}...` : 'MISSING')
    console.log('   Service Role Key:', serviceRoleKey ? `${String(serviceRoleKey).substring(0, 30)}...` : 'MISSING')

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ [NOTIFICACAO-AUTO] Configurações do Supabase estão faltando!')
      return false
    }

    const dadosNotificacao = {
      titulo: notificationData.titulo,
      mensagem: notificationData.mensagem,
      tipo: notificationData.tipo || 'info',
      origem: notificationData.origem || 'sistema',
      dados: notificationData.dados || {},
      importante: notificationData.importante || false,
      acao_url: notificationData.acao_url || null,
      data_expiracao: null,
      lida: false,
      created_at: new Date().toISOString()
    }

    console.log('📦 [NOTIFICACAO-AUTO] Payload final:', JSON.stringify(dadosNotificacao, null, 2))

    const url = `${supabaseUrl}/rest/v1/notificacoes`
    console.log('🌐 [NOTIFICACAO-AUTO] URL da requisição:', url)

    const headers = {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }

    console.log('📋 [NOTIFICACAO-AUTO] Headers:', {
      'apikey': serviceRoleKey ? `${String(serviceRoleKey).substring(0, 20)}...` : 'MISSING',
      'Authorization': serviceRoleKey ? `Bearer ${String(serviceRoleKey).substring(0, 20)}...` : 'MISSING',
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    })

    console.log('📡 [NOTIFICACAO-AUTO] Fazendo requisição para Supabase...')

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(dadosNotificacao)
    })

    console.log('📊 [NOTIFICACAO-AUTO] Status da resposta:', response.status)
    console.log('📊 [NOTIFICACAO-AUTO] Status text:', response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [NOTIFICACAO-AUTO] Erro na resposta:', errorText)
      console.error('📋 [NOTIFICACAO-AUTO] Response headers:', Object.fromEntries(response.headers.entries()))
      
      // Tentar parsear o erro como JSON
      try {
        const errorJson = JSON.parse(errorText)
        console.error('📋 [NOTIFICACAO-AUTO] Erro JSON:', errorJson)
      } catch (e) {
        console.error('📋 [NOTIFICACAO-AUTO] Erro não é JSON válido')
      }
      
      return false
    }

    const notificacao = await response.json()
    console.log('✅ [NOTIFICACAO-AUTO] Notificação criada com sucesso!')
    console.log('📋 [NOTIFICACAO-AUTO] ID da notificação:', notificacao[0]?.id)
    console.log('📋 [NOTIFICACAO-AUTO] Resposta completa:', JSON.stringify(notificacao, null, 2))
    console.log('📬 [NOTIFICACAO-AUTO] === FIM DA CRIAÇÃO ===')
    
    return true

  } catch (error: any) {
    console.error('💥 [NOTIFICACAO-AUTO] === ERRO NA CRIAÇÃO ===')
    console.error('💥 [NOTIFICACAO-AUTO] Mensagem:', error.message)
    console.error('💥 [NOTIFICACAO-AUTO] Stack:', error.stack)
    console.error('💥 [NOTIFICACAO-AUTO] Erro completo:', error)
    return false
  }
}

/**
 * Cria notificação para login de funcionário
 */
export async function notificarLogin(event: any, funcionario: any, clientIP: string) {
  const agora = new Date().toLocaleString('pt-BR', { 
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  await criarNotificacaoAdmin(event, {
    titulo: '🔐 Login no Sistema',
    mensagem: `${funcionario.nome} fez login no sistema em ${agora}`,
    tipo: 'info',
    origem: 'login',
    dados: {
      funcionario_id: funcionario.id,
      funcionario_nome: funcionario.nome,
      funcionario_email: funcionario.email,
      tipo_acesso: funcionario.tipo,
      ip: clientIP,
      timestamp: new Date().toISOString()
    }
  })
}

/**
 * Cria notificação para alteração de dados
 */
export async function notificarAlteracaoDados(
  event: any, 
  funcionario: any, 
  camposAlterados: string[],
  tipoAlteracao: 'proprio' | 'admin' = 'proprio',
  valoresAnteriores?: any,
  valoresNovos?: any
) {
  const agora = new Date().toLocaleString('pt-BR', { 
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  // Mapear nomes técnicos para nomes amigáveis
  const nomesCampos: { [key: string]: string } = {
    nome_completo: 'Nome Completo',
    cpf: 'CPF',
    rg: 'RG',
    data_nascimento: 'Data de Nascimento',
    sexo: 'Sexo',
    telefone: 'Telefone',
    email_pessoal: 'Email Pessoal',
    email_login: 'Email de Login',
    empresa_id: 'Empresa',
    departamento_id: 'Departamento',
    cargo_id: 'Cargo',
    jornada_trabalho_id: 'Jornada de Trabalho',
    responsavel_id: 'Responsável',
    tipo_contrato: 'Tipo de Contrato',
    data_admissao: 'Data de Admissão',
    matricula: 'Matrícula',
    senha: 'Senha',
    tipo_acesso: 'Tipo de Acesso',
    status: 'Status',
    salario_base: 'Salário Base',
    numero_dependentes: 'Número de Dependentes',
    tipo_salario: 'Tipo de Salário',
    banco: 'Banco',
    agencia: 'Agência',
    conta: 'Conta',
    tipo_conta: 'Tipo de Conta',
    forma_pagamento: 'Forma de Pagamento',
    chave_pix: 'Chave PIX',
    pis_pasep: 'PIS/PASEP',
    pensao_alimenticia: 'Pensão Alimentícia',
    avatar: 'Avatar',
    endereco: 'Endereço',
    cep: 'CEP',
    cidade: 'Cidade',
    estado: 'Estado'
  }

  // Criar lista detalhada das alterações
  const alteracoesDetalhadas = camposAlterados.map(campo => {
    const nomeAmigavel = nomesCampos[campo] || campo
    let detalhes = nomeAmigavel

    // Se temos valores anteriores e novos, mostrar a mudança
    if (valoresAnteriores && valoresNovos && valoresAnteriores[campo] !== undefined) {
      const valorAnterior = valoresAnteriores[campo]
      const valorNovo = valoresNovos[campo]
      
      // Para campos sensíveis, não mostrar o valor
      if (['senha', 'senha_hash'].includes(campo)) {
        detalhes = `${nomeAmigavel}: senha alterada`
      } else if (campo === 'salario_base') {
        const salAnt = valorAnterior ? Number(valorAnterior).toFixed(2) : '0.00'
        const salNovo = valorNovo ? Number(valorNovo).toFixed(2) : '0.00'
        detalhes = `${nomeAmigavel}: R$ ${salAnt} → R$ ${salNovo}`
      } else if (campo.includes('data_')) {
        const dataAnt = valorAnterior ? new Date(valorAnterior).toLocaleDateString('pt-BR') : '(vazio)'
        const dataNova = valorNovo ? new Date(valorNovo).toLocaleDateString('pt-BR') : '(vazio)'
        detalhes = `${nomeAmigavel}: ${dataAnt} → ${dataNova}`
      } else if (campo === 'beneficios' || campo === 'descontos_personalizados') {
        // Para objetos complexos, mostrar apenas que foi alterado
        detalhes = `${nomeAmigavel}: configuração alterada`
      } else if (typeof valorAnterior === 'object' || typeof valorNovo === 'object') {
        // Para outros objetos, mostrar apenas que foi alterado
        detalhes = `${nomeAmigavel}: dados alterados`
      } else {
        const valAnt = valorAnterior === null || valorAnterior === undefined ? '(vazio)' : String(valorAnterior)
        const valNovo = valorNovo === null || valorNovo === undefined ? '(vazio)' : String(valorNovo)
        detalhes = `${nomeAmigavel}: "${valAnt}" → "${valNovo}"`
      }
    }

    return detalhes
  })

  const acao = tipoAlteracao === 'proprio' ? 'alterou seus próprios dados' : 'teve seus dados alterados pelo admin'
  const alteracoesTexto = alteracoesDetalhadas.join('; ')
  
  await criarNotificacaoAdmin(event, {
    titulo: '✏️ Alteração de Dados',
    mensagem: `${funcionario.nome} ${acao} em ${agora}. Alterações: ${alteracoesTexto}`,
    tipo: 'warning',
    origem: 'alteracao_dados',
    importante: true,
    dados: {
      funcionario_id: funcionario.id,
      funcionario_nome: funcionario.nome,
      campos_alterados: camposAlterados,
      alteracoes_detalhadas: alteracoesDetalhadas,
      valores_anteriores: valoresAnteriores,
      valores_novos: valoresNovos,
      tipo_alteracao: tipoAlteracao,
      timestamp: new Date().toISOString()
    },
    acao_url: `/admin/funcionarios`
  })
}

/**
 * Cria notificação para criação de funcionário
 */
export async function notificarCriacaoFuncionario(event: any, funcionario: any, responsavel: any) {
  const agora = new Date().toLocaleString('pt-BR', { 
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  await criarNotificacaoAdmin(event, {
    titulo: '👤 Novo Funcionário',
    mensagem: `Funcionário ${funcionario.nome_completo} foi cadastrado por ${responsavel.nome} em ${agora}`,
    tipo: 'success',
    origem: 'novo_funcionario',
    importante: true,
    dados: {
      funcionario_id: funcionario.id,
      funcionario_nome: funcionario.nome_completo,
      funcionario_email: funcionario.email_login,
      responsavel_id: responsavel.id,
      responsavel_nome: responsavel.nome,
      timestamp: new Date().toISOString()
    },
    acao_url: `/admin/funcionarios`
  })
}

/**
 * Cria notificação para geração de holerites
 */
export async function notificarGeracaoHolerites(
  event: any, 
  tipo: 'mensal' | 'adiantamento',
  totalGerados: number,
  responsavel?: any
) {
  const agora = new Date().toLocaleString('pt-BR', { 
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const tipoTexto = tipo === 'mensal' ? 'Folha Mensal' : 'Adiantamento Salarial'
  const responsavelTexto = responsavel ? ` por ${responsavel.nome}` : ' automaticamente'

  await criarNotificacaoAdmin(event, {
    titulo: '💰 Holerites Gerados',
    mensagem: `${tipoTexto}: ${totalGerados} holerite(s) gerado(s)${responsavelTexto} em ${agora}`,
    tipo: 'success',
    origem: 'geracao_holerites',
    importante: true,
    dados: {
      tipo_holerite: tipo,
      total_gerados: totalGerados,
      responsavel_id: responsavel?.id,
      responsavel_nome: responsavel?.nome,
      timestamp: new Date().toISOString()
    },
    acao_url: `/admin/holerites`
  })
}

/**
 * Cria notificação para visualização de holerite
 */
export async function notificarVisualizacaoHolerite(
  event: any,
  funcionario: any,
  holerite: any
) {
  const agora = new Date().toLocaleString('pt-BR', { 
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  // CORRIGIDO: Usar split para evitar problemas de timezone
  const [anoInicio, mesInicio, diaInicio] = holerite.periodo_inicio.split('-').map(Number)
  const [anoFim, mesFim, diaFim] = holerite.periodo_fim.split('-').map(Number)
  const periodoInicio = new Date(anoInicio, mesInicio - 1, diaInicio)
  const periodoFim = new Date(anoFim, mesFim - 1, diaFim)
  const mesAno = periodoInicio.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  
  // Determinar tipo de holerite
  let tipoHolerite = 'mensal'
  if (periodoInicio.getDate() === 15) {
    tipoHolerite = 'adiantamento'
  } else if (periodoInicio.getDate() === 1 && periodoFim.getDate() <= 15) {
    tipoHolerite = '1ª quinzena'
  } else if (periodoInicio.getDate() === 16) {
    tipoHolerite = '2ª quinzena'
  }

  await criarNotificacaoAdmin(event, {
    titulo: '👁️ Holerite Visualizado',
    mensagem: `${funcionario.nome} visualizou seu holerite (${tipoHolerite}) de ${mesAno} em ${agora}`,
    tipo: 'info',
    origem: 'visualizacao_holerite',
    dados: {
      funcionario_id: funcionario.id,
      funcionario_nome: funcionario.nome,
      funcionario_email: funcionario.email,
      holerite_id: holerite.id,
      periodo: mesAno,
      tipo_holerite: tipoHolerite,
      periodo_inicio: holerite.periodo_inicio,
      periodo_fim: holerite.periodo_fim,
      salario_liquido: holerite.salario_liquido,
      timestamp: new Date().toISOString()
    },
    acao_url: `/admin/holerites`
  })
}

/**
 * Cria notificação para download de holerite
 */
export async function notificarDownloadHolerite(
  event: any,
  funcionario: any,
  holerite: any,
  formato: 'html' | 'pdf' = 'html'
) {
  const agora = new Date().toLocaleString('pt-BR', { 
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  // CORRIGIDO: Usar split para evitar problemas de timezone
  const [anoInicio, mesInicio, diaInicio] = holerite.periodo_inicio.split('-').map(Number)
  const [anoFim, mesFim, diaFim] = holerite.periodo_fim.split('-').map(Number)
  const periodoInicio = new Date(anoInicio, mesInicio - 1, diaInicio)
  const periodoFim = new Date(anoFim, mesFim - 1, diaFim)
  const mesAno = periodoInicio.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  
  // Determinar tipo de holerite
  let tipoHolerite = 'mensal'
  if (periodoInicio.getDate() === 15) {
    tipoHolerite = 'adiantamento'
  } else if (periodoInicio.getDate() === 1 && periodoFim.getDate() <= 15) {
    tipoHolerite = '1ª quinzena'
  } else if (periodoInicio.getDate() === 16) {
    tipoHolerite = '2ª quinzena'
  }

  const formatoTexto = formato.toUpperCase()

  await criarNotificacaoAdmin(event, {
    titulo: '📥 Holerite Baixado',
    mensagem: `${funcionario.nome} baixou seu holerite (${tipoHolerite}) de ${mesAno} em formato ${formatoTexto} em ${agora}`,
    tipo: 'info',
    origem: 'download_holerite',
    dados: {
      funcionario_id: funcionario.id,
      funcionario_nome: funcionario.nome,
      funcionario_email: funcionario.email,
      holerite_id: holerite.id,
      periodo: mesAno,
      tipo_holerite: tipoHolerite,
      formato: formato,
      periodo_inicio: holerite.periodo_inicio,
      periodo_fim: holerite.periodo_fim,
      salario_liquido: holerite.salario_liquido,
      timestamp: new Date().toISOString()
    },
    acao_url: `/admin/holerites`
  })
}
/**
 * Cria notificação para erros críticos
 */
export async function notificarErroCritico(event: any, erro: string, contexto: any = {}) {
  const agora = new Date().toLocaleString('pt-BR', { 
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  await criarNotificacaoAdmin(event, {
    titulo: '🚨 Erro Crítico',
    mensagem: `Erro crítico detectado em ${agora}: ${erro}`,
    tipo: 'error',
    origem: 'erro_sistema',
    importante: true,
    dados: {
      erro_mensagem: erro,
      contexto: contexto,
      timestamp: new Date().toISOString()
    }
  })
}