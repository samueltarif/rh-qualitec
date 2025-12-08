-- =====================================================
-- ATUALIZAR NOMES IMEDIATAMENTE
-- =====================================================
-- Este script força a atualização de TODOS os nomes
-- de app_users baseado nos nomes de colaboradores

-- PASSO 1: Ver o que vai ser alterado (ANTES)
SELECT 
  'ANTES DA ATUALIZAÇÃO' as momento,
  c.id,
  c.nome as nome_colaborador,
  au.nome as nome_app_user_ANTES,
  CASE 
    WHEN c.nome != au.nome THEN '⚠️ VAI ATUALIZAR'
    ELSE '✅ JÁ IGUAL'
  END as acao
FROM colaboradores c
INNER JOIN app_users au ON c.id = au.id
ORDER BY c.nome;

-- PASSO 2: ATUALIZAR TODOS OS NOMES
UPDATE app_users au
SET 
  nome = c.nome,
  updated_at = NOW()
FROM colaboradores c
WHERE au.id = c.id
  AND au.nome != c.nome;

-- PASSO 3: Ver o resultado (DEPOIS)
SELECT 
  'DEPOIS DA ATUALIZAÇÃO' as momento,
  c.id,
  c.nome as nome_colaborador,
  au.nome as nome_app_user_DEPOIS,
  CASE 
    WHEN c.nome = au.nome THEN '✅ SINCRONIZADO'
    ELSE '❌ AINDA DIFERENTE'
  END as status
FROM colaboradores c
INNER JOIN app_users au ON c.id = au.id
ORDER BY c.nome;

-- PASSO 4: Criar trigger para futuras atualizações
CREATE OR REPLACE FUNCTION sync_colaborador_nome_to_app_users()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar o nome em app_users quando o nome do colaborador mudar
  UPDATE app_users
  SET 
    nome = NEW.nome,
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS trigger_sync_colaborador_nome ON colaboradores;

-- Criar novo trigger
CREATE TRIGGER trigger_sync_colaborador_nome
  AFTER UPDATE OF nome ON colaboradores
  FOR EACH ROW
  WHEN (OLD.nome IS DISTINCT FROM NEW.nome)
  EXECUTE FUNCTION sync_colaborador_nome_to_app_users();

-- RESULTADO FINAL
SELECT 
  '✅ ATUALIZAÇÃO CONCLUÍDA' as status,
  COUNT(*) as total_sincronizados
FROM colaboradores c
INNER JOIN app_users au ON c.id = au.id
WHERE c.nome = au.nome;
