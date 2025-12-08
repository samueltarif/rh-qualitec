-- Remover TODOS os triggers da tabela solicitacoes_alteracao_dados
-- Execute este script no Supabase SQL Editor

DO $$
DECLARE
  trigger_rec RECORD;
BEGIN
  -- Listar e remover todos os triggers (exceto os de sistema)
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'solicitacoes_alteracao_dados'::regclass
    AND tgname NOT LIKE 'pg_%'
    AND tgname NOT LIKE 'RI_%'
    AND NOT tgisinternal
  LOOP
    BEGIN
      EXECUTE format('DROP TRIGGER IF EXISTS %I ON solicitacoes_alteracao_dados', trigger_rec.tgname);
      RAISE NOTICE 'Trigger % removido', trigger_rec.tgname;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao remover trigger %: %', trigger_rec.tgname, SQLERRM;
    END;
  END LOOP;
END $$;

-- Verificar triggers restantes
SELECT 
  tgname as "Triggers Restantes",
  tgenabled as "Status"
FROM pg_trigger 
WHERE tgrelid = 'solicitacoes_alteracao_dados'::regclass
AND tgname NOT LIKE 'pg_%';
