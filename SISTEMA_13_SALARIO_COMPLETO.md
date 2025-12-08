# Sistema de 13º Salário - Completo

## 📋 Resumo

Sistema completo para geração de holerites de 13º salário com seleção individual de funcionários, cálculo automático de parcelas e envio por email.

## 🎯 Funcionalidades Implementadas

### 1. Modal de Seleção de Funcionários
- ✅ Lista todos os colaboradores ativos
- ✅ Seleção individual ou em massa
- ✅ Filtros por nome, CPF, departamento e cargo
- ✅ Visualização do valor do 13º em tempo real
- ✅ Resumo com total de selecionados

### 2. Configuração de Parcelas
- ✅ **1ª Parcela** (até 30/11)
  - 50% do valor sem descontos
  - Sem INSS e IRRF
  
- ✅ **2ª Parcela** (até 20/12)
  - 50% restante com descontos
  - INSS e IRRF sobre valor total
  
- ✅ **Parcela Integral**
  - 100% com todos os descontos
  - Para pagamento único

### 3. Cálculo Automático
- ✅ Cálculo proporcional por meses trabalhados
- ✅ INSS progressivo (tabela 2024)
- ✅ IRRF progressivo (tabela 2024)
- ✅ FGTS (8% - empresa)
- ✅ Dedução por dependentes

### 4. Geração de Holerites
- ✅ Geração individual por colaborador
- ✅ Holerites detalhados com todas as informações
- ✅ Armazenamento no banco de dados
- ✅ Disponível no portal do funcionário

### 5. Envio por Email
- ✅ Envio individual para cada colaborador
- ✅ Email personalizado com nome e valores
- ✅ Integração com sistema de email existente
- ✅ Relatório de envios bem-sucedidos

## 🏗️ Arquitetura

### Componentes

```
app/components/
└── Modal13Salario.vue          # Modal principal com seleção
```

### APIs

```
server/api/decimo-terceiro/
├── gerar.post.ts               # Gera holerites
└── gerar-enviar.post.ts        # Gera e envia por email
```

### Database

```
database/migrations/
└── 28_holerites_decimo_terceiro.sql  # Adiciona suporte para 13º
```

## 📊 Fluxo de Uso

### 1. Acessar Funcionalidade

```
Folha de Pagamento → Ações Rápidas → Gerar 13º Salário
```

### 2. Configurar Parcela

```
┌─────────────────────────────────┐
│ Parcela: [1ª Parcela ▼]        │
│ Ano: [2024 ▼]                   │
└─────────────────────────────────┘
```

### 3. Selecionar Colaboradores

```
┌─────────────────────────────────────────────┐
│ ☑ Selecionar Todos                          │
│                                             │
│ ☑ João Silva      | R$ 1.500,00            │
│ ☑ Maria Santos    | R$ 2.000,00            │
│ ☐ Pedro Oliveira  | R$ 1.800,00            │
└─────────────────────────────────────────────┘
```

### 4. Gerar ou Enviar

```
[Gerar Holerites]  [Gerar e Enviar por Email]
```

## 💡 Regras de Cálculo

### Cálculo Proporcional

```typescript
const mesesTrabalhados = calcularMesesTrabalhados(dataAdmissao, ano)
const valor13Proporcional = (salarioBase / 12) * mesesTrabalhados
```

**Exemplos:**
- Admitido em Janeiro: 12 meses = 100% do salário
- Admitido em Julho: 6 meses = 50% do salário
- Admitido em Dezembro: 1 mês = 8,33% do salário

### 1ª Parcela

```typescript
const primeiraParcela = valor13Proporcional / 2
// Sem descontos
```

**Exemplo:**
- Salário: R$ 3.000,00
- 12 meses trabalhados
- 1ª Parcela: R$ 1.500,00 (sem descontos)

### 2ª Parcela

```typescript
const valor13Total = valor13Proporcional
const inss = calcularINSS(valor13Total)
const irrf = calcularIRRF(valor13Total, inss, dependentes)
const primeiraParcela = valor13Total / 2
const segundaParcela = valor13Total - primeiraParcela - inss - irrf
```

