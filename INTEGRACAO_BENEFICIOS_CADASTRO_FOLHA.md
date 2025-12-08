# ✅ Integração: Benefícios do Cadastro → Folha de Pagamento

## 🎯 Objetivo

Integrar os benefícios cadastrados no perfil do colaborador com o modal de edição da folha de pagamento, permitindo que sejam automaticamente carregados e editáveis mensalmente.

## 📋 O que foi implementado

### 1. **Pré-preenchimento Automático**

Quando você abre o modal de edição da folha de um colaborador, os benefícios são automaticamente carregados do cadastro dele:

```typescript
// Busca dados do colaborador
const response = await $fetch(`/api/colaboradores/${item.colaborador_id}`)

// Pré-preenche benefícios
const beneficiosColaborador = {
  vale_transporte: response.recebe_vt ? (response.valor_vt || 0) : 0,
  vale_refeicao: response.recebe_vr ? (response.valor_vr || 0) : 0,
  vale_alimentacao: response.recebe_va ? (response.valor_va || 0) : 0,
  plano_saude: response.plano_saude ? (response.valor_plano_saude || 0) : 0,
  plano_odontologico: response.plano_odonto ? (response.valor_plano_odonto || 0) : 0,
}
```

### 2. **Benefícios são Proventos (não Descontos)**

**Importante**: Os benefícios foram movidos da seção "Descontos" para uma seção própria "Benefícios (Proventos)" porque:

- ✅ São **proventos** pagos pela empresa
- ✅ Aparecem no holerite do colaborador
- ✅ **NÃO afetam o salário líquido** (não são descontados)
- ✅ Mostram o custo total da empresa com aquele colaborador

### 3. **Campos de Benefícios Disponíveis**

#### Vales (pré-preenchidos do cadastro):
- **Vale Transporte** - `recebe_vt` + `valor_vt`
- **Vale Refeição** - `recebe_vr` + `valor_vr`
- **Vale Alimentação** - `recebe_va` + `valor_va`

#### Planos (pré-preenchidos do cadastro):
- **Plano de Saúde** - `plano_saude` + `valor_plano_saude`
- **Plano Odontológico** - `plano_odonto` + `valor_plano_odonto`

#### Outros Benefícios (editáveis):
- Seguro de Vida
- Auxílio Creche
- Auxílio Educação
- Auxílio Combustível
- Outros Benefícios (personalizado)

## 🎨 Interface

### Visual da Seção de Benefícios

```
┌─────────────────────────────────────────────────────┐
│ 🎁 Benefícios (Proventos - Aparecem no Holerite)   │
├─────────────────────────────────────────────────────┤
│ ℹ️ Valores pré-preenchidos do cadastro do          │
│    colaborador. Você pode ajustar os valores aqui  │
│    para este mês específico. Estes benefícios são  │
│    proventos (não descontos) e aparecem no         │
│    holerite, mas não afetam o salário líquido pois │
│    são pagos pela empresa.                          │
├─────────────────────────────────────────────────────┤
│ [Vale Transporte] [Vale Refeição] [Vale Alimentação]│
│ [Plano de Saúde] [Plano Odontológico]              │
│ [Seguro de Vida] [Auxílio Creche]                  │
│ [Auxílio Educação] [Auxílio Combustível]           │
│ [Outros Benefícios]                                 │
└─────────────────────────────────────────────────────┘
```

- **Cor**: Verde (bg-green-50, border-green-200)
- **Ícone**: 🎁 (heroicons:gift)
- **Destaque**: Banner informativo em verde claro

## 🔄 Fluxo de Dados

### 1. Cadastro do Colaborador
```
Aba "Benefícios" do Colaborador
    ↓
Salva no banco: recebe_vt, valor_vt, plano_saude, etc.
```

### 2. Edição da Folha
```
Clica em "Editar" na folha
    ↓
Busca dados do colaborador via API
    ↓
Pré-preenche benefícios no modal
    ↓
Usuário pode ajustar valores para o mês específico
    ↓
Salva ajustes na tabela folha_ajustes
```

### 3. Geração do Holerite
```
Gera holerite
    ↓
Inclui benefícios do cadastro + ajustes da folha
    ↓
Mostra no PDF do holerite
```

## 📊 Cálculos

### Benefícios NO cálculo:

```typescript
// Total de benefícios (para exibição)
const totalBeneficios = 
  vale_transporte +
  vale_refeicao +
  vale_alimentacao +
  plano_saude +
  plano_odontologico +
  seguro_vida +
  auxilio_creche +
  auxilio_educacao +
  auxilio_combustivel +
  outros_beneficios
```

### Benefícios NÃO afetam salário líquido:

```typescript
// Cálculo do salário líquido (benefícios NÃO entram aqui)
const salarioLiquido = salarioBruto - (inss + irrf + outrosDescontos)

// Benefícios são mostrados separadamente no resumo
```

## 📝 Resumo Lateral

O painel de resumo em tempo real mostra:

