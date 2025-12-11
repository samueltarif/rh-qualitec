-- VERIFICAR E CRIAR ASSINATURA PARA CARLOS
-- Este script verifica se Carlos tem assinatura e cria uma se necessário

-- 1. Verificar se Carlos tem assinatura existente
SELECT 
  'Verificando assinatura existente' as status,
  ap.*,
  c.nome as colaborador_nome
FROM assinaturas_ponto ap
JOIN colaboradores c ON ap.colaborador_id = c.id
WHERE c.nome ILIKE '%CARLOS%'
  AND ap.mes = 12 
  AND ap.ano = 2025;

-- 2. Verificar dados do colaborador Carlos
SELECT 
  'Dados do Carlos' as status,
  id,
  nome,
  cpf,
  auth_uid
FROM colaboradores 
WHERE nome ILIKE '%CARLOS%';

-- 3. Criar assinatura para Carlos se não existir
INSERT INTO assinaturas_ponto (
  colaborador_id,
  mes,
  ano,
  data_assinatura,
  ip_assinatura,
  user_agent,
  hash_assinatura,
  total_dias,
  total_horas,
  observacoes
)
SELECT 
  c.id,
  12,
  2025,
  NOW(),
  '192.168.1.100',
  'Sistema Web - Assinatura Digital',
  'HASH_' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)),
  3,
  24,
  'Assinatura digital realizada pelo sistema'
FROM colaboradores c
WHERE c.nome ILIKE '%CARLOS%'
  AND NOT EXISTS (
    SELECT 1 FROM assinaturas_ponto ap 
    WHERE ap.colaborador_id = c.id 
      AND ap.mes = 12 
      AND ap.ano = 2025
  );

-- 4. Verificar resultado final
SELECT 
  'Resultado final' as status,
  ap.id,
  ap.colaborador_id,
  ap.mes,
  ap.ano,
  ap.data_assinatura,
  ap.hash_assinatura,
  ap.total_dias,
  ap.total_horas,
  c.nome as colaborador_nome
FROM assinaturas_ponto ap
JOIN colaboradores c ON ap.colaborador_id = c.id
WHERE c.nome ILIKE '%CARLOS%'
  AND ap.mes = 12 
  AND ap.ano = 2025;