import { serverSupabaseServiceRole } from '#supabase/server'

/**
 * API para verificar e criar notificações de aniversariantes
 * POST /api/notificacoes/verificar-aniversariantes
 */
export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)
    const hoje = new Date()
    const diaHoje = hoje.getDate()
    const mesHoje = hoje.getMonth() + 1

    console.log(`🎂 [ANIVERSARIANTES] Verificando aniversariantes para ${diaHoje}/${mesHoje}...`)

    // Buscar funcionários que fazem aniversário hoje
    const { data: funcionarios, error: errorFuncionarios } = await supabase
      .from('funcionarios')
      .select('id, nome_completo, data_nascimento, email')
      .eq('status', 'ativo')
      .not('data_nascimento', 'is', null)

    if (errorFuncionarios) {
      console.error('❌ Erro ao buscar funcionários:', errorFuncionarios)
      throw errorFuncionarios
    }

    if (!funcionarios || funcionarios.length === 0) {
      console.log('📭 Nenhum funcionário encontrado')
      return {
        success: true,
        message: 'Nenhum funcionário encontrado',
        aniversariantes: []
      }
    }

    // Filtrar aniversariantes de hoje
    const aniversariantesHoje = funcionarios.filter(func => {
      if (!func.data_nascimento) return false
      
      // CORRIGIDO: Usar split para evitar problemas de timezone
      const [ano, mes, dia] = func.data_nascimento.split('-').map(Number)
      const diaAniversario = dia
      const mesAniversario = mes
      
      return diaAniversario === diaHoje && mesAniversario === mesHoje
    })

    console.log(`🎉 ${aniversariantesHoje.length} aniversariante(s) encontrado(s) para hoje`)

    if (aniversariantesHoje.length === 0) {
      return {
        success: true,
        message: 'Nenhum aniversariante hoje',
        aniversariantes: []
      }
    }

    const notificacoesCriadas = []
    let erros = 0

    // Criar notificação para cada aniversariante
    for (const funcionario of aniversariantesHoje) {
      try {
        // CORRIGIDO: Usar split para evitar problemas de timezone
        const [ano, mes, dia] = funcionario.data_nascimento.split('-').map(Number)
        const dataNascimento = new Date(ano, mes - 1, dia)
        const idade = hoje.getFullYear() - dataNascimento.getFullYear()
        
        // Verificar se já existe notificação de aniversário para este funcionário hoje
        const { data: notificacaoExistente } = await supabase
          .from('notificacoes')
          .select('id')
          .eq('tipo', 'aniversario')
          .eq('origem', 'aniversarios')
          .gte('data_criacao', hoje.toISOString().split('T')[0]) // Hoje
          .like('dados', `%"funcionario_id":"${funcionario.id}"%`)
          .maybeSingle()

        if (notificacaoExistente) {
          console.log(`⚠️ Notificação de aniversário já existe para ${funcionario.nome_completo}`)
          continue
        }

        // Criar notificação usando a função do banco
        const { data: notificacaoId, error: errorNotificacao } = await supabase
          .rpc('criar_notificacao_aniversario', {
            funcionario_nome: funcionario.nome_completo,
            funcionario_id: funcionario.id,
            data_aniversario: funcionario.data_nascimento
          })

        if (errorNotificacao) {
          console.error(`❌ Erro ao criar notificação para ${funcionario.nome_completo}:`, errorNotificacao)
          erros++
          continue
        }

        notificacoesCriadas.push({
          funcionario: funcionario.nome_completo,
          idade: idade,
          notificacao_id: notificacaoId
        })

        console.log(`✅ Notificação criada para ${funcionario.nome_completo} (${idade} anos)`)

      } catch (error: any) {
        console.error(`💥 Erro inesperado para ${funcionario.nome_completo}:`, error)
        erros++
      }
    }

    const mensagem = `Verificação de aniversariantes concluída: ${notificacoesCriadas.length} notificação(ões) criada(s)${erros > 0 ? ` (${erros} erro(s))` : ''}`

    console.log(`🎊 ${mensagem}`)

    return {
      success: true,
      message: mensagem,
      data_verificacao: hoje.toISOString(),
      aniversariantes_encontrados: aniversariantesHoje.length,
      notificacoes_criadas: notificacoesCriadas.length,
      erros: erros,
      aniversariantes: notificacoesCriadas
    }

  } catch (error: any) {
    console.error('💥 Erro na verificação de aniversariantes:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro na verificação de aniversariantes'
    })
  }
})