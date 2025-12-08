-- Corrigir foreign key constraint de notifications
-- Execute este script no Supabase SQL Editor

-- Passo 1: Tornar a coluna user_id NULLABLE (permitir NULL)
ALTER TABLE notifications 
ALTER COLUMN user_id DROP NOT NULL;

-- Passo 2: Remover a constraint de foreign key (se necessário)
DO $$
BEGIN
  -- Verificar se a constraint existe e removê-la
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'notifications_user_id_fkey' 
    AND table_name = 'notifications'
  ) THEN
    ALTER TABLE notifications DROP CONSTRAINT notifications_user_id_fkey;
    RAISE NOTICE 'Constraint notifications_user_id_fkey removida';
  ELSE
    RAISE NOTICE 'Constraint notifications_user_id_fkey não existe';
  END IF;
END $$;

-- Passo 3: Recriar a constraint como NULLABLE com ON DELETE SET NULL
ALTER TABLE notifications 
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- Passo 4: Verificar a estrutura final
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND column_name = 'user_id';
