import { requireOwnershipOrAdmin } from '../../utils/authMiddleware'
import { notificarVisualizacaoHolerite } from '../../utils/notifications'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl
  const serviceRoleKey = config.supabaseServiceRoleKey || config.public.supabaseKey

  // Pegar ID do funcionário do query parameter (enviado pelo frontend)
  const query = getQuery(event)
  const funcionarioId = query.funcionarioId

  console.log('🔍 [MEUS-HOLERITES] === INÍCIO DA REQUISIÇÃO ===')
  console.log('🔍 [MEUS-HOLERITES] Timestamp:', new Date().toISOString())
  console.log('🔍 [MEUS-HOLERITES] Query params:', query)
  console.log('🔍 [MEUS-HOLERITES] Funcionário ID:', funcionarioId)

  if (!funcionarioId) {
    console.error('❌ [MEUS-HOLERITES] Funcionário não identificado')
    throw createError({
      statusCode: 400,
      statusMessage: 'ID do funcionário é obrigatório'
    })
  }

  // SEGURANÇA: Verificar autenticação e autorização
  const requestingUser = await requireOwnershipOrAdmin(event, funcionarioId as string)
  console.log('🔒 [MEUS-HOLERITES] Usuário autenticado:', requestingUser.nome_completo, 'acessando holerites do ID:', funcionarioId)

  console.log('🔍 [MEUS-HOLERITES] Buscando holerites para funcionário ID:', funcionarioId)

  try {
    // CORREÇÃO PRODUÇÃO: Verificar configurações do Supabase
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ [MEUS-HOLERITES] Configurações do Supabase faltando!')
      console.error('   Supabase URL:', supabaseUrl ? 'OK' : 'MISSING')
      console.error('   Service Role Key:', serviceRoleKey ? 'OK' : 'MISSING')
      console.error('   Variáveis de ambiente disponíveis:', Object.keys(process.env).filter(k => k.includes('SUPABASE')))
      console.error('   Todas as variáveis de ambiente:', Object.keys(process.env))
      
      throw createError({
        statusCode: 500,
        message: 'Configuração do servidor incompleta - Verifique variáveis de ambiente no Vercel'
      })
    }

    // CORREÇÃO PRODUÇÃO: Múltiplas tentativas com diferentes filtros
    const urls = [
      // Primeira tentativa: apenas enviado e visualizado
      `${supabaseUrl}/rest/v1/holerites?funcionario_id=eq.${funcionarioId}&status=in.(enviado,visualizado)&select=*&order=periodo_inicio.desc`,
      // Segunda tentativa: todos exceto gerado
      `${supabaseUrl}/rest/v1/holerites?funcionario_id=eq.${funcionarioId}&status=neq.gerado&select=*&order=periodo_inicio.desc`,
      // Terceira tentativa: todos os holerites (para debug)
      `${supabaseUrl}/rest/v1/holerites?funcionario_id=eq.${funcionarioId}&select=*&order=periodo_inicio.desc`
    ]

    let holerites = null
    let lastError = null

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]
      console.log(`🌐 [MEUS-HOLERITES] Tentativa ${i + 1}/3 - URL:`, url)
      
      const headers = {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Nuxt-Server-Production-V2',
        'Accept': 'application/json',
        'Prefer': 'return=representation'
      }
      
      console.log(`📋 [MEUS-HOLERITES] Tentativa ${i + 1} - Headers:`, {
        'apikey': serviceRoleKey ? `${serviceRoleKey.substring(0, 20)}...` : 'MISSING',
        'Authorization': serviceRoleKey ? `Bearer ${serviceRoleKey.substring(0, 20)}...` : 'MISSING',
        'Content-Type': 'application/json',
        'User-Agent': 'Nuxt-Server-Production-V2'
      })

      try {
        console.log(`📡 [MEUS-HOLERITES] Tentativa ${i + 1} - Iniciando requisição...`)
        const startTime = Date.now()
        
        const response = await fetch(url, { 
          headers,
          method: 'GET'
        })

        const endTime = Date.now()
        console.log(`⏱️ [MEUS-HOLERITES] Tentativa ${i + 1} - Tempo:`, `${endTime - startTime}ms`)
        console.log(`📊 [MEUS-HOLERITES] Tentativa ${i + 1} - Status:`, response.status)
        console.log(`📊 [MEUS-HOLERITES] Tentativa ${i + 1} - Status text:`, response.statusText)

        if (response.ok) {
          holerites = await response.json()
          console.log(`✅ [MEUS-HOLERITES] Tentativa ${i + 1} - SUCESSO!`)
          console.log(`📦 [MEUS-HOLERITES] Tentativa ${i + 1} - Holerites:`, holerites?.length || 0)
          break // Sucesso, sair do loop
        } else {
          const errorText = await response.text()
          lastError = `Status ${response.status}: ${errorText}`
          console.error(`❌ [MEUS-HOLERITES] Tentativa ${i + 1} - Erro:`, lastError)
          
          // Se for erro 401/403, tentar próxima URL
          if (response.status === 401 || response.status === 403) {
            console.log(`🔄 [MEUS-HOLERITES] Tentativa ${i + 1} - Erro de auth, tentando próxima...`)
            continue
          } else {
            // Para outros erros, falhar imediatamente
            throw new Error(lastError)
          }
        }
      } catch (fetchError: any) {
        lastError = fetchError.message
        console.error(`💥 [MEUS-HOLERITES] Tentativa ${i + 1} - Erro de fetch:`, fetchError)
        
        // Se for a última tentativa, relançar o erro
        if (i === urls.length - 1) {
          throw fetchError
        }
      }
    }

    // Se chegou aqui sem sucesso, lançar erro
    if (holerites === null) {
      throw new Error(`Todas as tentativas falharam. Último erro: ${lastError}`)
    }

    console.log('📦 [MEUS-HOLERITES] Resposta final recebida com sucesso')
    console.log('📦 [MEUS-HOLERITES] Tipo da resposta:', typeof holerites)
    console.log('📦 [MEUS-HOLERITES] É array?', Array.isArray(holerites))
    console.log('📦 [MEUS-HOLERITES] Holerites encontrados:', holerites?.length || 0)
    
    if (holerites && holerites.length > 0) {
      console.log('📦 [MEUS-HOLERITES] Primeiros 3 holerites:')
      holerites.slice(0, 3).forEach((h: any, i: number) => {
        console.log(`   ${i+1}. ID: ${h.id}, Status: ${h.status}, Período: ${h.periodo_inicio} a ${h.periodo_fim}`)
      })
    } else {
      console.log('📦 [MEUS-HOLERITES] Nenhum holerite encontrado para o funcionário')
      console.log('📦 [MEUS-HOLERITES] Verificar se:')
      console.log('   - Funcionário tem holerites gerados')
      console.log('   - Holerites têm status correto')
      console.log('   - ID do funcionário está correto')
    }

    // Se há holerites, buscar dados do funcionário para notificação E atualizar status
    if (holerites && holerites.length > 0) {
      try {
        // NOVA FUNCIONALIDADE: Atualizar status dos holerites para "visualizado"
        // quando o funcionário acessar a área "meus holerites"
        const holeriteIds = holerites
          .filter((h: any) => h.status !== 'visualizado') // Só atualizar os que não são visualizados
          .map((h: any) => h.id)
        
        if (holeriteIds.length > 0) {
          console.log(`🔄 [MEUS-HOLERITES] Atualizando ${holeriteIds.length} holerites para status "visualizado"`)
          
          const updateResponse = await fetch(
            `${supabaseUrl}/rest/v1/holerites?id=in.(${holeriteIds.join(',')})`,
            {
              method: 'PATCH',
              headers: {
                'apikey': serviceRoleKey,
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({ status: 'visualizado' })
            }
          )
          
          if (updateResponse.ok) {
            console.log(`✅ [MEUS-HOLERITES] Status atualizado com sucesso para ${holeriteIds.length} holerites`)
            // Atualizar os holerites na resposta também
            holerites.forEach((h: any) => {
              if (holeriteIds.includes(h.id)) {
                h.status = 'visualizado'
              }
            })
          } else {
            console.error(`❌ [MEUS-HOLERITES] Erro ao atualizar status:`, await updateResponse.text())
          }
        }

        const funcionarioResponse = await fetch(
          `${supabaseUrl}/rest/v1/funcionarios?id=eq.${funcionarioId}&select=id,nome_completo,email_login,email_pessoal`,
          { 
            headers: {
              'apikey': serviceRoleKey,
              'Authorization': `Bearer ${serviceRoleKey}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (funcionarioResponse.ok) {
          const funcionarios = await funcionarioResponse.json()
          if (funcionarios && funcionarios.length > 0) {
            const funcionario = funcionarios[0]
            
            // Criar notificação apenas se há holerites para visualizar
            await notificarVisualizacaoHolerite(event, {
              id: funcionario.id,
              nome: funcionario.nome_completo,
              email: funcionario.email_login || funcionario.email_pessoal
            }, { 
              id: 'lista',
              periodo_inicio: new Date().toISOString(),
              periodo_fim: new Date().toISOString(),
              total_holerites: holerites.length
            })
          }
        }
      } catch (notificationError) {
        console.error('⚠️ [MEUS-HOLERITES] Erro ao criar notificação:', notificationError)
        // Não falhar a requisição por causa da notificação
      }
    }

    console.log('✅ [MEUS-HOLERITES] === FIM DA REQUISIÇÃO ===')
    console.log('✅ [MEUS-HOLERITES] Retornando', holerites?.length || 0, 'holerites')
    
    return holerites || []
    
  } catch (error: any) {
    console.error('💥 [MEUS-HOLERITES] === ERRO CRÍTICO ===')
    console.error('💥 [MEUS-HOLERITES] Timestamp:', new Date().toISOString())
    console.error('💥 [MEUS-HOLERITES] Erro ao buscar holerites:', error)
    console.error('💥 [MEUS-HOLERITES] Stack trace:', error.stack)
    console.error('💥 [MEUS-HOLERITES] Mensagem:', error.message)
    console.error('💥 [MEUS-HOLERITES] Status:', error.status || error.statusCode)
    console.error('💥 [MEUS-HOLERITES] Data:', error.data)
    console.error('💥 [MEUS-HOLERITES] Tipo do erro:', typeof error)
    console.error('💥 [MEUS-HOLERITES] Nome do erro:', error.name)
    
    // CORREÇÃO PRODUÇÃO: Log adicional para debug
    if (error.cause) {
      console.error('💥 [MEUS-HOLERITES] Causa do erro:', error.cause)
    }
    
    throw createError({
      statusCode: error.statusCode || error.status || 500,
      message: `Erro ao buscar holerites: ${error.message || 'Erro desconhecido'}`
    })
  }
})