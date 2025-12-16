-- ============================================================================
-- MIGRATION 32: ADICIONAR EMPRESA_ID NA TABELA APP_USERS
-- Simplificar consultas e melhorar performance
-- Execute no Supabase SQL Editor
-- ============================================================================

-- 1. ADICIONAR COLUNA EMPRESA_ID
ALTER TABLE app_users 
ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL;

-- 2. CRIAR ÍNDICE PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_app_users_empresa_id ON app_users(empresa_id);

-- 3. POPULAR EMPRESA_ID BASEADO NO COLABORADOR VINCULADO
UPDATE app_users 
SET empresa_id = c.empresa_id
FROM colaboradores c
WHERE app_users.colaborador_id = c.id
AND app_users.empresa_id IS NULL;

-- 4. POPULAR EMPRESA_ID PARA ADMINS (primeira empresa disponível)
UPDATE app_users 
SET empresa_id = (SELECT id FROM empresas ORDER BY created_at LIMIT 1)
WHERE role = 'admin' 
AND empresa_id IS NULL
AND EXISTS (SELECT 1 FROM empresas);

-- 5. VERIFICAR RESULTADO
SELECT 
    '=== RESULTADO DA MIGRAÇÃO ===' as titulo;

SELECT 
    role,
    COUNT(*) as total,
    COUNT(empresa_id) as com_empresa,
    COUNT(*) - COUNT(empresa_id) as sem_empresa
FROM app_users
GROUP BY role
ORDER BY role;

-- 6. MOSTRAR USUÁRIOS SEM EMPRESA (se houver)
SELECT 
    '=== USUÁRIOS SEM EMPRESA (precisam de correção) ===' as titulo;

SELECT 
    id,
    email,
    nome,
    role,
    colaborador_id,
    'Precisa definir empresa_id manualmente' as acao
FROM app_users
WHERE empresa_id IS NULL;

-- ============================================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================
COMMENT ON COLUMN app_users.empresa_id IS 'ID da empresa do usuário - simplifica consultas e melhora performance';

-- ============================================================================
-- FIM DA MIGRATION 32
-- ============================================================================