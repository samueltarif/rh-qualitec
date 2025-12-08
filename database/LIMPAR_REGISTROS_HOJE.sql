-- ============================================================================
-- LIMPAR REGISTROS DE PONTO DE HOJE
-- Execute no Supabase SQL Editor
-- ============================================================================

-- Ver registros de hoje
SELECT 
  rp.id,
  c.nome as colaborador,
  rp.data,
  rp.entrada_1,
  rp.saida_1,
  rp.entrada_2,
  rp.saida_2,
  rp.entrada_3,
  rp.saida_3
FROM registros_ponto rp
JOIN colaboradores c ON c.id = rp.colaborador_id
WHERE rp.data = CURRENT_DATE
ORDER BY c.nome;

-- Deletar registros de hoje (CUIDADO!)
DELETE FROM registros_ponto
WHERE data = CURRENT_DATE;

-- Verificar se foi deletado
SELECT COUNT(*) as registros_hoje
FROM registros_ponto
WHERE data = CURRENT_DATE;

-- ============================================================================
-- PRONTO! Agora você pode registrar ponto novamente
-- ============================================================================
