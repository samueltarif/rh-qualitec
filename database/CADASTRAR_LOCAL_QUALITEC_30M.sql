-- ============================================
-- CADASTRAR LOCAL QUALITEC COM 30 METROS
-- ============================================
-- Coordenadas: -23.482782095366336, -46.758626422116876
-- Raio: 30 metros
-- ============================================

-- 1. Atualizar o local padrão (se já existe)
UPDATE locais_ponto 
SET 
  nome = 'Sede Qualitec',
  descricao = 'Escritório principal - Localização exata',
  latitude = -23.482782095366336,
  longitude = -46.758626422116876,
  raio_metros = 30,
  ativo = true,
  updated_at = NOW()
WHERE nome = 'Sede Qualitec';

-- 2. Se não existir, inserir novo
INSERT INTO locais_ponto (nome, descricao, latitude, longitude, raio_metros, ativo)
SELECT 
  'Sede Qualitec',
  'Escritório principal - Localização exata',
  -23.482782095366336,
  -46.758626422116876,
  30,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM locais_ponto WHERE nome = 'Sede Qualitec'
);

-- 3. Verificar se foi cadastrado
SELECT 
  id,
  nome,
  descricao,
  latitude,
  longitude,
  raio_metros,
  ativo,
  created_at
FROM locais_ponto
WHERE nome = 'Sede Qualitec';

-- ============================================
-- TESTE: Verificar se você está no raio
-- ============================================
-- Cole suas coordenadas atuais aqui para testar:

SELECT * FROM verificar_local_permitido(
  -23.482782095366336,  -- Sua latitude atual
  -46.758626422116876   -- Sua longitude atual
);

-- Resultado esperado:
-- local_id | local_nome    | distancia | dentro_raio
-- ---------|---------------|-----------|-------------
-- [uuid]   | Sede Qualitec | 0         | true

-- ============================================
-- TESTE: Simular alguém a 20 metros
-- ============================================
SELECT * FROM verificar_local_permitido(
  -23.482962,  -- ~20m de distância
  -46.758626
);
-- Resultado: dentro_raio = true (está dentro dos 30m)

-- ============================================
-- TESTE: Simular alguém a 50 metros
-- ============================================
SELECT * FROM verificar_local_permitido(
  -23.483232,  -- ~50m de distância
  -46.758626
);
-- Resultado: dentro_raio = false (fora dos 30m)

-- ============================================
-- PRONTO! ✅
-- ============================================
-- Agora os funcionários só podem bater ponto
-- se estiverem a até 30 metros deste local!
