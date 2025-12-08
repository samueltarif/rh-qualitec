-- Desabilitar triggers de notificação que estão causando erro
-- Execute este script no Supabase SQL Editor

-- Listar todos os triggers na tabela solicitacoes_alteracao_dados
SELECT 
  tgname as "Nome do Trigger",
  tgrelid::regclass as "Tabela",
  tgenabled as "Status"
FROM pg_trigger 
WHERE tgrelid = 'solicitacoes_alteracao_dados'::regclass
AND tgname NOT LIKE 'pg_%';

-- Desabilitar todos os triggers relacionados a notificações
DO $$
DECLARE
  trigger_rec RECORD;
  trigger_count INTEGER := 0;
BEGIN
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'solicitacoes_alteracao_dados'::regclass
    AND tgname NOT LIKE 'pg_%'
    AND tgname NOT LIKE 'RI_%'  -- Ignorar triggers de integridade referencial
    AND tgname NOT LIKE '%updated_at%'  -- Manter trigger de updated_at
    AND NOT tgisinternal  -- Ignorar triggers internos
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE solicitacoes_alteracao_dados DISABLE TRIGGER %I', trigger_rec.tgname);
      RAISE NOTICE 'Trigger % desabilitado', trigger_rec.tgname;
      trigger_count := trigger_count + 1;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Não foi possível desabilitar trigger %: %', trigger_rec.tgname, SQLERRM;
    END;
  END LOOP;
  
  IF trigger_count = 0 THEN
    RAISE NOTICE 'Nenhum trigger encontrado para desabilitar';
  ELSE
    RAISE NOTICE 'Total de triggers desabilitados: %', trigger_count;
  END IF;
END $$;

-- Verificar triggers após desabilitar
SELECT 
  tgname as "Nome do Trigger",
  CASE tgenabled
    WHEN 'O' THEN 'Habilitado'
    WHEN 'D' THEN 'Desabilitado'
    ELSE 'Outro'
  END as "Status"
FROM pg_trigger 
WHERE tgrelid = 'solicitacoes_alteracao_dados'::regclass
AND tgname NOT LIKE 'pg_%';
