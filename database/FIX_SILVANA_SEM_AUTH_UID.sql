-- ============================================
-- FIX DEFINITIVO: SILVANA SEM AUTH_UID
-- ============================================
-- PROBLEMA: Silvana tem auth_uid = NULL
-- SOLUÇÃO: Preencher com o auth_uid correto

-- OPÇÃO 1: Se você está logado como Silvana AGORA
-- Execute este UPDATE enquanto logado como Silvana:
UPDATE app_users
SET auth_uid = auth.uid()
WHERE id = 'bb055400-5486-4464-9198-66ea33e166b7';

-- OPÇÃO 2: Se você NÃO está logado como Silvana
-- Primeiro, descubra o auth_uid dela no Supabase Auth:
-- 1. Vá em Authentication > Users no Supabase Dashboard
-- 2. Procure por silvana@qualitec.ind.br
-- 3. Copie o UUID (ID do usuário)
-- 4. Execute o UPDATE abaixo substituindo 'COLE_O_UUID_AQUI':

-- UPDATE app_users
-- SET auth_uid = 'COLE_O_UUID_AQUI'
-- WHERE id = 'bb055400-5486-4464-9198-66ea33e166b7';

-- VERIFICAR se foi atualizado
SELECT 
  id,
  nome,
  email,
  auth_uid,
  role,
  CASE 
    WHEN auth_uid IS NULL THEN '❌ AINDA NULL'
    ELSE '✅ PREENCHIDO'
  END as status
FROM app_users
WHERE id = 'bb055400-5486-4464-9198-66ea33e166b7';

-- ============================================
-- DEPOIS: Faça logout e login novamente
-- ============================================
