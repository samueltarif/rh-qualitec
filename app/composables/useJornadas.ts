// Composable para gerenciar jornadas de trabalho
export interface JornadaTrabalho {
  id: string
  nome: string
  descricao: string
  horas_semanais: number
  horas_mensais: number
  ativa: boolean
  padrao: boolean
  created_at: string
  updated_at: string
  horarios?: JornadaHorario[]
}

export interface JornadaHorario {
  id: string
  jornada_id: string
  dia_semana: number
  entrada: string
  saida: string
  intervalo_inicio?: string
  intervalo_fim?: string
  horas_brutas: number
  horas_intervalo: number
  horas_liquidas: number
  trabalha: boolean
}

export const useJornadas = () => {
  const jornadas = ref<JornadaTrabalho[]>([])
  const loading = ref(false)
  const error = ref('')

  // Nomes dos dias da semana
  const diasSemana = [
    { id: 1, nome: 'Segunda-feira', abrev: 'Seg' },
    { id: 2, nome: 'Terça-feira', abrev: 'Ter' },
    { id: 3, nome: 'Quarta-feira', abrev: 'Qua' },
    { id: 4, nome: 'Quinta-feira', abrev: 'Qui' },
    { id: 5, nome: 'Sexta-feira', abrev: 'Sex' },
    { id: 6, nome: 'Sábado', abrev: 'Sáb' },
    { id: 7, nome: 'Domingo', abrev: 'Dom' }
  ]

  const carregarJornadas = async () => {
    console.log('📡 [useJornadas] Carregando jornadas...')
    loading.value = true
    error.value = ''

    try {
      const response = await $fetch('/api/jornadas')
      console.log('✅ [useJornadas] Resposta recebida:', response)
      
      if (response.success && response.data) {
        jornadas.value = response.data
        console.log('✅ [useJornadas] Jornadas carregadas:', jornadas.value.length)
        return { success: true, message: 'Jornadas carregadas com sucesso!' }
      }

      console.log('⚠️ [useJornadas] Resposta sem sucesso')
      return { success: false, message: 'Erro ao carregar jornadas' }
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao carregar jornadas'
      console.error('❌ [useJornadas] Erro ao carregar jornadas:', err)
      
      // Fallback para dados de exemplo em caso de erro
      jornadas.value = [
        {
          id: '1',
          nome: 'Jornada 42h45min',
          descricao: 'Jornada personalizada: Segunda a quinta 8h45min, sexta 7h45min',
          horas_semanais: 42.75,
          horas_mensais: 185.25,
          ativa: true,
          padrao: true,
          created_at: '2026-01-13T10:00:00Z',
          updated_at: '2026-01-13T10:00:00Z',
          horarios: []
        }
      ]
      
      console.log('🔧 [useJornadas] Usando dados de fallback')
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const salvarJornada = async (jornada: Partial<JornadaTrabalho>): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    try {
      const response = await $fetch('/api/jornadas', {
        method: 'POST',
        body: jornada
      })

      if (response.success) {
        // Recarregar lista de jornadas
        await carregarJornadas()
        return { success: true, message: response.message || 'Jornada salva com sucesso!' }
      }

      return { success: false, message: 'Erro ao salvar jornada' }
    } catch (err: any) {
      console.error('Erro ao salvar jornada:', err)
      return { success: false, message: err.data?.message || 'Erro ao salvar jornada' }
    } finally {
      loading.value = false
    }
  }

  // Obter jornada por ID
  const obterJornada = (id: string): JornadaTrabalho | undefined => {
    return jornadas.value.find(j => j.id === id)
  }

  // Obter jornada padrão
  const obterJornadaPadrao = (): JornadaTrabalho | undefined => {
    return jornadas.value.find(j => j.padrao && j.ativa)
  }

  // Obter opções para select
  const opcoesJornadas = computed(() => {
    return jornadas.value
      .filter(j => j.ativa)
      .map(j => ({
        value: j.id,
        label: `${j.nome} (${j.horas_semanais}h semanais)`
      }))
  })

  // Formatar horário
  const formatarHorario = (horario: string): string => {
    if (!horario || horario === '00:00') return '--'
    return horario.substring(0, 5) // Remove os segundos
  }

  // Formatar horas decimais para horas:minutos
  const formatarHorasDecimais = (horas: number): string => {
    if (horas === 0) return '0h'
    
    const horasInteiras = Math.floor(horas)
    const minutos = Math.round((horas - horasInteiras) * 60)
    
    if (minutos === 0) {
      return `${horasInteiras}h`
    }
    
    return `${horasInteiras}h${minutos.toString().padStart(2, '0')}min`
  }

  // Calcular total de horas da semana
  const calcularHorasSemanais = (horarios: JornadaHorario[]): number => {
    return horarios
      .filter(h => h.trabalha)
      .reduce((total, h) => total + h.horas_liquidas, 0)
  }

  // Calcular total de horas do mês
  const calcularHorasMensais = (horasSemanais: number): number => {
    return horasSemanais * 4.33 // Média de semanas por mês
  }

  // Obter nome do dia da semana
  const obterNomeDia = (diaSemana: number): string => {
    const dia = diasSemana.find(d => d.id === diaSemana)
    return dia ? dia.nome : 'Desconhecido'
  }

  // Obter abreviação do dia da semana
  const obterAbrevDia = (diaSemana: number): string => {
    const dia = diasSemana.find(d => d.id === diaSemana)
    return dia ? dia.abrev : '?'
  }

  // Validar horários de uma jornada
  const validarJornada = (horarios: JornadaHorario[]): { valida: boolean; erros: string[] } => {
    const erros: string[] = []

    horarios.forEach(horario => {
      if (!horario.trabalha) return

      // Validar se entrada é antes da saída
      if (horario.entrada >= horario.saida) {
        erros.push(`${obterNomeDia(horario.dia_semana)}: Horário de entrada deve ser anterior ao de saída`)
      }

      // Validar intervalo
      if (horario.intervalo_inicio && horario.intervalo_fim) {
        if (horario.intervalo_inicio >= horario.intervalo_fim) {
          erros.push(`${obterNomeDia(horario.dia_semana)}: Início do intervalo deve ser anterior ao fim`)
        }

        if (horario.intervalo_inicio <= horario.entrada || horario.intervalo_fim >= horario.saida) {
          erros.push(`${obterNomeDia(horario.dia_semana)}: Intervalo deve estar dentro do horário de trabalho`)
        }
      }
    })

    return {
      valida: erros.length === 0,
      erros
    }
  }

  return {
    // Estado
    jornadas: readonly(jornadas),
    loading: readonly(loading),
    error: readonly(error),
    
    // Dados auxiliares
    diasSemana,
    opcoesJornadas,
    
    // Métodos
    carregarJornadas,
    salvarJornada,
    obterJornada,
    obterJornadaPadrao,
    formatarHorario,
    formatarHorasDecimais,
    calcularHorasSemanais,
    calcularHorasMensais,
    obterNomeDia,
    obterAbrevDia,
    validarJornada
  }
}