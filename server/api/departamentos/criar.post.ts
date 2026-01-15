// API para criar ou atualizar departamento
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl
  const serviceRoleKey = config.supabaseServiceRoleKey || config.public.supabaseKey

  console.log('📝 Salvando departamento:', JSON.stringify(body, null, 2))

  try {
    if (body.id) {
      // Atualizar departamento existente
      console.log('🔄 Atualizando departamento ID:', body.id)
      const { id, ...dadosDepartamento } = body
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/departamentos?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(dadosDepartamento)
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro ao atualizar:', errorText)
        throw new Error(`Erro ao atualizar departamento: ${errorText}`)
      }

      const departamentoAtualizado = await response.json()
      console.log('✅ Departamento atualizado!')

      return {
        success: true,
        message: 'Departamento atualizado com sucesso!',
        data: departamentoAtualizado[0]
      }
    } else {
      // Criar novo departamento
      console.log('➕ Criando novo departamento')
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/departamentos`,
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
            responsavel: body.responsavel
          })
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro ao criar:', errorText)
        throw new Error(`Erro ao criar departamento: ${errorText}`)
      }

      const departamentoCriado = await response.json()
      console.log('✅ Departamento criado!')

      return {
        success: true,
        message: 'Departamento criado com sucesso!',
        data: departamentoCriado[0]
      }
    }
  } catch (error: any) {
    console.error('💥 Erro ao salvar departamento:', error.message)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao salvar departamento'
    })
  }
})
