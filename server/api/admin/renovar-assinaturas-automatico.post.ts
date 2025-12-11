import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)
    
    const hoje = new Date()
    const diaAtual = hoje.getDate()
    
    // Só executa no dia 5 ou depois
    if (diaAtual < 5) {
      return {
        success: false,
        message: `Renovação automática só ocorre a partir do dia 5. Hoje é dia ${diaAtual}.`
      }
    }
    
    const mesAtual = hoje.getMonth() + 1
    const anoAtual = hoje.getFullYear()
    
    // Buscar todos os colaboradores ativos
    const { data: colaboradores } = await supabase
      .from('colaboradores')
      .select('id, nome, email_corporativo')
      .eq('status', 'Ativo')
    
    if (!colaboradores) {
      return { success: false, message: 'Nenhum colaborador encontrado' }
    }
    
    let renovacoesNecessarias = 0
    
    // Verificar cada colaborador
    for (const colaborador of colaboradores) {
      // Verificar se já tem assinatura para o mês atual
      const { data: assinaturaExistente } = await supabase
        .from('assinaturas_ponto')
        .select('id')
        .eq('colaborador_id', colaborador.id)
        .eq('mes', mesAtual)
        .eq('ano', anoAtual)
        .single()
      
      if (!assinaturaExistente) {
        renovacoesNecessarias++
        
        // Aqui você pode implementar notificações por email
        // ou outras formas de alertar o funcionário
        console.log(`Colaborador ${colaborador.nome} precisa renovar assinatura para ${mesAtual}/${anoAtual}`)
      }
    }
    
    return {
      success: true,
      message: `Verificação concluída. ${renovacoesNecessarias} colaboradores precisam renovar assinatura.`,
      renovacoesNecessarias,
      totalColaboradores: colaboradores.length
    }
    
  } catch (error: any) {
    console.error('Erro na renovação automática:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro interno do servidor'
    })
  }
})