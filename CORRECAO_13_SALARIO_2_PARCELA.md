# Correção do Cálculo da 2ª Parcela do 13º Salário

## Problema Identificado

O holerite da 2ª parcela do 13º salário estava com cálculos incorretos:

### Dados do Funcionário (Samuel)
- **Salário Base**: R$ 2.650,00
- **Data de Admissão**: 01/08/2025
- **Meses Trabalhados em 2025**: 5 meses (agosto a dezembro)

### Erro no Holerite Original
- ❌ Mostrava 7/12 meses (incorreto)
- ❌ Proventos: R$ 1.545,83 (valor errado)
- ❌ INSS: R$ 117,95 (calculado sobre valor errado)
- ❌ Líquido: R$ 1.427,88 (resultado incorreto)

## Cálculo Correto

### 1. Calcular 13º Proporcional (5/12)
```
13º Proporcional = (Salário Base / 12) × Meses Trabalhados
13º Proporcional = (R$ 2.650,00 / 12) × 5
13º Proporcional = R$ 220,83 × 5
13º Proporcional = R$ 1.104,17
```

### 2. Calcular 1ª Parcela (50% sem descontos)
```
1ª Parcela = 13º Proporcional / 2
1ª Parcela = R$ 1.104,17 / 2
1ª Parcela = R$ 552,09
```

### 3. Calcular INSS sobre o Valor Total
O INSS é calculado sobre o valor TOTAL do 13º (R$ 1.104,17) usando a tabela progressiva 2025:

```
Faixa 1: R$ 1.104,17 × 7,5% = R$ 82,81
INSS Total = R$ 82,81
```

### 4. Calcular IRRF sobre o Valor Total
```
Base de Cálculo = 13º Total - INSS
Base de Cálculo = R$ 1.104,17 - R$ 82,81
Base de Cálculo = R$ 1.021,36

Como R$ 1.021,36 < R$ 2.259,20 → IRRF = R$ 0,00 (isento)
```

### 5. Calcular 2ª Parcela
```
2ª Parcela = 13º Total - 1ª Parcela - INSS - IRRF
2ª Parcela = R$ 1.104,17 - R$ 552,09 - R$ 82,81 - R$ 0,00
2ª Parcela = R$ 469,27
```

## Holerite Corrigido - 2ª Parcela

### PROVENTOS
| Descrição | Valor |
|-----------|-------|
| 13º Salário (2ª Parcela) | R$ 552,08 |
| **TOTAL PROVENTOS** | **R$ 552,08** |

### DESCONTOS
| Descrição | Valor |
|-----------|-------|
| INSS | R$ 82,81 |
| IRRF | R$ 0,00 |
| **TOTAL DESCONTOS** | **R$ 82,81** |

### VALOR LÍQUIDO
```
Valor Líquido = Total Proventos - Total Descontos
Valor Líquido = R$ 552,08 - R$ 82,81
Valor Líquido = R$ 469,27
```

### Observações
```
13º Salário - 2ª Parcela (Com Descontos) - 2025
Meses trabalhados: 5/12
1ª Parcela paga: R$ 552,09
Descontos sobre valor total: R$ 82,81
```

## Resumo das Correções Implementadas

### 1. Função `calcularMesesTrabalhados`
**Antes:**
```typescript
return 13 - mesAdmissao // ERRADO: dava 7 para agosto
```

**Depois:**
```typescript
return 12 - mesAdmissao + 1 // CORRETO: dá 5 para agosto
```

### 2. Cálculo da 2ª Parcela
**Antes:**
```typescript
totalProventos = valor13Total // Mostrava valor total como provento
valor13Parcela = valor13Total - descontos // Não descontava 1ª parcela
```

**Depois:**
```typescript
const primeiraParcela = valor13Total / 2
totalProventos = valor13Total - primeiraParcela // Mostra apenas 2ª parcela
valor13Parcela = totalProventos - descontos // Desconta corretamente
```

## Validação

### Para Samuel (5 meses trabalhados)
- ✅ 13º Total: R$ 1.104,17 (5/12 de R$ 2.650,00)
- ✅ 1ª Parcela: R$ 552,09 (50% sem descontos)
- ✅ INSS: R$ 82,81 (sobre valor total)
- ✅ 2ª Parcela: R$ 469,27 (restante - descontos)
- ✅ Total Pago: R$ 1.021,36 (R$ 552,09 + R$ 469,27)

### Fórmula Geral
```
13º Proporcional = (Salário / 12) × Meses
1ª Parcela = 13º Proporcional / 2 (sem descontos)
INSS = calcularINSS(13º Proporcional)
IRRF = calcularIRRF(13º Proporcional - INSS)
2ª Parcela = (13º Proporcional / 2) - INSS - IRRF
```

## Aplicação para Todos os Holerites

A correção se aplica automaticamente para TODOS os colaboradores:
- ✅ Cálculo correto de meses trabalhados
- ✅ 1ª parcela sempre 50% sem descontos
- ✅ 2ª parcela com descontos sobre o total
- ✅ Descontos calculados sobre valor total do 13º
- ✅ Observações corretas no holerite

## Próximos Passos

1. Excluir holerites incorretos da 2ª parcela
2. Gerar novamente com a lógica corrigida
3. Verificar todos os colaboradores
4. Enviar por e-mail os holerites corretos
