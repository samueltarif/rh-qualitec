/**
 * Composable para gerenciar o modal de 13º salário
 */
export const useModal13Salario = () => {
  const loading = ref(false)
  const gerando = ref(false)
  const colaboradores = ref<any[]>([])
  const selecionados = ref<number[]>([])
  const mostrarFiltros = ref(false)
  const busca = ref('')
  const filtroStatus = ref('')

  // Filtros
  const hoje = new Date()
  const filtros = ref({
    parcela: '1' as '1' | '2' | 'integral',
    ano: String(hoje.getFullYear())
  })

  // Colaboradores filtrados
  const colaboradoresFiltrados = computed(() => {
    let resultado = colaboradores.value

    if (busca.value) {
      const termo = busca.value.toLowerCase()
      resultado = resultado.filter(c => 
        c.nome.toLowerCase().includes(termo) || 
        c.cpf.includes(termo)
      )
    }

    if (filtroStatus.value) {
      resultado = resultado.filter(c => c.status === filtroStatus.value)
    }

    return resultado
  })

  // Colaboradores selecionados
  const colaboradoresSelecionados = computed(() => {
    return colaboradores.value.filter(c => selecionados.value.includes(c.id))
  })

  // Todos selecionados
  const todosSelecionados = computed(() => {
    return colaboradoresFiltrados.value.length > 0 && 
           colaboradoresFiltrados.value.every(c => selecionados.value.includes(c.id))
  })

  // Total selecionados
  const totalSelecionados = computed(() => {
    const { calcularValor13 } = use13SalarioCalculos()
    return colaboradoresSelecionados.value.reduce((total, c) => {
      return total + calcularValor13(c.salario_base, c.meses_trabalhados || 12, filtros.value.parcela)
    }, 0)
  })

  // Toggle colaborador
  const toggleColaborador = (id: number) => {
    const index = selecionados.value.indexOf(id)
    if (index > -1) {
      selecionados.value.splice(index, 1)
    } else {
      selecionados.value.push(id)
    }
  }

  // Toggle todos
  const toggleTodos = () => {
    if (todosSelecionados.value) {
      const filtradosIds = colaboradoresFiltrados.value.map(c => c.id)
      selecionados.value = selecionados.value.filter(id => !filtradosIds.includes(id))
    } else {
      const filtradosIds = colaboradoresFiltrados.value.map(c => c.id)
      selecionados.value = [...new Set([...selecionados.value, ...filtradosIds])]
    }
  }

  // Carregar colaboradores
  const carregarColaboradores = async () => {
    loading.value = true
    try {
      const { calcularMesesTrabalhados } = use13SalarioCalculos()
      const response = await $fetch<any[]>('/api/colaboradores', {
        params: { status: 'Ativo' }
      })

      if (response) {
        colaboradores.value = response.map(colab => ({
          ...colab,
          meses_trabalhados: colab.data_admissao 
            ? calcularMesesTrabalhados(colab.data_admissao, parseInt(filtros.value.ano))
            : 12
        }))
      }
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error)
      alert('Erro ao carregar colaboradores')
    } finally {
      loading.value = false
    }
  }

  // Gerar holerites
  const gerarHolerites = async () => {
    if (colaboradoresSelecionados.value.length === 0) {
      alert('Selecione pelo menos um colaborador')
      return false
    }

    const { formatCurrency } = useFolhaCalculos()
    const parcelaTexto = obterTextoParcelaCompleto(filtros.value.parcela)
    
    const confirmar = confirm(
      `Deseja gerar holerites de 13º salário para ${colaboradoresSelecionados.value.length} colaborador(es)?\n\n` +
      `${parcelaTexto}\n` +
      `Ano: ${filtros.value.ano}\n` +
      `Total: ${formatCurrency(totalSelecionados.value)}`
    )

    if (!confirmar) return false

    gerando.value = true
    try {
      const response = await $fetch<{ success: boolean; data: any }>('/api/decimo-terceiro/gerar', {
        method: 'POST',
        body: {
          colaboradores_ids: selecionados.value,
          parcela: filtros.value.parcela,
          ano: parseInt(filtros.value.ano)
        }
      })

      if (response.success) {
        const { total_gerados, total_erros } = response.data
        
        let mensagem = `✅ ${total_gerados} holerite(s) de 13º salário gerado(s) com sucesso!`
        
        if (total_erros > 0) {
          mensagem += `\n\n⚠️ ${total_erros} erro(s) encontrado(s).`
        }
        
        mensagem += '\n\nOs funcionários já podem visualizar seus holerites no portal.'
        
        alert(mensagem)
        return true
      }
    } catch (error: any) {
      console.error('Erro ao gerar holerites:', error)
      alert(`Erro ao gerar holerites: ${error.data?.message || error.message || 'Erro desconhecido'}`)
      return false
    } finally {
      gerando.value = false
    }
  }

  // Gerar e enviar
  const gerarEEnviar = async () => {
    if (colaboradoresSelecionados.value.length === 0) {
      alert('Selecione pelo menos um colaborador')
      return false
    }

    const { formatCurrency } = useFolhaCalculos()
    const parcelaTexto = obterTextoParcelaCompleto(filtros.value.parcela)
    
    const confirmar = confirm(
      `Deseja gerar e enviar por email os holerites de 13º salário para ${colaboradoresSelecionados.value.length} colaborador(es)?\n\n` +
      `${parcelaTexto}\n` +
      `Ano: ${filtros.value.ano}\n` +
      `Total: ${formatCurrency(totalSelecionados.value)}\n\n` +
      `Os emails serão enviados individualmente para cada colaborador.`
    )

    if (!confirmar) return false

    gerando.value = true
    try {
      const response = await $fetch<{ success: boolean; data: any }>('/api/decimo-terceiro/gerar-enviar', {
        method: 'POST',
        body: {
          colaboradores_ids: selecionados.value,
          parcela: filtros.value.parcela,
          ano: parseInt(filtros.value.ano)
        }
      })

      if (response.success) {
        const { total_gerados, total_enviados, total_erros } = response.data
        
        let mensagem = `✅ ${total_gerados} holerite(s) gerado(s)\n`
        mensagem += `📧 ${total_enviados} email(s) enviado(s) com sucesso!`
        
        if (total_erros > 0) {
          mensagem += `\n\n⚠️ ${total_erros} erro(s) encontrado(s).`
        }
        
        alert(mensagem)
        return true
      }
    } catch (error: any) {
      console.error('Erro ao gerar e enviar:', error)
      alert(`Erro ao processar: ${error.data?.message || error.message || 'Erro desconhecido'}`)
      return false
    } finally {
      gerando.value = false
    }
  }

  // Resetar
  const resetar = () => {
    selecionados.value = []
    busca.value = ''
    filtroStatus.value = ''
    mostrarFiltros.value = false
  }

  // Recalcular meses trabalhados quando o ano mudar
  watch(() => filtros.value.ano, () => {
    if (colaboradores.value.length > 0) {
      const { calcularMesesTrabalhados } = use13SalarioCalculos()
      colaboradores.value = colaboradores.value.map(colab => ({
        ...colab,
        meses_trabalhados: colab.data_admissao 
          ? calcularMesesTrabalhados(colab.data_admissao, parseInt(filtros.value.ano))
          : 12
      }))
    }
  })

  return {
    loading,
    gerando,
    colaboradores,
    selecionados,
    mostrarFiltros,
    busca,
    filtroStatus,
    filtros,
    colaboradoresFiltrados,
    colaboradoresSelecionados,
    todosSelecionados,
    totalSelecionados,
    toggleColaborador,
    toggleTodos,
    carregarColaboradores,
    gerarHolerites,
    gerarEEnviar,
    resetar,
  }
}

// Helper para obter texto da parcela
function obterTextoParcelaCompleto(parcela: string): string {
  if (parcela === '1') {
    return 'Parcela: 1ª Parcela\nSerá gerado 1 holerite (novembro)'
  } else if (parcela === '2') {
    return 'Parcela: 2ª Parcela\nSerá gerado 1 holerite (dezembro)'
  } else {
    return 'Parcela: Integral\nSerá gerado 1 holerite (dezembro)'
  }
}
