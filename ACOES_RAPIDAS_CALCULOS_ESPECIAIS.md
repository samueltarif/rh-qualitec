# Ações Rápidas - Cálculos Especiais

## 📋 Resumo

Componente separado criado para gerenciar ações rápidas de cálculos especiais na folha de pagamento: **Férias**, **13º Salário** e **Rescisão Contratual**.

## 🎯 Componente Criado

### `FolhaAcoesRapidasCalculos.vue`

**Localização:** `nuxt-app/app/components/FolhaAcoesRapidasCalculos.vue`

#### Funcionalidades

1. **Gerar Férias**
   - Ícone: Sol (heroicons:sun)
   - Cor: Verde
   - Ação: Redireciona para `/ferias`
   - Descrição: Calcule férias individuais ou em lote

2. **Gerar 13º Salário**
   - Ícone: Presente (heroicons:gift)
   - Cor: Azul
   - Ação: Emite evento `abrir-modal-13-salario`
   - Descrição: Calcule 13º salário (1ª e 2ª parcela)

3. **Simular Rescisão**
   - Ícone: Documento Menos (heroicons:document-minus)
   - Cor: Âmbar
   - Ação: Emite evento `abrir-modal-rescisao`
   - Descrição: Simule rescisão contratual

#### Design

- **Layout:** Grid responsivo de 3 colunas
- **Estilo:** Cards brancos com bordas coloridas e hover effects
- **Background:** Gradiente roxo-rosa
- **Dica:** Box informativo com ícone de informação

#### Eventos Emitidos

```typescript
defineEmits<{
  'abrir-modal-13-salario': []
  'abrir-modal-rescisao': []
}>()
```

## 🔄 Refatoração da Página

### Antes

A página `folha-pagamento.vue` tinha todo o código HTML das ações rápidas inline (~90 linhas).

### Depois

Agora usa o componente separado:

```vue
<FolhaAcoesRapidasCalculos 
  @abrir-modal-13-salario="abrirModal13Salario"
  @abrir-modal-rescisao="abrirModalRescisao"
  class="mb-8"
/>
```

**Redução:** De ~90 linhas para 4 linhas

## 📦 Estrutura de Componentes da Folha

```
folha-pagamento.vue (Página Principal)
├── FolhaResumoDetalhadoCard.vue (Resumo com totais)
├── FolhaDadosColaboradorSection.vue (Dados do colaborador)
├── FolhaBeneficiosSection.vue (Benefícios)
└── FolhaAcoesRapidasCalculos.vue (Ações rápidas - NOVO!)
```

## 🎨 Visual

### Card de Férias (Verde)
```
┌─────────────────────────────────┐
│ ☀️  Gerar Férias                │
│                                 │
│ Calcule férias individuais      │
│ ou em lote                      │
│                                 │
│ [Acessar Férias →]              │
└─────────────────────────────────┘
```

### Card de 13º Salário (Azul)
```
┌─────────────────────────────────┐
│ 🎁  Gerar 13º Salário           │
│                                 │
│ Calcule 13º salário             │
│ (1ª e 2ª parcela)               │
│                                 │
│ [Calcular 13º]                  │
└─────────────────────────────────┘
```

### Card de Rescisão (Âmbar)
```
┌─────────────────────────────────┐
│ 📄  Simular Rescisão            │
│                                 │
│ Simule rescisão                 │
│ contratual                      │
│                                 │
│ [Simular Rescisão]              │
└─────────────────────────────────┘
```

## 💡 Dica Informativa

```
ℹ️ Dica: Use estas ferramentas para cálculos especiais além da 
folha mensal regular. Férias, 13º salário e rescisões têm regras 
específicas de cálculo.
```

## 🚀 Como Usar

### Na Página de Folha de Pagamento

```vue
<template>
  <div>
    <!-- Outros componentes -->
    
    <FolhaAcoesRapidasCalculos 
      @abrir-modal-13-salario="handleModal13"
      @abrir-modal-rescisao="handleModalRescisao"
    />
  </div>
</template>

<script setup>
const handleModal13 = () => {
  // Lógica para abrir modal de 13º salário
}

const handleModalRescisao = () => {
  // Lógica para abrir modal de rescisão
}
</script>
```

## 📝 Funcionalidades Futuras

### 13º Salário (Em Desenvolvimento)
- Calcular 1ª parcela (até 30/11)
- Calcular 2ª parcela (até 20/12)
- Gerar holerites de 13º
- Enviar por email

### Rescisão (Em Desenvolvimento)
- Rescisão sem justa causa
- Rescisão com justa causa
- Pedido de demissão
- Acordo trabalhista

**Cálculos incluirão:**
- Saldo de salário
- Férias proporcionais e vencidas
- 13º proporcional
- Aviso prévio
- Multa FGTS (40%)

## ✅ Benefícios da Refatoração

1. **Reutilização:** Componente pode ser usado em outras páginas
2. **Manutenção:** Código isolado e fácil de manter
3. **Legibilidade:** Página principal mais limpa
4. **Testabilidade:** Componente pode ser testado isoladamente
5. **Escalabilidade:** Fácil adicionar novas ações rápidas

## 🎯 Status

- ✅ Componente criado
- ✅ Refatoração da página concluída
- ✅ Eventos configurados
- ⏳ Modal de 13º salário (em desenvolvimento)
- ⏳ Modal de rescisão (em desenvolvimento)

## 📚 Arquivos Relacionados

- `nuxt-app/app/components/FolhaAcoesRapidasCalculos.vue` (NOVO)
- `nuxt-app/app/pages/folha-pagamento.vue` (REFATORADO)
- `nuxt-app/app/components/FolhaResumoDetalhadoCard.vue`
- `nuxt-app/app/components/FolhaDadosColaboradorSection.vue`
- `nuxt-app/app/components/FolhaBeneficiosSection.vue`

---

**Data:** Dezembro 2024  
**Status:** ✅ Implementado e Refatorado
