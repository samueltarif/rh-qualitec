-- ============================================
-- 🚀 EXECUTAR AGORA - AUMENTAR RAIO PARA 10KM
-- ============================================
-- Isso vai permitir bater ponto de qualquer lugar
-- próximo (bom para testes)
-- ============================================

-- Ver situação atual
SELECT 
  nome,
  raio_metros as raio_atual_metros,
  ROUND(raio_metros / 1000.0, 2) as raio_atual_km,
  ativo
FROM locais_ponto;

-- Aumentar para 10km (10000 metros)
UPDATE locais_ponto 
SET 
  raio_metros = 10000,
  updated_at = NOW()
WHERE ativo = true;

-- Verificar após atualização
SELECT 
  nome,
  raio_metros as raio_novo_metros,
  ROUND(raio_metros / 1000.0, 2) as raio_novo_km,
  ativo,
  '✅ Agora permite até ' || ROUND(raio_metros / 1000.0, 2) || 'km de distância' as status
FROM locais_ponto;

-- ============================================
-- ✅ PRONTO!
-- ============================================
-- Agora peça para tentarem bater ponto novamente
-- Deve funcionar para:
-- - Sede (estava a 8.8km) ✅
-- - Escritório (estava a 0.9km) ✅
