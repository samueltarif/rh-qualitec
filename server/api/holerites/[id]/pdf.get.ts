import { gerarHoleriteHTML } from '../../../utils/holeriteHTML'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceRoleKey = config.supabaseServiceRoleKey || config.public.supabaseKey
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'ID do holerite não fornecido'
      })
    }

    console.log('📄 Gerando holerite HTML para ID:', id)

    // Buscar holerite
    const holeriteResponse = await fetch(
      `${supabaseUrl}/rest/v1/holerites?id=eq.${id}&select=*`,
      {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!holeriteResponse.ok) {
      throw new Error('Erro ao buscar holerite')
    }

    const holerites = await holeriteResponse.json()
    
    if (!holerites || holerites.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Holerite não encontrado'
      })
    }

    const holerite = holerites[0]

    // Buscar funcionário com cargo e departamento
    const funcionarioResponse = await fetch(
      `${supabaseUrl}/rest/v1/funcionarios?id=eq.${holerite.funcionario_id}&select=*,cargo:cargos(nome),departamento:departamentos(nome)`,
      {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!funcionarioResponse.ok) {
      throw new Error('Erro ao buscar funcionário')
    }

    const funcionarios = await funcionarioResponse.json()
    
    if (!funcionarios || funcionarios.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Funcionário não encontrado'
      })
    }

    const funcionario = funcionarios[0]
    
    // Adicionar nome do cargo e departamento ao objeto funcionario
    funcionario.cargo_nome = funcionario.cargo?.nome || 'Não definido'
    funcionario.departamento_nome = funcionario.departamento?.nome || 'Não definido'
    funcionario.numero_dependentes = funcionario.numero_dependentes || 0

    // Buscar empresa
    const empresaResponse = await fetch(
      `${supabaseUrl}/rest/v1/empresas?id=eq.${funcionario.empresa_id}&select=*`,
      {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!empresaResponse.ok) {
      throw new Error('Erro ao buscar empresa')
    }

    const empresas = await empresaResponse.json()
    
    if (!empresas || empresas.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Empresa não encontrada'
      })
    }

    const empresa = empresas[0]

    // Gerar HTML
    const html = gerarHoleriteHTML(holerite, funcionario, empresa)

    // Retornar HTML
    setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8')
    return html

  } catch (error: any) {
    console.error('Erro ao gerar holerite:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao gerar holerite'
    })
  }
})
