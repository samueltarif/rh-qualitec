-- SINCRONIZAÇÃO AUTOMÁTICA DE AUTH_UID
-- Unifica as tabelas app_users e colaboradores para usar o mesmo auth_uid

-- =============================================
-- 1. SINCRONIZAR AUTH_UID EXISTENTES
-- =============================================

-- Atualizar colaboradores com auth_uid dos app_users
UPDATE colaboradores 
SET auth_uid = au.auth_uid
FROM app_users au
WHERE au.colaborador_id = colaboradores.id
AND au.auth_uid IS NOT NULL
AND (colaboradores.auth_uid IS NULL OR colaboradores.auth_uid != au.auth_uid);

-- Verificar sincronização
SELECT 
  'SINCRONIZAÇÃO ATUAL' as status,
  COUNT(*) as total_colaboradores,
  COUNT(CASE WHEN auth_uid IS NOT NULL THEN 1 END) as com_auth_uid,
  COUNT(CASE WHEN auth_uid IS NULL THEN 1 END) as sem_auth_uid
FROM colaboradores;

-- =============================================
-- 2. FUNÇÃO PARA SINCRONIZAÇÃO AUTOMÁTICA
-- =============================================

-- Função que sincroniza auth_uid quando app_users é atualizado
CREATE OR REPLACE FUNCTION sync_auth_uid_colaboradores()
RETURNS TRIGGER AS $$
BEGIN
  -- Se auth_uid foi alterado no app_users, atualizar no colaboradores
  IF TG_OP = 'UPDATE' AND (OLD.auth_uid IS DISTINCT FROM NEW.auth_uid) THEN
    UPDATE colaboradores 
    SET auth_uid = NEW.auth_uid,
        updated_at = NOW()
    WHERE id = NEW.colaborador_id;
  END IF;
  
  -- Se novo app_users foi criado com colaborador_id, sincronizar
  IF TG_OP = 'INSERT' AND NEW.colaborador_id IS NOT NULL AND NEW.auth_uid IS NOT NULL THEN
    UPDATE colaboradores 
    SET auth_uid = NEW.auth_uid,
        updated_at = NOW()
    WHERE id = NEW.colaborador_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 3. TRIGGERS PARA SINCRONIZAÇÃO AUTOMÁTICA
-- =============================================

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS trigger_sync_auth_uid_colaboradores ON app_users;

-- Criar trigger para sincronizar quando app_users for alterado
CREATE TRIGGER trigger_sync_auth_uid_colaboradores
  AFTER INSERT OR UPDATE ON app_users
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_uid_colaboradores();

-- =============================================
-- 4. FUNÇÃO PARA SINCRONIZAÇÃO REVERSA
-- =============================================

-- Função que sincroniza auth_uid quando colaboradores é atualizado
CREATE OR REPLACE FUNCTION sync_auth_uid_app_users()
RETURNS TRIGGER AS $$
BEGIN
  -- Se auth_uid foi alterado no colaboradores, atualizar no app_users
  IF TG_OP = 'UPDATE' AND (OLD.auth_uid IS DISTINCT FROM NEW.auth_uid) THEN
    UPDATE app_users 
    SET auth_uid = NEW.auth_uid,
        updated_at = NOW()
    WHERE colaborador_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para sincronização reversa
DROP TRIGGER IF EXISTS trigger_sync_auth_uid_app_users ON colaboradores;

CREATE TRIGGER trigger_sync_auth_uid_app_users
  AFTER UPDATE ON colaboradores
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_uid_app_users();

-- =============================================
-- 5. FUNÇÃO PARA CRIAR USUÁRIO AUTOMATICAMENTE
-- =============================================

-- Função que cria app_users quando colaborador é criado com email
CREATE OR REPLACE FUNCTION auto_create_app_user()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Usar email corporativo ou pessoal
  user_email := COALESCE(NEW.email_corporativo, NEW.email_pessoal);
  
  -- Se tem email e não existe app_users, criar
  IF user_email IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM app_users WHERE colaborador_id = NEW.id
  ) THEN
    INSERT INTO app_users (
      colaborador_id,
      nome,
      email,
      role,
      auth_uid,
      ativo,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.nome,
      user_email,
      'funcionario',
      NEW.auth_uid, -- Usar o auth_uid do colaborador se existir
      true,
      NOW(),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar app_users automaticamente
DROP TRIGGER IF EXISTS trigger_auto_create_app_user ON colaboradores;

CREATE TRIGGER trigger_auto_create_app_user
  AFTER INSERT OR UPDATE ON colaboradores
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_app_user();

-- =============================================
-- 6. VERIFICAÇÃO E TESTE
-- =============================================

-- Verificar estado atual das sincronizações
SELECT 
  'VERIFICAÇÃO FINAL' as status,
  c.id as colaborador_id,
  c.nome as colaborador_nome,
  c.auth_uid as colaborador_auth_uid,
  au.id as app_user_id,
  au.auth_uid as app_user_auth_uid,
  CASE 
    WHEN c.auth_uid = au.auth_uid THEN '✅ SINCRONIZADO'
    WHEN c.auth_uid IS NULL AND au.auth_uid IS NOT NULL THEN '⚠️ COLABORADOR SEM AUTH_UID'
    WHEN c.auth_uid IS NOT NULL AND au.auth_uid IS NULL THEN '⚠️ APP_USER SEM AUTH_UID'
    ELSE '❌ DESSINCRONIZADO'
  END as status_sync
FROM colaboradores c
LEFT JOIN app_users au ON au.colaborador_id = c.id
ORDER BY c.nome;

-- Testar especificamente o usuário problema
SELECT 
  'USUÁRIO PROBLEMA CORRIGIDO' as status,
  c.nome,
  c.auth_uid,
  au.email,
  au.auth_uid,
  CASE WHEN c.auth_uid = au.auth_uid THEN '✅ OK' ELSE '❌ ERRO' END as resultado
FROM colaboradores c
JOIN app_users au ON au.colaborador_id = c.id
WHERE au.email = 'conta3secunndaria@gmail.com';

-- =============================================
-- 7. COMENTÁRIOS E DOCUMENTAÇÃO
-- =============================================

COMMENT ON FUNCTION sync_auth_uid_colaboradores() IS 'Sincroniza auth_uid de app_users para colaboradores automaticamente';
COMMENT ON FUNCTION sync_auth_uid_app_users() IS 'Sincroniza auth_uid de colaboradores para app_users automaticamente';
COMMENT ON FUNCTION auto_create_app_user() IS 'Cria app_users automaticamente quando colaborador é criado com email';

-- Resultado esperado: Todas as sincronizações devem mostrar ✅ SINCRONIZADO