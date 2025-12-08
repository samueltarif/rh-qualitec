# 💼 Sistema de Holerites - Completo e Profissional

## 📋 Visão Geral

Sistema completo de geração e visualização de holerites individuais para funcionários, com segurança RLS garantindo que cada funcionário veja apenas seus próprios holerites.

## ✨ Funcionalidades

### Para Administradores

#### 1. Geração de Holerites
- **Local**: `/folha-pagamento`
- **Processo**:
  1. Selecionar mês e ano
  2. Calcular folha de pagamento
  3. Clicar em "Gerar Holerites"
  4. Confirmar geração
  5. ✅ Holerites criados automaticamente

#### 2. Cálculos Automáticos
- ✅ INSS (tabela progressiva 2024)
- ✅ IRRF (tabela progressiva 2024)
- ✅ FGTS (8% - encargo patronal)
- ✅ Salário líquido
- ✅ Total de descontos

#### 3. Gestão
- Ver todos os holerites gerados
- Atualizar holerites existentes
- Deletar holerites
- Filtrar por período, colaborador, status

### Para Funcionários

#### 1. Visualização de Holerites
- **Local**: `/employee` → Aba "Holerites"
- **Recursos**:
  - Lista de todos os holerites disponíveis
  - Cards visuais com resumo
  - Status (Novo, Visualizado, Pago)
  - Valores destacados

#### 2. Detalhes do Holerite
- Dados do funcionário
- Período de referência
- Proventos detalhados
- Descontos detalhados
- Valor líquido destacado
- Dados bancários
- Observações

#### 3. Ações
- ✅ Visualizar holerite completo
- ✅ Imprimir holerite
- ✅ Baixar PDF (em desenvolvimento)
- ✅ Marcação automática como "visualizado"

## 🔒 Segurança

### Row Level Security (RLS)

#### Políticas para Admin
```sql
- Ver todos os holerites
- Criar holerites
- Atualizar holerites
- Deletar holerites
```

#### Políticas para Funcionário
```sql
- Ver APENAS seus próprios holerites
- Marcar como visualizado
- NÃO pode ver holerites de outros
- NÃO pode criar/deletar
```

### Validações
- ✅ Autenticação obrigatória
- ✅ Verificação de role (admin/funcionario)
- ✅ Vínculo user_id ↔ colaborador_id
- ✅ Isolamento total entre funcionários

## 📊 Estrutura de Dados

### Tabela: holerites

```typescript
interface Holerite {
  // Identificação
  id: string
  colaborador_id: string
  mes: number (1-12)
  ano: number
  
  // Dados do Colaborador (snapshot)
  nome_colaborador: string
  cpf: string
  cargo: string
  departamento: string
  
  // Valores Base
  salario_base: number
  horas_trabalhadas: number
  horas_extras_50: number
  horas_extras_100: number
  
  // Proventos
  valor_horas_extras_50: number
  valor_horas_extras_100: number
  adicional_noturno: number
  adicional_insalubridade: number
  adicional_periculosidade: number
  outros_proventos: number
  descricao_outros_proventos: string
  total_proventos: number
  
  // Descontos
  inss: number
  irrf: number
  vale_transporte: number
  vale_refeicao: number
  plano_saude: number
  faltas: number
  atrasos: number
  outros_descontos: number
  descricao_outros_descontos: string
  total_descontos: number
  
  // Totais
  salario_bruto: number
  salario_liquido: number
  
  // Encargos Patronais
  fgts: number
  inss_patronal: number
  
  // Dados Bancários
  banco: string
  agencia: string
  conta: string
  
  // Controle
  status: 'gerado' | 'enviado' | 'visualizado' | 'pago'
  data_pagamento: Date
  observacoes: string
  
  // Auditoria
  gerado_por: string
  gerado_em: Date
  enviado_em: Date
  visualizado_em: Date
  created_at: Date
  updated_at: Date
}
```

## 🎨 Interface

### Admin - Página de Folha de Pagamento

```
┌─────────────────────────────────────────┐
│  Folha de Pagamento                     │
├─────────────────────────────────────────┤
│  [Mês ▼] [Ano ▼]                       │
│  [Calcular Folha] [Gerar Holerites]    │
├─────────────────────────────────────────┤
│  📊 Resumo da Folha                     │
│  • Total Colaboradores: 10              │
│  • Salário Bruto: R$ 50.000,00         │
│  • Total Descontos: R$ 8.500,00        │
│  • Salário Líquido: R$ 41.500,00       │
├─────────────────────────────────────────┤
│  📋 Detalhamento por Colaborador        │
│  [Tabela com todos os colaboradores]   │
└─────────────────────────────────────────┘
```

### Funcionário - Aba de Holerites

```
┌─────────────────────────────────────────┐
│  Meus Holerites                         │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐            │
│  │ 📄 Nov   │  │ 📄 Out   │            │
│  │ 2024     │  │ 2024     │            │
│  │          │  │          │            │
│  │ Bruto:   │  │ Bruto:   │            │
│  │ R$ 5.000 │  │ R$ 5.000 │            │
│  │          │  │          │            │
│  │ Líquido: │  │ Líquido: │            │
│  │ R$ 4.150 │  │ R$ 4.150 │            │
│  │          │  │          │            │
│  │ [Novo]   │  │ [Visto]  │            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
```

### Modal de Visualização do Holerite

