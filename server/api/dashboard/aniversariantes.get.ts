import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)

    // Buscar funcionários com data de nascimento
    const { data: funcionarios, error } = await supabase
      .from('funcionarios')
      .select(`
        id,
        nome_completo,
        data_nascimento,
        cargo:cargos(nome),
        departamento:departamentos(nome)
      `)
      .not('data_nascimento', 'is', null)

    if (error) throw error

    // Filtrar aniversariantes do mês atual
    const mesAtual = new Date().getMonth() + 1
    const aniversariantes = funcionarios?.filter((f: any) => {
      const mesNascimento = new Date(f.data_nascimento).getMonth() + 1
      return mesNascimento === mesAtual
    }).map((f: any) => ({
      id: f.id,
      nome_completo: f.nome_completo,
      data_nascimento: f.data_nascimento,
      cargo: f.cargo?.nome || 'Não definido',
      departamento: f.departamento?.nome || 'Não definido',
      dia: new Date(f.data_nascimento).getDate()
    })).sort((a: any, b: any) => a.dia - b.dia) || []

    return aniversariantes
  } catch (error: any) {
    console.error('Erro ao buscar aniversariantes:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro ao buscar aniversariantes'
    })
  }
})