**Exemplo:**
- Salário: R$ 3.000,00
- 12 meses trabalhados
- Valor Total: R$ 3.000,00
- INSS: R$ 225,00
- IRRF: R$ 75,00
- 1ª Parcela já paga: R$ 1.500,00
- 2ª Parcela: R$ 1.200,00

### Parcela Integral

```typescript
const valorIntegral = valor13Proporcional
const inss = calcularINSS(valorIntegral)
const irrf = calcularIRRF(valorIntegral, inss, dependentes)
const valorLiquido = valorIntegral - inss - irrf
```

## 🎨 Interface do Modal

### Cabeçalho

```
┌─────────────────────────────────────────────┐
│ 🎁 Gerar 13º Salário                        │
│ Selecione os colaboradores e a parcela     │
└─────────────────────────────────────────────┘
```

### Configurações

```
┌─────────────────────────────────────────────┐
│ Configurações do 13º Salário                │
├─────────────────────────────────────────────┤
│ Parcela: [1ª Parcela ▼]  Ano: [2024 ▼]    │
│                                             │
│ ℹ️  A 1ª parcela corresponde a 50% do 13º  │
│    salário (sem descontos de INSS e IRRF). │
└─────────────────────────────────────────────┘
```

### Lista de Colaboradores

```
┌─────────────────────────────────────────────┐
│ ☑ Selecionar Todos    2 de 3 selecionados  │
├─────────────────────────────────────────────┤
│ ☑ │ João Silva      │ 123.456.789-00 │ ... │
│ ☑ │ Maria Santos    │ 987.654.321-00 │ ... │
│ ☐ │ Pedro Oliveira  │ 456.789.123-00 │ ... │
└─────────────────────────────────────────────┘
```

### Resumo

```
┌─────────────────────────────────────────────┐
│ Colaboradores: 2  │ Total: R$ 3.500,00     │
└─────────────────────────────────────────────┘
```

### Ações

```
[Cancelar]  [Gerar Holerites]  [Gerar e Enviar]
```

## 📧 Email Enviado

### Assunto
```
13º Salário - [1ª/2ª Parcela] - [Ano]
```

### Corpo
```
Olá [Nome do Colaborador],

Seu holerite de 13º salário está disponível!

Parcela: [1ª/2ª Parcela/Integral]
Ano: [2024]
Valor Líquido: R$ [valor]

Acesse o portal do funcionário para visualizar os detalhes.

Atenciosamente,
Equipe de RH
```

## 🗄️ Estrutura do Banco

### Tabela: holerites

```sql
CREATE TABLE holerites (
  id UUID PRIMARY KEY,
  colaborador_id UUID NOT NULL,
  mes INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  
  -- Novos campos para 13º
  tipo VARCHAR(50) DEFAULT 'mensal',
  parcela_13 VARCHAR(20),
  meses_trabalhados INTEGER,
  
  salario_base DECIMAL(10,2),
  salario_bruto DECIMAL(10,2),
  inss DECIMAL(10,2),
  irrf DECIMAL(10,2),
  total_descontos DECIMAL(10,2),
  salario_liquido DECIMAL(10,2),
  fgts DECIMAL(10,2),
  
  observacoes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Exemplo de Registro

```json
{
  "id": "uuid",
  "colaborador_id": "uuid",
  "mes": 12,
  "ano": 2024,
  "tipo": "decimo_terceiro",
  "parcela_13": "1",
  "meses_trabalhados": 12,
  "salario_base": 3000.00,
  "salario_bruto": 3000.00,
  "inss": 0,
  "irrf": 0,
  "total_descontos": 0,
  "salario_liquido": 1500.00,
  "fgts": 240.00,
  "observacoes": "13º Salário - 1ª Parcela - 2024"
}
```

## 🧪 Testes

### Teste 1: Gerar 1ª Parcela

```typescript
// Selecionar 1 colaborador
// Parcela: 1ª
// Ano: 2024
// Clicar em "Gerar Holerites"

// Verificar:
// ✅ Holerite criado no banco
// ✅ Valor = 50% do salário
// ✅ Sem descontos
// ✅ Disponível no portal
```

### Teste 2: Gerar 2ª Parcela

```typescript
// Selecionar 1 colaborador
// Parcela: 2ª
// Ano: 2024
// Clicar em "Gerar Holerites"

