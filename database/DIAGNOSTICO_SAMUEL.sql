-- ============================================================================
-- DIAGNÓSTICO COMPLETO DO SAMUEL
-- Execute cada passo no Supabase SQL Editor
-- ============================================================================

-- 1️⃣ VER O AUTH_UID DO SAMUEL NO SUPABASE AUTH
-- Vá em Authentication > Users e copie o UUID do samuel.tarif@gmail.com
-- Esse é o auth_uid que precisamos

-- 2️⃣ VER ESTADO ATUAL DO APP_USERS
SELECT 
  id,
  auth_uid,
  email,
  nome,
  colaborador_id,
  role
FROM app_users
WHERE email = 'samuel.tarif@gmail.com';

-- 3️⃣ VER SE O COLABORADOR EXISTE
SELECT id, nome, email_corporativo, cpf, matricula
FROM colaboradores
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38';

-- 4️⃣ VERIFICAR SE auth_uid ESTÁ CORRETO
-- Compare o auth_uid do passo 2 com o UUID do Authentication > Users
-- Se forem diferentes, o problema está aí!

-- ============================================================================
-- SOLUÇÃO: ATUALIZAR auth_uid E colaborador_id
-- ============================================================================
-- Substitua 'SEU_AUTH_UID_AQUI' pelo UUID do Authentication > Users

-- UPDATE app_users 
-- SET 
--   auth_uid = 'SEU_AUTH_UID_AQUI',
--   colaborador_id = '84165a85-616f-4709-9069-54cfd46d6a38'
-- WHERE email = 'samuel.tarif@gmail.com';
