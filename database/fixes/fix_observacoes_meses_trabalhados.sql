-- Corrigir observações dos holerites de 13º salário com meses trabalhados errados
-- Este script recalcula os meses trabalhados e atualiza as observações

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
  -- Extrair componentes da data
  ano_admissao := EXTRACT(YEAR FROM data_admissao);
  mes_admissao := EXTRACT(MONTH FROM data_admissao);
  dia_admissao := EXTRACT(DAY FROM data_admissao);
  
  -- Se foi admitido depois do ano em questão, não tem direito
  IF ano_admissao > ano_referencia THEN
    RETURN 0;
  END IF;
  
  -- Se foi admitido antes do ano em questão, trabalhou o ano todo
  IF ano_admissao < ano_referencia THEN
    RETURN 12;
  END IF;
  
  -- Trabalhou parte do ano - contar de mes_admissao até dezembro
  -- Regra CLT: se admitido até dia 15, conta o mês; se após dia 15, não conta
  IF dia_admissao <= 15 THEN
    meses := 12 - mes_admissao + 1;
  ELSE
    meses := 12 - mes_admissao;
  END IF;
  
  RETURN meses;
END;
$$ LANGUAGE plpgsql;

-- Atualizar holerites de 13º salário com meses trabalhados corretos
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

-- Mostrar resultado
SELECT 
  id,
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

-- Limpar função auxiliar (opcional)
-- DROP FUNCTION IF EXISTS calcular_meses_trabalhados_correto(DATE, INTEGER);
