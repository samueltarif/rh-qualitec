/**
 * Composable de Gestão de Departamentos - Sistema RH Qualitec
 */

export interface Departamento {
  id: string
  empresa_id: string
  nome: string
  descricao?: string
  centro_custo?: string
  gestor_id?: string
  ativo: boolean
  created_at: string
  updated_at: string
  gestor?: {
    id: string
    nome: string
  }
  _count?: {
    colaboradores: number
    cargos: number
  }
}

export interface CreateDepartamentoData {
  nome: string
  descricao?: string
  centro_custo?: string
  gestor_id?: string
}

export interface UpdateDepartamentoData {
  nome?: string
  descricao?: string
  centro_custo?: string
  gestor_id?: string
  ativo?: boolean
}

export const useDepartamentos = () => {
  const supabase = useSupabaseClient()

  const departamentos = ref<Departamento[]>([])
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
   * Listar todos os departamentos
   */
  const fetchDepartamentos = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await (supabase as any)
        .from('departamentos')
        .select('*')
        .order('nome', { ascending: true })

      if (fetchError) throw fetchError

      departamentos.value = data as Departamento[]
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Buscar departamento por ID
   */
  const fetchDepartamentoById = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await (supabase as any)
        .from('departamentos')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      return { success: true, data: data as Departamento }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Criar departamento
   */
  const createDepartamento = async (departamentoData: CreateDepartamentoData) => {
    loading.value = true
    error.value = null

    try {
      let empresaId = await getDefaultEmpresaId()

      const cleanData: Record<string, unknown> = {
        empresa_id: empresaId,
        nome: departamentoData.nome,
        ativo: true,
      }

      if (departamentoData.descricao) cleanData.descricao = departamentoData.descricao
      if (departamentoData.centro_custo) cleanData.centro_custo = departamentoData.centro_custo
      if (departamentoData.gestor_id) cleanData.gestor_id = departamentoData.gestor_id

      const { data, error: createError } = await (supabase as any)
        .from('departamentos')
        .insert(cleanData)
        .select()
        .single()

      if (createError) throw createError

      await fetchDepartamentos()
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Atualizar departamento
   */
  const updateDepartamento = async (id: string, departamentoData: UpdateDepartamentoData) => {
    loading.value = true
    error.value = null

    try {
      const cleanData: Record<string, unknown> = {
        ...departamentoData,
        updated_at: new Date().toISOString(),
      }

      const { data, error: updateError } = await (supabase as any)
        .from('departamentos')
        .update(cleanData)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      await fetchDepartamentos()
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Ativar/Desativar departamento
   */
  const toggleDepartamentoStatus = async (id: string, ativo: boolean) => {
    return await updateDepartamento(id, { ativo })
  }

  /**
   * Deletar departamento (soft delete)
   */
  const deleteDepartamento = async (id: string) => {
    return await toggleDepartamentoStatus(id, false)
  }

  /**
   * Buscar colaboradores para serem gestores
   */
  const fetchColaboradoresParaGestor = async () => {
    try {
      const { data, error: fetchError } = await (supabase as any)
        .from('colaboradores')
        .select('id, nome, cargo_id')
        .eq('status', 'Ativo')
        .order('nome', { ascending: true })

      if (fetchError) throw fetchError

      return { success: true, data }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  /**
   * Filtrar departamentos
   */
  const filterDepartamentos = (filters: {
    search?: string
    status?: 'ativo' | 'inativo' | 'all'
  }) => {
    let filtered = [...departamentos.value]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (d) =>
          d.nome.toLowerCase().includes(searchLower) ||
          d.descricao?.toLowerCase().includes(searchLower) ||
          d.centro_custo?.toLowerCase().includes(searchLower)
      )
    }

    if (filters.status && filters.status !== 'all') {
      const isAtivo = filters.status === 'ativo'
      filtered = filtered.filter((d) => d.ativo === isAtivo)
    }

    return filtered
  }

  /**
   * Contadores
   */
  const countByStatus = computed(() => ({
    ativo: departamentos.value.filter((d) => d.ativo).length,
    inativo: departamentos.value.filter((d) => !d.ativo).length,
    total: departamentos.value.length,
  }))

  return {
    // Estado
    departamentos,
    loading,
    error,
    countByStatus,

    // Métodos
    fetchDepartamentos,
    fetchDepartamentoById,
    createDepartamento,
    updateDepartamento,
    toggleDepartamentoStatus,
    deleteDepartamento,
    fetchColaboradoresParaGestor,
    filterDepartamentos,
  }
}
