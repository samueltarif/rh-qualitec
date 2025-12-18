# 📋 EXEMPLO DE USO - SISTEMA TRCT

## 🎯 Como Usar o Sistema TRCT

### 1. **Acessar o Simulador de Rescisão**

```typescript
// Na página de colaboradores ou folha de pagamento
<UIButton @click="abrirSimuladorRescisao">
  <Icon name="heroicons:calculator" />
  Simular Rescisão
</UIButton>
```

### 2. **Fluxo Completo de Rescisão**

#### **Etapa 1: Seleção do Colaborador**
```
┌─────────────────────────────────────────┐
│ 👤 SELEÇÃO DO COLABORADOR               │
├─────────────────────────────────────────┤
│ Colaborador: [João Silva ▼]            │
│                                         │
│ 📋 Dados do Colaborador:                │
│ • Cargo: Analista de Sistemas          │
│ • Salário: R$ 5.000,00                 │
│ • Admissão: 15/01/2022                 │
│ • Contrato: Indeterminado               │
└─────────────────────────────────────────┘
```

#### **Etapa 2: Dados da Rescisão**
```
┌─────────────────────────────────────────┐
│ 📝 DADOS DA RESCISÃO                    │
├─────────────────────────────────────────┤
│ Tipo: [Dispensa sem Justa Causa ▼]     │
│ Data Desligamento: [15/12/2024]        │
│ Aviso Prévio: [Indenizado ▼]           │
│ Dias Trabalhados: [15]                 │
│ Férias Vencidas: [Não ▼]               │
│ Horas Extras (média): [10.5]           │
│ Adicionais: [R$ 200,00]                │
│ Faltas: [0]                            │
│ Adiantamentos: [R$ 0,00]               │
└─────────────────────────────────────────┘
```

#### **Etapa 3: Resultado da Simulação**
```
┌─────────────────────────────────────────┐
│ 💰 RESULTADO DA SIMULAÇÃO               │
├─────────────────────────────────────────┤
│ 📈 PROVENTOS:                           │
│ • Saldo de Salário        R$ 2.500,00  │
│ • Aviso Prévio Indenizado R$ 5.000,00  │
│ • 13º Proporcional        R$ 4.583,33  │
│ • Férias Proporcionais    R$ 4.583,33  │
│ • 1/3 Constitucional      R$ 1.527,78  │
│ • Horas Extras            R$   875,00  │
│ ────────────────────────────────────────│
│ TOTAL PROVENTOS:          R$ 19.069,44 │
│                                         │
│ 📉 DESCONTOS:                           │
│ • INSS                    R$   687,50  │
│ • IRRF                    R$   425,30  │
│ ────────────────────────────────────────│
│ TOTAL DESCONTOS:          R$ 1.112,80  │
│                                         │
│ 🏦 FGTS:                                │
│ • FGTS Acumulado          R$ 2.880,00  │
│ • FGTS Aviso Prévio       R$   400,00  │
│ • Multa 40%               R$ 1.312,00  │
│ ────────────────────────────────────────│
│ TOTAL FGTS:               R$ 4.592,00  │
│                                         │
│ 💵 VALOR LÍQUIDO:         R$ 17.956,64 │
└─────────────────────────────────────────┘
```

### 3. **Ações Disponíveis**

#### **Visualizar TRCT**
```typescript
// Botão para preview do documento oficial
<UIButton variant="info" @click="visualizarTRCT">
  <Icon name="heroicons:eye" />
  Visualizar TRCT
</UIButton>
```

#### **Gerar TRCT Oficial**
```typescript
// Botão para download do PDF oficial
<UIButton variant="primary" @click="gerarTRCT">
  <Icon name="heroicons:document-text" />
  Gerar TRCT Oficial
</UIButton>
```

## 📄 Exemplo de TRCT Gerado

### **Cabeçalho do Documento**
```
┌─────────────────────────────────────────────────────────────┐
│           TERMO DE RESCISÃO DO CONTRATO DE TRABALHO         │
│              (Artigo 477 da CLT e Lei nº 7.998/90)         │
├─────────────────────────────────────────────────────────────┤
│ EMPREGADOR                    │ EMPREGADO                   │
│ Razão Social: QUALITEC LTDA   │ Nome: João Silva            │
│ CNPJ: 12.345.678/0001-90      │ CPF: 123.456.789-00         │
│ Endereço: Rua das Flores, 123 │ PIS: 12345678901            │
│ CEP: 12345-678 - SP/SP        │ Cargo: Analista Sistemas    │
│ CNAE: 6201-5/00               │ CBO: 212205                 │
│                               │ Matrícula: 001              │
└─────────────────────────────────────────────────────────────┘
```

### **Dados do Contrato**
```
┌─────────────────────────────────────────────────────────────┐
│                      DADOS DO CONTRATO                      │
├─────────────────────────────────────────────────────────────┤
│ Data Admissão: 15/01/2022    │ Tipo: Dispensa s/ Justa     │
│ Data Desligamento: 15/12/2024│ Tempo: 2 anos, 11 meses    │
└─────────────────────────────────────────────────────────────┘
```

