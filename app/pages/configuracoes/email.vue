<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-6">
      <button @click="navigateTo('/configuracoes')" class="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
        <Icon name="mdi:arrow-left" size="20" />
        Voltar para Configurações
      </button>
    </div>

    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">E-mail e Comunicação</h1>
      <p class="text-gray-600">Configure SMTP, templates de e-mail e notificações automáticas</p>
    </div>

    <CardEmailStats :stats="stats" />

    <!-- Tabs -->
    <div class="mb-6">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id" :class="['py-4 px-1 border-b-2 font-medium text-sm transition-colors', activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700']">
            <Icon :name="tab.icon" class="inline mr-2" />{{ tab.label }}
          </button>
        </nav>
      </div>
    </div>

    <FormSmtpConfig v-if="activeTab === 'smtp'" :smtp="smtp" :salvando="salvandoSMTP" :testando="testando" @salvar="salvarSMTP" @testar="testarSMTP" />

    <SectionEmailTemplates v-if="activeTab === 'templates'" :templates="templates" @novo="abrirModalTemplate()" @editar="abrirModalTemplate" @excluir="excluirTemplate" />

    <FormComunicacaoConfig v-if="activeTab === 'comunicacao'" :comunicacao="comunicacao" :salvando="salvandoComunicacao" @salvar="salvarComunicacao" />

    <SectionEmailHistorico v-if="activeTab === 'historico'" :historico="historico" v-model:filtroStatus="filtroStatus" />

    <ModalTemplateEmail v-if="modalTemplate" :template="templateSelecionado" @close="modalTemplate = false" @saved="carregarTemplates" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'default' })

const tabs = [
  { id: 'smtp', label: 'Configurações SMTP', icon: 'mdi:email-settings' },
  { id: 'templates', label: 'Templates', icon: 'mdi:email-edit' },
  { id: 'comunicacao', label: 'Notificações', icon: 'mdi:bell' },
  { id: 'historico', label: 'Histórico', icon: 'mdi:history' }
]

const activeTab = ref('smtp')
const salvandoSMTP = ref(false)
const salvandoComunicacao = ref(false)
const testando = ref(false)
const modalTemplate = ref(false)
const templateSelecionado = ref(null)
const filtroStatus = ref('')

const stats = ref({ totalEnviados: 0, totalPendentes: 0, totalFalhas: 0, taxaAbertura: '0.0', enviadosHoje: 0, totalTemplates: 0 })
const smtp = ref({ servidor_smtp: '', porta: 587, usa_ssl: true, usa_tls: true, usuario_smtp: '', senha_smtp: '', email_remetente: '', nome_remetente: '', email_resposta: '', timeout: 30, ativo: true })
const comunicacao = ref({ notificar_admissao: true, notificar_demissao: true, notificar_aniversario: true, notificar_ferias_aprovadas: true, notificar_ferias_vencendo: true, notificar_documentos_vencendo: true, notificar_ponto_inconsistente: true, notificar_folha_gerada: true, dias_alerta_ferias: 30, dias_alerta_documentos: 15, dias_alerta_aniversario: 3, horario_envio_inicio: '08:00', horario_envio_fim: '18:00', enviar_finais_semana: false, rastrear_abertura: true, rastrear_cliques: true })
const templates = ref<any[]>([])
const historico = ref<any[]>([])

const carregarStats = async () => { try { stats.value = await $fetch('/api/email/stats') } catch (e) { console.error(e) } }
const carregarSMTP = async () => { try { const data = await $fetch('/api/email/smtp'); if (data) smtp.value = { ...smtp.value, ...data } } catch (e) { console.error(e) } }
const carregarComunicacao = async () => { try { const data = await $fetch('/api/email/comunicacao'); if (data) comunicacao.value = { ...comunicacao.value, ...data } } catch (e) { console.error(e) } }
const carregarTemplates = async () => { try { templates.value = await $fetch('/api/email/templates') } catch (e) { console.error(e) } }
const carregarHistorico = async () => { try { const params = filtroStatus.value ? `?status=${filtroStatus.value}` : ''; const data = await $fetch(`/api/email/historico${params}`); historico.value = (data as any).data } catch (e) { console.error(e) } }

const salvarSMTP = async () => {
  salvandoSMTP.value = true
  try { await $fetch('/api/email/smtp', { method: 'PUT', body: smtp.value }); alert('Configurações SMTP salvas!') }
  catch { alert('Erro ao salvar SMTP') }
  finally { salvandoSMTP.value = false }
}

const testarSMTP = async () => {
  testando.value = true
  try { const result = await $fetch('/api/email/smtp-test', { method: 'POST', body: smtp.value }); alert((result as any).message); if ((result as any).success) await carregarSMTP() }
  catch { alert('Erro ao testar SMTP') }
  finally { testando.value = false }
}

const salvarComunicacao = async () => {
  salvandoComunicacao.value = true
  try { await $fetch('/api/email/comunicacao', { method: 'PUT', body: comunicacao.value }); alert('Configurações salvas!') }
  catch { alert('Erro ao salvar') }
  finally { salvandoComunicacao.value = false }
}

const abrirModalTemplate = (template: any = null) => { templateSelecionado.value = template; modalTemplate.value = true }

const excluirTemplate = async (id: string) => {
  if (!confirm('Deseja excluir este template?')) return
  try { await $fetch(`/api/email/templates/${id}`, { method: 'DELETE' }); await carregarTemplates(); alert('Template excluído!') }
  catch { alert('Erro ao excluir') }
}

watch(activeTab, (newTab) => { if (newTab === 'historico') carregarHistorico() })
watch(filtroStatus, () => carregarHistorico())

onMounted(() => Promise.all([carregarStats(), carregarSMTP(), carregarComunicacao(), carregarTemplates()]))
</script>
