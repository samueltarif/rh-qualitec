# 🔗 Integração Automática de Documentos

## 🎯 Como os Campos São Preenchidos Automaticamente

Este documento explica como o sistema de documentos se integra automaticamente com outras áreas.

## 📋 Fluxo de Integração

### 1. Cadastro de Colaborador

Quando um novo colaborador é cadastrado:

```typescript
// Ao salvar colaborador
const colaborador = await criarColaborador(dados)

// Sistema automaticamente:
// 1. Busca tipos de documentos da categoria "Admissão"
const docsAdmissao = await $fetch('/api/tipos-documentos?categoria_id=admissao&apenas_ativos=true')

// 2. Cria registros pendentes para cada documento obrigatório
for (const tipo of docsAdmissao) {
  await $fetch('/api/documentos-rh', {
    method: 'POST',
    body: {
      colaborador_id: colaborador.id,
      tipo_documento_id: tipo.id,
      categoria_id: tipo.categoria_id,
      status: 'Pendente',
      // Campos preenchidos automaticamente do tipo:
      requer_periodo: tipo.requer_periodo,
      requer_horas: tipo.requer_horas,
      requer_aprovacao: tipo.requer_aprovacao,
    }
  })
}

// 3. Notifica RH sobre documentos pendentes
notificarRH(`Colaborador ${colaborador.nome} cadastrado. ${docsAdmissao.length} documentos pendentes.`)
```

### 2. Upload de Documento

Quando colaborador/RH faz upload de documento:

```typescript
// Ao selecionar tipo de documento
const tipoSelecionado = await $fetch(`/api/tipos-documentos/${tipoId}`)

// Formulário se adapta automaticamente:
const camposFormulario = {
  // Sempre presente
  arquivo: { obrigatorio: tipoSelecionado.requer_arquivo },
  observacoes: { obrigatorio: false },
  
  // Condicionais baseados no tipo
  ...(tipoSelecionado.requer_periodo && {
    data_inicio: { obrigatorio: true },
    data_fim: { obrigatorio: true }
  }),
  
  ...(tipoSelecionado.requer_horas && {
    horas: { obrigatorio: true }
  }),
  
  // Calcula validade automaticamente
  ...(tipoSelecionado.tem_validade && {
    data_validade: calcularValidade(new Date(), tipoSelecionado.dias_validade)
  })
}

// Ao salvar
const documento = await $fetch('/api/documentos-rh', {
  method: 'POST',
  body: {
    colaborador_id: colaboradorId,
    tipo_documento_id: tipoSelecionado.id,
    categoria_id: tipoSelecionado.categoria_id,
    arquivo_url: arquivoUrl,
    data_inicio: form.data_inicio,
    data_fim: form.data_fim,
    horas: form.horas,
    data_validade: form.data_validade,
    status: tipoSelecionado.requer_aprovacao ? 'Pendente' : 'Aprovado',
    observacoes: form.observacoes
  }
})

// Se requer aprovação, notifica gestor
if (tipoSelecionado.requer_aprovacao) {
  const gestor = await buscarGestor(colaboradorId)
  notificarGestor(gestor, `${colaborador.nome} enviou ${tipoSelecionado.nome} para aprovação`)
}
```

### 3. Solicitação de Férias

Quando colaborador solicita férias:

```typescript
// Ao criar solicitação de férias
const solicitacao = await criarSolicitacaoFerias({
  colaborador_id: colaboradorId,
  data_inicio: '2024-01-15',
  data_fim: '2024-01-29',
  dias: 15
})

// Sistema automaticamente cria documento
const tipoSolicitacaoFerias = await $fetch('/api/tipos-documentos', {
  query: { 
    categoria_id: 'ferias',
    nome: 'Solicitação de Férias'
  }
})

const documento = await $fetch('/api/documentos-rh', {
  method: 'POST',
  body: {
    colaborador_id: colaboradorId,
    tipo_documento_id: tipoSolicitacaoFerias.id,
    categoria_id: tipoSolicitacaoFerias.categoria_id,
    // Campos preenchidos automaticamente da solicitação
    data_inicio: solicitacao.data_inicio,
    data_fim: solicitacao.data_fim,
    status: 'Pendente', // Aguarda aprovação
    observacoes: `Solicitação de ${solicitacao.dias} dias de férias`,
    // Vincula à solicitação
    campos_extras_valores: {
      solicitacao_ferias_id: solicitacao.id,
      dias_solicitados: solicitacao.dias
    }
  }
})

// Notifica gestor para aprovação
notificarGestor(gestor, 'Nova solicitação de férias')
```

