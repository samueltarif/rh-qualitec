export default defineEventHandler(async (event) => {
  try {
    console.log('🚪 Processando logout...')
    
    // Limpar cookie de sessão
    setCookie(event, 'session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expira imediatamente
      path: '/'
    })
    
    console.log('✅ Logout realizado com sucesso')
    
    return {
      success: true,
      message: 'Logout realizado com sucesso'
    }
    
  } catch (error: any) {
    console.error('💥 Erro no logout:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor'
    })
  }
})