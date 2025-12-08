<template>
  <div class="card">
    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <Icon name="heroicons:cog-6-tooth" class="text-teal-600" size="24" />
      Configurações Gerais
    </h3>

    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Tamanho Máximo de Arquivo (MB)</label>
        <UIInput v-model.number="config.tamanhoMaximoArquivo" type="number" min="1" max="100" />
        <p class="text-xs text-gray-500 mt-1">Limite: 1MB a 100MB</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Tempo de Expiração de Exportações (horas)</label>
        <UIInput v-model.number="config.tempoExpiracaoExportacao" type="number" min="1" max="168" />
        <p class="text-xs text-gray-500 mt-1">Arquivos exportados serão excluídos após este período</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Limite de Registros por Exportação</label>
        <UIInput v-model.number="config.limiteRegistrosExportacao" type="number" min="100" max="100000" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Encoding Padrão</label>
        <UISelect v-model="config.encodingPadrao">
          <option value="UTF-8">UTF-8</option>
          <option value="ISO-8859-1">ISO-8859-1</option>
          <option value="Windows-1252">Windows-1252</option>
        </UISelect>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Delimitador CSV</label>
        <UISelect v-model="config.delimitadorCsv">
          <option value=",">, (vírgula)</option>
          <option value=";">; (ponto e vírgula)</option>
          <option value="\t">Tab</option>
        </UISelect>
      </div>

      <div class="space-y-3 pt-4 border-t border-gray-200">
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="config.validacaoAutomatica" class="rounded text-teal-600" />
          <span class="text-sm text-gray-700">Validar dados automaticamente antes de importar</span>
        </label>
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="config.backupAntesImportacao" class="rounded text-teal-600" />
          <span class="text-sm text-gray-700">Fazer backup automático antes de importações</span>
        </label>
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="config.notificarConclusao" class="rounded text-teal-600" />
          <span class="text-sm text-gray-700">Notificar por e-mail ao concluir operações</span>
        </label>
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="config.permitirImportacaoParalela" class="rounded text-teal-600" />
          <span class="text-sm text-gray-700">Permitir múltiplas importações simultâneas</span>
        </label>
      </div>

      <UIButton @click="$emit('salvar')" theme="admin" variant="primary" full-width :disabled="salvando">
        {{ salvando ? 'Salvando...' : 'Salvar Configurações' }}
      </UIButton>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  config: {
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
  salvando: boolean
}>()

defineEmits<{ salvar: [] }>()
</script>
