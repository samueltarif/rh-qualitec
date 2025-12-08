-- =====================================================
-- SINCRONIZAR NOMES POR EMAIL
-- =====================================================
-- Como as tabelas usam IDs diferentes, vamos vincular por EMAIL

-- PASSO 1: Ver quais registros vão ser atualizados
SELECT 
  'ANTES' as momento,
  c.email_pessoal,
  c.nome as nome_colaborador,
  au.nome as nome_app_user_ANTES,
  CASE 
    WHEN c.nome != au.nome THEN '⚠️ VAI ATUALIZAR'
    ELSE '✅ JÁ IGUAL'
  END as acao
FROM colaboradores c
INNER JOIN app_users au ON LOWER(TRIM(c.email_pessoal)) = LOWER(TRIM(au.email))
WHERE c.email_pessoal IS NOT NULL 
  AND au.email IS NOT NULL
ORDER BY c.nome;

-- PASSO 2: ATUALIZAR os nomes em app_users baseado no email
UPDATE app_users au
SET 
  nome = c.nome,
  updated_at = NOW()
FROM colaboradores c
WHERE LOWER(TRIM(au.email)) = LOWER(TRIM(c.email_pessoal))
  AND c.email_pessoal IS NOT NULL
  AND au.email IS NOT NULL
  AND au.nome != c.nome;

-- PASSO 3: Ver o resultado
SELECT 
  'DEPOIS' as momento,
  c.email_pessoal,
  c.nome as nome_colaborador,
  au.nome as nome_app_user_DEPOIS,
  '✅ SINCRONIZADO' as status
FROM colaboradores c
INNER JOIN app_users au ON LOWER(TRIM(c.email_pessoal)) = LOWER(TRIM(au.email))
WHERE c.email_pessoal IS NOT NULL 
  AND au.email IS NOT NULL
ORDER BY c.nome;

-- PASSO 4: Criar trigger para sincronização automática por EMAIL
CREATE OR REPLACE FUNCTION sync_colaborador_nome_por_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar o nome em app_users quando o nome do colaborador mudar
  UPDATE app_users
  SET 
    nome = NEW.nome,
    updated_at = NOW()
  WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.email_pessoal))
    AND email IS NOT NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS trigger_sync_colaborador_nome_email ON colaboradores;

-- Criar novo trigger
CREATE TRIGGER trigger_sync_colaborador_nome_email
  AFTER UPDATE OF nome ON colaboradores
  FOR EACH ROW
  WHEN (OLD.nome IS DISTINCT FROM NEW.nome)
  EXECUTE FUNCTION sync_colaborador_nome_por_email();

-- RESUMO FINAL
SELECT 
  '✅ SINCRONIZAÇÃO POR EMAIL CONCLUÍDA' as status,
  COUNT(*) as total_sincronizados
FROM colaboradores c
INNER JOIN app_users au ON LOWER(TRIM(c.email_pessoal)) = LOWER(TRIM(au.email))
WHERE c.nome = au.nome
  AND c.email_pessoal IS NOT NULL
  AND au.email IS NOT NULL;
