-- ============================================
-- AJUSTAR RAIO DOS LOCAIS DE PONTO
-- ============================================
-- Aumentar o raio para 200 metros (mais realista)
-- ============================================

-- Ver locais atuais
SELECT 
  id,
  nome,
  latitude,
  longitude,
  raio_metros,
  ativo
FROM locais_ponto
ORDER BY nome;

-- Atualizar TODOS os locais para 200 metros
UPDATE locais_ponto 
SET 
  raio_metros = 200,
  updated_at = NOW()
WHERE ativo = true;

-- Verificar após atualização
SELECT 
  id,
  nome,
  descricao,
  latitude,
  longitude,
  raio_metros,
  ativo
FROM locais_ponto
ORDER BY nome;

-- ============================================
-- TESTE COM AS COORDENADAS ATUAIS
-- ============================================
-- Sede: 889m de distância
-- Escritório: 8825m de distância

-- Com 200m: ainda vai bloquear ambos
-- Sugestão: aumentar para 1000m (1km) ou desabilitar temporariamente

-- OPÇÃO 1: Aumentar para 1km (1000 metros)
UPDATE locais_ponto 
SET raio_metros = 1000
WHERE nome = 'Sede Qualitec';

-- OPÇÃO 2: Aumentar para 10km (10000 metros) - muito permissivo
UPDATE locais_ponto 
SET raio_metros = 10000
WHERE nome IN ('Sede Qualitec', 'Escritório');

-- OPÇÃO 3: Desabilitar verificação temporariamente
UPDATE locais_ponto 
SET ativo = false;

-- ============================================
-- RECOMENDAÇÃO
-- ============================================
-- Para testes: use 10km (10000 metros)
-- Para produção: use 100-200 metros e cadastre
-- as coordenadas EXATAS de cada local
