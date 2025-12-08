-- ============================================
-- 🚀 AUMENTAR RAIO PARA 1KM (1000 METROS)
-- ============================================
-- Solução para GPS com precisão ruim
-- ============================================

-- Ver situação atual
SELECT 
  nome,
  latitude,
  longitude,
  raio_metros,
  ROUND(raio_metros / 1000.0, 2) || 'km' as raio_km,
  ativo
FROM locais_ponto
ORDER BY nome;

-- Aumentar para 1km (1000 metros)
UPDATE locais_ponto 
SET 
  raio_metros = 1000,
  updated_at = NOW()
WHERE ativo = true;

-- Verificar após atualização
SELECT 
  nome,
  latitude,
  longitude,
  raio_metros,
  ROUND(raio_metros / 1000.0, 2) || 'km' as raio_km,
  ativo,
  '✅ Permite até ' || ROUND(raio_metros / 1000.0, 2) || 'km de distância' as status
FROM locais_ponto
ORDER BY nome;

-- ============================================
-- ✅ PRONTO!
-- ============================================
-- Agora deve funcionar mesmo com GPS impreciso
-- - Sede: 890m → ✅ Dentro do raio de 1km
-- - Escritório: 390m → ✅ Dentro do raio de 1km
