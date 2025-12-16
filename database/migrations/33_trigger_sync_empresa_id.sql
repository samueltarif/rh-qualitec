-- ============================================================================
-- MIGRATION 33: TRIGGER PARA SINCRONIZAR EMPRESA_ID AUTOMATICAMENTE
-- Manter app_users.empresa_id sempre sincronizado
-- Execute no Supabase SQL Editor
-- ============================================================================

-- 1. FUNÇÃO PARA SINCRONIZAR EMPRESA_ID
CREATE OR REPLACE FUNCTION sync_app_users_empresa_id()
RETURNS TRIGGER AS $
BEGIN
  -- Quando colaborador_id é atualizado em app_users
  IF TG_TABLE_NAME = 'app_users' THEN
    IF NEW.colaborador_id IS NOT NULL AND NEW.colaborador_id != OLD.colaborador_id THEN
      -- Buscar empresa_id do colaborador
      SELECT empresa_id INTO NEW.empresa_id
      FROM colaboradores 
      WHERE id = NEW.colaborador_id;
    END IF;
    RETURN NEW;
  END IF;

  -- Quando empresa_id é atualizada em colaboradores
  IF TG_TABLE_NAME = 'colaboradores' THEN
    -- Atualizar todos os app_users vinculados a este colaborador
    UPDATE app_users 
    SET empresa_id = NEW.empresa_id
    WHERE colaborador_id = NEW.id;
    
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$ LANGUAGE plpgsql;

-- 2. TRIGGER PARA APP_USERS (quando colaborador_id muda)
DROP TRIGGER IF EXISTS trigger_sync_empresa_id_app_users ON app_users;
CREATE TRIGGER trigger_sync_empresa_id_app_users
  BEFORE UPDATE ON app_users
  FOR EACH ROW
  WHEN (OLD.colaborador_id IS DISTINCT FROM NEW.colaborador_id)
  EXECUTE FUNCTION sync_app_users_empresa_id();

-- 3. TRIGGER PARA COLABORADORES (quando empresa_id muda)
DROP TRIGGER IF EXISTS trigger_sync_empresa_id_colaboradores ON colaboradores;
CREATE TRIGGER trigger_sync_empresa_id_colaboradores
  AFTER UPDATE ON colaboradores
  FOR EACH ROW
  WHEN (OLD.empresa_id IS DISTINCT FROM NEW.empresa_id)
  EXECUTE FUNCTION sync_app_users_empresa_id();

-- 4. FUNÇÃO PARA NOVOS USUÁRIOS (INSERT)
CREATE OR REPLACE FUNCTION set_empresa_id_new_user()
RETURNS TRIGGER AS $
BEGIN
  -- Se colaborador_id foi definido, buscar empresa_id
  IF NEW.colaborador_id IS NOT NULL THEN
    SELECT empresa_id INTO NEW.empresa_id
    FROM colaboradores 
    WHERE id = NEW.colaborador_id;
  END IF;
  
  -- Se ainda não tem empresa_id e é admin, usar primeira empresa
  IF NEW.empresa_id IS NULL AND NEW.role = 'admin' THEN
    SELECT id INTO NEW.empresa_id
    FROM empresas 
    ORDER BY created_at 
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- 5. TRIGGER PARA NOVOS USUÁRIOS
DROP TRIGGER IF EXISTS trigger_set_empresa_id_new_user ON app_users;
CREATE TRIGGER trigger_set_empresa_id_new_user
  BEFORE INSERT ON app_users
  FOR EACH ROW
  EXECUTE FUNCTION set_empresa_id_new_user();

-- 6. TESTE DOS TRIGGERS
SELECT 
    '=== TRIGGERS CRIADOS ===' as titulo;

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name LIKE '%empresa_id%'
ORDER BY event_object_table, trigger_name;

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================
COMMENT ON FUNCTION sync_app_users_empresa_id() IS 'Sincroniza empresa_id entre app_users e colaboradores automaticamente';
COMMENT ON FUNCTION set_empresa_id_new_user() IS 'Define empresa_id para novos usuários baseado no colaborador ou role';

-- ============================================================================
-- FIM DA MIGRATION 33
-- ============================================================================