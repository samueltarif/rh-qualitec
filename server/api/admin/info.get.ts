import { requireAdmin } from '../../utils/authMiddleware'

// API para buscar informações da admin (com autenticação)
export default defineEventHandler(async (event) => {
  try {
    // Verificar se o usuário é admin
    const user = await requireAdmin(event)
    
    console.log('📊 Admin autenticado acessando info:', user.nome_completo)
    
    return {
      success: true,
      data: {
        id: user.id,
        nome: user.nome_completo,
        email: user.email_login,
        cargo_id: user.cargo_id || null,
        departamento_id: user.departamento_id || null
      }
    }
    
  } catch (error: any) {
    console.error('💥 Erro ao buscar info admin:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor'
    })
  }
})
