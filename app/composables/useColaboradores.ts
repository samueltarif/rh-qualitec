/**
 * Composable de Gestão de Colaboradores - Sistema RH Qualitec
 */

export interface Colaborador {
  id: string
  empresa_id: string
  
  // Identificação
  foto_url?: string
  matricula?: string
  nome: string
  cpf: string
  rg?: string
  data_nascimento: string
  sexo?: 'M' | 'F' | 'Outro'
  estado_civil?: string
  escolaridade?: string
  
  // Profissional
  cargo_id?: string
  cargo?: { id: string; nome: string; nivel: string }
  departamento_id?: string
  departamento?: { id: string; nome: string }
  unidade?: string
  tipo_contrato: string
  jornada_trabalho?: string
  salario: number
  data_admissao: string
  data_desligamento?: string
  status: 'Ativo' | 'Ferias' | 'Afastado' | 'Desligado'
  regime_pagamento?: string
  
  // Contato
  email_corporativo?: string
  email_pessoal?: string
  email_alternativo?: string
  telefone?: string
  celular?: string
  contato_emergencia_nome?: string
  contato_emergencia_telefone?: string
  
  // Endereço
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  
  // Dados Bancários
  banco_codigo?: string
  banco_nome?: string
  agencia?: string
  conta?: string
  tipo_conta?: string
  pix?: string
  
  // Documentos
  pis?: string
  ctps?: string
  ctps_serie?: string
  
  // Benefícios
  recebe_vt?: boolean
  valor_vt?: number
  recebe_va_vr?: boolean
  valor_va_vr?: number
  desconto_inss_padrao?: boolean
  
  // RH
  observacoes_rh?: string
  
  // Metadados
  created_at: string
  updated_at: string
}

export interface Dependente {
  id: string
  colaborador_id: string
  nome: string
  cpf?: string
  data_nascimento: string
  parentesco: string
  deducao_irrf: boolean
  plano_saude: boolean
}

export interface Documento {
  id: string
  colaborador_id: string
  tipo: string
  nome: string
  descricao?: string
  arquivo_url: string
  created_at: string
}

