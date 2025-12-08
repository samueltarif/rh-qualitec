# 🔧 Correção: Meses Trabalhados no 13º Salário

## 🎯 Problema Identificado

O modal está mostrando **6/12 meses** para Samuel quando deveria mostrar **5/12 meses**.

### Análise dos Valores

**Samuel Barretos Tarif:**
- Salário Base: R$ 2.650,00
- Meses mostrados: **6/12** ❌
- Meses corretos: **5/12** ✅

### Valores Calculados (ERRADOS com 6 meses):

| Parcela | Valor Mostrado ❌ | Valor Correto ✅ |
|---------|-------------------|------------------|
| **Integral** | R$ 1.325,00 | R$ 1.104,17 |
| **1ª Parcela** | R$ 662,50 | R$ 552,09 |
| **2ª Parcela** | R$ 662,50 | R$ 552,08 |

## 🔍 Causa do Problema

A função `calcularMesesTrabalhados` está **CORRETA**:

```typescript
const calcularMesesTrabalhados = (dataAdmissao: string, ano: number): number => {
  const admissao = new Date(dataAdmissao)
  const anoAdmissao = admissao.getFullYear()
  const mesAdmissao = admissao.getMonth() + 1 // 1 = janeiro, 12 = dezembro

  if (anoAdmissao > ano) return 0
  if (anoAdmissao < ano) return 12
  
  // Trabalhou parte do ano
  return 12 - mesAdmissao + 1
}
```

**O problema está na DATA DE ADMISSÃO no banco de dados!**

### Cálculo com Diferentes Datas:

| Data Admissão | Mês | Cálculo | Meses | Resultado |
|---------------|-----|---------|-------|-----------|
| 01/07/2025 | 7 | 12 - 7 + 1 | 6 | ❌ ERRADO |
| 01/08/2025 | 8 | 12 - 8 + 1 | 5 | ✅ CORRETO |

**Conclusão**: A data de admissão do Samuel está cadastrada como **julho (07)** quando deveria ser **agosto (08)**.

## ✅ Solução

### 1. Verificar Data de Admissão

Execute no Supabase SQL Editor:

```sql
SELECT 
  nome,
  data_admissao,
  EXTRACT(MONTH FROM data_admissao) as mes_admissao,
  12 - EXTRACT(MONTH FROM data_admissao) + 1 as meses_calculados
FROM colaboradores
WHERE nome ILIKE '%samuel%';
```

### 2. Corrigir Data de Admissão

Se a data estiver errada, corrija:

```sql
UPDATE colaboradores
SET data_admissao = '2025-08-01'
WHERE nome ILIKE '%samuel%'
  AND id = [ID_DO_SAMUEL];
```

### 3. Verificar Todos os Colaboradores

```sql
SELECT 
  nome,
  data_admissao,
  EXTRACT(MONTH FROM data_admissao) as mes,
  12 - EXTRACT(MONTH FROM data_admissao) + 1 as meses_2025,
  salario_base,
  ROUND((salario_base / 12.0) * (12 - EXTRACT(MONTH FROM data_admissao) + 1), 2) as "13º Proporcional"
FROM colaboradores
WHERE status = 'Ativo'
  AND EXTRACT(YEAR FROM data_admissao) = 2025
ORDER BY data_admissao;
```

## 📊 Validação dos Cálculos

### Samuel com Data Correta (01/08/2025)

```
Meses: 12 - 8 + 1 = 5 meses ✅

13º Proporcional:
(R$ 2.650,00 / 12) × 5 = R$ 1.104,17

1ª Parcela (50% sem descontos):
R$ 1.104,17 / 2 = R$ 552,09

2ª Parcela (50% com descontos):
R$ 1.104,17 / 2 = R$ 552,08

Integral (com descontos):
R$ 1.104,17
```

### Comparação: Antes e Depois

| Item | Com 6 Meses ❌ | Com 5 Meses ✅ | Diferença |
|------|----------------|----------------|-----------|
| **13º Proporcional** | R$ 1.325,00 | R$ 1.104,17 | -R$ 220,83 |
| **1ª Parcela** | R$ 662,50 | R$ 552,09 | -R$ 110,41 |
| **2ª Parcela** | R$ 552,08 | R$ 552,08 | -R$ 110,42 |

## 🎯 Checklist de Verificação

Para cada colaborador admitido em 2025:

- [ ] Verificar data de admissão no banco
- [ ] Confirmar mês correto
- [ ] Calcular meses: `12 - mês + 1`
- [ ] Validar valor do 13º proporcional
- [ ] Conferir valores no modal

### Exemplos de Validação:

| Admissão | Mês | Meses Trabalhados | 13º (R$ 2.650,00) |
|----------|-----|-------------------|-------------------|
| 01/01/2025 | 1 | 12 | R$ 2.650,00 |
| 01/02/2025 | 2 | 11 | R$ 2.429,17 |
| 01/03/2025 | 3 | 10 | R$ 2.208,33 |
| 01/04/2025 | 4 | 9 | R$ 1.987,50 |
| 01/05/2025 | 5 | 8 | R$ 1.766,67 |
| 01/06/2025 | 6 | 7 | R$ 1.545,83 |
| 01/07/2025 | 7 | 6 | R$ 1.325,00 |
| **01/08/2025** | **8** | **5** | **R$ 1.104,17** ✅ |
| 01/09/2025 | 9 | 4 | R$ 883,33 |
| 01/10/2025 | 10 | 3 | R$ 662,50 |
| 01/11/2025 | 11 | 2 | R$ 441,67 |
| 01/12/2025 | 12 | 1 | R$ 220,83 |

## 🔧 Script SQL Completo

```sql
-- 1. Verificar todos os colaboradores
SELECT 
  id,
  nome,
  data_admissao,
  EXTRACT(MONTH FROM data_admissao) as mes_admissao,
  12 - EXTRACT(MONTH FROM data_admissao) + 1 as meses_trabalhados,
  salario_base,
  ROUND((salario_base / 12.0) * (12 - EXTRACT(MONTH FROM data_admissao) + 1), 2) as valor_13_proporcional
FROM colaboradores
WHERE status = 'Ativo'
  AND EXTRACT(YEAR FROM data_admissao) = 2025
ORDER BY data_admissao;

-- 2. Corrigir Samuel (se necessário)
UPDATE colaboradores
SET data_admissao = '2025-08-01'
WHERE nome = 'SAMUEL BARRETOS TARIF';

-- 3. Verificar correção
SELECT 
  nome,
  data_admissao,
  12 - EXTRACT(MONTH FROM data_admissao) + 1 as meses_trabalhados
FROM colaboradores
WHERE nome = 'SAMUEL BARRETOS TARIF';
```

## ✨ Resultado Esperado

Após corrigir a data de admissão:

**Modal de 13º Salário - Samuel:**
- Meses: **5/12** ✅
- Integral: **R$ 1.104,17** ✅
- 1ª Parcela: **R$ 552,09** ✅
- 2ª Parcela: **R$ 552,08** ✅

---

**Status**: Aguardando correção da data de admissão no banco  
**Arquivo SQL**: `database/VERIFICAR_DATAS_ADMISSAO.sql`  
**Data**: 06/12/2025
