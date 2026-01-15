import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)

    // Buscar estatísticas
    const [
      { count: totalFuncionarios },
      { count: totalDepartamentos },
      { data: funcionarios }
    ] = await Promise.all([
      supabase.from('funcionarios').select('*', { count: 'exact', head: true }),
      supabase.from('departamentos').select('*', { count: 'exact', head: true }),
      supabase.from('funcionarios').select('salario_base, data_nascimento')
    ])

    // Calcular folha mensal total
    const folhaMensal = funcionarios?.reduce((total: number, f: any) => total + (f.salario_base || 0), 0) || 0

    // Calcular aniversariantes do mês
    const mesAtual = new Date().getMonth() + 1
    const aniversariantes = funcionarios?.filter((f: any) => {
      if (!f.data_nascimento) return false
      const mesNascimento = new Date(f.data_nascimento).getMonth() + 1
      return mesNascimento === mesAtual
    }) || []

    return {
      totalFuncionarios: totalFuncionarios || 0,
      totalDepartamentos: totalDepartamentos || 0,
      folhaMensal,
      totalAniversariantes: aniversariantes.length,
      aniversariantes: aniversariantes.slice(0, 5) // Primeiros 5
    }
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro ao buscar estatísticas do dashboard'
    })
  }
})
