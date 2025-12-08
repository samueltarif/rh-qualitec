-- =====================================================
-- CORRIGIR VÍNCULOS ENTRE COLABORADORES E APP_USERS
-- =====================================================
-- Os IDs estão diferentes! Vamos vincular por EMAIL

-- PASSO 1: Ver os dados atuais
SELECT 
  'SITUAÇÃO ATUAL' as momento,
  c.id as id_colaborador,
  c.nome as nome_colaborador,
  c.email as email_colaborador,
  au.id as id_app_user,
  au.nome as nome_app_user,
  au.email as email_app_user
FROM colaboradores c
LEFT JOIN app_users au ON LOWER(c.email) = LOWER(au.email)
ORDER BY c.nome;

-- PASSO 2: Atualizar o ID dos colaboradores para corresponder ao app_users
-- Isso vai fazer o vínculo correto baseado no EMAIL
UPDATE colaboradores c
SET id = au.id
FROM app_users au
WHERE LOWER(c.email) = LOWER(au.email)
  AND c.id != au.id;

-- PASSO 3: Ver o resultado
SELECT 
  'DEPOIS DA CORREÇÃO' as momento,
  c.id as id_colaborador,
  c.nome as nome_colaborador,
  c.email as email_colaborador,
  au.id as id_app_user,
  au.nome as nome_app_user,
  au.email as email_app_user,
  CASE 
    WHEN c.id = au.id THEN '✅ VINCULADO'
    ELSE '❌ NÃO VINCULADO'
  END as status
FROM colaboradores c
LEFT JOIN app_users au ON c.id = au.id
ORDER BY c.nome;

-- PASSO 4: Sincronizar os NOMES agora que os IDs estão corretos
UPDATE app_users au
SET 
  nome = c.nome,
  updated_at = NOW()
FROM colaboradores c
WHERE au.id = c.id
  AND au.nome != c.nome;

-- PASSO 5: Verificação final
SELECT 
  '✅ RESULTADO FINAL' as status,
  c.id,
  c.nome as nome_colaborador,
  au.nome as nome_app_user,
  c.email,
  CASE 
    WHEN c.nome = au.nome THEN '✅ SINCRONIZADO'
    ELSE '⚠️ DIFERENTE'
  END as status_nome
FROM colaboradores c
INNER JOIN app_users au ON c.id = au.id
ORDER BY c.nome;

-- PASSO 6: Criar trigger para futuras atualizações
CREATE OR REPLACE FUNCTION sync_colaborador_nome_to_app_users()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE app_users
  SET 
    nome = NEW.nome,
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_colaborador_nome ON colaboradores;

CREATE TRIGGER trigger_sync_colaborador_nome
  AFTER UPDATE OF nome ON colaboradores
  FOR EACH ROW
  WHEN (OLD.nome IS DISTINCT FROM NEW.nome)
  EXECUTE FUNCTION sync_colaborador_nome_to_app_users();

SELECT '🎉 CONCLUÍDO! Vínculos corrigidos e trigger criado!' as mensagem;
