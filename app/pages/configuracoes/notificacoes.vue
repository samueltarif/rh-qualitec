<template>
  <div class="min-h-screen bg-gray-50">
    <BasePageHeader
      title="Notificações e Alertas"
      subtitle="Configure avisos automáticos do sistema RH"
      backTo="/configuracoes"
      theme="admin"
    >
      <template #actions>
        <button @click="handleGerarAlertas" :disabled="gerandoAlertas" class="btn-secondary">
          <Icon :name="gerandoAlertas ? 'heroicons:arrow-path' : 'heroicons:bolt'" :class="{ 'animate-spin': gerandoAlertas }" class="mr-2" />
          Gerar Alertas Agora
        </button>
      </template>
    </BasePageHeader>

    <div class="max-w-7xl mx-auto p-8">
      <CardNotificacoesStats :stats="stats" />

      <!-- Tabs -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div class="flex border-b border-gray-200">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="abaAtiva = tab.id"
            class="px-6 py-3 font-medium transition-colors"
            :class="abaAtiva === tab.id ? 'text-red-700 border-b-2 border-red-700' : 'text-gray-500 hover:text-gray-700'"
          >
            <Icon :name="tab.icon" class="inline mr-2" />
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Aba Configurações -->
      <div v-if="abaAtiva === 'configuracoes'" class="space-y-6">
        <CardConfigNotificacao title="Documentos" icon="heroicons:document-text" iconColor="text-amber-600">
          <FormCheckboxDias v-model:checked="config.notificar_documentos_vencendo" label="Notificar documentos vencendo" :dias="config.dias_antecedencia_documentos" @update:dias="config.dias_antecedencia_documentos = $event" diasLabel="Dias de antecedência:" showDias :min="1" :max="90" />
        </CardConfigNotificacao>

        <CardConfigNotificacao title="Contratos e Experiência" icon="heroicons:document-check" iconColor="text-purple-600">
          <FormCheckboxDias v-model:checked="config.notificar_contratos_vencendo" label="Notificar contratos vencendo" :dias="config.dias_antecedencia_contratos" @update:dias="config.dias_antecedencia_contratos = $event" diasLabel="Dias de antecedência:" showDias :min="1" :max="120" />
          <FormCheckboxDias v-model:checked="config.notificar_experiencia_vencendo" label="Notificar período de experiência" :dias="config.dias_antecedencia_experiencia" @update:dias="config.dias_antecedencia_experiencia = $event" diasLabel="Dias de antecedência:" showDias :min="1" :max="30" />
        </CardConfigNotificacao>

        <CardConfigNotificacao title="Férias" icon="heroicons:sun" iconColor="text-cyan-600">
          <FormCheckboxDias v-model:checked="config.notificar_ferias_vencendo" label="Notificar férias vencendo" :dias="config.dias_antecedencia_ferias" @update:dias="config.dias_antecedencia_ferias = $event" diasLabel="Dias de antecedência:" showDias :min="1" :max="90" />
          <FormCheckboxDias v-model:checked="config.notificar_ferias_programadas" label="Notificar férias programadas" :dias="config.dias_antecedencia_ferias_programadas" @update:dias="config.dias_antecedencia_ferias_programadas = $event" diasLabel="Dias de antecedência:" showDias :min="1" :max="30" />
        </CardConfigNotificacao>

        <CardConfigNotificacao title="Aniversários" icon="heroicons:cake" iconColor="text-pink-600">
          <FormCheckboxDias v-model:checked="config.notificar_aniversarios" label="Notificar aniversários" :dias="config.dias_antecedencia_aniversarios" @update:dias="config.dias_antecedencia_aniversarios = $event" diasLabel="Dias de antecedência:" showDias :min="0" :max="7" />
          <FormCheckboxDias v-model:checked="config.notificar_aniversarios_empresa" label="Notificar aniversários de empresa" :dias="config.dias_antecedencia_aniversarios_empresa" @update:dias="config.dias_antecedencia_aniversarios_empresa = $event" diasLabel="Dias de antecedência:" showDias :min="0" :max="30" />
        </CardConfigNotificacao>

        <CardConfigNotificacao title="Exames Médicos" icon="heroicons:heart" iconColor="text-red-600">
          <FormCheckboxDias v-model:checked="config.notificar_exames_vencendo" label="Notificar ASO/exames vencendo" :dias="config.dias_antecedencia_exames" @update:dias="config.dias_antecedencia_exames = $event" diasLabel="Dias de antecedência:" showDias :min="1" :max="90" />
        </CardConfigNotificacao>

        <CardConfigNotificacao title="Ponto e Frequência" icon="heroicons:clock" iconColor="text-blue-600">
          <FormCheckboxDias v-model:checked="config.notificar_faltas_injustificadas" label="Notificar faltas injustificadas" />
          <div></div>
          <FormCheckboxDias v-model:checked="config.notificar_atrasos_frequentes" label="Notificar atrasos frequentes" :dias="config.limite_atrasos_mes" @update:dias="config.limite_atrasos_mes = $event" diasLabel="Limite de atrasos/mês:" showDias :min="1" :max="20" />
          <FormCheckboxDias v-model:checked="config.notificar_horas_extras_excessivas" label="Notificar horas extras excessivas" :dias="config.limite_horas_extras_mes" @update:dias="config.limite_horas_extras_mes = $event" diasLabel="Limite de HE/mês:" showDias :min="1" :max="100" suffix="horas" />
        </CardConfigNotificacao>

        <CardConfigNotificacao title="Afastamentos" icon="heroicons:user-minus" iconColor="text-orange-600">
          <FormCheckboxDias v-model:checked="config.notificar_afastamentos_longos" label="Notificar afastamentos longos" :dias="config.dias_afastamento_longo" @update:dias="config.dias_afastamento_longo = $event" diasLabel="Dias para considerar longo:" showDias :min="1" :max="60" />
          <FormCheckboxDias v-model:checked="config.notificar_retorno_afastamento" label="Notificar retorno de afastamento" :dias="config.dias_antecedencia_retorno" @update:dias="config.dias_antecedencia_retorno = $event" diasLabel="Dias de antecedência:" showDias :min="1" :max="15" />
        </CardConfigNotificacao>

        <CardConfigNotificacao title="Treinamentos e Certificados" icon="heroicons:academic-cap" iconColor="text-indigo-600">
          <FormCheckboxDias v-model:checked="config.notificar_certificados_vencendo" label="Notificar certificados/NRs vencendo" :dias="config.dias_antecedencia_certificados" @update:dias="config.dias_antecedencia_certificados = $event" diasLabel="Dias de antecedência:" showDias :min="1" :max="120" />
        </CardConfigNotificacao>

        <CardConfigNotificacao title="Folha de Pagamento" icon="heroicons:banknotes" iconColor="text-green-600">
          <label class="flex items-center gap-3">
            <input type="checkbox" v-model="config.notificar_folha_processada" class="rounded text-red-600">
            <span>Notificar quando folha for processada</span>
          </label>
          <label class="flex items-center gap-3">
            <input type="checkbox" v-model="config.notificar_erros_folha" class="rounded text-red-600">
            <span>Notificar erros no processamento</span>
          </label>
        </CardConfigNotificacao>

        <CardConfigNotificacao title="Canais e Destinatários" icon="heroicons:paper-airplane" iconColor="text-teal-600">
          <div>
            <h4 class="font-medium text-gray-700 mb-3">Canais de Envio</h4>
            <div class="space-y-2">
              <label class="flex items-center gap-3">
                <input type="checkbox" v-model="config.enviar_sistema" class="rounded text-red-600">
                <span>Notificações no sistema</span>
              </label>
              <label class="flex items-center gap-3">
                <input type="checkbox" v-model="config.enviar_email" class="rounded text-red-600">
                <span>Enviar por e-mail</span>
              </label>
              <label class="flex items-center gap-3 opacity-50">
                <input type="checkbox" v-model="config.enviar_push" class="rounded text-red-600" disabled>
                <span>Push notifications (em breve)</span>
              </label>
            </div>
          </div>
          <div>
            <h4 class="font-medium text-gray-700 mb-3">Destinatários Padrão</h4>
            <div class="space-y-2">
              <label class="flex items-center gap-3">
                <input type="checkbox" v-model="config.notificar_rh" class="rounded text-red-600">
                <span>Equipe de RH</span>
              </label>
              <label class="flex items-center gap-3">
                <input type="checkbox" v-model="config.notificar_gestor" class="rounded text-red-600">
                <span>Gestor do colaborador</span>
              </label>
              <label class="flex items-center gap-3">
                <input type="checkbox" v-model="config.notificar_colaborador" class="rounded text-red-600">
                <span>Próprio colaborador</span>
              </label>
            </div>
          </div>
        </CardConfigNotificacao>

        <CardConfigNotificacao title="Resumo Diário" icon="heroicons:calendar-days" iconColor="text-slate-600">
          <label class="flex items-center gap-3">
            <input type="checkbox" v-model="config.enviar_resumo_diario" class="rounded text-red-600">
            <span>Enviar resumo diário de alertas</span>
          </label>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Horário de envio:</span>
            <input type="time" v-model="config.horario_resumo_diario" class="input w-32">
          </div>
        </CardConfigNotificacao>

        <div class="flex justify-end">
          <button @click="handleSalvarConfig" :disabled="salvando" class="btn-primary px-8">
            <Icon :name="salvando ? 'heroicons:arrow-path' : 'heroicons:check'" :class="{ 'animate-spin': salvando }" class="mr-2" />
            {{ salvando ? 'Salvando...' : 'Salvar Configurações' }}
          </button>
        </div>
      </div>

      <!-- Aba Alertas -->
      <div v-if="abaAtiva === 'alertas'">
        <div class="flex justify-between items-center mb-6">
          <div class="flex gap-4">
            <select v-model="filtroStatus" class="input">
              <option value="todos">Todos os status</option>
              <option value="pendente">Pendentes</option>
              <option value="lido">Lidos</option>
              <option value="resolvido">Resolvidos</option>
              <option value="ignorado">Ignorados</option>
            </select>
            <select v-model="filtroPrioridade" class="input">
              <option value="todas">Todas as prioridades</option>
              <option value="critica">Crítica</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>
          <button @click="abrirModalAlerta()" class="btn-primary">
            <Icon name="heroicons:plus" class="mr-2" />
            Novo Alerta
          </button>
        </div>

        <div v-if="alertas.length === 0" class="card text-center py-12">
          <Icon name="heroicons:bell-slash" size="48" class="text-gray-300 mx-auto mb-4" />
          <p class="text-gray-500">Nenhum alerta encontrado</p>
          <button @click="handleGerarAlertas" class="btn-primary mt-4">
            <Icon name="heroicons:bolt" class="mr-2" />
            Gerar Alertas
          </button>
        </div>

        <div v-else class="space-y-3">
          <ItemAlerta
            v-for="alerta in alertas"
            :key="alerta.id"
            :alerta="alerta"
            @marcar="(status) => handleMarcarAlerta(alerta, status)"
            @excluir="handleExcluirAlerta(alerta)"
          />
        </div>
      </div>

      <!-- Aba Tipos -->
      <SectionAlertasTipos v-if="abaAtiva === 'tipos'" :tiposAlertas="tiposAlertas" />
    </div>

    <ModalAlerta
      v-model="modalAlertaAberto"
      :editando="alertaEditando"
      :tiposAlertas="tiposAlertas"
      :colaboradores="colaboradores"
      @salvar="handleSalvarAlerta"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin'], layout: false })

