// API para criar ou atualizar benefício
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl
  const serviceRoleKey = config.supabaseServiceRoleKey || config.public.supabaseKey

  console.log('📝 Salvando benefício:', JSON.stringify(body, null, 2))

  try {
    if (body.id) {
      // Atualizar benefício existente
      console.log('🔄 Atualizando benefício ID:', body.id)
      const { id, ...dadosBeneficio } = body
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/beneficios?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(dadosBeneficio)
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro ao atualizar:', errorText)
        throw new Error(`Erro ao atualizar benefício: ${errorText}`)
      }

      const beneficioAtualizado = await response.json()
      console.log('✅ Benefício atualizado!')

      return {
        success: true,
        message: 'Benefício atualizado com sucesso!',
        data: beneficioAtualizado[0]
      }
    } else {
      // Criar novo benefício
      console.log('➕ Criando novo benefício')
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/beneficios`,
        {
          method: 'POST',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            nome: body.nome,
            descricao: body.descricao,
            valor: body.valor,
            desconto: body.desconto,
            icone: body.icone,
            ativo: true
          })
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro ao criar:', errorText)
        throw new Error(`Erro ao criar benefício: ${errorText}`)
      }

      const beneficioCriado = await response.json()
      console.log('✅ Benefício criado!')

      return {
        success: true,
        message: 'Benefício criado com sucesso!',
        data: beneficioCriado[0]
      }
    }
  } catch (error: any) {
    console.error('💥 Erro ao salvar benefício:', error.message)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao salvar benefício'
    })
  }
})
