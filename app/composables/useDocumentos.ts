/**
 * Composable para gerenciar upload e download de documentos
 */

export const useDocumentos = () => {
  const supabase = useSupabaseClient()

  /**
   * Upload de documento para o Storage
   */
  const uploadDocumento = async (
    colaboradorId: string,
    categoria: string,
    arquivo: File
  ) => {
    try {
      // Validar tipo de arquivo
      const tiposPermitidos = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]

      if (!tiposPermitidos.includes(arquivo.type)) {
        throw new Error('Tipo de arquivo não permitido. Use PDF, JPG, PNG ou DOC.')
      }

      // Validar tamanho (10 MB)
      const tamanhoMaximo = 10 * 1024 * 1024 // 10 MB
      if (arquivo.size > tamanhoMaximo) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 10 MB')
      }

      // Gerar nome único
      const timestamp = Date.now()
      const extensao = arquivo.name.split('.').pop()
      const nomeSeguro = arquivo.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .substring(0, 100)
      const nomeArquivo = `${timestamp}-${nomeSeguro}`
      
      // Caminho no storage
      const caminho = `colaboradores/${colaboradorId}/${categoria}/${nomeArquivo}`

      // Upload para o Storage
      const { data, error } = await supabase.storage
        .from('documentos-rh')
        .upload(caminho, arquivo, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Obter URL assinada (válida por 1 ano)
      const { data: urlData } = await supabase.storage
        .from('documentos-rh')
        .createSignedUrl(caminho, 60 * 60 * 24 * 365)

      return {
        success: true,
        path: data.path,
        url: urlData?.signedUrl || '',
        nome: arquivo.name,
        tamanho: arquivo.size,
        tipo: arquivo.type,
      }
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Baixar documento do Storage
   */
  const downloadDocumento = async (caminho: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documentos-rh')
        .download(caminho)

      if (error) throw error

      return {
        success: true,
        data
      }
    } catch (error: any) {
      console.error('Erro ao baixar documento:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Excluir documento do Storage
   */
  const excluirDocumento = async (caminho: string) => {
    try {
      const { error } = await supabase.storage
        .from('documentos-rh')
        .remove([caminho])

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('Erro ao excluir documento:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Obter URL assinada (temporária) para visualização
   */
  const getUrlAssinada = async (caminho: string, expiresIn = 3600) => {
    try {
      const { data, error } = await supabase.storage
        .from('documentos-rh')
        .createSignedUrl(caminho, expiresIn)

      if (error) throw error

      return {
        success: true,
        url: data.signedUrl
      }
    } catch (error: any) {
      console.error('Erro ao gerar URL assinada:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Listar documentos de um colaborador
   */
  const listarDocumentos = async (colaboradorId: string, categoria?: string) => {
    try {
      const caminho = categoria 
        ? `colaboradores/${colaboradorId}/${categoria}`
        : `colaboradores/${colaboradorId}`

      const { data, error } = await supabase.storage
        .from('documentos-rh')
        .list(caminho)

      if (error) throw error

      return {
        success: true,
        arquivos: data || []
      }
    } catch (error: any) {
      console.error('Erro ao listar documentos:', error)
      return {
        success: false,
        error: error.message,
        arquivos: []
      }
    }
  }

  /**
   * Validar arquivo antes do upload
   */
  const validarArquivo = (arquivo: File) => {
    const erros: string[] = []

    // Tipos permitidos
    const tiposPermitidos = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!tiposPermitidos.includes(arquivo.type)) {
      erros.push('Tipo de arquivo não permitido. Use PDF, JPG, PNG ou DOC.')
    }

    // Tamanho máximo (10 MB)
    const tamanhoMaximo = 10 * 1024 * 1024
    if (arquivo.size > tamanhoMaximo) {
      erros.push('Arquivo muito grande. Tamanho máximo: 10 MB')
    }

    // Nome do arquivo
    if (!arquivo.name || arquivo.name.length > 255) {
      erros.push('Nome do arquivo inválido')
    }

    return {
      valido: erros.length === 0,
      erros
    }
  }

  /**
   * Formatar tamanho de arquivo
   */
  const formatarTamanho = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  /**
   * Obter ícone baseado no tipo de arquivo
   */
  const getIconeArquivo = (tipo: string): string => {
    if (tipo.includes('pdf')) return 'heroicons:document-text'
    if (tipo.includes('image')) return 'heroicons:photo'
    if (tipo.includes('word') || tipo.includes('document')) return 'heroicons:document'
    return 'heroicons:document'
  }

  return {
    uploadDocumento,
    downloadDocumento,
    excluirDocumento,
    getUrlAssinada,
    listarDocumentos,
    validarArquivo,
    formatarTamanho,
    getIconeArquivo,
  }
}
