/**
 * Composable de Gestão de Cargos - Sistema RH Qualitec
 * 
 * Gerencia CRUD de cargos
 * Níveis: operacional (sem poderes especiais) e gestão (poderes de admin, exceto editar/excluir funcionários)
 */

export interface Cargo {
  id: string
  empresa_id?: string
  nome: string
  nivel: 'operacional' | 'gestao'
  descricao?: string
  departamento_id?: string
  ativo: boolean
  created_at: string
  updated_at: string
  gestores?: CargoGestor[]
  departamento?: {
    id: string
    nome: string
  }
}

export interface CargoGestor {
  id: string
  cargo_id: string
  colaborador_id: string
  created_at: string
  colaborador?: {
    id: string
    nome: string
    email_corporativo?: string
  }
}

export interface CreateCargoData {
  nome: string
  nivel: 'operacional' | 'gestao'
  descricao?: string
  departamento_id?: string
  empresa_id?: string
}

export interface UpdateCargoData {
  nome?: string
  nivel?: 'operacional' | 'gestao'
  descricao?: string
  departamento_id?: string
  ativo?: boolean
}

export const useCargos = () => {
  const supabase = useSupabaseClient()

  const cargos = ref<Cargo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Listar todos os cargos (com gestores vinculados)
   */
  const fetchCargos = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await (supabase as any)
        .from('cargos')
        .select(`
          *,
          gestores:cargo_gestores(
            id,
            cargo_id,
            colaborador_id,
            created_at,
            colaborador:colaboradores(
              id,
              nome,
              email_corporativo
            )
          )
        `)
        .order('nome', { ascending: true })

      if (fetchError) throw fetchError

      cargos.value = data as Cargo[]
      return { success: true, data }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Buscar cargo por ID
   */
  const fetchCargoById = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('cargos')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      return { success: true, data: data as Cargo }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Buscar empresa_id padrão (primeira empresa)
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
   * Criar novo cargo
   */
  const createCargo = async (cargoData: CreateCargoData) => {
    loading.value = true
    error.value = null

    try {
      // Buscar empresa_id se não fornecido
      let empresaId = cargoData.empresa_id
      if (!empresaId) {
        empresaId = await getDefaultEmpresaId() || undefined
      }

      const insertData: Record<string, unknown> = {
        nome: cargoData.nome,
        nivel: cargoData.nivel,
        descricao: cargoData.descricao || null,
        ativo: true,
      }

      if (empresaId) {
        insertData.empresa_id = empresaId
      }

      const { data, error: createError } = await (supabase as any)
        .from('cargos')
        .insert(insertData)
        .select()
        .single()

      if (createError) throw createError

      // Atualizar lista local
      await fetchCargos()

      return { success: true, data }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Atualizar cargo
   */
  const updateCargo = async (id: string, cargoData: UpdateCargoData) => {
    loading.value = true
    error.value = null

    try {
      const updatePayload: Record<string, unknown> = {
        ...cargoData,
        updated_at: new Date().toISOString(),
      }
      
      const { data, error: updateError } = await (supabase as any)
        .from('cargos')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      // Atualizar lista local
      await fetchCargos()

      return { success: true, data }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Ativar/Desativar cargo
   */
  const toggleCargoStatus = async (id: string, ativo: boolean) => {
    return await updateCargo(id, { ativo })
  }

  /**
   * Deletar cargo (soft delete - apenas desativa)
   */
  const deleteCargo = async (id: string) => {
    return await toggleCargoStatus(id, false)
  }

  /**
   * Filtrar cargos
   */
  const filterCargos = (filters: {
    search?: string
    nivel?: 'operacional' | 'gestao' | 'all'
    status?: 'ativo' | 'inativo' | 'all'
  }) => {
    let filtered = [...cargos.value]

    // Filtro de busca
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (cargo) =>
          cargo.nome.toLowerCase().includes(searchLower) ||
          (cargo.descricao && cargo.descricao.toLowerCase().includes(searchLower))
      )
    }

    // Filtro de nível
    if (filters.nivel && filters.nivel !== 'all') {
      filtered = filtered.filter((cargo) => cargo.nivel === filters.nivel)
    }

    // Filtro de status
    if (filters.status && filters.status !== 'all') {
      const isAtivo = filters.status === 'ativo'
      filtered = filtered.filter((cargo) => cargo.ativo === isAtivo)
    }

    return filtered
  }

  /**
   * Contar cargos por nível
   */
  const countByNivel = computed(() => {
    return {
      operacional: cargos.value.filter((c) => c.nivel === 'operacional').length,
      gestao: cargos.value.filter((c) => c.nivel === 'gestao').length,
      total: cargos.value.length,
    }
  })

  /**
   * Contar cargos por status
   */
  const countByStatus = computed(() => {
    return {
      ativo: cargos.value.filter((c) => c.ativo).length,
      inativo: cargos.value.filter((c) => !c.ativo).length,
    }
  })

  /**
   * Adicionar gestor a um cargo
   */
  const addGestor = async (cargoId: string, colaboradorId: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await (supabase as any)
        .from('cargo_gestores')
        .insert({
          cargo_id: cargoId,
          colaborador_id: colaboradorId,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Atualizar lista local
      await fetchCargos()

      return { success: true, data }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Remover gestor de um cargo
   */
  const removeGestor = async (cargoGestorId: string) => {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('cargo_gestores')
        .delete()
        .eq('id', cargoGestorId)

      if (deleteError) throw deleteError

      // Atualizar lista local
      await fetchCargos()

      return { success: true }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Buscar colaboradores disponíveis (que não estão vinculados ao cargo)
   */
  const fetchColaboradoresDisponiveis = async (cargoId: string) => {
    try {
      const { data, error: fetchError } = await (supabase as any)
        .from('colaboradores')
        .select('id, nome, email_corporativo, cargo_id')
        .eq('status', 'Ativo')
        .order('nome', { ascending: true })

      if (fetchError) throw fetchError

      // Filtrar colaboradores que já estão vinculados
      const cargo = cargos.value.find(c => c.id === cargoId)
      const gestoresIds = cargo?.gestores?.map(g => g.colaborador_id) || []
      
      const disponiveis = data.filter((col: any) => !gestoresIds.includes(col.id))

      return { success: true, data: disponiveis }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  /**
   * Buscar departamentos disponíveis
   */
  const fetchDepartamentos = async () => {
    try {
      const { data, error: fetchError } = await (supabase as any)
        .from('departamentos')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome', { ascending: true })

      if (fetchError) throw fetchError

      return { success: true, data }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  return {
    // Estado
    cargos,
    loading,
    error,
    countByNivel,
    countByStatus,

    // Métodos
    fetchCargos,
    fetchCargoById,
    createCargo,
    updateCargo,
    toggleCargoStatus,
    deleteCargo,
    filterCargos,
    
    // Gestores
    addGestor,
    removeGestor,
    fetchColaboradoresDisponiveis,
    
    // Departamentos
    fetchDepartamentos,
  }
}
