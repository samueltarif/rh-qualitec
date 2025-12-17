-- ============================================================================
-- FIX: Corrigir problema de ID NULL na tabela colaboradores
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- 1. Verificar a estrutura atual da tabela colaboradores
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'colaboradores' 
  AND column_name = 'id'
ORDER BY ordinal_position;

-- 2. Verificar se a função gen_random_uuid() está disponível
SELECT gen_random_uuid() as teste_uuid;

-- 3. Verificar se há registros com ID NULL
SELECT COUNT(*) as registros_com_id_null 
FROM colaboradores 
WHERE id IS NULL;

-- 4. Se necessário, corrigir a estrutura da tabela
-- (Execute apenas se o campo ID não tiver o default correto)

-- Garantir que a coluna ID tenha o default correto
ALTER TABLE colaboradores 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Garantir que a coluna ID seja NOT NULL
ALTER TABLE colaboradores 
ALTER COLUMN id SET NOT NULL;

-- 5. Se houver registros com ID NULL, corrigi-los
-- (Execute apenas se houver registros com ID NULL)
UPDATE colaboradores 
SET id = gen_random_uuid() 
WHERE id IS NULL;

-- 6. Verificar se a extensão uuid-ossp está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 7. Verificar novamente a estrutura
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'colaboradores' 
  AND column_name = 'id';

-- 8. Testar inserção de um registro de teste
-- (Remova o comentário para testar)
/*
INSERT INTO colaboradores (empresa_id, nome, cpf) 
VALUES (
  (SELECT id FROM empresas LIMIT 1),
  'TESTE - REMOVER',
  '00000000000'
);

-- Verificar se foi inserido com ID
SELECT id, nome, cpf FROM colaboradores WHERE nome = 'TESTE - REMOVER';

-- Remover o registro de teste
DELETE FROM colaboradores WHERE nome = 'TESTE - REMOVER';
*/

-- ============================================================================
-- RESULTADO ESPERADO:
-- - Campo ID deve ter default: gen_random_uuid()
-- - Campo ID deve ser NOT NULL
-- - Inserção deve funcionar sem especificar ID
-- ============================================================================