-- ============================================
-- 🚀 EXECUTAR AGORA - COORDENADAS CORRETAS
-- ============================================
-- Sede Qualitec e Escritório WeWork
-- ============================================

-- Ver o que está cadastrado agora
SELECT 
  id,
  nome,
  latitude,
  longitude,
  raio_metros,
  ativo
FROM locais_ponto
ORDER BY nome;

-- ============================================
-- SEDE QUALITEC
-- ============================================
-- Endereço: Rua Herman Rechter, 14 - Vila Penteado
-- Coordenadas: -23.4828938, -46.7585612
-- ============================================

-- Deletar se existir
DELETE FROM locais_ponto WHERE nome = 'Sede Qualitec';

-- Inserir com coordenadas corretas
INSERT INTO locais_ponto (nome, descricao, latitude, longitude, raio_metros, ativo)
VALUES (
  'Sede Qualitec',
  'Qualitec Comércio e Serviços - Rua Herman Rechter, 14',
  -23.4828938,
  -46.7585612,
  100,  -- 100 metros de raio
  true
);

-- ============================================
-- ESCRITÓRIO WEWORK
-- ============================================
-- Endereço: Av. Nicolas Bôer, 399
-- Coordenadas: -23.5197977, -46.6796206
-- ============================================

-- Deletar se existir
DELETE FROM locais_ponto WHERE nome = 'Escritório' OR nome LIKE '%WeWork%';

-- Inserir com coordenadas corretas
INSERT INTO locais_ponto (nome, descricao, latitude, longitude, raio_metros, ativo)
VALUES (
  'Escritório WeWork',
  'WeWork Sala Comercial & Coworking - Av. Nicolas Bôer, 399',
  -23.5197977,
  -46.6796206,
  50,  -- 100 metros de raio
  true
);

-- ============================================
-- VERIFICAR APÓS CADASTRO
-- ============================================
SELECT 
  nome,
  descricao,
  latitude,
  longitude,
  raio_metros,
  ativo,
  '✅ Cadastrado corretamente' as status
FROM locais_ponto
ORDER BY nome;

-- ============================================
-- ✅ PRONTO!
-- ============================================
-- Agora peça para as pessoas tentarem bater ponto:
-- - Quem está na SEDE → deve mostrar 0-50m → ✅ Permite
-- - Quem está no ESCRITÓRIO → deve mostrar 0-50m → ✅ Permite
-- - Quem está fora → mostra >100m → ❌ Bloqueia
