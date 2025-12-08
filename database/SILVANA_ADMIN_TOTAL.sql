-- ============================================
-- SILVANA = ADMIN TOTAL - PODE FAZER TUDO!
-- ============================================

-- PASSO 1: GARANTIR QUE SILVANA É ADMIN
UPDATE app_users
SET 
  role = 'admin',
  ativo = true,
  updated_at = NOW()
WHERE LOWER(email) = 'silvana@qualitec.ind.br';

-- PASSO 2: CORRIGIR AUTH_UID (vínculo com Supabase Auth)
UPDATE app_users
SET 
  auth_uid = (
    SELECT id 
    FROM auth.users 
    WHERE LOWER(email) = 'silvana@qualitec.ind.br'
    LIMIT 1
  ),
  updated_at = NOW()
WHERE LOWER(email) = 'silvana@qualitec.ind.br';

-- PASSO 3: VINCULAR AO COLABORADOR (se existir)
UPDATE app_users
SET 
  colaborador_id = (
    SELECT id 
    FROM colaboradores 
    WHERE LOWER(email_corporativo) = 'silvana@qualitec.ind.br'
    LIMIT 1
  ),
  updated_at = NOW()
WHERE LOWER(email) = 'silvana@qualitec.ind.br'
  AND colaborador_id IS NULL;

-- PASSO 4: VERIFICAR RESULTADO
SELECT 
  '✅ SILVANA CONFIGURADA' AS status,
  u.id,
  u.auth_uid,
  u.nome,
  u.email,
  u.role,
  u.ativo,
  u.colaborador_id,
  CASE 
    WHEN u.role = 'admin' THEN '✅ É ADMIN'
    ELSE '❌ NÃO É ADMIN'
  END AS permissao,
  CASE 
    WHEN u.ativo = true THEN '✅ ATIVO'
    ELSE '❌ INATIVO'
  END AS status_ativo,
  CASE 
    WHEN u.auth_uid IS NOT NULL THEN '✅ AUTH OK'
    ELSE '❌ AUTH NULL'
  END AS status_auth
FROM app_users u
WHERE LOWER(u.email) = 'silvana@qualitec.ind.br';

-- ============================================
-- IMPORTANTE: SILVANA AGORA TEM ACESSO TOTAL!
-- ============================================
-- Como admin, ela pode:
-- ✅ Aprovar/Rejeitar solicitações
-- ✅ Gerenciar colaboradores
-- ✅ Gerar holerites
-- ✅ Configurar sistema
-- ✅ Ver todos os dados
-- ✅ Fazer TUDO no sistema!
