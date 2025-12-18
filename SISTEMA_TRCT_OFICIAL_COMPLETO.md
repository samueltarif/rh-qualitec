# 📋 SISTEMA TRCT OFICIAL - TERMO DE RESCISÃO DO CONTRATO DE TRABALHO

## 🎯 Visão Geral

Sistema completo para geração do **Espelho de TRCT (Termo de Rescisão do Contrato de Trabalho)** conforme modelo oficial utilizado no Brasil, com total conformidade ao Ministério do Trabalho e legislação trabalhista vigente.

## 📄 Características do TRCT

### ✅ Conformidade Legal Total
- **Artigo 477 da CLT** - Prazo e forma de pagamento
- **Lei nº 8.036/90** - FGTS e multas rescisórias
- **Lei nº 7.998/90** - Seguro-desemprego
- **Lei nº 15.270/2025** - Nova tabela IRRF (vigente 01/01/2026)

### 📊 Estrutura Oficial do Documento

#### 1. **Identificação Completa**
```
┌─────────────────────────────────────────┐
│ EMPREGADOR                              │
│ • Razão Social                          │
│ • CNPJ                                  │
│ • Endereço completo                     │
│ • CNAE                                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ EMPREGADO                               │
│ • Nome completo                         │
│ • CPF                                   │
│ • PIS/PASEP                             │
│ • Cargo e CBO                           │
│ • Matrícula                             │
└─────────────────────────────────────────┘
```

#### 2. **Dados do Contrato**
- Data de admissão
- Data de desligamento
- Tipo de rescisão (com descrição legal)
- Tempo total de contrato

#### 3. **Quadro de Verbas Rescisórias**

| CÓD | DESCRIÇÃO DA VERBA | REFERÊNCIA | VENCIMENTOS | DESCONTOS |
|-----|-------------------|------------|-------------|-----------|
| 001 | Saldo de Salário | Dias trabalhados | R$ XXX,XX | - |
| 002 | Aviso Prévio Indenizado | 30 dias | R$ XXX,XX | - |
| 004 | 13º Salário Proporcional | Meses/avos | R$ XXX,XX | - |
| 005 | Férias Proporcionais | Período aquisitivo | R$ XXX,XX | - |
| 007 | 1/3 Constitucional | Férias | R$ XXX,XX | - |
| 101 | INSS | Base de cálculo | - | R$ XXX,XX |
| 102 | IRRF | Base de cálculo | - | R$ XXX,XX |

**TOTAIS:** | | | **R$ X.XXX,XX** | **R$ XXX,XX**
**VALOR LÍQUIDO A RECEBER:** | | | | **R$ X.XXX,XX**

#### 4. **Quadro FGTS Separado**
```
┌─────────────────────────────────────────┐
│ FUNDO DE GARANTIA DO TEMPO DE SERVIÇO   │
├─────────────────────────────────────────┤
│ FGTS Acumulado (X meses × 8%)          │ R$ X.XXX,XX
│ FGTS sobre Aviso Prévio (8%)           │ R$ XXX,XX
│ Multa FGTS (40%)                       │ R$ X.XXX,XX
├─────────────────────────────────────────┤
│ TOTAL FGTS + MULTA:                    │ R$ X.XXX,XX
└─────────────────────────────────────────┘

⚠️ INFORMATIVO: Saque autorizado com código 01
```

#### 5. **Observações Legais Automáticas**
- Prazo de pagamento conforme tipo de rescisão
- Direitos do trabalhador
- Informações sobre seguro-desemprego
- Base legal aplicável

#### 6. **Campos de Assinatura**
- Empregado (com CPF)
- Empregador (representante legal)
- Homologação sindical (quando obrigatória)

## 🔧 Implementação Técnica

### Arquivos Criados

#### 1. **Componente de Visualização**
```typescript
// nuxt-app/app/components/EspelhoTRCT.vue
- Interface completa do TRCT
- Formatação oficial
- Códigos de verbas corretos
- Cálculos integrados com simulador
```

#### 2. **API de Geração PDF**
```typescript
// nuxt-app/server/api/rescisao/gerar-trct.post.ts
- Geração de PDF com Puppeteer
- HTML estruturado conforme modelo oficial
- Validação de dados obrigatórios
- Headers corretos para download
```

#### 3. **Modal de Visualização**
```typescript
// nuxt-app/app/components/ModalVisualizarTRCT.vue
- Preview do TRCT antes da geração
- Opções de impressão e download
- Interface responsiva
```

### Códigos Oficiais das Verbas

#### **Proventos (001-099)**
- `001` - Saldo de Salário
- `002` - Aviso Prévio Indenizado
- `003` - Aviso Prévio Trabalhado
- `004` - 13º Salário Proporcional
- `005` - Férias Proporcionais
- `006` - Férias Vencidas
- `007` - 1/3 Constitucional Férias
- `008` - Horas Extras
- `009` - Adicional Noturno
- `010` - Adicional Insalubridade
- `011` - Adicional Periculosidade
- `012` - Comissões
- `013` - Gratificações

#### **Descontos (101-199)**
- `101` - INSS
- `102` - IRRF
- `103` - Faltas Injustificadas
- `104` - Adiantamento Salarial
- `105` - Vale Transporte
- `106` - Vale Refeição
- `107` - Pensão Alimentícia
- `108` - Empréstimo Consignado

## 📋 Tipos de Rescisão Suportados

