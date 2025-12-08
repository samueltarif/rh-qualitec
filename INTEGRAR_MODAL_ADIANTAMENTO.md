# 🔧 INTEGRAR MODAL DE ADIANTAMENTO NA PÁGINA DE FOLHA

## 📋 PASSO A PASSO

### **1. Adicionar o Modal no Template**

Na página `app/pages/folha-pagamento.vue`, adicione o modal **ANTES** do fechamento da `</div>` principal:

```vue
<!-- Logo após o ModalGerenciarHolerites, adicione: -->

<!-- Modal de Adiantamento Salarial -->
<ModalAdiantamento 
  :show="modalAdiantamento.aberto"
  :colaboradores="colaboradoresAtivos"
  :percentual="parametrosAdiantamento.percentual"
  :dia-pagamento="parametrosAdiantamento.diaPagamento"
  @close="modalAdiantamento.aberto = false"
  @success="handleSucessoAdiantamento"
/>
```

### **2. Adicionar Estado no Script**

No `<script setup>` da página, adicione:

```typescript
// Após as outras refs, adicione:

// Modal de Adiantamento
const modalAdiantamento = ref({
  aberto: false,
})

// Colaboradores ativos
const colaboradoresAtivos = ref<any[]>([])

// Parâmetros de adiantamento
const parametrosAdiantamento = ref({
  percentual: 40,
  diaPagamento: 20,
})
```

### **3. Buscar Colaboradores Ativos**

Adicione esta função para buscar colaboradores:

```typescript
// Buscar colaboradores ativos
const buscarColaboradores = async () => {
  try {
    const { data } = await useFetch('/api/colaboradores/index.get', {
      query: { status: 'Ativo' }
    })
    
    if (data.value) {
      colaboradoresAtivos.value = data.value
    }
  } catch (error) {
    console.error('Erro ao buscar colaboradores:', error)
  }
}

// Buscar parâmetros de adiantamento
const buscarParametrosAdiantamento = async () => {
  try {
    const { data } = await useFetch('/api/parametros-folha/index.get')
    
    if (data.value) {
      parametrosAdiantamento.value = {
        percentual: data.value.adiantamento_percentual || 40,
        diaPagamento: data.value.adiantamento_dia_pagamento || 20,
      }
    }
  } catch (error) {
    console.error('Erro ao buscar parâmetros:', error)
  }
}
```

### **4. Adicionar Função para Abrir Modal**

```typescript
// Abrir modal de adiantamento
const abrirModalAdiantamento = async () => {
  // Buscar colaboradores e parâmetros antes de abrir
  await Promise.all([
    buscarColaboradores(),
    buscarParametrosAdiantamento()
  ])
  
  modalAdiantamento.value.aberto = true
}

// Handler de sucesso
const handleSucessoAdiantamento = () => {
  // Recarregar a folha se estiver calculada
  if (folha.value) {
    calcularFolha()
  }
}
```

### **5. Conectar ao Componente de Ações Rápidas**

Se você estiver usando o componente `FolhaAcoesRapidasCalculos`, adicione o evento:

```vue
<FolhaAcoesRapidasCalculos 
  @abrir-modal-adiantamento="abrirModalAdiantamento"
  @abrir-modal-13-salario="abrirModal13Salario"
  @abrir-modal-rescisao="abrirModalRescisao"
  class="mb-8"
/>
```

### **6. Buscar Dados ao Montar**

Adicione no `onMounted`:

```typescript
onMounted(() => {
  buscarColaboradores()
  buscarParametrosAdiantamento()
})
```

---

## 📝 CÓDIGO COMPLETO PARA COPIAR

### **Adicionar no Template (antes do `</div>` final):**

```vue
<!-- Modal de Adiantamento Salarial -->
<ModalAdiantamento 
  :show="modalAdiantamento.aberto"
  :colaboradores="colaboradoresAtivos"
  :percentual="parametrosAdiantamento.percentual"
  :dia-pagamento="parametrosAdiantamento.diaPagamento"
  @close="modalAdiantamento.aberto = false"
  @success="handleSucessoAdiantamento"
/>
```

### **Adicionar no Script (após as outras refs):**

```typescript
// Modal de Adiantamento
const modalAdiantamento = ref({
  aberto: false,
})

const colaboradoresAtivos = ref<any[]>([])

const parametrosAdiantamento = ref({
  percentual: 40,
  diaPagamento: 20,
})

// Buscar colaboradores ativos
const buscarColaboradores = async () => {
  try {
    const { data } = await useFetch('/api/colaboradores/index.get', {
      query: { status: 'Ativo' }
    })
    
    if (data.value) {
      colaboradoresAtivos.value = data.value
    }
  } catch (error) {
    console.error('Erro ao buscar colaboradores:', error)
  }
}

// Buscar parâmetros de adiantamento
const buscarParametrosAdiantamento = async () => {
  try {
    const { data } = await useFetch('/api/parametros-folha/index.get')
    
    if (data.value) {
      parametrosAdiantamento.value = {
        percentual: data.value.adiantamento_percentual || 40,
        diaPagamento: data.value.adiantamento_dia_pagamento || 20,
      }
    }
  } catch (error) {
    console.error('Erro ao buscar parâmetros:', error)
  }
}

// Abrir modal de adiantamento
const abrirModalAdiantamento = async () => {
  await Promise.all([
    buscarColaboradores(),
    buscarParametrosAdiantamento()
  ])
  
  modalAdiantamento.value.aberto = true
}

// Handler de sucesso
const handleSucessoAdiantamento = () => {
  if (folha.value) {
    calcularFolha()
  }
}

// Buscar ao montar
onMounted(() => {
  buscarColaboradores()
  buscarParametrosAdiantamento()
})
```

---

## ✅ RESULTADO ESPERADO

Quando clicar no botão **"Gerar Adiantamento"**:

1. ✅ Sistema busca colaboradores ativos
2. ✅ Sistema busca configurações (40%, dia 20)
3. ✅ Modal abre com popup
4. ✅ Lista todos os colaboradores
5. ✅ Mostra cálculo em tempo real
6. ✅ Permite selecionar colaboradores
7. ✅ Gera adiantamentos ao confirmar

---

## 🎯 LOCALIZAÇÃO DOS ARQUIVOS

- **Página:** `app/pages/folha-pagamento.vue`
- **Modal:** `app/components/ModalAdiantamento.vue` (já criado)
- **API:** `server/api/adiantamento/gerar.post.ts` (já criado)
- **Botão:** `app/components/FolhaAcoesRapidasCalculos.vue` (já atualizado)

---

## 🆘 TROUBLESHOOTING

### **Modal não abre?**
- Verifique se `modalAdiantamento.aberto` está mudando para `true`
- Verifique console do navegador por erros

### **Colaboradores não aparecem?**
- Verifique se a API `/api/colaboradores/index.get` está funcionando
- Verifique se existem colaboradores com status "Ativo"

### **Erro ao gerar?**
- Verifique se a migration 29 foi executada
- Verifique se o adiantamento está habilitado em configurações

---

**Pronto!** Agora o modal abre em popup quando clicar no botão! 🎉
