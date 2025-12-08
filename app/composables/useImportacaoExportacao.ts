export interface ImportForm {
  tipoEntidade: string
  templateId: string
  arquivo: File | null
  validarAntes: boolean
  fazerBackup: boolean
  atualizarExistentes: boolean
}

export interface ExportForm {
  tipoEntidade: string
  formato: string
  incluirInativos: boolean
  filtros: { dataInicio: string; dataFim: string; status: string }
}

export interface ConfigImportacao {
  tamanhoMaximoArquivo: number
  tempoExpiracaoExportacao: number
  limiteRegistrosExportacao: number
  encodingPadrao: string
  delimitadorCsv: string
  validacaoAutomatica: boolean
  backupAntesImportacao: boolean
  notificarConclusao: boolean
  permitirImportacaoParalela: boolean
}

export const useImportacaoExportacao = () => {
  const templates = ref<any[]>([])
  const historicoImportacoes = ref<any[]>([])
  const historicoExportacoes = ref<any[]>([])
  const config = ref<ConfigImportacao>({
    tamanhoMaximoArquivo: 10,
    tempoExpiracaoExportacao: 24,
    limiteRegistrosExportacao: 50000,
    encodingPadrao: 'UTF-8',
    delimitadorCsv: ',',
    validacaoAutomatica: true,
    backupAntesImportacao: true,
    notificarConclusao: true,
    permitirImportacaoParalela: false,
  })
  const erroMigration = ref(false)
  const loading = ref(false)

  const carregarTemplates = async () => {
    try {
      const response = await $fetch<any>('/api/importacao/templates')
      templates.value = response.data || []
      erroMigration.value = false
    } catch (error: any) {
      if (error.message?.includes('does not exist')) erroMigration.value = true
    }
  }

  const carregarHistoricoImportacoes = async () => {
    loading.value = true
    try {
      const response = await $fetch<any>('/api/importacao/historico')
      historicoImportacoes.value = response.data || []
    } catch (e) { console.error(e) }
    finally { loading.value = false }
  }

  const carregarHistoricoExportacoes = async () => {
    loading.value = true
    try {
      const response = await $fetch<any>('/api/exportacao/historico')
      historicoExportacoes.value = response.data || []
    } catch (e) { console.error(e) }
    finally { loading.value = false }
  }

  const carregarConfig = async () => {
    try {
      const response = await $fetch<any>('/api/importacao/config')
      if (response.data) {
        config.value = {
          tamanhoMaximoArquivo: response.data.tamanho_maximo_arquivo / 1048576,
          tempoExpiracaoExportacao: response.data.tempo_expiracao_exportacao,
          limiteRegistrosExportacao: response.data.limite_registros_exportacao,
          encodingPadrao: response.data.encoding_padrao,
          delimitadorCsv: response.data.delimitador_csv,
          validacaoAutomatica: response.data.validacao_automatica,
          backupAntesImportacao: response.data.backup_antes_importacao,
          notificarConclusao: response.data.notificar_conclusao,
          permitirImportacaoParalela: response.data.permitir_importacao_paralela,
        }
      }
      erroMigration.value = false
    } catch (error: any) {
      if (error.message?.includes('does not exist')) erroMigration.value = true
    }
  }

  const executarImportacao = async (form: ImportForm) => {
    if (!form.arquivo || !form.tipoEntidade) throw new Error('Selecione o tipo e arquivo')
    const formData = new FormData()
    formData.append('arquivo', form.arquivo)
    formData.append('tipoEntidade', form.tipoEntidade)
    formData.append('templateId', form.templateId)
    formData.append('validarAntes', String(form.validarAntes))
    formData.append('fazerBackup', String(form.fazerBackup))
    formData.append('atualizarExistentes', String(form.atualizarExistentes))
    await $fetch('/api/importacao/executar', { method: 'POST', body: formData })
    await carregarHistoricoImportacoes()
  }

  const executarExportacao = async (form: ExportForm) => {
    if (!form.tipoEntidade || !form.formato) throw new Error('Selecione tipo e formato')
    await $fetch('/api/exportacao/executar', { method: 'POST', body: form })
    await carregarHistoricoExportacoes()
  }

  const excluirTemplate = async (id: string) => {
    await $fetch(`/api/importacao/templates/${id}`, { method: 'DELETE' })
    await carregarTemplates()
  }

  return {
    templates, historicoImportacoes, historicoExportacoes, config, erroMigration, loading,
    carregarTemplates, carregarHistoricoImportacoes, carregarHistoricoExportacoes,
    carregarConfig, executarImportacao, executarExportacao, excluirTemplate,
  }
}