```
┌─────────────────────────────────────────┐
│  HOLERITE - Novembro/2024               │
├─────────────────────────────────────────┤
│  Funcionário: João Silva                │
│  CPF: 123.456.789-00                    │
│  Cargo: Desenvolvedor                   │
├─────────────────────────────────────────┤
│  PROVENTOS                              │
│  Salário Base............R$ 5.000,00    │
│  TOTAL PROVENTOS.........R$ 5.000,00    │
├─────────────────────────────────────────┤
│  DESCONTOS                              │
│  INSS....................R$ 550,00      │
│  IRRF....................R$ 300,00      │
│  TOTAL DESCONTOS.........R$ 850,00      │
├─────────────────────────────────────────┤
│  💰 VALOR LÍQUIDO: R$ 4.150,00         │
├─────────────────────────────────────────┤
│  [Fechar] [Imprimir] [Baixar PDF]      │
└─────────────────────────────────────────┘
```

## 🔄 Fluxo de Trabalho

### 1. Geração (Admin)
```
Admin acessa /folha-pagamento
    ↓
Seleciona mês/ano
    ↓
Clica em "Calcular Folha"
    ↓
Sistema calcula valores
    ↓
Admin clica em "Gerar Holerites"
    ↓
Sistema cria holerites individuais
    ↓
✅ Holerites disponíveis para funcionários
```

### 2. Visualização (Funcionário)
```
Funcionário acessa /employee
    ↓
Clica na aba "Holerites"
    ↓
Vê lista de holerites disponíveis
    ↓
Clica em um holerite
    ↓
Modal abre com detalhes completos
    ↓
Sistema marca como "visualizado"
    ↓
Funcionário pode imprimir/baixar
```

## 📁 Arquivos Criados

### Database
```
database/migrations/
  └── 27_holerites.sql                    ← Migration principal
  └── EXECUTAR_MIGRATION_27.md            ← Instruções

```

### Backend (APIs)
```
server/api/
  ├── holerites/
  │   ├── gerar.post.ts                   ← Gerar holerites (admin)
  │   ├── index.get.ts                    ← Listar holerites (admin)
  │   └── [id].get.ts                     ← Ver holerite específico
  └── funcionario/
      └── holerites.get.ts                ← Holerites do funcionário
```

### Frontend (Componentes)
```
app/components/
  ├── ModalHolerite.vue                   ← Modal de visualização
  └── EmployeeHoleritesTab.vue            ← Aba no portal

app/pages/
  ├── folha-pagamento.vue                 ← Atualizado (botão gerar)
  └── employee.vue                        ← Atualizado (nova aba)
```

### Documentação
```
SISTEMA_HOLERITES_COMPLETO.md             ← Este arquivo
```

## 🧪 Como Testar

### 1. Executar Migration
```bash
# Acesse Supabase SQL Editor
# Execute: database/migrations/27_holerites.sql
```

### 2. Gerar Holerites (Admin)
```bash
1. Login como admin
2. Acesse /folha-pagamento
3. Selecione mês/ano
4. Clique em "Calcular Folha"
5. Clique em "Gerar Holerites"
6. Confirme
```

### 3. Visualizar (Funcionário)
```bash
1. Login como funcionário
2. Acesse /employee
3. Clique na aba "Holerites"
4. Veja seus holerites
5. Clique para visualizar detalhes
```

### 4. Verificar Segurança
```bash
# Teste 1: Funcionário A não vê holerites do Funcionário B
1. Login como Funcionário A
2. Acesse /employee → Holerites
3. Deve ver apenas seus holerites

# Teste 2: Admin vê todos
1. Login como Admin
2. Acesse /folha-pagamento
3. Deve ver holerites de todos
```

## 📊 Cálculos Implementados

### INSS (Tabela 2024)
```
Até R$ 1.320,00      → 7,5%
R$ 1.320,01 a 2.571,29 → 9%
R$ 2.571,30 a 3.856,94 → 12%
R$ 3.856,95 a 7.507,49 → 14%
```

### IRRF (Tabela 2024)
```
Até R$ 2.259,20        → Isento
R$ 2.259,21 a 2.826,65 → 7,5% - R$ 169,44
R$ 2.826,66 a 3.751,05 → 15% - R$ 381,44
R$ 3.751,06 a 4.664,68 → 22,5% - R$ 662,77
Acima de R$ 4.664,68   → 27,5% - R$ 896,00
```

### FGTS
```
8% do salário bruto (pago pela empresa)
```

## 🎯 Benefícios

### Para a Empresa
- ✅ Automação completa
- ✅ Redução de erros
- ✅ Economia de tempo
- ✅ Auditoria completa
- ✅ Conformidade legal

### Para o RH
- ✅ Geração em massa
- ✅ Cálculos automáticos
- ✅ Controle de status
- ✅ Histórico completo
- ✅ Menos trabalho manual

### Para os Funcionários
- ✅ Acesso 24/7
- ✅ Histórico completo
- ✅ Transparência total
- ✅ Download/impressão
- ✅ Privacidade garantida

## 🔐 Conformidade

- ✅ LGPD: Dados sensíveis protegidos
- ✅ CLT: Informações obrigatórias
- ✅ Segurança: RLS ativo
- ✅ Auditoria: Logs completos
- ✅ Privacidade: Isolamento total

## 🚀 Próximas Melhorias

- [ ] Geração de PDF profissional
- [ ] Envio automático por email
- [ ] Assinatura digital
- [ ] Integração com eSocial
- [ ] Notificações push
- [ ] Histórico de alterações
- [ ] Comparativo mês a mês
- [ ] Gráficos de evolução salarial

## 📞 Suporte

Em caso de dúvidas:
1. Consulte este documento
2. Veja `EXECUTAR_MIGRATION_27.md`
3. Verifique os logs do sistema
4. Teste em ambiente de desenvolvimento primeiro

---

**Status**: ✅ Implementado e Testado
**Data**: 05/12/2025
**Versão**: 1.0
**Autor**: Sistema RH Qualitec
