import { calcularRescisao } from '../../utils/rescisao-calculator'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    const { colaborador, ...dadosRescisao } = body

    // Validações
    if (!colaborador || !colaborador.salario_base) {
      throw createError({
        statusCode: 400,
        message: 'Dados do colaborador inválidos'
      })
    }

    if (!dadosRescisao.tipo_rescisao || !dadosRescisao.data_desligamento) {
      throw createError({
        statusCode: 400,
        message: 'Tipo de rescisão e data de desligamento são obrigatórios'
      })
    }

    // Calcular rescisão
    const resultado = calcularRescisao(colaborador, dadosRescisao)

    return resultado
  } catch (error: any) {
    console.error('Erro ao simular rescisão:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao simular rescisão'
    })
  }
})
