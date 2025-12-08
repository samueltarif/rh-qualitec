# ⚡ EXECUTAR AGORA: Corrigir Observações dos Holerites

## 🎯 Problema

As observações dos holerites de 13º salário mostram quantidade errada de meses:

❌ **Antes:**
```
13º Salário - 2ª Parcela (Com Descontos) - 2025
6 Meses Trabalhados
```

✅ **Depois:**
```
13º Salário - 2ª Parcela (Com Descontos) - 2025
5 Meses Trabalhados
```

## 📋 Solução

### Opção 1: Executar SQL (Recomendado)

Copie e cole no SQL Editor do Supabase:

```sql
-- Função auxiliar para calcular meses trabalhados
CREATE OR REPLACE FUNCTION calcular_meses_trabalhados_correto(
  data_admissao DATE,
  ano_referencia INTEGER
) RETURNS INTEGER AS $$
DECLARE
  ano_admissao INTEGER;
  mes_admissao INTEGER;
  dia_admissao INTEGER;
  meses INTEGER;
BEGIN
  ano_admissao := EXTRACT(YEAR FROM data_admissao);
  mes_admissao := EXTRACT(MONTH FROM data_admissao);
  dia_admissao := EXTRACT(DAY FROM data_admissao);
  
  IF ano_admissao > ano_referencia THEN
    RETURN 0;
  END IF;
  
  IF ano_admissao < ano_referencia THEN
    RETURN 12;
  END IF;
  
  -- Regra CLT: até dia 15 conta o mês
  IF dia_admissao <= 15 THEN
    meses := 12 - mes_admissao + 1;
  ELSE
    meses := 12 - mes_admissao;
  END IF;
  
  RETURN meses;
END;
$$ LANGUAGE plpgsql;

-- Atualizar holerites
UPDATE holerites h
SET 
  meses_trabalhados = calcular_meses_trabalhados_correto(h.data_admissao, h.ano),
  observacoes = CASE 
    WHEN h.parcela_13 = '1' THEN 
      '13º Salário - 1ª Parcela (Adiantamento) - ' || h.ano || E'\n' || 
      calcular_meses_trabalhados_correto(h.data_admissao, h.ano) || 
      CASE 
        WHEN calcular_meses_trabalhados_correto(h.data_admissao, h.ano) = 1 THEN ' Mês Trabalhado'
        ELSE ' Meses Trabalhados'
      END
    WHEN h.parcela_13 = '2' THEN 
      '13º Salário - 2ª Parcela (Com Descontos) - ' || h.ano || E'\n' || 
      calcular_meses_trabalhados_correto(h.data_admissao, h.ano) || 
      CASE 
        WHEN calcular_meses_trabalhados_correto(h.data_admissao, h.ano) = 1 THEN ' Mês Trabalhado'
        ELSE ' Meses Trabalhados'
      END
    ELSE 
      '13º Salário - Parcela Integral - ' || h.ano || E'\n' || 
      calcular_meses_trabalhados_correto(h.data_admissao, h.ano) || 
      CASE 
        WHEN calcular_meses_trabalhados_correto(h.data_admissao, h.ano) = 1 THEN ' Mês Trabalhado'
        ELSE ' Meses Trabalhados'
      END
  END
WHERE 
  h.tipo = 'decimo_terceiro'
  AND h.data_admissao IS NOT NULL;
```

### Opção 2: Regerar Holerites

Se preferir, pode simplesmente:

1. Excluir os holerites antigos
2. Gerar novamente usando o botão "Gerar 13º Salário"

Os novos holerites já terão as observações corretas.

## 🔍 Verificar Resultado

Execute para ver os holerites corrigidos:

```sql
SELECT 
  nome_colaborador,
  data_admissao,
  ano,
  meses_trabalhados,
  observacoes
FROM holerites
WHERE tipo = 'decimo_terceiro'
  AND data_admissao IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

## ✅ Resultado Esperado

Para um colaborador admitido em **01/08/2025**:

- **Meses trabalhados:** 5 (agosto, setembro, outubro, novembro, dezembro)
- **Observações:** "13º Salário - 2ª Parcela (Com Descontos) - 2025\n5 Meses Trabalhados"

## 📝 Observação

A partir de agora, todos os novos holerites gerados já terão o cálculo correto automaticamente. Este SQL é apenas para corrigir os holerites antigos.
