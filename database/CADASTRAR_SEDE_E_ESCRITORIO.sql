-- ============================================
-- CADASTRAR SEDE E ESCRITÓRIO SEPARADAMENTE
-- ============================================
-- Você precisa pegar as coordenadas REAIS de cada local
-- ============================================

-- PASSO 1: Ver o que está cadastrado agora
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
-- COMO PEGAR AS COORDENADAS CORRETAS:
-- ============================================
-- 1. Vá até a SEDE fisicamente
-- 2. Abra Google Maps no celular
-- 3. Toque e segure no local exato
-- 4. Copie as coordenadas que aparecem
-- 5. Cole abaixo

-- SEDE QUALITEC (EXEMPLO - SUBSTITUA PELAS COORDENADAS REAIS)
INSERT INTO locais_ponto (nome, descricao, latitude, longitude, raio_metros, ativo)
VALUES (
  'Sede Qualitec',
  'Escritório principal',
  -23.XXXXXX,  -- ⚠️ COLE A LATITUDE REAL DA SEDE AQUI
  -46.XXXXXX,  -- ⚠️ COLE A LONGITUDE REAL DA SEDE AQUI
  100,         -- 100 metros de raio
  true
)
ON CONFLICT (nome) 
DO UPDATE SET
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  raio_metros = EXCLUDED.raio_metros,
  updated_at = NOW();

-- ESCRITÓRIO (EXEMPLO - SUBSTITUA PELAS COORDENADAS REAIS)
INSERT INTO locais_ponto (nome, descricao, latitude, longitude, raio_metros, ativo)
VALUES (
  'Escritório',
  'Escritório secundário',
  -23.YYYYYY,  -- ⚠️ COLE A LATITUDE REAL DO ESCRITÓRIO AQUI
  -46.YYYYYY,  -- ⚠️ COLE A LONGITUDE REAL DO ESCRITÓRIO AQUI
  100,         -- 100 metros de raio
  true
)
ON CONFLICT (nome) 
DO UPDATE SET
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  raio_metros = EXCLUDED.raio_metros,
  updated_at = NOW();

-- ============================================
-- ALTERNATIVA: AUMENTAR O RAIO TEMPORARIAMENTE
-- ============================================
-- Se não puder ir até os locais agora, aumente o raio:

UPDATE locais_ponto 
SET raio_metros = 10000  -- 10km - muito permissivo
WHERE nome IN ('Sede Qualitec', 'Escritório');

-- ============================================
-- VERIFICAR APÓS CADASTRO
-- ============================================
SELECT 
  nome,
  latitude,
  longitude,
  raio_metros,
  ROUND(raio_metros / 1000.0, 2) || 'km' as raio_km,
  ativo
FROM locais_ponto
ORDER BY nome;
