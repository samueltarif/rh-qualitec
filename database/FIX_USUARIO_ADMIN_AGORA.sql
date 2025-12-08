-- ============================================================================
-- FIX RÁPIDO: Criar/Atualizar Usuário Admin para Gerar Holerites
-- ============================================================================
-- Execute este script no Supabase SQL Editor enquanto estiver logado
-- ============================================================================

-- Passo 1: Ver quem você é
SELECT 
  auth.uid() as meu_auth_uid,
  auth.email() as meu_email;

-- Passo 2: Ver se você já existe na app_users
SELECT 
  id,
  auth_uid,
  email,
  role,
  ativo
FROM app_users 
WHERE auth_uid = auth.uid();

-- Passo 3: Criar ou atualizar seu usuário como admin
INSERT INTO app_users (auth_uid, email, role, nome, ativo)
VALUES (
  auth.uid(),
  COALESCE(auth.email(), 'admin@qualitec.com'),
  'admin',
  'Administrador',
  true
)
ON CONFLICT (auth_uid) 
DO UPDATE SET 
  role = 'admin',
  ativo = true,
  updated_at = NOW();

-- Passo 4: Confirmar que funcionou
SELECT 
  '✅ SUCESSO!' as status,
  id,
  auth_uid,
  email,
  role,
  ativo
FROM app_users 
WHERE auth_uid = auth.uid();

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- Você deve ver:
-- status: ✅ SUCESSO!
-- role: admin
-- ativo: true
-- ============================================================================

-- Agora faça:
-- 1. Logout do sistema
-- 2. Login novamente
-- 3. Tente gerar holerites
-- ============================================================================
