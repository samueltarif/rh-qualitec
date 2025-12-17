-- ============================================================================
-- CORREÇÃO: Vincular usuário ao colaborador correto
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- 1. Verificar o vínculo atual
SELECT 
  apu.id as app_user_id,
  apu.auth_uid,
  apu.email,
  apu.nome as app_user_nome,
  apu.colaborador_id,
  c.id as colaborador_real_id,
  c.nome as colaborador_nome
FROM app_users apu
LEFT JOIN colaboradores c ON apu.colaborador_id = c.id
WHERE apu.nome = 'LUCAS LUCAS';

-- 2. Encontrar o colaborador correto para LUCAS LUCAS
SELECT 
  id as colaborador_id,
  nome,
  email_corporativo,
  cpf
FROM colaboradores 
WHERE nome ILIKE '%LUCAS%'
ORDER BY created_at DESC;

-- ============================================================================
-- CORREÇÃO: Atualizar o vínculo
-- (Execute após identificar o colaborador_id correto)
-- ============================================================================

-- Substitua 'ID_DO_COLABORADOR_CORRETO' pelo ID do colaborador LUCAS LUCAS
UPDATE app_users 
SET colaborador_id = '27f2b3c8-c741-42ee-aa7e-da143e07c2ea'  -- ID do colaborador LUCAS LUCAS
WHERE nome = 'LUCAS LUCAS' 
  AND auth_uid = 'a14fd827-f595-4b98-a1e3-ec69acce439f';

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Verificar se o vínculo foi criado corretamente
SELECT 
  apu.id,
  apu.auth_uid,
  apu.email,
  apu.nome as usuario_nome,
  apu.colaborador_id,
  c.nome as colaborador_nome,
  c.email_corporativo
FROM app_users apu
LEFT JOIN colaboradores c ON apu.colaborador_id = c.id
WHERE apu.nome = 'LUCAS LUCAS';