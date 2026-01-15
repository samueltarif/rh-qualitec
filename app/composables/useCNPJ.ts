// Composable para consulta de CNPJ
export interface DadosEmpresaCNPJ {
  // Dados principais
  nome: string
  nome_fantasia: string
  cnpj: string
  
  // Endereço detalhado
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  municipio: string
  uf: string
  cep: string
  endereco_completo: string
  
  // Contatos
  telefone: string
  email: string
  
  // Informações cadastrais
  situacao_cadastral: string
  inscricao_estadual: string
  atividade_principal: string
  natureza_juridica: string
  porte: string
  capital_social: string
  data_abertura: string
  
  // Campos legados para compatibilidade
  razao_social: string
  endereco: string
}

export const useCNPJ = () => {
  const loading = ref(false)
  const error = ref('')

  const consultarCNPJ = async (cnpj: string): Promise<{ success: boolean; data?: DadosEmpresaCNPJ; message: string }> => {
    loading.value = true
    error.value = ''

    try {
      // Validação básica do CNPJ
      const cnpjLimpo = cnpj.replace(/[^\d]/g, '')
      
      if (!cnpjLimpo) {
        throw new Error('CNPJ é obrigatório')
      }

      if (cnpjLimpo.length !== 14) {
        throw new Error('CNPJ deve ter 14 dígitos')
      }

      // Validação de CNPJ (algoritmo básico)
      if (!validarCNPJ(cnpjLimpo)) {
        throw new Error('CNPJ inválido')
      }

      console.log('🔍 Consultando CNPJ:', cnpjLimpo)

      // Fazer a consulta na API com tratamento de erro mais robusto
      const response = await $fetch('/api/consulta-cnpj', {
        method: 'POST',
        body: { cnpj: cnpjLimpo },
        headers: {
          'Content-Type': 'application/json'
        },
        // Adicionar retry em caso de falha
        retry: 1,
        retryDelay: 1000
      })

      console.log('📦 Resposta recebida:', response)

      if (response.success) {
        console.log('🏢 Inscrição Estadual:', response.data?.inscricao_estadual || 'Não informada')
        
        return {
          success: true,
          data: response.data,
          message: 'Dados da empresa encontrados com sucesso!'
        }
      } else {
        throw new Error('Erro na consulta')
      }

    } catch (err: any) {
      console.error('❌ Erro na consulta CNPJ:', err)
      
      let mensagem = 'Erro ao consultar CNPJ'
      
      // Tratar diferentes tipos de erro
      if (err.statusCode === 404) {
        mensagem = 'CNPJ não encontrado na Receita Federal'
      } else if (err.statusCode === 400) {
        mensagem = err.data?.message || err.message || 'CNPJ inválido'
      } else if (err.statusCode === 429) {
        mensagem = 'Muitas consultas realizadas. Aguarde alguns minutos e tente novamente.'
      } else if (err.statusCode === 503) {
        mensagem = 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.'
      } else if (err.name === 'FetchError') {
        mensagem = 'Erro de conexão. Verifique sua internet e tente novamente.'
      } else {
        mensagem = err.data?.message || err.message || 'Erro interno do servidor'
      }
      
      error.value = mensagem
      
      return {
        success: false,
        message: mensagem
      }
    } finally {
      loading.value = false
    }
  }

  const formatarCNPJ = (cnpj: string): string => {
    const cnpjLimpo = cnpj.replace(/[^\d]/g, '')
    if (cnpjLimpo.length === 14) {
      return cnpjLimpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
    }
    return cnpj
  }

  const validarCNPJ = (cnpj: string): boolean => {
    // Remove caracteres não numéricos
    const cnpjLimpo = cnpj.replace(/[^\d]/g, '')
    
    // Verifica se tem 14 dígitos
    if (cnpjLimpo.length !== 14) return false
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cnpjLimpo)) return false
    
    // Validação dos dígitos verificadores
    let soma = 0
    let peso = 2
    
    // Primeiro dígito verificador
    for (let i = 11; i >= 0; i--) {
      soma += parseInt(cnpjLimpo.charAt(i)) * peso
      peso = peso === 9 ? 2 : peso + 1
    }
    
    let digito1 = soma % 11 < 2 ? 0 : 11 - (soma % 11)
    
    if (parseInt(cnpjLimpo.charAt(12)) !== digito1) return false
    
    // Segundo dígito verificador
    soma = 0
    peso = 2
    
    for (let i = 12; i >= 0; i--) {
      soma += parseInt(cnpjLimpo.charAt(i)) * peso
      peso = peso === 9 ? 2 : peso + 1
    }
    
    let digito2 = soma % 11 < 2 ? 0 : 11 - (soma % 11)
    
    return parseInt(cnpjLimpo.charAt(13)) === digito2
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    consultarCNPJ,
    formatarCNPJ,
    validarCNPJ
  }
}