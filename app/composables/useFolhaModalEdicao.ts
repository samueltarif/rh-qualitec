/**
 * Composable para gerenciar o modal de edição da folha
 */
export const useFolhaModalEdicao = () => {
  const modalEdicao = ref({
    aberto: false,
    dados: null as any,
    edicao: {
      // Proventos
      horas_extras_50: 0,
      horas_extras_100: 0,
      bonus: 0,
      comissoes: 0,
      adicional_insalubridade: 0,
      adicional_periculosidade: 0,
      adicional_noturno: 0,
      outros_proventos: 0,
      // Descontos
      adiantamento: 0,
      emprestimos: 0,
      faltas_horas: 0,
      atrasos_horas: 0,
      vale_transporte: 0,
      vale_refeicao: 0,
      vale_alimentacao: 0,
      outros_descontos: 0,
      // Benefícios
      plano_saude: 0,
      plano_odontologico: 0,
      seguro_vida: 0,
      auxilio_creche: 0,
      auxilio_educacao: 0,
      auxilio_combustivel: 0,
      outros_beneficios: 0,
      // Impostos manuais (opcional)
      inss_manual: null as number | null,
      irrf_manual: null as number | null,
      // Itens personalizados
      itens_personalizados: [] as Array<{
        tipo: 'provento' | 'desconto'
        codigo: string
        descricao: string
        referencia: string
        valor: number
      }>,
    },
    resumo: {
      salario_base: 0,
      total_proventos: 0,
      salario_bruto: 0,
      inss: 0,
      irrf: 0,
      outros_descontos: 0,
      total_descontos: 0,
      salario_liquido: 0,
      fgts: 0,
      total_beneficios: 0,
      inss_calculado: 0,
      irrf_calculado: 0,
    }
  })

  // Computed para benefícios
  const beneficiosData = computed({
    get: () => ({
      vale_transporte: modalEdicao.value.edicao.vale_transporte,
      vale_refeicao: modalEdicao.value.edicao.vale_refeicao,
      vale_alimentacao: modalEdicao.value.edicao.vale_alimentacao,
      plano_saude: modalEdicao.value.edicao.plano_saude,
      plano_odontologico: modalEdicao.value.edicao.plano_odontologico,
      seguro_vida: modalEdicao.value.edicao.seguro_vida,
      auxilio_creche: modalEdicao.value.edicao.auxilio_creche,
      auxilio_educacao: modalEdicao.value.edicao.auxilio_educacao,
      auxilio_combustivel: modalEdicao.value.edicao.auxilio_combustivel,
      outros_beneficios: modalEdicao.value.edicao.outros_beneficios,
    }),
    set: (value) => {
      Object.assign(modalEdicao.value.edicao, value)
    }
  })

  // Computed para proventos
  const proventosData = computed({
    get: () => ({
      horas_extras_50: modalEdicao.value.edicao.horas_extras_50,
      horas_extras_100: modalEdicao.value.edicao.horas_extras_100,
      bonus: modalEdicao.value.edicao.bonus,
      comissoes: modalEdicao.value.edicao.comissoes,
      adicional_insalubridade: modalEdicao.value.edicao.adicional_insalubridade,
      adicional_periculosidade: modalEdicao.value.edicao.adicional_periculosidade,
      adicional_noturno: modalEdicao.value.edicao.adicional_noturno,
      outros_proventos: modalEdicao.value.edicao.outros_proventos,
    }),
    set: (value) => {
      Object.assign(modalEdicao.value.edicao, value)
    }
  })

  // Computed para descontos
  const descontosData = computed({
    get: () => ({
      adiantamento: modalEdicao.value.edicao.adiantamento,
      emprestimos: modalEdicao.value.edicao.emprestimos,
      faltas_horas: modalEdicao.value.edicao.faltas_horas,
      atrasos_horas: modalEdicao.value.edicao.atrasos_horas,
      outros_descontos: modalEdicao.value.edicao.outros_descontos,
    }),
    set: (value) => {
      Object.assign(modalEdicao.value.edicao, value)
    }
  })

  // Computed para impostos
  const impostosData = computed({
    get: () => ({
      inss_manual: modalEdicao.value.edicao.inss_manual,
      irrf_manual: modalEdicao.value.edicao.irrf_manual,
    }),
    set: (value) => {
      Object.assign(modalEdicao.value.edicao, value)
    }
  })

  // Computed para itens personalizados
  const itensPersonalizadosData = computed({
    get: () => modalEdicao.value.edicao.itens_personalizados,
    set: (value) => {
      modalEdicao.value.edicao.itens_personalizados = value
    }
  })

  // Abrir modal de edição
  const abrirModalEdicao = async (item: any, mes?: string, ano?: string) => {
    try {
      const response = await $fetch<any>(`/api/colaboradores/${item.colaborador_id}`)
      
      modalEdicao.value.dados = {
        ...item,
        mes: mes || item.mes,
        ano: ano || item.ano,
        cargo: response.cargo_nome || response.cargo || '-',
        salario_base: item.salario_bruto || 0,
        dependentes: response.dependentes || 0,
        horas_contratadas: response.horas_contratadas || 220,
      }
      
      console.log('📝 Dados do modal carregados:', {
        colaborador_id: modalEdicao.value.dados.colaborador_id,
        mes: modalEdicao.value.dados.mes,
        ano: modalEdicao.value.dados.ano
      })

      // Pré-preencher benefícios do cadastro do colaborador
      const beneficiosColaborador = {
        vale_transporte: response.recebe_vt ? (Number(response.valor_vt) || 0) : 0,
        vale_refeicao: response.recebe_vr ? (Number(response.valor_vr) || 0) : 0,
        vale_alimentacao: response.recebe_va ? (Number(response.valor_va) || 0) : 0,
        plano_saude: response.plano_saude ? 150 : 0,
        plano_odontologico: response.plano_odonto ? 50 : 0,
      }

      // Resetar campos de edição com benefícios pré-preenchidos
      Object.assign(modalEdicao.value.edicao, {
        horas_extras_50: 0,
        horas_extras_100: 0,
        bonus: 0,
        comissoes: 0,
        adicional_insalubridade: 0,
        adicional_periculosidade: 0,
        adicional_noturno: 0,
        outros_proventos: 0,
        adiantamento: 0,
        emprestimos: 0,
        faltas_horas: 0,
        atrasos_horas: 0,
        vale_transporte: beneficiosColaborador.vale_transporte,
        vale_refeicao: beneficiosColaborador.vale_refeicao,
        vale_alimentacao: beneficiosColaborador.vale_alimentacao,
        outros_descontos: 0,
        plano_saude: beneficiosColaborador.plano_saude,
        plano_odontologico: beneficiosColaborador.plano_odontologico,
        seguro_vida: 0,
        auxilio_creche: 0,
        auxilio_educacao: 0,
        auxilio_combustivel: 0,
        outros_beneficios: 0,
        inss_manual: null,
        irrf_manual: null,
        itens_personalizados: [],
      })

      modalEdicao.value.aberto = true
      
      // Aguardar próximo tick e calcular resumo inicial
      await nextTick()
      recalcularResumo()
    } catch (error) {
      console.error('Erro ao buscar dados do colaborador:', error)
      
      // Usar dados básicos se falhar
      modalEdicao.value.dados = {
        ...item,
        cargo: '-',
        salario_base: item.salario_bruto || 0,
        dependentes: 0,
        horas_contratadas: 220,
      }
      
      // Resetar sem benefícios
      Object.assign(modalEdicao.value.edicao, {
        horas_extras_50: 0,
        horas_extras_100: 0,
        bonus: 0,
        comissoes: 0,
        adicional_insalubridade: 0,
        adicional_periculosidade: 0,
        adicional_noturno: 0,
        outros_proventos: 0,
        adiantamento: 0,
        emprestimos: 0,
        faltas_horas: 0,
        atrasos_horas: 0,
        vale_transporte: 0,
        vale_refeicao: 0,
        vale_alimentacao: 0,
        outros_descontos: 0,
        plano_saude: 0,
        plano_odontologico: 0,
        seguro_vida: 0,
        auxilio_creche: 0,
        auxilio_educacao: 0,
        auxilio_combustivel: 0,
        outros_beneficios: 0,
        inss_manual: null,
        irrf_manual: null,
        itens_personalizados: [],
      })
      
      modalEdicao.value.aberto = true
      
      // Calcular resumo inicial mesmo em caso de erro
      recalcularResumo()
    }
  }

  // Fechar modal
  const fecharModalEdicao = () => {
    modalEdicao.value.aberto = false
    modalEdicao.value.dados = null
  }

  // Instanciar composable de cálculos uma vez
  const { recalcularResumo: calcular } = useFolhaPagamento()

  // Recalcular resumo
  const recalcularResumo = () => {
    const resumo = calcular(modalEdicao.value.edicao, modalEdicao.value.dados)
    if (resumo) {
      modalEdicao.value.resumo = resumo
      console.log('📊 Resumo recalculado:', resumo)
    }
  }

  // Watch para recalcular automaticamente quando os dados de edição mudarem
  watch(
    () => modalEdicao.value.edicao,
    () => {
      if (modalEdicao.value.aberto && modalEdicao.value.dados) {
        recalcularResumo()
      }
    },
    { deep: true }
  )

  // Salvar edição
  const salvarEdicao = async () => {
    if (!modalEdicao.value.dados) {
      console.error('❌ Dados do modal não encontrados')
      return
    }
    
    try {
      // Debug: ver todos os dados disponíveis
      console.log('💾 Salvando edição...', modalEdicao.value.dados)
      
      // Extrair mes e ano dos dados
      const mes = modalEdicao.value.dados.mes || (modalEdicao.value.dados as any).competencia_mes
      const ano = modalEdicao.value.dados.ano || (modalEdicao.value.dados as any).competencia_ano
      
      if (!mes || !ano) {
        console.error('❌ Mês ou ano não encontrados nos dados:', {
          mes,
          ano,
          dados: modalEdicao.value.dados
        })
        alert('Erro: Não foi possível identificar o mês e ano da folha.')
        return
      }

      const body = {
        colaborador_id: modalEdicao.value.dados.colaborador_id,
        mes: String(mes),
        ano: String(ano),
        edicao: modalEdicao.value.edicao,
        resumo: modalEdicao.value.resumo,
        itens_personalizados: modalEdicao.value.edicao.itens_personalizados,
      }

      console.log('📤 Enviando dados:', body)

      const response = await $fetch('/api/holerites/salvar-edicao', {
        method: 'POST',
        body
      })

      console.log('✅ Edição salva com sucesso:', response)
      
      alert('Edição salva com sucesso!\n\nAgora você pode gerar o holerite para ver as alterações.')
      
      fecharModalEdicao()
      
      // Recarregar a página para atualizar os dados
      window.location.reload()
    } catch (error: any) {
      console.error('❌ Erro ao salvar edição:', error)
      alert(`Erro ao salvar edição:\n${error.message || 'Erro desconhecido'}`)
    }
  }

  return {
    modalEdicao,
    beneficiosData,
    proventosData,
    descontosData,
    impostosData,
    itensPersonalizadosData,
    abrirModalEdicao,
    fecharModalEdicao,
    recalcularResumo,
    salvarEdicao,
  }
}
