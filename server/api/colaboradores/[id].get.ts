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

  // Primeiro tentar buscar com relacionamentos
  let { data, error } = await supabase
    .from('colaboradores')
    .select(`
      *,
      cargo_rel:cargos(nome),
      departamento_rel:departamentos(nome)
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

  // Formatar resposta para incluir nome do cargo e departamento
  // Tentar pegar do relacionamento primeiro, senão usar o campo direto
  const colaborador = data as any
  const cargoNome = colaborador.cargo_rel?.nome || colaborador.cargo || '-'
  const departamentoNome = colaborador.departamento_rel?.nome || colaborador.departamento || '-'

  return {
    ...colaborador,
    cargo_nome: cargoNome,
    departamento_nome: departamentoNome,
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
