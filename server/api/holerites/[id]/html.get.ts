import { serverSupabaseServiceRole } from '#supabase/server'
import { gerarHoleriteHTML } from '../../../utils/holeriteHTML'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const supabase = serverSupabaseServiceRole(event)

  try {
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'ID do holerite é obrigatório'
      })
    }

    // Buscar holerite com dados completos
    const { data: holerite, error }: any = await supabase
      .from('holerites')
      .select(`
        *,
        funcionario:funcionario_id (
          nome_completo,
          cpf,
          cargo_id (nome),
          departamento_id (nome),
          empresa_id (
            nome,
            cnpj,
            logradouro,
            numero,
            complemento,
            bairro,
            cidade,
            estado,
            cep
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error || !holerite) {
      throw createError({
        statusCode: 404,
        message: 'Holerite não encontrado'
      })
    }

    // Gerar HTML
    const funcionarioData = {
      nome_completo: holerite.funcionario.nome_completo,
      cpf: holerite.funcionario.cpf,
      cargo: holerite.funcionario.cargo_id?.nome || 'Não informado',
      departamento: holerite.funcionario.departamento_id?.nome || 'Não informado',
      data_admissao: holerite.funcionario.data_admissao,
      numero_dependentes: holerite.funcionario.numero_dependentes || 0
    }

    const empresaData = {
      nome: holerite.funcionario.empresa_id?.nome || 'Empresa',
      cnpj: holerite.funcionario.empresa_id?.cnpj || '',
      logradouro: holerite.funcionario.empresa_id?.logradouro || '',
      numero: holerite.funcionario.empresa_id?.numero || '',
      complemento: holerite.funcionario.empresa_id?.complemento || '',
      bairro: holerite.funcionario.empresa_id?.bairro || '',
      cidade: holerite.funcionario.empresa_id?.cidade || '',
      estado: holerite.funcionario.empresa_id?.estado || '',
      cep: holerite.funcionario.empresa_id?.cep || ''
    }

    const html = gerarHoleriteHTML(holerite, funcionarioData, empresaData)

    // Retornar HTML como arquivo para download
    setHeader(event, 'Content-Type', 'text/html; charset=utf-8')
    setHeader(event, 'Content-Disposition', `attachment; filename="holerite-${holerite.funcionario.nome_completo.replace(/\s+/g, '-')}.html"`)
    
    return html
  } catch (error: any) {
    console.error('Erro ao gerar HTML:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao gerar HTML do holerite'
    })
  }
})
