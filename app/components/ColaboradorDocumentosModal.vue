<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>
    <div class="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto p-6">
      <h3 class="text-xl font-bold text-gray-800 mb-2">Documentos</h3>
      <p class="text-sm text-gray-600 mb-6">Colaborador: <strong>{{ colaborador?.nome }}</strong></p>

      <!-- Upload -->
      <div class="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
        <div class="flex flex-col md:flex-row gap-4">
          <UISelect v-model="uploadTipo" class="md:w-48">
            <option value="">Tipo de documento</option>
            <option value="RG">RG</option>
            <option value="CPF">CPF</option>
            <option value="CTPS">CTPS</option>
            <option value="Contrato">Contrato</option>
            <option value="Comprovante_Residencia">Comprovante de Residência</option>
            <option value="ASO">ASO</option>
            <option value="Certificado">Certificado</option>
            <option value="Outros">Outros</option>
          </UISelect>
          <input type="file" ref="fileInput" class="flex-1" @change="handleFileSelect" />
          <UIButton theme="admin" variant="primary" :disabled="!uploadFile || !uploadTipo || uploading" @click="handleUpload">
            {{ uploading ? 'Enviando...' : 'Enviar' }}
          </UIButton>
        </div>
      </div>

      <!-- Lista de Documentos -->
      <div v-if="documentos.length > 0" class="space-y-2">
        <div v-for="doc in documentos" :key="doc.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div class="flex items-center gap-3">
            <Icon name="heroicons:document" class="text-gray-400" size="24" />
            <div>
              <p class="font-medium text-gray-800">{{ doc.nome }}</p>
              <p class="text-xs text-gray-500">{{ doc.tipo }} • {{ formatDate(doc.created_at) }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <a :href="doc.arquivo_url" target="_blank" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
              <Icon name="heroicons:arrow-down-tray" size="18" />
            </a>
            <button class="p-2 text-red-600 hover:bg-red-50 rounded-lg" @click="$emit('remove', doc.id)">
              <Icon name="heroicons:trash" size="18" />
            </button>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-8 text-gray-500">
        <Icon name="heroicons:document" class="mx-auto mb-2 text-gray-300" size="48" />
        <p>Nenhum documento cadastrado</p>
      </div>

      <div class="flex justify-end mt-6">
        <UIButton theme="admin" variant="secondary" @click="$emit('close')">Fechar</UIButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  colaborador: { id: string; nome: string } | null
  documentos: Array<{ id: string; nome: string; tipo: string; arquivo_url: string; created_at: string }>
  uploading: boolean
}>()

const emit = defineEmits<{
  close: []
  upload: [file: File, tipo: string]
  remove: [id: string]
}>()

const uploadTipo = ref('')
const uploadFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const formatDate = (dateString: string) => dateString ? new Date(dateString).toLocaleDateString('pt-BR') : '-'

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  uploadFile.value = target.files?.[0] || null
}

const handleUpload = () => {
  if (uploadFile.value && uploadTipo.value) {
    emit('upload', uploadFile.value, uploadTipo.value)
    uploadTipo.value = ''
    uploadFile.value = null
    if (fileInput.value) fileInput.value.value = ''
  }
}
</script>