### **Quadro de Verbas**
```
┌─────────────────────────────────────────────────────────────┐
│              DISCRIMINAÇÃO DAS VERBAS RESCISÓRIAS           │
├─────┬─────────────────────┬──────────┬───────────┬─────────┤
│ CÓD │ DESCRIÇÃO DA VERBA  │REFERÊNCIA│VENCIMENTOS│DESCONTOS│
├─────┼─────────────────────┼──────────┼───────────┼─────────┤
│ 001 │ Saldo de Salário    │15 dias   │ 2.500,00  │    -    │
│ 002 │ Aviso Prévio Indeniz│30 dias   │ 5.000,00  │    -    │
│ 004 │ 13º Proporcional    │11/12 avos│ 4.583,33  │    -    │
│ 005 │ Férias Proporcionais│11/12 avos│ 4.583,33  │    -    │
│ 007 │ 1/3 Constitucional  │Férias    │ 1.527,78  │    -    │
│ 008 │ Horas Extras        │Média     │   875,00  │    -    │
│ 101 │ INSS                │Base calc │     -     │ 687,50  │
│ 102 │ IRRF                │Base calc │     -     │ 425,30  │
├─────┼─────────────────────┼──────────┼───────────┼─────────┤
│     │ TOTAIS:             │          │19.069,44  │1.112,80 │
├─────┼─────────────────────┼──────────┼───────────┼─────────┤
│     │ VALOR LÍQUIDO A RECEBER:        │    17.956,64        │
└─────┴─────────────────────────────────┴─────────────────────┘
```

### **Quadro FGTS**
```
┌─────────────────────────────────────────────────────────────┐
│         FUNDO DE GARANTIA DO TEMPO DE SERVIÇO - FGTS       │
├─────────────────────────────────────────────────────────────┤
│ FGTS Acumulado (36 meses × 8%)              R$ 2.880,00    │
│ FGTS sobre Aviso Prévio (8%)                R$   400,00    │
│ Multa FGTS (40%)                            R$ 1.312,00    │
├─────────────────────────────────────────────────────────────┤
│ TOTAL FGTS + MULTA:                         R$ 4.592,00    │
└─────────────────────────────────────────────────────────────┘
│ ⚠️ INFORMATIVO: Saque autorizado com código 01             │
│    Dispensa sem justa causa                                 │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Integração com o Sistema

### **No Modal de Colaboradores**
```vue
<template>
  <div class="colaborador-actions">
    <!-- Outros botões -->
    <UIButton 
      variant="warning" 
      @click="abrirSimuladorRescisao(colaborador)"
    >
      <Icon name="heroicons:calculator" />
      Simular Rescisão
    </UIButton>
  </div>

  <!-- Modal de Rescisão -->
  <ModalSimuladorRescisao
    :show="mostrarRescisao"
    @close="mostrarRescisao = false"
  />
</template>
```

### **Na Folha de Pagamento**
```vue
<template>
  <div class="folha-actions">
    <UIButton @click="abrirRescisoes">
      <Icon name="heroicons:document-text" />
      Rescisões do Mês
    </UIButton>
  </div>
</template>
```

## 📊 Casos de Uso Comuns

### **1. Dispensa sem Justa Causa**
```
✅ Aviso prévio indenizado (30 dias)
✅ Multa FGTS 40%
✅ Seguro-desemprego
✅ Saque FGTS (código 01)
✅ Prazo pagamento: 1º dia útil
```

### **2. Pedido de Demissão**
```
✅ Aviso prévio trabalhado (30 dias)
❌ Multa FGTS
❌ Seguro-desemprego
❌ Saque FGTS
✅ Prazo pagamento: 10 dias
```

### **3. Acordo Mútuo (Art. 484-A)**
```
✅ Aviso prévio 50% (15 dias)
✅ Multa FGTS 20%
✅ Seguro-desemprego 50%
✅ Saque FGTS 80% (código 03)
✅ Prazo pagamento: 10 dias
```

### **4. Término de Experiência**
```
❌ Aviso prévio
❌ Multa FGTS
✅ Seguro-desemprego
✅ Saque FGTS (código 04)
✅ Prazo pagamento: 1º dia útil
```

## 🎯 Validações Automáticas

### **Dados Obrigatórios**
- ✅ Colaborador selecionado
- ✅ Tipo de rescisão
- ✅ Data de desligamento
- ✅ Dados da empresa configurados

### **Cálculos Automáticos**
- ✅ Proporcionalidade de salário
- ✅ 13º salário (meses/avos)
- ✅ Férias proporcionais
- ✅ FGTS e multas
- ✅ INSS e IRRF

### **Conformidade Legal**
- ✅ Prazos de pagamento
- ✅ Códigos de verbas oficiais
- ✅ Base legal atualizada
- ✅ Homologação quando necessária

## 📱 Interface Responsiva

### **Desktop**
- Modal completo com todas as etapas
- Visualização lado a lado
- Impressão otimizada

### **Mobile**
- Etapas em tela cheia
- Navegação por swipe
- Botões adaptados

## 🔒 Segurança

### **Validações**
- Dados obrigatórios
- Formatos corretos
- Valores consistentes
- Permissões de usuário

### **Auditoria**
- Log de operações
- Timestamp nos documentos
- Rastreabilidade completa
- Backup automático

---

## 📞 Suporte Técnico

Para implementar o sistema TRCT:

1. **Configure os dados da empresa**
2. **Teste com colaboradores fictícios**
3. **Valide os cálculos**
4. **Treine a equipe de RH**
5. **Mantenha backup dos documentos**

**⚠️ IMPORTANTE:** Sempre valide os cálculos com um contador ou advogado trabalhista antes de usar em produção.