### 4. Justificativa de Ponto

Quando colaborador justifica falta/atraso:

```typescript
// Ao criar justificativa
const justificativa = await criarJustificativa({
  colaborador_id: colaboradorId,
  data: '2024-01-10',
  tipo: 'Consulta Médica',
  horas: 2.5
})

// Sistema busca tipo apropriado
const tipoDeclaracao = await $fetch('/api/tipos-documentos', {
  query: { 
    categoria_id: 'ponto',
    nome: 'Declaração de Comparecimento'
  }
})

// Cria documento automaticamente
const documento = await $fetch('/api/documentos-rh', {
  method: 'POST',
  body: {
    colaborador_id: colaboradorId,
    tipo_documento_id: tipoDeclaracao.id,
    categoria_id: tipoDeclaracao.categoria_id,
    // Campos do tipo (requer_periodo=true, requer_horas=true)
    data_inicio: justificativa.data,
    data_fim: justificativa.data,
    horas: justificativa.horas,
    status: 'Pendente',
    observacoes: justificativa.tipo,
    campos_extras_valores: {
      justificativa_id: justificativa.id,
      tipo_justificativa: justificativa.tipo
    }
  }
})

// Aguarda upload do comprovante
notificarColaborador('Faça upload do comprovante de comparecimento')
```

### 5. Atestado Médico

Quando colaborador envia atestado:

```typescript
// Upload de atestado
const arquivo = await uploadArquivo(file)

// Busca tipo de atestado
const tipoAtestado = await $fetch('/api/tipos-documentos', {
  query: { 
    categoria_id: 'medicos',
    nome: 'Atestado Médico'
  }
})

// Cria documento
const documento = await $fetch('/api/documentos-rh', {
  method: 'POST',
  body: {
    colaborador_id: colaboradorId,
    tipo_documento_id: tipoAtestado.id,
    categoria_id: tipoAtestado.categoria_id,
    arquivo_url: arquivo.url,
    // Tipo requer período e aprovação
    data_inicio: form.data_inicio,
    data_fim: form.data_fim,
    status: 'Pendente', // Aguarda aprovação do gestor
    observacoes: form.observacoes
  }
})

// Automaticamente:
// 1. Notifica gestor para aprovar
notificarGestor(gestor, 'Novo atestado médico para aprovação')

// 2. Cria afastamento temporário no ponto
await criarAfastamento({
  colaborador_id: colaboradorId,
  data_inicio: documento.data_inicio,
  data_fim: documento.data_fim,
  tipo: 'Atestado Médico',
  documento_id: documento.id
})

// 3. Quando gestor aprovar, confirma afastamento
// Quando gestor rejeitar, remove afastamento
```

### 6. Vencimento de Documentos

Sistema roda job diário para verificar vencimentos:

