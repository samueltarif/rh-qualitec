-- =====================================================
-- FIX: Recalcular 2ª Parcela do 13º Salário
-- =====================================================
-- Este script corrige os holerites da 2ª parcela do 13º
-- que foram gerados com cálculos incorretos
-- =====================================================

-- 1. Ver holerites da 2ª parcela do 13º que precisam correção
SELECT 
  h.id,
  h.nome_colaborador,
  h.mes,
  h.ano,
  h.parcela_13,
  h.meses_trabalhados,
  h.salario_base,
  h.salario_bruto as "13º Total",
  h.total_proventos as "Proventos Mostrados",
  h.inss,
  h.irrf,
  h.total_descontos,
  h.salario_liquido as "Líquido Pago",
  -- Cálculo correto
  ROUND((h.salario_base / 12.0) * h.meses_trabalhados, 2) as "13º Correto",
  ROUND(((h.salario_base / 12.0) * h.meses_trabalhados) / 2, 2) as "1ª Parcela",
  ROUND(((h.salario_base / 12.0) * h.meses_trabalhados) / 2, 2) as "2ª Parcela (Proventos)"
FROM holerites h
WHERE h.tipo = 'decimo_terceiro'
  AND h.parcela_13 = '2'
  AND h.ano = 2025
ORDER BY h.nome_colaborador;

-- 2. Verificar meses trabalhados incorretos
-- (Colaboradores admitidos em agosto devem ter 5 meses, não 7)
SELECT 
  c.id,
  c.nome,
  c.data_admissao,
  EXTRACT(MONTH FROM c.data_admissao) as mes_admissao,
  -- Cálculo correto: 12 - mes_admissao + 1
  (12 - EXTRACT(MONTH FROM c.data_admissao) + 1) as meses_corretos,
  h.meses_trabalhados as meses_no_holerite,
  CASE 
    WHEN h.meses_trabalhados != (12 - EXTRACT(MONTH FROM c.data_admissao) + 1) 
    THEN '❌ INCORRETO'
    ELSE '✅ CORRETO'
  END as status
FROM colaboradores c
LEFT JOIN holerites h ON h.colaborador_id = c.id 
  AND h.tipo = 'decimo_terceiro' 
  AND h.ano = 2025
WHERE EXTRACT(YEAR FROM c.data_admissao) = 2025
  AND c.status = 'Ativo'
ORDER BY c.data_admissao;

-- 3. EXCLUIR holerites incorretos da 2ª parcela
-- (Para regenerar com cálculo correto)
DELETE FROM holerites
WHERE tipo = 'decimo_terceiro'
  AND parcela_13 = '2'
  AND ano = 2025;

-- 4. Verificar exclusão
SELECT 
  COUNT(*) as total_2parcela_restantes
FROM holerites
WHERE tipo = 'decimo_terceiro'
  AND parcela_13 = '2'
  AND ano = 2025;

-- Deve retornar 0 se a exclusão foi bem-sucedida

-- =====================================================
-- PRÓXIMOS PASSOS:
-- =====================================================
-- 1. Execute este script no Supabase SQL Editor
-- 2. Verifique os dados antes de excluir
-- 3. Após excluir, vá no sistema e gere novamente a 2ª parcela
-- 4. O sistema agora usará a lógica corrigida
-- =====================================================

-- =====================================================
-- EXEMPLO DE CÁLCULO CORRETO (Samuel)
-- =====================================================
-- Salário Base: R$ 2.650,00
-- Data Admissão: 01/08/2025 (agosto = mês 8)
-- Meses Trabalhados: 12 - 8 + 1 = 5 meses
-- 
-- 13º Proporcional: (2650 / 12) * 5 = R$ 1.104,17
-- 1ª Parcela: 1104,17 / 2 = R$ 552,09 (sem descontos)
-- INSS sobre total: R$ 82,81
-- IRRF sobre total: R$ 0,00 (isento)
-- 2ª Parcela Proventos: R$ 552,08
-- 2ª Parcela Líquido: 552,08 - 82,81 = R$ 469,27
-- =====================================================
