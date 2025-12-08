# ⚡ Aplicar Correção das Observações - 13º Salário

## 🎯 O que foi corrigido?

As observações agora mostram de forma mais clara:

**Antes:**
```
Meses trabalhados: 6/12
```

**Depois:**
```
6 Meses Trabalhados
```

## 🚀 Como Aplicar (2 opções)

### Opção 1: Atualizar Holerites Existentes (Rápido)

Execute no Supabase SQL Editor:

```sql
-- Atualizar observações
UPDATE holerites
SET observacoes = CONCAT(
  '13º Salário - ',
  CASE 
    WHEN parcela_13 = '1' THEN '1ª Parcela (Adiantamento)'
    WHEN parcela_13 = '2' THEN '2ª Parcela (Com Descontos)'
    ELSE 'Parcela Integral'
  END,
  ' - ', ano, E'\n',
  meses_trabalhados, ' ',
  CASE 
    WHEN meses_trabalhados = 1 THEN 'Mês Trabalhado'
    ELSE 'Meses Trabalhados'
  END
),
updated_at = NOW()
WHERE tipo = 'decimo_terceiro'
  AND ano = 2025;
```

### Opção 2: Regenerar Tudo (Completo)

1. **Excluir holerites:**
```sql
DELETE FROM holerites
WHERE tipo = 'decimo_terceiro'
  AND ano = 2025;
```

2. **Gerar novamente no sistema:**
   - Acesse Folha de Pagamento → 13º Salário
   - Selecione os colaboradores
   - Gere 1ª e 2ª parcelas novamente

## ✅ Verificar Resultado

```sql
SELECT 
  nome_colaborador,
  meses_trabalhados,
  observacoes
FROM holerites
WHERE tipo = 'decimo_terceiro'
  AND ano = 2025
ORDER BY nome_colaborador;
```

## 📊 Exemplos Esperados

| Meses | Observação |
|-------|-----------|
| 1 | 1 Mês Trabalhado |
| 5 | 5 Meses Trabalhados |
| 12 | 12 Meses Trabalhados |

---

**Recomendação**: Use a Opção 1 (mais rápido) se os valores dos holerites estão corretos.
