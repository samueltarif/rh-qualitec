<template>
  <UIModal 
    :show="show" 
    @close="$emit('close')"
    size="full"
    title="Visualizar TRCT - Termo de Rescisão do Contrato de Trabalho"
  >
    <div class="max-h-[80vh] overflow-y-auto">
      <EspelhoTRCT 
        :empresa="empresa"
        :colaborador="colaborador"
        :dados-rescisao="dadosRescisao"
        :calculos="calculos"
      />
    </div>

    <template #footer>
      <div class="flex justify-between gap-3">
        <UIButton variant="secondary" @click="$emit('close')">
          Fechar
        </UIButton>
        
        <div class="flex gap-3">
          <UIButton variant="primary" @click="gerarPDF">
            <Icon name="heroicons:document-arrow-down" size="20" class="mr-2" />
            Baixar PDF
          </UIButton>
          
          <UIButton variant="success" @click="imprimir">
            <Icon name="heroicons:printer" size="20" class="mr-2" />
            Imprimir
          </UIButton>
        </div>
      </div>
    </template>
  </UIModal>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  empresa: any
  colaborador: any
  dadosRescisao: any
  calculos: any
}

const props = defineProps<Props>()
const emit = defineEmits(['close'])

const gerarPDF = async () => {
  try {
    const response = await $fetch('/api/rescisao/gerar-trct', {
      method: 'POST',
      body: {
        colaborador: props.colaborador,
        dadosRescisao: props.dadosRescisao,
        empresa: props.empresa
      }
    })
    
    // Criar link para download do TRCT
    const blob = new Blob([response as any], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `TRCT_${props.colaborador.nome.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Erro ao gerar TRCT:', error)
    alert('Erro ao gerar TRCT')
  }
}

const imprimir = () => {
  window.print()
}
</script>

<style scoped>
@media print {
  .modal-overlay,
  .modal-header,
  .modal-footer {
    display: none !important;
  }
  
  .modal-content {
    box-shadow: none !important;
    border: none !important;
    margin: 0 !important;
    padding: 0 !important;
  }
}
</style>