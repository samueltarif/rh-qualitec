-- SOLUÇÃO FINAL: Remover TODOS os triggers e funções problemáticas
-- Execute este script no Supabase SQL Editor

-- Passo 1: Listar todos os triggers em solicitacoes_alteracao_dados
SELECT 
  tgname as "Trigger Name",
  pg_get_triggerdef(oid) as "Definition"
FROM pg_trigger 
WHERE tgrelid = 'solicitacoes_alteracao_dados'::regclass
AND tgname NOT LIKE 'pg_%'
AND tgname NOT LIKE 'RI_%';

-- Passo 2: Remover TODOS os triggers (exceto os de sistema)
DO $$
DECLARE
  trigger_rec RECORD;
BEGIN
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'solicitacoes_alteracao_dados'::regclass
    AND tgname NOT LIKE 'pg_%'
    AND tgname NOT LIKE 'RI_%'
    AND NOT tgisinternal
  LOOP
    BEGIN
      EXECUTE format('DROP TRIGGER IF EXISTS %I ON solicitacoes_alteracao_dados CASCADE', trigger_rec.tgname);
      RAISE NOTICE 'Trigger % removido', trigger_rec.tgname;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao remover trigger %: %', trigger_rec.tgname, SQLERRM;
    END;
  END LOOP;
END $$;

-- Passo 3: Remover função fn_criar_notificacao se existir
DROP FUNCTION IF EXISTS fn_criar_notificacao CASCADE;
DROP FUNCTION IF EXISTS public.fn_criar_notificacao CASCADE;

-- Passo 4: Verificar se ainda existem triggers
SELECT 
  tgname as "Triggers Restantes"
FROM pg_trigger 
WHERE tgrelid = 'solicitacoes_alteracao_dados'::regclass
AND tgname NOT LIKE 'pg_%'
AND tgname NOT LIKE 'RI_%';

-- Passo 5: Mensagem final
DO $$
BEGIN
  RAISE NOTICE 'Limpeza concluída! Tente aprovar a alteração novamente.';
END $$;
