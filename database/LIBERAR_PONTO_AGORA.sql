-- ============================================
-- 🚀 EXECUTAR AGORA - LIBERAR PONTO IMEDIATAMENTE
-- ============================================
-- Aumenta o raio para 10km para permitir bater ponto
-- de qualquer lugar enquanto você não pega as
-- coordenadas corretas
-- ============================================

-- Ver situação atual
SELECT 
  nome,
  latitude,
  longitude,
  raio_metros as raio_atual,
  ativo,
  '❌ Bloqueando - raio muito pequeno' as status
FROM locais_ponto;

-- SOLUÇÃO: Aumentar para 10km (10000 metros)
UPDATE locais_ponto 
SET 
  raio_metros = 10000,
  updated_at = NOW()
WHERE ativo = true;

-- Verificar após atualização
SELECT 
  nome,
  latitude,
  longitude,
  raio_metros as raio_novo,
  ROUND(raio_metros / 1000.0, 1) || 'km' as raio_km,
  ativo,
  '✅ Liberado - permite até ' || ROUND(raio_metros / 1000.0, 1) || 'km' as status
FROM locais_ponto;

-- ============================================
-- ✅ PRONTO! PEÇA PARA TENTAREM NOVAMENTE
-- ============================================
-- Agora qualquer pessoa a até 10km dos locais
-- cadastrados pode bater ponto
--
-- PRÓXIMO PASSO:
-- 1. Vá até cada local físico
-- 2. Pegue as coordenadas corretas no Google Maps
-- 3. Atualize no sistema
-- 4. Reduza o raio para 100-200 metros
