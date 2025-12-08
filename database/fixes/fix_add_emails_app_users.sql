-- ============================================================================
-- FIX: Adicionar Colunas de Email em app_users
-- ============================================================================
-- Adiciona email_corporativo e email_pessoal na tabela app_users
-- para manter consistência com a tabela colaboradores
-- ============================================================================

-- 1. Adicionar colunas de email
ALTER TABLE app_users 
ADD COLUMN IF NOT EXISTS email_corporativo VARCHAR(255);

ALTER TABLE app_users 
ADD COLUMN IF NOT EXISTS email_pessoal VARCHAR(255);

-- 2. Criar índices para busca por email
CREATE INDEX IF NOT EXISTS idx_app_users_email_corporativo 
ON app_users(email_corporativo) 
WHERE email_corporativo IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_app_users_email_pessoal 
ON app_users(email_pessoal) 
WHERE email_pessoal IS NOT NULL;

-- 3. Migrar email existente para email_corporativo (se houver)
UPDATE app_users 
SET email_corporativo = email
WHERE email IS NOT NULL 
AND email_corporativo IS NULL;

-- 4. Comentários
COMMENT ON COLUMN app_users.email_corporativo IS 'Email corporativo do usuário (preferencial para comunicações)';
COMMENT ON COLUMN app_users.email_pessoal IS 'Email pessoal do usuário (alternativo)';

-- 5. Verificar estrutura atualizada
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'app_users'
AND column_name LIKE '%email%'
ORDER BY ordinal_position;

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- Deve mostrar:
-- - email (VARCHAR, NOT NULL) - Email original (para login)
-- - email_corporativo (VARCHAR, NULL) - Email corporativo
-- - email_pessoal (VARCHAR, NULL) - Email pessoal
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Colunas de email adicionadas em app_users!';
  RAISE NOTICE '📧 email_corporativo - Email corporativo (preferencial)';
  RAISE NOTICE '📧 email_pessoal - Email pessoal (alternativo)';
  RAISE NOTICE '📧 email - Email original (mantido para login)';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Agora app_users e colaboradores têm a mesma estrutura de emails';
END $$;