### 1. **Dispensa sem Justa Causa**
- Aviso prévio: 30 dias
- Multa FGTS: 40%
- Seguro-desemprego: Sim
- Saque FGTS: Código 01

### 2. **Dispensa com Justa Causa**
- Aviso prévio: Não
- Multa FGTS: Não
- Seguro-desemprego: Não
- Saque FGTS: Não

### 3. **Pedido de Demissão**
- Aviso prévio: 30 dias (trabalhado)
- Multa FGTS: Não
- Seguro-desemprego: Não
- Saque FGTS: Não

### 4. **Acordo Mútuo (Art. 484-A CLT)**
- Aviso prévio: 50% (15 dias)
- Multa FGTS: 20%
- Seguro-desemprego: 50%
- Saque FGTS: 80% (Código 03)

### 5. **Término de Contrato**
- Aviso prévio: Não aplicável
- Multa FGTS: Não
- Seguro-desemprego: Sim
- Saque FGTS: Código 04

## ⚖️ Conformidade Legal

### **Prazos de Pagamento (Art. 477 CLT)**
- **Dispensa:** Até o 1º dia útil
- **Pedido de demissão:** Até 10 dias corridos
- **Acordo mútuo:** Até 10 dias corridos

### **Homologação Sindical**
- Obrigatória para contratos > 1 ano
- Automática no sistema
- Campo específico no TRCT

### **Base Legal Incluída**
- CLT Arts. 477, 478, 479, 487, 488
- Lei nº 8.036/90 (FGTS)
- Lei nº 7.998/90 (Seguro-desemprego)
- Lei nº 15.270/2025 (Nova tabela IRRF)

## 🚀 Como Usar

### 1. **Simulação de Rescisão**
```typescript
// No modal de rescisão
1. Selecionar colaborador
2. Definir tipo de rescisão
3. Informar dados específicos
4. Calcular valores
5. Visualizar TRCT
6. Gerar PDF oficial
```

### 2. **Geração do TRCT**
```typescript
// Fluxo completo
const response = await $fetch('/api/rescisao/gerar-trct', {
  method: 'POST',
  body: {
    colaborador: dadosColaborador,
    dadosRescisao: formRescisao,
    empresa: dadosEmpresa
  }
})
```

### 3. **Validações Automáticas**
- Dados obrigatórios da empresa
- Informações do colaborador
- Cálculos conforme legislação
- Códigos de verbas corretos

## 📊 Recursos Avançados

### **Cálculos Automáticos**
- ✅ Saldo de salário proporcional
- ✅ Aviso prévio (trabalhado/indenizado)
- ✅ 13º salário proporcional
- ✅ Férias proporcionais + 1/3
- ✅ FGTS + multa (quando aplicável)
- ✅ INSS e IRRF (Lei 15.270/2025)

### **Informações Contextuais**
- ✅ Códigos de saque FGTS
- ✅ Direito ao seguro-desemprego
- ✅ Prazos legais de pagamento
- ✅ Observações por tipo de rescisão

### **Validação Jurídica**
- ✅ Conformidade com CLT
- ✅ Atualização legislativa
- ✅ Códigos oficiais MT
- ✅ Formato auditável

## 🎨 Interface do Usuário

### **Modal de Simulação**
- Etapas guiadas
- Validação em tempo real
- Preview dos cálculos
- Botões de ação claros

### **Visualização do TRCT**
- Layout oficial
- Impressão otimizada
- Download direto em PDF
- Responsivo para telas

### **Experiência do Usuário**
- Fluxo intuitivo
- Alertas informativos
- Validações automáticas
- Feedback visual

## 🔒 Segurança e Auditoria

### **Validações de Entrada**
- Dados obrigatórios
- Formatos corretos
- Valores consistentes
- Datas válidas

### **Rastreabilidade**
- Log de geração
- Timestamp no documento
- Identificação do sistema
- Versão da legislação

### **Conformidade**
- Modelo oficial MT
- Códigos padronizados
- Base legal atualizada
- Formato auditável

## 📈 Benefícios do Sistema

### **Para o RH**
- ✅ Agilidade na rescisão
- ✅ Redução de erros
- ✅ Conformidade garantida
- ✅ Documentação oficial

### **Para a Empresa**
- ✅ Redução de passivo trabalhista
- ✅ Padronização de processos
- ✅ Auditoria facilitada
- ✅ Compliance automático

### **Para o Colaborador**
- ✅ Transparência nos cálculos
- ✅ Documento oficial
- ✅ Informações claras
- ✅ Direitos preservados

## 🎯 Próximos Passos

### **Melhorias Futuras**
- [ ] Integração com eSocial
- [ ] Assinatura digital
- [ ] Envio automático por email
- [ ] Histórico de rescisões
- [ ] Relatórios gerenciais

### **Atualizações Legislativas**
- [ ] Monitoramento de mudanças na CLT
- [ ] Atualização automática de tabelas
- [ ] Novos códigos de verbas
- [ ] Adequação a novas leis

---

## 📞 Suporte

Para dúvidas sobre o sistema TRCT:
- Consulte a documentação da CLT
- Verifique atualizações legislativas
- Teste sempre em ambiente de homologação
- Mantenha backup dos documentos gerados

**⚠️ IMPORTANTE:** Este sistema gera documentos com validade legal. Sempre valide os cálculos e mantenha-se atualizado com a legislação trabalhista vigente.