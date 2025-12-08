-- ============================================================================
-- FIX DEFINITIVO: Criar usuário admin usando EMAIL
-- ============================================================================

-- PASSO 1: Ver todos os usuários do Supabase Auth
SELECT 
  '📋 USUÁRIOS SUPABASE AUTH' as secao,
  id as auth_uid,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- ============================================================================
-- PASSO 2: COPIE o auth_uid do SEU email da lista acima
-- e cole no comando abaixo substituindo 'SEU_AUTH_UID_AQUI'
-- ============================================================================

-- Deletar usuário antigo se existir
DELETE FROM app_users WHERE email = 'admin@qualitec.com';

-- Criar usuário admin com o auth_uid correto
-- ⚠️ SUBSTITUA 'SEU_AUTH_UID_AQUI' pelo auth_uid que você copiou acima!
INSERT INTO app_users (auth_uid, email, role, nome, ativo, created_at, updated_at)
VALUES (
  'SEU_AUTH_UID_AQUI',  -- ⚠️ COLE O AUTH_UID AQUI
  'admin@qualitec.com',
  'admin',
  'Administrador',
  true,
  NOW(),
  NOW()
);

-- Confirmar
SELECT 
  '✅ USUÁRIO CRIADO' as status,
  id,
  auth_uid,
  email,
  role,
  ativo
FROM app_users 
WHERE email = 'admin@qualitec.com';

-- ============================================================================
-- DEPOIS:
-- 1. Logout do sistema
-- 2. Login novamente
-- 3. Tente gerar holerites
-- ============================================================================
