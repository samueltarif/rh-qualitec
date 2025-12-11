import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)

    console.log('🔍 Testando busca de assinaturas para Carlos...')

    // 1. Buscar colaborador Carlos
    const { data: colaborador, error: colaboradorError } = await supabase
      .from('colaboradores')
      .select('id, nome, matricula')
      .ilike('nome', '%CARLOS%')
      .single()

    if (colaboradorError) {
      console.error('❌ Erro ao buscar colaborador:', colaboradorError)
      return { error: 'Colaborador não encontrado', details: colaboradorError }
    }

    console.log('👤 Colaborador encontrado:', colaborador)

    // 2. Buscar todas as assinaturas do Carlos
    const { data: todasAssinaturas, error: todasError } = await supabase
      .from('assinaturas_ponto')
      .select('*')
      .eq('colaborador_id', colaborador.id)
      .order('created_at', { ascending: false })

    console.log('📋 Todas as assinaturas do Carlos:', todasAssinaturas)

    // 3. Buscar assinatura específica para dezembro/2025
    const mesAtual = 12
    const anoAtual = 2025

    const { data: assinaturaAtual, error: assinaturaError } = await supabase
      .from('assinaturas_ponto')
      .select('*')
      .eq('colaborador_id', colaborador.id)
      .eq('mes', mesAtual)
      .eq('ano', anoAtual)
      .maybeSingle()

    console.log('📝 Assinatura dezembro/2025:', assinaturaAtual)

    // 4. Verificar estrutura da tabela
    const { data: estrutura } = await supabase
      .rpc('exec_sql', { 
        sql_query: `
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'assinaturas_ponto' 
          ORDER BY ordinal_position
        `
      })

    // 5. Contar total de assinaturas
    const { count } = await supabase
      .from('assinaturas_ponto')
      .select('*', { count: 'exact', head: true })

    return {
      success: true,
      colaborador,
      totalAssinaturas: count,
      todasAssinaturas,
      assinaturaAtual,
      estruturaTabela: estrutura,
      busca: {
        colaborador_id: colaborador.id,
        mes: mesAtual,
        ano: anoAtual
      },
      errors: {
        colaboradorError,
        todasError,
        assinaturaError
      }
    }

  } catch (error: any) {
    console.error('❌ Erro no teste:', error)
    return {
      success: false,
      error: error.message,
      stack: error.stack
    }
  }
})