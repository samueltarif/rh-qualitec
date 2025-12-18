import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID do colaborador é obrigatório'
    })
  }

  const supabase = await serverSupabaseClient(event)

  // Buscar colaborador com relacionamentos
  let { data, error } = await supabase
    .from('colaboradores')
    .select(`
      *,
      cargo:cargos(id, nome, nivel),
      departamento:departamentos!colaboradores_departamento_id_fkey(id, nome),
      jornada:jornadas_trabalho(id, nome, tipo)
    `)
    .eq('id', id)
    .single()

  // Se der erro, buscar sem relacionamentos
  if (error) {
    const { data: dataSimples, error: errorSimples } = await supabase
      .from('colaboradores')
      .select('*')
      .eq('id', id)
      .single()
    
    if (errorSimples) {
      throw createError({
        statusCode: 500,
        message: `Erro ao buscar colaborador: ${errorSimples.message}`
      })
    }
    
    data = dataSimples as any
  }

  if (!data) {
    throw createError({
      statusCode: 404,
      message: 'Colaborador não encontrado'
    })
  }

  // Garantir que os campos de benefícios existam
  const colaborador = data as any
  
  return {
    ...colaborador,
    // Garantir que os campos de benefícios existam
    recebe_vt: colaborador.recebe_vt || false,
    valor_vt: colaborador.valor_vt || 0,
    recebe_vr: colaborador.recebe_vr || false,
    valor_vr: colaborador.valor_vr || 0,
    recebe_va: colaborador.recebe_va || false,
    valor_va: colaborador.valor_va || 0,
    recebe_va_vr: colaborador.recebe_va_vr || false,
    valor_va_vr: colaborador.valor_va_vr || 0,
    plano_saude: colaborador.plano_saude || false,
    plano_odonto: colaborador.plano_odonto || false,
  }
})
