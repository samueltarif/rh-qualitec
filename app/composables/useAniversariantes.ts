interface Aniversariante {
  id: string
  nome_completo: string
  data_nascimento: string
  avatar?: string
  dia?: number
  cargo?: string
  departamento?: string
}

// Estado global dos aniversariantes
const aniversariantes = ref<Aniversariante[]>([])
const loading = ref(false)
const lastFetch = ref<Date | null>(null)

export const useAniversariantes = () => {
  // Função para buscar aniversariantes
  const fetchAniversariantes = async (forceRefresh = false) => {
    // Evitar múltiplas chamadas desnecessárias
    if (!forceRefresh && lastFetch.value) {
      const agora = new Date()
      const diffMinutos = (agora.getTime() - lastFetch.value.getTime()) / (1000 * 60)
      if (diffMinutos < 5) { // Cache por 5 minutos
        return aniversariantes.value
      }
    }

    loading.value = true
    try {
      const data = await $fetch('/api/dashboard/aniversariantes')
      aniversariantes.value = Array.isArray(data) ? data : []
      lastFetch.value = new Date()
      
      console.log(`📅 Aniversariantes carregados: ${aniversariantes.value.length}`)
      return aniversariantes.value
    } catch (error) {
      console.error('Erro ao buscar aniversariantes:', error)
      aniversariantes.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  // Função para obter aniversariantes do dia
  const getAniversariantesHoje = () => {
    const hoje = new Date()
    const diaHoje = hoje.getDate()
    
    return aniversariantes.value.filter(aniversariante => {
      // CORRIGIDO: Usar split para evitar problemas de timezone
      const [ano, mes, dia] = aniversariante.data_nascimento.split('-').map(Number)
      return dia === diaHoje
    })
  }

  // Função para obter próximos aniversariantes (próximos 7 dias)
  const getProximosAniversariantes = () => {
    const hoje = new Date()
    const diaHoje = hoje.getDate()
    const mesAtual = hoje.getMonth()
    const anoAtual = hoje.getFullYear()
    
    return aniversariantes.value.filter(aniversariante => {
      // CORRIGIDO: Usar split para evitar problemas de timezone
      const [ano, mes, dia] = aniversariante.data_nascimento.split('-').map(Number)
      const diaNascimento = dia
      
      // Próximos 7 dias
      for (let i = 1; i <= 7; i++) {
        const dataFutura = new Date(anoAtual, mesAtual, diaHoje + i)
        if (dataFutura.getDate() === diaNascimento) {
          return true
        }
      }
      return false
    })
  }

  // Função para formatar data de aniversário
  const formatarDataAniversario = (dataString: string) => {
    // CORRIGIDO: Usar split para evitar problemas de timezone
    const [ano, mes, dia] = dataString.split('-').map(Number)
    const data = new Date(ano, mes - 1, dia)
    return data.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long' 
    })
  }

  // Função para calcular idade
  const calcularIdade = (dataString: string) => {
    const hoje = new Date()
    // CORRIGIDO: Usar split para evitar problemas de timezone
    const [ano, mes, dia] = dataString.split('-').map(Number)
    const nascimento = new Date(ano, mes - 1, dia)
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    
    const mesAtual = hoje.getMonth()
    const diaAtual = hoje.getDate()
    const mesNascimento = nascimento.getMonth()
    const diaNascimento = nascimento.getDate()
    
    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && diaAtual < diaNascimento)) {
      idade--
    }
    
    return idade
  }

  // Computed para verificar se há aniversariantes hoje
  const temAniversarianteHoje = computed(() => {
    return getAniversariantesHoje().length > 0
  })

  // Computed para verificar se há aniversariantes no mês
  const temAniversarianteMes = computed(() => {
    return aniversariantes.value.length > 0
  })

  // Computed para contar aniversariantes
  const totalAniversariantes = computed(() => {
    return aniversariantes.value.length
  })

  return {
    // Estado
    aniversariantes: readonly(aniversariantes),
    loading: readonly(loading),
    
    // Funções
    fetchAniversariantes,
    getAniversariantesHoje,
    getProximosAniversariantes,
    formatarDataAniversario,
    calcularIdade,
    
    // Computed
    temAniversarianteHoje,
    temAniversarianteMes,
    totalAniversariantes
  }
}