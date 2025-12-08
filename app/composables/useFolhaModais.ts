/**
 * Composable para gerenciar modais da folha de pagamento
 */
export const useFolhaModais = () => {
  // Modal de 13º salário
  const modal13Aberto = ref(false)

  // Modal de Gerenciar Holerites
  const modalGerenciarHolerites = ref(false)

  // Modal de Adiantamento
  const modalAdiantamento = ref({
    aberto: false,
  })

  const colaboradoresAtivos = ref<any[]>([])

  const parametrosAdiantamento = ref({
    percentual: 40,
    diaPagamento: 20,
  })

  // Abrir modal de 13º salário
  const abrirModal13Salario = () => {
    modal13Aberto.value = true
  }

  // Callback de sucesso do 13º
  const handleSucesso13 = () => {
    console.log('13º salário gerado com sucesso')
  }

  // Buscar colaboradores ativos
  const buscarColaboradores = async () => {
    try {
      const data = await $fetch('/api/colaboradores', {
        query: { status: 'Ativo' }
      })
      
      if (data) {
        colaboradoresAtivos.value = data as any[]
      }
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error)
    }
  }

  // Buscar parâmetros de adiantamento
  const buscarParametrosAdiantamento = async () => {
    try {
      const data = await $fetch('/api/parametros-folha')
      
      if (data) {
        parametrosAdiantamento.value = {
          percentual: (data as any).adiantamento_percentual || 40,
          diaPagamento: (data as any).adiantamento_dia_pagamento || 20,
        }
      }
    } catch (error) {
      console.error('Erro ao buscar parâmetros:', error)
    }
  }

  // Abrir modal de adiantamento
  const abrirModalAdiantamento = async () => {
    await Promise.all([
      buscarColaboradores(),
      buscarParametrosAdiantamento()
    ])
    
    modalAdiantamento.value.aberto = true
  }

  // Handler de sucesso do adiantamento
  const handleSucessoAdiantamento = (callback?: () => void) => {
    if (callback) {
      callback()
    }
  }

  // Abrir modal de rescisão
  const abrirModalRescisao = () => {
    alert(
      '📋 Simulação de Rescisão Contratual\n\n' +
      'Funcionalidade em desenvolvimento!\n\n' +
      'Em breve você poderá simular:\n' +
      '• Rescisão sem justa causa\n' +
      '• Rescisão com justa causa\n' +
      '• Pedido de demissão\n' +
      '• Acordo trabalhista\n\n' +
      'Cálculos incluirão:\n' +
      '• Saldo de salário\n' +
      '• Férias proporcionais e vencidas\n' +
      '• 13º proporcional\n' +
      '• Aviso prévio\n' +
      '• Multa FGTS (40%)\n\n' +
      'Aguarde as próximas atualizações!'
    )
  }

  // Inicializar dados
  const inicializarDados = async () => {
    await Promise.all([
      buscarColaboradores(),
      buscarParametrosAdiantamento()
    ])
  }

  return {
    modal13Aberto,
    modalGerenciarHolerites,
    modalAdiantamento,
    colaboradoresAtivos,
    parametrosAdiantamento,
    abrirModal13Salario,
    handleSucesso13,
    abrirModalAdiantamento,
    handleSucessoAdiantamento,
    abrirModalRescisao,
    inicializarDados,
  }
}
