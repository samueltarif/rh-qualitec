-- =====================================================
-- FIX: Atualizar Observações dos Holerites do 13º
-- =====================================================
-- Este script atualiza as observações dos holerites
-- para mostrar de forma mais clara os meses trabalhados
-- =====================================================

-- 1. Ver observações atuais
SELECT 
  id,
  nome_colaborador,
  meses_trabalhados,
  observacoes as observacao_atual
FROM holerites
WHERE tipo = 'decimo_terceiro'
  AND ano = 2025
ORDER BY nome_colaborador;

-- 2. Atualizar observações para formato mais claro
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

-- 3. Verificar resultado
SELECT 
  id,
  nome_colaborador,
  meses_trabalhados,
  observacoes as observacao_nova
FROM holerites
WHERE tipo = 'decimo_terceiro'
  AND ano = 2025
ORDER BY nome_colaborador;

-- =====================================================
-- EXEMPLOS DE RESULTADO ESPERADO:
-- =====================================================
-- 
-- Para 1 mês:
-- 13º Salário - 2ª Parcela (Com Descontos) - 2025
-- 1 Mês Trabalhado
--
-- Para 5 meses (Samuel):
-- 13º Salário - 2ª Parcela (Com Descontos) - 2025
-- 5 Meses Trabalhados
--
-- Para 12 meses:
-- 13º Salário - 2ª Parcela (Com Descontos) - 2025
-- 12 Meses Trabalhados
-- =====================================================