const { config, stats, alertas, tiposAlertas, carregarConfig, salvarConfig, carregarStats, carregarAlertas, carregarTiposAlertas, gerarAlertas, marcarAlerta, salvarAlerta, excluirAlerta } = useNotificacoes()

const abaAtiva = ref('configuracoes')
const salvando = ref(false)
const gerandoAlertas = ref(false)
const filtroStatus = ref('pendente')
const filtroPrioridade = ref('todas')
const modalAlertaAberto = ref(false)
const alertaEditando = ref<any>(null)
const colaboradores = ref<any[]>([])

const tabs = [
  { id: 'configuracoes', label: 'Configurações', icon: 'heroicons:cog-6-tooth' },
  { id: 'alertas', label: `Alertas Ativos (${stats.value.pendentes})`, icon: 'heroicons:bell-alert' },
  { id: 'tipos', label: 'Tipos de Alertas', icon: 'heroicons:tag' },
]

const handleSalvarConfig = async () => {
  salvando.value = true
  try {
    await salvarConfig()
    alert('Configurações salvas com sucesso!')
  } catch { alert('Erro ao salvar configurações') }
  finally { salvando.value = false }
}

const handleGerarAlertas = async () => {
  gerandoAlertas.value = true
  try {
    const result = await gerarAlertas()
    alert(`${(result as any).alertas_inseridos} novos alertas gerados!`)
  } catch { alert('Erro ao gerar alertas') }
  finally { gerandoAlertas.value = false }
}