// Verificar:
// ✅ Holerite criado no banco
// ✅ Valor = 50% - descontos
// ✅ INSS e IRRF calculados
// ✅ Disponível no portal
```

### Teste 3: Enviar por Email

```typescript
// Selecionar múltiplos colaboradores
// Clicar em "Gerar e Enviar por Email"

// Verificar:
// ✅ Holerites criados
// ✅ Emails enviados individualmente
// ✅ Cada email com dados corretos
// ✅ Relatório de envios
```

### Teste 4: Cálculo Proporcional

```typescript
// Colaborador admitido em Julho (6 meses)
// Salário: R$ 3.000,00
// Parcela: Integral

// Verificar:
// ✅ Valor 13º = R$ 1.500,00 (50%)
// ✅ Descontos proporcionais
// ✅ Meses trabalhados = 6
```

## 📊 Relatórios

### Após Geração

```
✅ 5 holerite(s) de 13º salário gerado(s) com sucesso!

Os funcionários já podem visualizar seus holerites no portal.
```

### Após Envio

```
✅ 5 holerite(s) gerado(s)
📧 5 email(s) enviado(s) com sucesso!
```

### Com Erros

```
✅ 4 holerite(s) gerado(s)
📧 3 email(s) enviado(s)

⚠️ 1 erro(s) encontrado(s):
- João Silva: Email não cadastrado
```

## 🔒 Segurança

### Validações

- ✅ Apenas colaboradores ativos
- ✅ Parcela válida (1, 2 ou integral)
- ✅ Ano válido (2020-2100)
- ✅ IDs de colaboradores existentes
- ✅ Email válido para envio

### Permissões

- ✅ Apenas administradores podem gerar
- ✅ Funcionários veem apenas seus holerites
- ✅ RLS aplicado na tabela holerites

## 📈 Performance

### Otimizações

- ✅ Processamento individual (evita timeout)
- ✅ Índices no banco de dados
- ✅ Cache de colaboradores
- ✅ Envio assíncrono de emails

### Limites

- Máximo: 100 colaboradores por vez
- Timeout: 30 segundos por colaborador
- Retry: 3 tentativas para emails

## 🎯 Próximas Melhorias

### Funcionalidades Futuras

- [ ] Agendamento automático de geração
- [ ] Relatório consolidado em PDF
- [ ] Exportação para contabilidade
- [ ] Histórico de gerações
- [ ] Notificações push
- [ ] Assinatura digital

### Melhorias de UX

- [ ] Preview do holerite antes de gerar
- [ ] Edição de valores antes de enviar
- [ ] Filtros salvos
- [ ] Busca avançada
- [ ] Ordenação customizada

## 📚 Documentação Relacionada

- `ACOES_RAPIDAS_CALCULOS_ESPECIAIS.md` - Componente de ações rápidas
- `SISTEMA_HOLERITES_COMPLETO.md` - Sistema de holerites
- `SISTEMA_EMAIL_COMUNICACAO.md` - Sistema de emails
- `database/migrations/EXECUTAR_MIGRATION_28.md` - Migration

## ✅ Checklist de Implementação

- [x] Criar componente Modal13Salario.vue
- [x] Criar API gerar.post.ts
- [x] Criar API gerar-enviar.post.ts
- [x] Criar migration 28
- [x] Integrar com página de folha
- [x] Adicionar cálculos de INSS e IRRF
- [x] Implementar envio de emails
- [x] Documentar funcionalidade
- [ ] Executar migration no banco
- [ ] Testar em produção

## 🚀 Como Usar

### 1. Executar Migration

```bash
# Ver instruções em:
database/migrations/EXECUTAR_MIGRATION_28.md
```

### 2. Acessar Sistema

```
1. Login como administrador
2. Ir para "Folha de Pagamento"
3. Clicar em "Gerar 13º Salário"
4. Selecionar colaboradores
5. Escolher parcela
6. Gerar ou enviar
```

### 3. Verificar Holerites

```
1. Login como funcionário
2. Ir para "Meus Holerites"
3. Filtrar por tipo: "13º Salário"
4. Visualizar ou baixar PDF
```

---

**Status:** ✅ Implementado e Documentado  
**Testado:** ⏳ Aguardando testes  
**Pronto para Produção:** ⏳ Após migration  
**Data:** Dezembro 2024
