-- =====================================================
-- SINCRONIZAR NOMES ENTRE COLABORADORES E APP_USERS
-- =====================================================
-- Este script cria um trigger que mantém os nomes
-- sincronizados entre as tabelas colaboradores e app_users

-- 1. Criar função que sincroniza o nome
CREATE OR REPLACE FUNCTION sync_colaborador_nome_to_app_users()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar o nome em app_users quando o nome do colaborador mudar
  UPDATE app_users
  SET nome = NEW.nome
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Criar trigger que executa após UPDATE na tabela colaboradores
DROP TRIGGER IF EXISTS trigger_sync_colaborador_nome ON colaboradores;

CREATE TRIGGER trigger_sync_colaborador_nome
  AFTER UPDATE OF nome ON colaboradores
  FOR EACH ROW
  WHEN (OLD.nome IS DISTINCT FROM NEW.nome)
  EXECUTE FUNCTION sync_colaborador_nome_to_app_users();

-- 3. Sincronizar nomes existentes que estão diferentes
UPDATE app_users au
SET nome = c.nome
FROM colaboradores c
WHERE au.id = c.id
  AND au.nome != c.nome;

-- 4. Verificar sincronização
SELECT 
  c.id as colaborador_id,
  c.nome as nome_colaborador,
  au.nome as nome_app_users,
  CASE 
    WHEN c.nome = au.nome THEN '✅ Sincronizado'
    ELSE '❌ Diferente'
  END as status
FROM colaboradores c
LEFT JOIN app_users au ON c.id = au.id
WHERE au.id IS NOT NULL
ORDER BY c.nome;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- ✅ Trigger criado com sucesso
-- ✅ Nomes sincronizados
-- ✅ Quando você alterar o nome em colaboradores,
--    automaticamente será alterado em app_users
-- =====================================================
