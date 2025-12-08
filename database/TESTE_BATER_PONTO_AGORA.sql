-- ============================================================================
-- TESTE: Simular batida de ponto manualmente
-- ============================================================================

-- 1. Ver dados do usuário que vai bater ponto
SELECT 
  u.id as app_user_id,
  u.auth_uid,
  u.nome,
  u.email,
  u.colaborador_id,
  c.nome as colaborador_nome,
  c.empresa_id
FROM app_users u
LEFT JOIN colaboradores c ON c.id = u.colaborador_id
WHERE u.email = 'samuel@qualitec.ind.br'; -- ALTERE AQUI

-- 2. Ver registros de ponto de hoje
SELECT 
  rp.*,
  c.nome as colaborador_nome
FROM registros_ponto rp
LEFT JOIN colaboradores c ON c.id = rp.colaborador_id
WHERE rp.data = CURRENT_DATE
ORDER BY rp.created_at DESC;

-- 3. Inserir um registro de ponto manualmente (TESTE)
-- DESCOMENTE PARA TESTAR:
/*
INSERT INTO registros_ponto (
  empresa_id,
  colaborador_id,
  data,
  entrada_1,
  status
)
SELECT 
  c.empresa_id,
  c.id,
  CURRENT_DATE,
  TO_CHAR(NOW(), 'HH24:MI'),
  'Normal'
FROM colaboradores c
JOIN app_users u ON u.colaborador_id = c.id
WHERE u.email = 'samuel@qualitec.ind.br' -- ALTERE AQUI
  AND NOT EXISTS (
    SELECT 1 FROM registros_ponto rp 
    WHERE rp.colaborador_id = c.id 
    AND rp.data = CURRENT_DATE
  );
*/

-- 4. Verificar se foi inserido
SELECT 
  rp.id,
  rp.data,
  rp.entrada_1,
  rp.saida_1,
  rp.entrada_2,
  rp.saida_2,
  rp.status,
  c.nome as colaborador
FROM registros_ponto rp
JOIN colaboradores c ON c.id = rp.colaborador_id
WHERE rp.data = CURRENT_DATE
ORDER BY rp.created_at DESC;

-- ============================================================================
-- SE O INSERT MANUAL FUNCIONAR, o problema está na API
-- SE O INSERT MANUAL FALHAR, o problema está nas políticas RLS
-- ============================================================================
