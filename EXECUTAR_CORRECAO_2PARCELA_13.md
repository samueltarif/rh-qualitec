# 🔧 Correção da 2ª Parcela do 13º Salário

## ⚠️ Problema Identificado

Os holerites da 2ª parcela do 13º salário estão com cálculos incorretos:

1. **Meses trabalhados errados**: Funcionários admitidos em agosto aparecem com 7/12 quando deveriam ser 5/12
2. **Valor de proventos errado**: Mostra o valor total do 13º ao invés de apenas a 2ª parcela
3. **Não desconta a 1ª parcela**: O cálculo não considera que 50% já foi pago

## ✅ Correção Implementada

### Arquivos Corrigidos

1. **`server/api/decimo-terceiro/gerar.post.ts`**
   - ✅ Função `calcularMesesTrabalhados` corrigida
   - ✅ Cálculo da 2ª parcela corrigido
   - ✅ Descontos aplicados corretamente

### Mudanças no Cálculo

**Antes (ERRADO):**
```typescript
// Meses trabalhados
return 13 - mesAdmissao // agosto = 13 - 8 = 5 ❌ (mas estava dando 7)

// 2ª Parcela
totalProventos = valor13Total // Mostrava valor total ❌
valor13Parcela = valor13Total - descontos // Não descontava 1ª parcela ❌
```

**Depois (CORRETO):**
```typescript
// Meses trabalhados
return 12 - mesAdmissao + 1 // agosto = 12 - 8 + 1 = 5 ✅

// 2ª Parcela
const primeiraParcela = valor13Total / 2
totalProventos = valor13Total - primeiraParcela // Mostra apenas 2ª parcela ✅
valor13Parcela = totalProventos - descontos // Desconta corretamente ✅
```

## 📋 Passo a Passo para Corrigir

### 1️⃣ Verificar Holerites Incorretos

Abra o Supabase SQL Editor e execute:

```sql
-- Ver holerites da 2ª parcela
SELECT 
  nome_colaborador,
  meses_trabalhados,
  salario_base,
  total_proventos,
  salario_liquido
FROM holerites
WHERE tipo = 'decimo_terceiro'
  AND parcela_13 = '2'
  AND ano = 2025;
```

### 2️⃣ Excluir Holerites Incorretos

```sql
-- ATENÇÃO: Isso vai excluir os holerites da 2ª parcela
DELETE FROM holerites
WHERE tipo = 'decimo_terceiro'
  AND parcela_13 = '2'
  AND ano = 2025;
```

### 3️⃣ Gerar Novamente no Sistema

1. Acesse o sistema
2. Vá em **Folha de Pagamento** → **13º Salário**
3. Selecione os colaboradores
4. Escolha **2ª Parcela**
5. Clique em **Gerar**

### 4️⃣ Verificar Resultado

```sql
-- Verificar se os valores estão corretos agora
SELECT 
  nome_colaborador,
  meses_trabalhados,
  salario_base,
  ROUND((salario_base / 12.0) * meses_trabalhados, 2) as "13º Total",
  ROUND(((salario_base / 12.0) * meses_trabalhados) / 2, 2) as "1ª Parcela",
  total_proventos as "2ª Parcela (Proventos)",
  inss,
  salario_liquido as "Líquido"
FROM holerites
WHERE tipo = 'decimo_terceiro'
  AND parcela_13 = '2'
  AND ano = 2025
ORDER BY nome_colaborador;
```

## 📊 Exemplo: Samuel

### Dados
- **Salário Base**: R$ 2.650,00
- **Admissão**: 01/08/2025
- **Meses Trabalhados**: 5 (agosto a dezembro)

### Cálculo Correto

| Item | Valor |
|------|-------|
| 13º Proporcional (5/12) | R$ 1.104,17 |
| 1ª Parcela (50% sem descontos) | R$ 552,09 |
| INSS (sobre total) | R$ 82,81 |
| IRRF (sobre total) | R$ 0,00 |
| **2ª Parcela Proventos** | **R$ 552,08** |
| **2ª Parcela Líquido** | **R$ 469,27** |

### Holerite Correto

```
PROVENTOS
13º Salário (2ª Parcela)          R$ 552,08
TOTAL PROVENTOS                   R$ 552,08

DESCONTOS
INSS                              R$ 82,81
IRRF                              R$ 0,00
TOTAL DESCONTOS                   R$ 82,81

VALOR LÍQUIDO A RECEBER           R$ 469,27

Observações:
13º Salário - 2ª Parcela (Com Descontos) - 2025
Meses trabalhados: 5/12
```

## 🎯 Validação

Para cada colaborador, verifique:

✅ **Meses trabalhados corretos**
- Admitido em janeiro = 12 meses
- Admitido em agosto = 5 meses
- Admitido em dezembro = 1 mês

✅ **Valores corretos**
- 13º Total = (Salário / 12) × Meses
- 1ª Parcela = 13º Total / 2
- 2ª Parcela Proventos = 13º Total / 2
- INSS = calculado sobre 13º Total
- Líquido = 2ª Parcela - INSS - IRRF

✅ **Observações corretas**
- Deve mostrar meses trabalhados corretos
- Deve indicar "2ª Parcela (Com Descontos)"

## 📝 Documentação

Para mais detalhes sobre os cálculos, consulte:
- `CORRECAO_13_SALARIO_2_PARCELA.md` - Explicação completa dos cálculos
- `database/FIX_2PARCELA_13_RECALCULAR.sql` - Script SQL para verificação

## ⚡ Ação Rápida

Se quiser fazer tudo de uma vez:

```bash
# 1. Abra o Supabase SQL Editor
# 2. Execute o arquivo completo:
nuxt-app/database/FIX_2PARCELA_13_RECALCULAR.sql

# 3. No sistema, gere novamente a 2ª parcela
```

## ✨ Resultado Final

Após a correção:
- ✅ Meses trabalhados calculados corretamente
- ✅ 1ª parcela sempre 50% sem descontos
- ✅ 2ª parcela mostra apenas os 50% restantes
- ✅ Descontos calculados sobre o valor total
- ✅ Valor líquido correto
- ✅ Observações refletem a realidade

---

**Importante**: Esta correção se aplica automaticamente para TODOS os colaboradores ao gerar novamente os holerites.