export const useColaboradores = () => {
  const supabase = useSupabaseClient()

  const colaboradores = ref<Colaborador[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Buscar empresa_id padrão
   */
  const getDefaultEmpresaId = async (): Promise<string | null> => {
    try {
      const { data } = await (supabase as any)
        .from('empresas')
        .select('id')
        .limit(1)
        .single()
      return data?.id || null
    } catch {
      return null
    }
  }

  /**
   * Listar todos os colaboradores
   */
  const fetchColaboradores = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await (supabase as any)
        .from('colaboradores')
        .select(`
          *,
          cargo:cargo_id(id, nome, nivel),
          departamento:departamento_id(id, nome)
        `)
        .order('nome', { ascending: true })

      if (fetchError) throw fetchError

      colaboradores.value = data as Colaborador[]
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message
      console.error('Erro ao buscar colaboradores:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Buscar colaborador por ID
   */
  const fetchColaboradorById = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await (supabase as any)
        .from('colaboradores')
        .select(`
          *,
          cargo:cargo_id(id, nome, nivel),
          departamento:departamento_id(id, nome)
        `)
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      return { success: true, data: data as Colaborador }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Criar colaborador (com opção de criar usuário junto)
   */
  const createColaborador = async (colaboradorData: Partial<Colaborador> & {
    criar_usuario?: boolean
    usuario_email?: string
    usuario_senha?: string
    usuario_role?: 'admin' | 'funcionario'
    usuario_ativo?: boolean
  }) => {
    loading.value = true
    error.value = null

    try {
      let empresaId = colaboradorData.empresa_id
      if (!empresaId) {
        empresaId = (await getDefaultEmpresaId()) || undefined
      }

      // Separar dados de usuário dos dados de colaborador
      const criarUsuario = colaboradorData.criar_usuario
      const usuarioEmail = colaboradorData.usuario_email
      const usuarioSenha = colaboradorData.usuario_senha
      const usuarioRole = colaboradorData.usuario_role || 'funcionario'
      const usuarioAtivo = colaboradorData.usuario_ativo !== false

      // Limpar dados: remover strings vazias e converter para null
      const cleanData: Record<string, unknown> = {}
      
      for (const [key, value] of Object.entries(colaboradorData)) {
        // Pular campos undefined
        if (value === undefined) continue
        
        // Pular campos de relacionamento (objetos aninhados do JOIN)
        if (key === 'cargo' || key === 'departamento' || key === 'gestor') continue
        
        // Pular campos de usuário
        if (key.startsWith('usuario_') || key === 'criar_usuario') continue
        
        // Converter strings vazias para null
        if (value === '') {
          cleanData[key] = null
        } else {
          cleanData[key] = value
        }
      }

      // Adicionar empresa_id
      cleanData.empresa_id = empresaId

      // 1. Criar colaborador
      const { data: colaborador, error: createError } = await (supabase as any)
        .from('colaboradores')
        .insert(cleanData)
        .select()
        .single()

      if (createError) throw createError

      // 2. Criar usuário se solicitado
      if (criarUsuario && usuarioEmail && usuarioSenha) {
        try {
          const response = await $fetch('/api/users/create', {
            method: 'POST',
            body: {
              nome: colaboradorData.nome,
              email: usuarioEmail,
              password: usuarioSenha,
              role: usuarioRole,
              colaborador_id: colaborador.id,
              ativo: usuarioAtivo,
            },
          })

          if (!response.success) {
            console.warn('Colaborador criado mas usuário falhou:', response.error)
            // Não falhar a operação toda, apenas avisar
          }
        } catch (userError: any) {
          console.warn('Erro ao criar usuário:', userError)
          // Não falhar a operação toda
        }
      }

      await fetchColaboradores()
      return { success: true, data: colaborador }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Atualizar colaborador
   */
  const updateColaborador = async (id: string, colaboradorData: Partial<Colaborador>) => {
    loading.value = true
    error.value = null

    try {
      // Limpar dados: remover strings vazias e converter para null
      const cleanData: Record<string, unknown> = {}
      
      for (const [key, value] of Object.entries(colaboradorData)) {
        // Pular campos undefined
        if (value === undefined) continue
        
        // Pular campos de relacionamento (objetos aninhados do JOIN)
        if (key === 'cargo' || key === 'departamento' || key === 'gestor') continue
        
        // Converter strings vazias para null
        if (value === '') {
          cleanData[key] = null
        } else {
          cleanData[key] = value
        }
      }

      cleanData.updated_at = new Date().toISOString()

      const { data, error: updateError } = await (supabase as any)
        .from('colaboradores')
        .update(cleanData)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      await fetchColaboradores()
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Buscar endereço por CEP (ViaCEP API)
   */
  const buscarCep = async (cep: string) => {
    try {
      const cepLimpo = cep.replace(/\D/g, '')
      if (cepLimpo.length !== 8) {
        return { success: false, error: 'CEP inválido' }
      }

      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await response.json()

      if (data.erro) {
        return { success: false, error: 'CEP não encontrado' }
      }

      return {
        success: true,
        data: {
          logradouro: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf,
        },
      }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  /**
   * Filtrar colaboradores
   */
  const filterColaboradores = (filters: {
    search?: string
    status?: string
    cargo_id?: string
    departamento_id?: string
  }) => {
    let filtered = [...colaboradores.value]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.nome.toLowerCase().includes(searchLower) ||
          c.cpf.includes(filters.search!) ||
          c.matricula?.includes(filters.search!) ||
          c.email_corporativo?.toLowerCase().includes(searchLower)
      )
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((c) => c.status === filters.status)
    }

    if (filters.cargo_id && filters.cargo_id !== 'all') {
      filtered = filtered.filter((c) => c.cargo_id === filters.cargo_id)
    }

    if (filters.departamento_id && filters.departamento_id !== 'all') {
      filtered = filtered.filter((c) => c.departamento_id === filters.departamento_id)
    }

    return filtered
  }

  /**
   * Contadores
   */
  const countByStatus = computed(() => ({
    ativo: colaboradores.value.filter((c) => c.status === 'Ativo').length,
    afastado: colaboradores.value.filter((c) => c.status === 'Afastado').length,
    desligado: colaboradores.value.filter((c) => c.status === 'Desligado').length,
    total: colaboradores.value.length,
  }))

  // ============ DEPENDENTES ============

  /**
   * Buscar dependentes de um colaborador
   */
  const fetchDependentes = async (colaboradorId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('dependentes')
        .select('*')
        .eq('colaborador_id', colaboradorId)
        .order('nome')

      if (fetchError) throw fetchError
      return { success: true, data: data as Dependente[] }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  /**
   * Adicionar dependente
   */
  const addDependente = async (dependenteData: Partial<Dependente>) => {
    try {
      const { data, error: insertError } = await (supabase as any)
        .from('dependentes')
        .insert(dependenteData)
        .select()
        .single()

      if (insertError) throw insertError
      return { success: true, data }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  /**
   * Remover dependente
   */
  const removeDependente = async (id: string) => {
    try {
      const { error: deleteError } = await supabase.from('dependentes').delete().eq('id', id)

      if (deleteError) throw deleteError
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  // ============ DOCUMENTOS ============

  /**
   * Buscar documentos de um colaborador
   */
  const fetchDocumentos = async (colaboradorId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('documentos')
        .select('*')
        .eq('colaborador_id', colaboradorId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      return { success: true, data: data as Documento[] }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  /**
   * Upload de documento
   */
  const uploadDocumento = async (
    colaboradorId: string,
    file: File,
    tipo: string,
    descricao?: string
  ) => {
    try {
      // Upload para Supabase Storage - usando bucket 'colaboradores-medicos'
      const fileName = `${Date.now()}_${file.name}`
      const filePath = `${colaboradorId}/docs/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('colaboradores-docs')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from('colaboradores-docs').getPublicUrl(filePath)

      // Salvar registro no banco
      const { data, error: insertError } = await (supabase as any)
        .from('documentos')
        .insert({
          colaborador_id: colaboradorId,
          tipo,
          nome: file.name,
          descricao,
          arquivo_url: publicUrl,
          arquivo_tamanho: file.size,
          arquivo_tipo: file.type,
        })
        .select()
        .single()

      if (insertError) throw insertError
      return { success: true, data }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  /**
   * Remover documento
   */
  const removeDocumento = async (id: string) => {
    try {
      const { error: deleteError } = await supabase.from('documentos').delete().eq('id', id)

      if (deleteError) throw deleteError
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  return {
    // Estado
    colaboradores,
    loading,
    error,
    countByStatus,

    // Colaboradores
    fetchColaboradores,
    fetchColaboradorById,
    createColaborador,
    updateColaborador,
    filterColaboradores,
    buscarCep,

    // Dependentes
    fetchDependentes,
    addDependente,
    removeDependente,

    // Documentos
    fetchDocumentos,
    uploadDocumento,
    removeDocumento,
  }
}