const handleMarcarAlerta = async (alerta: any, status: string) => {
  try { await marcarAlerta(alerta.id, status) }
  catch { alert('Erro ao atualizar alerta') }
}

const handleExcluirAlerta = async (alerta: any) => {
  if (!confirm(`Excluir alerta "${alerta.titulo}"?`)) return
  try { await excluirAlerta(alerta.id) }
  catch { alert('Erro ao excluir alerta') }
}

const abrirModalAlerta = (alerta: any = null) => {
  alertaEditando.value = alerta
  modalAlertaAberto.value = true
}

const handleSalvarAlerta = async (form: any) => {
  try {
    await salvarAlerta({
      titulo: form.titulo,
      mensagem: form.mensagem,
      prioridade: form.prioridade,
      data_vencimento: form.data_vencimento || null,
      tipo_alerta_id: form.tipo_alerta_id || null,
      colaborador_id: form.colaborador_id || null,
    }, alertaEditando.value?.id)
    modalAlertaAberto.value = false
  } catch { alert('Erro ao salvar alerta') }
}

watch([filtroStatus, filtroPrioridade], () => {
  carregarAlertas({ status: filtroStatus.value, prioridade: filtroPrioridade.value })
})

const carregarColaboradores = async () => {
  try {
    const { useColaboradores } = await import('~/composables/useColaboradores')
    const { fetchColaboradores, colaboradores: colabs } = useColaboradores()
    await fetchColaboradores()
    colaboradores.value = colabs.value
  } catch { colaboradores.value = [] }
}

onMounted(() => {
  carregarConfig()
  carregarStats()
  carregarAlertas({ status: filtroStatus.value, prioridade: filtroPrioridade.value })
  carregarTiposAlertas()
  carregarColaboradores()
})
</script>
