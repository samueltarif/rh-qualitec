import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  try {
    // Buscar colaborador_id do usuário
    const { data: appUserData } = await client
      .from('app_users')
      .select('colaborador_id')
      .eq('auth_uid', user.id)
      .single()

    const appUser = appUserData as any
    if (!appUser?.colaborador_id) {
      return []
    }

    // Buscar dados do colaborador para filtrar comunicados
    const { data: colaboradorData } = await client
      .from('colaboradores')
      .select('empresa_id, departamento_id, cargo_id')
      .eq('id', appUser.colaborador_id)
      .single()

    const colaborador = colaboradorData as any
    if (!colaborador?.empresa_id) {
      return []
    }

    const agora = new Date().toISOString()

    // Buscar comunicados ativos
    const { data: comunicados, error } = await client
      .from('comunicados')
      .select(`
        *,
        publicado:app_users!comunicados_publicado_por_fkey(nome)
      `)
      .eq('empresa_id', colaborador.empresa_id)
      .eq('ativo', true)
      .or(`data_expiracao.is.null,data_expiracao.gt.${agora}`)
      .order('data_publicacao', { ascending: false })

    if (error) {
      throw createError({ statusCode: 500, message: error.message })
    }

    // Filtrar por destino
    const comunicadosFiltrados = (comunicados || []).filter((c: any) => {
      if (c.destino === 'todos') return true
      if (c.destino === 'departamento' && c.destino_ids?.includes(colaborador.departamento_id)) return true
      if (c.destino === 'cargo' && c.destino_ids?.includes(colaborador.cargo_id)) return true
      if (c.destino === 'individual' && c.destino_ids?.includes(appUser.colaborador_id)) return true
      return false
    })

    // Buscar quais foram lidos
    const { data: lidos } = await client
      .from('comunicados_lidos')
      .select('comunicado_id')
      .eq('colaborador_id', appUser.colaborador_id)

    const lidosIds = new Set((lidos || []).map((l: any) => l.comunicado_id))

    return comunicadosFiltrados.map((c: any) => ({
      ...c,
      lido: lidosIds.has(c.id)
    }))
  } catch (e: any) {
    console.error('Erro ao buscar comunicados:', e)
    throw createError({ statusCode: 500, message: e.message || 'Erro ao buscar comunicados' })
  }
})