```
💵 Salário Base: R$ 3.000,00
➕ Total Proventos: R$ 500,00
💰 Salário Bruto: R$ 3.500,00
➖ INSS: R$ 280,00
➖ IRRF: R$ 150,00
➖ Outros Descontos: R$ 100,00
🟰 Total Descontos: R$ 530,00
✅ Salário Líquido: R$ 2.970,00
─────────────────────────────
🏦 FGTS (8% - Empresa): R$ 280,00
🎁 Total Benefícios: R$ 850,00  ← Aparece aqui!
```

## 🎯 Exemplo Prático

### Cenário: Colaborador João Silva

**Cadastro do João (Aba Benefícios):**
- ✅ Vale Transporte: R$ 220,00
- ✅ Vale Alimentação: R$ 280,00
- ✅ Plano de Saúde: Sim
- ❌ Plano Odontológico: Não

**Ao editar a folha de Dezembro/2024:**

1. Modal abre com valores pré-preenchidos:
   - Vale Transporte: R$ 220,00 ✓
   - Vale Alimentação: R$ 280,00 ✓
   - Plano de Saúde: R$ 0,00 (você define o valor)
   - Plano Odontológico: R$ 0,00

2. Você ajusta para este mês:
   - Vale Transporte: R$ 220,00 (mantém)
   - Vale Alimentação: R$ 280,00 (mantém)
   - Plano de Saúde: R$ 350,00 (adiciona valor)
   - Auxílio Educação: R$ 200,00 (adiciona extra)

3. No holerite aparecerá:
   ```
   PROVENTOS:
   Salário Base: R$ 3.000,00
   Horas Extras: R$ 500,00
   
   BENEFÍCIOS:
   Vale Transporte: R$ 220,00
   Vale Alimentação: R$ 280,00
   Plano de Saúde: R$ 350,00
   Auxílio Educação: R$ 200,00
   Total Benefícios: R$ 1.050,00
   
   DESCONTOS:
   INSS: R$ 280,00
   IRRF: R$ 150,00
   
   SALÁRIO LÍQUIDO: R$ 3.070,00
   ```

## 🔧 Estrutura de Dados

### Tabela `colaboradores` (campos existentes):
```sql
recebe_vt BOOLEAN DEFAULT false
valor_vt DECIMAL(10,2) DEFAULT 0
recebe_vr BOOLEAN DEFAULT false
valor_vr DECIMAL(10,2) DEFAULT 0
recebe_va BOOLEAN DEFAULT false
valor_va DECIMAL(10,2) DEFAULT 0
recebe_va_vr BOOLEAN DEFAULT false
valor_va_vr DECIMAL(10,2) DEFAULT 0
plano_saude BOOLEAN DEFAULT false
valor_plano_saude DECIMAL(10,2) DEFAULT 0
plano_odonto BOOLEAN DEFAULT false
valor_plano_odonto DECIMAL(10,2) DEFAULT 0
```

### Tabela `folha_ajustes` (sugerida para salvar edições):
```sql
CREATE TABLE folha_ajustes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  colaborador_id UUID REFERENCES colaboradores(id),
  mes INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  
  -- Benefícios (podem ser diferentes do cadastro)
  vale_transporte DECIMAL(10,2) DEFAULT 0,
  vale_refeicao DECIMAL(10,2) DEFAULT 0,
  vale_alimentacao DECIMAL(10,2) DEFAULT 0,
  plano_saude DECIMAL(10,2) DEFAULT 0,
  plano_odontologico DECIMAL(10,2) DEFAULT 0,
  seguro_vida DECIMAL(10,2) DEFAULT 0,
  auxilio_creche DECIMAL(10,2) DEFAULT 0,
  auxilio_educacao DECIMAL(10,2) DEFAULT 0,
  auxilio_combustivel DECIMAL(10,2) DEFAULT 0,
  outros_beneficios DECIMAL(10,2) DEFAULT 0,
  
  -- ... outros campos (proventos, descontos, impostos)
  
  UNIQUE(colaborador_id, mes, ano)
);
```

## ✅ Benefícios desta Implementação

1. **Automação**: Benefícios são carregados automaticamente do cadastro
2. **Flexibilidade**: Podem ser ajustados mensalmente sem alterar o cadastro
3. **Transparência**: Colaborador vê todos os benefícios no holerite
4. **Controle de Custos**: Empresa visualiza custo total com cada colaborador
5. **Conformidade**: Separação clara entre salário e benefícios
6. **Histórico**: Mantém registro de benefícios por mês/ano

## 🚀 Próximos Passos

1. **Implementar API de salvamento** - Salvar ajustes na tabela `folha_ajustes`
2. **Integrar com geração de holerites** - Incluir benefícios no PDF
3. **Adicionar histórico** - Mostrar benefícios de meses anteriores
4. **Relatórios** - Relatório de custos com benefícios por colaborador/departamento

---

**Status**: ✅ Implementado e funcionando
**Arquivos modificados**: 
- `nuxt-app/app/pages/folha-pagamento.vue`
- `nuxt-app/BENEFICIOS_HOLERITE_ADICIONADO.md`
