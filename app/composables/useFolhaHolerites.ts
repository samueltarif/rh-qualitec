/**
 * Composable para gerenciar ações de holerites
 */
export const useFolhaHolerites = () => {
  const loadingAcoes = ref<Record<number, boolean>>({})
  const loadingEmails = ref<Record<number, boolean>>({})
  const loadingHolerites = ref(false)

  // Gerar holerites em lote
  const gerarHolerites = async (mes: string, ano: string, totalColaboradores: number) => {
    const { nomeMes } = useFolhaCalculos()
    
    const confirmar = confirm(
      `Deseja gerar holerites para ${totalColaboradores} colaboradores?\n\n` +
      `Período: ${nomeMes(mes)}/${ano}\n\n` +
      `Os holerites ficarão disponíveis automaticamente para cada funcionário no portal.`
    )

    if (!confirmar) return false

    loadingHolerites.value = true
    try {
      const response = await $fetch<{ success: boolean; data: any }>('/api/holerites/gerar', {
        method: 'POST',
        body: {
          mes: parseInt(mes),
          ano: parseInt(ano),
        },
      })

      if (response.success) {
        const { total_gerados, total_erros } = response.data
        
        let mensagem = `✅ ${total_gerados} holerite(s) gerado(s) com sucesso!`
        
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
      loadingHolerites.value = false
    }
  }

  // Gerar holerite individual
  const gerarHoleriteIndividual = async (item: any, mes: string, ano: string) => {
    const { nomeMes } = useFolhaCalculos()
    
    const confirmar = confirm(
      `Deseja gerar o holerite individual para ${item.nome}?\n\n` +
      `Período: ${nomeMes(mes)}/${ano}`
    )

    if (!confirmar) return false

    loadingAcoes.value[item.colaborador_id] = true

    try {
      const response = await $fetch<{ success: boolean; message: string }>('/api/holerites/gerar-individual', {
        method: 'POST',
        body: {
          colaborador_id: item.colaborador_id,
          mes: parseInt(mes),
          ano: parseInt(ano),
        },
      })

      if (response.success) {
        alert(`✅ ${response.message}\n\nO holerite está disponível no portal do funcionário.`)
        return true
      }
    } catch (error: any) {
      console.error('Erro ao gerar holerite individual:', error)
      alert(`❌ Erro ao gerar holerite: ${error.data?.message || error.message || 'Erro desconhecido'}`)
      return false
    } finally {
      loadingAcoes.value[item.colaborador_id] = false
    }
  }

  // Enviar holerite por email
  const enviarHoleritePorEmail = async (item: any, mes: string, ano: string) => {
    const { nomeMes } = useFolhaCalculos()
    
    const confirmar = confirm(
      `Deseja enviar o holerite por email para ${item.nome}?\n\n` +
      `Período: ${nomeMes(mes)}/${ano}\n\n` +
      `O holerite será enviado para o email cadastrado do colaborador.`
    )

    if (!confirmar) return false

    loadingEmails.value[item.colaborador_id] = true

    try {
      // Preparar dados temporários do holerite calculado
      const dadosTemporarios = {
        nome_colaborador: item.nome,
        salario_base: item.salario_bruto,
        total_proventos: item.salario_bruto,
        inss: item.inss,
        irrf: item.irrf,
        total_descontos: item.total_descontos,
        salario_liquido: item.salario_liquido,
      }

      const response = await $fetch<{ success: boolean; message: string; email: string }>('/api/holerites/enviar-email', {
        method: 'POST',
        body: {
          colaborador_id: item.colaborador_id,
          mes: parseInt(mes),
          ano: parseInt(ano),
          dados_temporarios: dadosTemporarios, // Enviar dados calculados
        },
      })

      if (response.success) {
        alert(`✅ ${response.message}\n\nEmail enviado para: ${response.email}`)
        return true
      }
    } catch (error: any) {
      console.error('Erro ao enviar holerite por email:', error)
      alert(`❌ Erro ao enviar email: ${error.data?.message || error.message || 'Erro desconhecido'}`)
      return false
    } finally {
      loadingEmails.value[item.colaborador_id] = false
    }
  }

  return {
    loadingAcoes,
    loadingEmails,
    loadingHolerites,
    gerarHolerites,
    gerarHoleriteIndividual,
    enviarHoleritePorEmail,
  }
}