```typescript
// Job diário (cron)
async function verificarVencimentos() {
  // Busca documentos com validade
  const documentos = await $fetch('/api/documentos-rh', {
    query: { 
      tem_validade: true,
      status: 'Aprovado'
    }
  })

  for (const doc of documentos) {
    const tipo = await $fetch(`/api/tipos-documentos/${doc.tipo_documento_id}`)
    
    if (tipo.notificar_vencimento) {
      const diasRestantes = calcularDiasRestantes(doc.data_validade)
      
      // Notifica se está próximo do vencimento
      if (diasRestantes <= tipo.dias_aviso_vencimento) {
        notificarRH(`Documento ${tipo.nome} de ${doc.colaborador.nome} vence em ${diasRestantes} dias`)
        notificarColaborador(doc.colaborador_id, `Seu ${tipo.nome} vence em ${diasRestantes} dias. Providencie renovação.`)
      }
      
      // Marca como vencido
      if (diasRestantes <= 0) {
        await $fetch(`/api/documentos-rh/${doc.id}`, {
          method: 'PUT',
          body: { status: 'Vencido' }
        })
        
        // Cria novo documento pendente
        await $fetch('/api/documentos-rh', {
          method: 'POST',
          body: {
            colaborador_id: doc.colaborador_id,
            tipo_documento_id: tipo.id,
            categoria_id: tipo.categoria_id,
            status: 'Pendente',
            observacoes: `Renovação de documento vencido em ${doc.data_validade}`
          }
        })
      }
    }
  }
}
```

## 🎨 Componentes Reutilizáveis

### FormularioDocumento.vue

```vue
<template>
  <form @submit.prevent="salvar">
    <!-- Tipo de Documento -->
    <select v-model="form.tipo_documento_id" @change="carregarConfigTipo">
      <option v-for="tipo in tipos" :value="tipo.id">{{ tipo.nome }}</option>
    </select>

    <!-- Campos dinâmicos baseados no tipo -->
    <div v-if="tipoConfig">
      <!-- Período (se requerido) -->
      <div v-if="tipoConfig.requer_periodo">
        <input v-model="form.data_inicio" type="date" required>
        <input v-model="form.data_fim" type="date" required>
      </div>

      <!-- Horas (se requerido) -->
      <div v-if="tipoConfig.requer_horas">
        <input v-model="form.horas" type="number" step="0.5" required>
      </div>

      <!-- Arquivo (se requerido) -->
      <div v-if="tipoConfig.requer_arquivo">
        <input type="file" @change="uploadArquivo" required>
      </div>

      <!-- Validade (calculada automaticamente) -->
      <div v-if="tipoConfig.tem_validade">
        <p>Válido até: {{ calcularDataValidade() }}</p>
      </div>

      <!-- Aviso de aprovação -->
      <div v-if="tipoConfig.requer_aprovacao" class="alert-info">
        Este documento será enviado para aprovação do gestor
      </div>
    </div>

    <button type="submit">Salvar</button>
  </form>
</template>

<script setup>
const tipoConfig = ref(null)

const carregarConfigTipo = async () => {
  tipoConfig.value = await $fetch(`/api/tipos-documentos/${form.tipo_documento_id}`)
}

const calcularDataValidade = () => {
  if (!tipoConfig.value?.tem_validade) return null
  const hoje = new Date()
  hoje.setDate(hoje.getDate() + tipoConfig.value.dias_validade)
  return hoje.toISOString().split('T')[0]
}
</script>
```

## ✅ Checklist de Integração

Ao implementar nova funcionalidade que usa documentos:

- [ ] Identificar categoria apropriada
- [ ] Buscar tipo de documento correto
- [ ] Verificar configurações do tipo (requer_periodo, requer_horas, etc)
- [ ] Preencher campos automaticamente quando possível
- [ ] Criar documento com status correto (Pendente/Aprovado)
- [ ] Se requer aprovação, notificar gestor
- [ ] Se tem validade, calcular data_validade
- [ ] Vincular documento à entidade original (campos_extras_valores)
- [ ] Implementar callback de aprovação/rejeição se necessário

## 🚀 Benefícios da Integração

1. **Zero Configuração Manual**: Campos aparecem automaticamente
2. **Validação Automática**: Sistema valida conforme tipo
3. **Workflow Automático**: Aprovações e notificações automáticas
4. **Rastreabilidade**: Tudo vinculado e auditável
5. **Flexibilidade**: Fácil adicionar novos tipos sem código
6. **Consistência**: Mesma lógica em todo o sistema

