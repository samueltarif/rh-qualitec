-- ADICIONAR COLUNA AUTH_UID NA TABELA COLABORADORES
-- E SINCRONIZAR COM APP_USERS

-- =============================================
-- PASSO 1: VERIFICAR SE COLUNA JÁ EXISTE
-- =============================================

-- Verificar estrutura atual da tabela colaboradores
SELECT 
  'ESTRUTURA ATUAL' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'colaboradores' 
AND column_name = 'auth_uid';

-- =============================================
-- PASSO 2: ADICIONAR COLUNA AUTH_UID
-- =============================================

-- Adicionar coluna auth_uid se não existir
ALTER TABLE colaboradores 
ADD COLUMN IF NOT EXISTS auth_uid UUID;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_colaboradores_auth_uid ON colaboradores(auth_uid);

-- =============================================
-- PASSO 3: SINCRONIZAR COM APP_USERS
-- =============================================

-- Atualizar colaboradores com auth_uid dos app_users
UPDATE colaboradores 
SET auth_uid = au.auth_uid
FROM app_users au
WHERE au.colaborador_id = colaboradores.id
AND au.auth_uid IS NOT NULL;

-- =============================================
-- PASSO 4: VERIFICAR SINCRONIZAÇÃO
-- =============================================

-- Verificar se a coluna foi criada
SELECT 
  'COLUNA CRIADA' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'colaboradores' 
AND column_name = 'auth_uid';

-- Verificar sincronização
SELECT 
  'SINCRONIZAÇÃO' as status,
  c.id,
  c.nome,
  c.auth_uid as colaborador_auth_uid,
  au.auth_uid as app_user_auth_uid,
  CASE 
    WHEN c.auth_uid = au.auth_uid THEN '✅ SINCRONIZADO'
    WHEN c.auth_uid IS NULL THEN '⚠️ SEM AUTH_UID'
    ELSE '❌ DESSINCRONIZADO'
  END as resultado
FROM colaboradores c
LEFT JOIN app_users au ON au.colaborador_id = c.id
ORDER BY c.nome;

-- =============================================
-- PASSO 5: TESTAR USUÁRIO ESPECÍFICO
-- =============================================

-- Verificar o usuário que estava com problema
SELECT 
  'USUÁRIO PROBLEMA' as teste,
  c.nome,
  c.auth_uid,
  au.email,
  au.auth_uid
FROM colaboradores c
JOIN app_users au ON au.colaborador_id = c.id
WHERE au.email = 'conta3secunndaria@gmail.com';

-- =============================================
-- PASSO 6: TESTAR CONSULTA DE CURSOS
-- =============================================

-- Testar se agora a consulta de cursos funciona
SELECT 
  'TESTE CURSOS' as teste,
  ca.id,
  ca.colaborador_id,
  ca.curso_id,
  ca.status,
  ca.progresso,
  c.titulo as curso_titulo,
  col.nome as funcionario_nome
FROM cursos_atribuicoes ca
JOIN cursos c ON c.id = ca.curso_id
JOIN colaboradores col ON col.id = ca.colaborador_id
WHERE col.auth_uid = '45379c68-2e7d-4f00-bbef-a0c2eb7be291';

-- =============================================
-- RESULTADO ESPERADO
-- =============================================

SELECT 
  'RESULTADO ESPERADO' as info,
  'Coluna auth_uid criada na tabela colaboradores' as passo1,
  'Dados sincronizados com app_users' as passo2,
  'Cursos devem aparecer no painel do funcionário' as passo3;