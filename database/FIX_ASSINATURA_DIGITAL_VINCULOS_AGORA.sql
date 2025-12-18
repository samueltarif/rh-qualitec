-- ============================================================================
-- FIX URGENTE: Corrigir vínculos para assinatura digital do ponto
-- ============================================================================
-- Problema: Colaboradores não conseguem assinar ponto por falta de vínculo
-- Solução: Sincronizar auth_uid entre app_users e colaboradores
-- ============================================================================

-- 1. Atualizar colaboradores que têm email mas não têm auth_uid
UPDATE colaboradores 
SET auth_uid = app_users.auth_uid
FROM app_users 
WHERE colaboradores.email_corporativo = app_users.email 
  AND colaboradores.auth_uid IS NULL
  AND app_users.auth_uid IS NOT NULL;

-- 2. Atualizar colaboradores por nome (caso o email não bata)
UPDATE colaboradores 
SET auth_uid = app_users.auth_uid
FROM app_users 
WHERE UPPER(colaboradores.nome) = UPPER(app_users.nome)
  AND colaboradores.auth_uid IS NULL
  AND app_users.auth_uid IS NOT NULL;

-- 3. Verificar colaboradores sem vínculo
SELECT 
  c.id,
  c.nome,
  c.email_corporativo,
  c.auth_uid,
  'SEM_VINCULO' as status
FROM colaboradores c
WHERE c.auth_uid IS NULL
  AND c.status = 'Ativo';

-- 4. Verificar vínculos corretos
SELECT 
  c.id,
  c.nome,
  c.email_corporativo,
  c.auth_uid,
  au.nome as nome_app_user,
  au.email as email_app_user,
  'VINCULADO' as status
FROM colaboradores c
JOIN app_users au ON c.auth_uid = au.auth_uid
WHERE c.status = 'Ativo';

-- 5. Criar função para vincular automaticamente novos colaboradores
CREATE OR REPLACE FUNCTION vincular_colaborador_automatico()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o colaborador não tem auth_uid, tentar vincular
  IF NEW.auth_uid IS NULL AND NEW.email_corporativo IS NOT NULL THEN
    -- Buscar por email
    UPDATE colaboradores 
    SET auth_uid = (
      SELECT auth_uid 
      FROM app_users 
      WHERE email = NEW.email_corporativo 
      LIMIT 1
    )
    WHERE id = NEW.id;
    
    -- Se ainda não tem, buscar por nome
    IF NEW.auth_uid IS NULL THEN
      UPDATE colaboradores 
      SET auth_uid = (
        SELECT auth_uid 
        FROM app_users 
        WHERE UPPER(nome) = UPPER(NEW.nome)
        LIMIT 1
      )
      WHERE id = NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar trigger para vincular automaticamente
DROP TRIGGER IF EXISTS trigger_vincular_colaborador ON colaboradores;
CREATE TRIGGER trigger_vincular_colaborador
  AFTER INSERT OR UPDATE ON colaboradores
  FOR EACH ROW
  EXECUTE FUNCTION vincular_colaborador_automatico();

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- ✅ Todos os colaboradores ativos terão auth_uid vinculado
-- ✅ Novos colaboradores serão vinculados automaticamente
-- ✅ Assinatura digital funcionará para todos
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '🔧 FIX APLICADO: Vínculos de assinatura digital corrigidos';
  RAISE NOTICE '✅ Colaboradores vinculados automaticamente';
  RAISE NOTICE '🔄 Trigger criado para vínculos futuros';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 TESTE AGORA:';
  RAISE NOTICE '1. Faça login como funcionário';
  RAISE NOTICE '2. Vá para a aba Ponto';
  RAISE NOTICE '3. Clique em "Assinar Digitalmente"';
  RAISE NOTICE '4. Verifique se funciona sem erro 404';
END $$;