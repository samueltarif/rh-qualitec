# 🔄 Fluxo de Adiantamento Salarial - CORRIGIDO

## 📋 Como Funciona o Adiantamento

### ✅ Fluxo Correto Implementado

O adiantamento salarial segue o seguinte fluxo:

#### 1️⃣ **Geração do Adiantamento (Dia 20 do Mês)**
- **Exemplo**: Dia 20/12/2024
- Sistema gera adiantamento de 40% do salário
- Colaborador recebe o valor SEM descontos (INSS, IRRF)
- Holerite tipo: `adiantamento`
- Mês/Ano: `12/2024`

```
Colaborador: João Silva
Salário Base: R$ 3.000,00
Adiantamento (40%): R$ 1.200,00
Descontos: R$ 0,00
Valor Líquido: R$ 1.200,00
```

#### 2️⃣ **Geração do Holerite Final (Início do Mês Seguinte)**
- **Exemplo**: Dia 05/01/2025
- Sistema busca adiantamento do **mês anterior** (12/2024)
- Desconta o valor do adiantamento no holerite final
- Holerite tipo: `mensal`
- Mês/Ano: `01/2025`

```
Colaborador: João Silva
Salário Base: R$ 3.000,00
(-) INSS: R$ 270,00
(-) IRRF: R$ 50,00
(-) Adiantamento (12/2024): R$ 1.200,00
= Salário Líquido: R$ 1.480,00
```

### 🔍 Lógica de Busca do Adiantamento

#### No Cálculo da Folha (`/api/folha/calcular`)
```typescript
// Calcular folha de Janeiro/2025
// Buscar adiantamentos de Dezembro/2024

let mesAnterior = parseInt(mes) - 1  // 01 - 1 = 0
let anoAnterior = parseInt(ano)      // 2025

if (mesAnterior === 0) {
  mesAnterior = 12    // Dezembro
  anoAnterior = 2024  // Ano anterior
}

// Busca: mes=12, ano=2024, tipo=adiantamento
```

#### Na Geração de Holerites (`/api/holerites/gerar`)
```typescript
// Gerar holerite de Janeiro/2025
// Buscar adiantamento de Dezembro/2024

const { data: adiantamentoPago } = await supabase
  .from('holerites')
  .select('salario_liquido, valor_adiantamento')
  .eq('colaborador_id', colab.id)
  .eq('mes', '12')
  .eq('ano', '2024')
  .eq('tipo', 'adiantamento')
  .maybeSingle()
```

### 📊 Visualização nos Componentes

#### `FolhaResumoDetalhadoCard.vue`
- Mostra "Adiantamentos (Mês Anterior)" apenas se houver
- Valor aparece nos totais de descontos
- Não confunde com adiantamentos do mês atual

#### `FolhaDetalhamentoColaboradores.vue`
- Coluna: "Adiant. (Mês Ant.)"
- Tooltip: "Adiantamento pago no mês anterior"
- Cor laranja quando há valor

### 📅 Exemplo Completo de Fluxo

#### Dezembro/2024
```
20/12/2024 - Gerar Adiantamento
├─ Tipo: adiantamento
├─ Mês/Ano: 12/2024
├─ Valor: 40% do salário
└─ Descontos: Nenhum
```

#### Janeiro/2025
```
05/01/2025 - Gerar Holerite Mensal
├─ Tipo: mensal
├─ Mês/Ano: 01/2025
├─ Busca adiantamento: 12/2024
├─ Descontos: INSS + IRRF + Adiantamento(12/2024)
└─ Observações: "Adiantamento pago em 20/12/2024"
```

### ⚠️ Importante

1. **Adiantamento NÃO é descontado no mesmo mês**
   - ❌ Errado: Gerar adiantamento em 20/12 e descontar em 31/12
   - ✅ Correto: Gerar adiantamento em 20/12 e descontar em 05/01

2. **Resumo da Folha**
   - Dezembro/2024: Não mostra desconto de adiantamento
   - Janeiro/2025: Mostra desconto do adiantamento de dezembro

3. **Holerites Separados**
   - Colaborador recebe 2 holerites em dezembro:
     - Adiantamento (20/12)
   - Colaborador recebe 1 holerite em janeiro:
     - Salário mensal com desconto do adiantamento

### 🎯 Benefícios da Correção

✅ Fluxo financeiro correto
✅ Transparência para o colaborador
✅ Cálculos precisos de descontos
✅ Conformidade com práticas trabalhistas
✅ Relatórios mensais corretos

### 🔧 Arquivos Modificados

1. `server/api/folha/calcular.post.ts`
   - Busca adiantamentos do mês anterior

2. `server/api/holerites/gerar.post.ts`
   - Busca adiantamentos do mês anterior
   - Atualiza observações com data correta

3. `app/components/FolhaResumoDetalhadoCard.vue`
   - Mostra "Adiantamentos (Mês Anterior)"
   - Interface atualizada

4. `app/components/FolhaDetalhamentoColaboradores.vue`
   - Coluna renomeada para "Adiant. (Mês Ant.)"
   - Tooltip explicativo

---

**Data da Correção**: 07/12/2024
**Status**: ✅ Implementado e Testado
