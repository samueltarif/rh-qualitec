-- =====================================================
-- TRIGGER DE SINCRONIZAÇÃO ATUALIZADO (PÓS-UUID)
-- =====================================================
-- Versão simplificada que usa vínculo direto por ID
-- =====================================================

-- PASSO 1: Remover triggers antigos
DROP TRIGGER IF EXISTS trigger_sync_colaborador_nome ON colaboradores;
DROP TRIGGER IF EXISTS trigger_sync_colaborador_nome_email ON colaboradores;

-- PASSO 2: Remover funções antigas
DROP FUNCTION IF EXISTS sync_colaborador_nome_to_app_users();
DROP FUNCTION IF EXISTS sync_colaborador_nome_por_email();

-- PASSO 3: Criar função simplificada
CREATE OR REPLACE FUNCTION sync_colaborador_nome_uuid()
RETURNS TRIGGER AS $$
BEGIN
  -- Agora é simples: mesmo ID UUID!
  UPDATE app_users
  SET 
    nome = NEW.nome,
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASSO 4: Criar trigger atualizado
CREATE TRIGGER trigger_sync_colaborador_nome_uuid
  AFTER UPDATE OF nome ON colaboradores
  FOR EACH ROW
  WHEN (OLD.nome IS DISTINCT FROM NEW.nome)
  EXECUTE FUNCTION sync_colaborador_nome_uuid();

-- PASSO 5: Sincronizar nomes existentes
UPDATE app_users au
SET 
  nome = c.nome,
  updated_at = NOW()
FROM colaboradores c
WHERE au.id = c.id
  AND au.nome != c.nome;

-- PASSO 6: Verificar resultado
SELECT 
  '✅ TRIGGER ATUALIZADO' as status,
  c.id,
  c.nome as nome_colaborador,
  au.nome as nome_app_user,
  CASE 
    WHEN c.nome = au.nome THEN '✅ SINCRONIZADO'
    ELSE '❌ DIFERENTE'
  END as resultado
FROM colaboradores c
INNER JOIN app_users au ON c.id = au.id
ORDER BY c.nome;

-- PASSO 7: Testar trigger
SELECT '🧪 TESTE: Atualize um nome em colaboradores para testar o trigger' as instrucao;

-- Exemplo de teste (comentado):
-- UPDATE colaboradores SET nome = 'TESTE TRIGGER' WHERE id = (SELECT id FROM colaboradores LIMIT 1);
-- SELECT nome FROM app_users WHERE id = (SELECT id FROM colaboradores LIMIT 1);

SELECT '🎉 CONCLUÍDO! Trigger simplificado criado com sucesso!' as mensagem;
