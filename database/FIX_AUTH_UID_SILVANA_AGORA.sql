-- ============================================
-- FIX URGENTE: CORRIGIR AUTH_UID DE SILVANA
-- ============================================
-- PROBLEMA: auth_uid de Silvana não corresponde ao auth.uid() atual
-- SOLUÇÃO: Atualizar auth_uid com o valor correto

-- PASSO 1: Ver o auth_uid atual da sessão
SELECT 
  auth.uid() as auth_uid_atual,
  'Este é o auth_uid correto' as nota;

-- PASSO 2: Ver o auth_uid de Silvana (ERRADO)
SELECT 
  id,
  nome,
  email,
  auth_uid as auth_uid_antigo,
  role
FROM app_users
WHERE email ILIKE '%silvana%';

-- PASSO 3: ATUALIZAR auth_uid de Silvana com o valor correto
-- ⚠️ IMPORTANTE: Execute este UPDATE enquanto estiver logado como Silvana!
UPDATE app_users
SET auth_uid = auth.uid()
WHERE email = 'silvana@qualitec.ind.br' 
   OR email ILIKE '%silvana%';

-- PASSO 4: CONFIRMAR que foi atualizado
SELECT 
  id,
  nome,
  email,
  auth_uid as auth_uid_novo,
  role,
  CASE 
    WHEN auth_uid = auth.uid() THEN '✅ CORRETO!'
    ELSE '❌ AINDA ERRADO'
  END as status
FROM app_users
WHERE email ILIKE '%silvana%';

-- ============================================
-- PRONTO! AGORA FAÇA LOGOUT E LOGIN NOVAMENTE
-- ============================================
