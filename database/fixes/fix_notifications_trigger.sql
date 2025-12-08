-- Corrigir erro de notifications com dados_extras
-- Execute este script no Supabase SQL Editor

-- Verificar se existe a tabela notifications
DO $$ 
BEGIN
  -- Se a tabela notifications existir, adicionar a coluna dados_extras
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    -- Adicionar coluna dados_extras se não existir
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'notifications' AND column_name = 'dados_extras'
    ) THEN
      ALTER TABLE notifications ADD COLUMN dados_extras JSONB DEFAULT '{}'::jsonb;
      RAISE NOTICE 'Coluna dados_extras adicionada à tabela notifications';
    ELSE
      RAISE NOTICE 'Coluna dados_extras já existe';
    END IF;
  ELSE
    RAISE NOTICE 'Tabela notifications não existe';
  END IF;
  
  -- Verificar se existe trigger que cria notifications
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname LIKE '%notification%' 
    AND tgrelid = 'solicitacoes_alteracao_dados'::regclass
  ) THEN
    RAISE NOTICE 'Encontrado trigger de notificação em solicitacoes_alteracao_dados';
    -- Listar triggers
    SELECT tgname, tgrelid::regclass 
    FROM pg_trigger 
    WHERE tgrelid = 'solicitacoes_alteracao_dados'::regclass;
  ELSE
    RAISE NOTICE 'Nenhum trigger de notificação encontrado';
  END IF;
END $$;

-- Verificar estrutura da tabela notifications se existir
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notifications'
ORDER BY ordinal_position;
