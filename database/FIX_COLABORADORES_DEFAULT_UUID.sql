-- ============================================================================
-- CORREÇÃO URGENTE: Adicionar DEFAULT gen_random_uuid() na tabela colaboradores
-- Execute este SQL AGORA no Supabase SQL Editor
-- ============================================================================

-- 1. Adicionar o DEFAULT que está faltando
ALTER TABLE colaboradores 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2. Verificar se foi aplicado corretamente
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'colaboradores' 
  AND column_name = 'id';

-- 3. Testar inserção (descomente para testar)
/*
INSERT INTO colaboradores (empresa_id, nome, cpf) 
VALUES (
  (SELECT id FROM empresas LIMIT 1),
  'TESTE CORREÇÃO',
  '99999999999'
);

-- Ver se foi inserido com ID gerado automaticamente
SELECT id, nome, cpf FROM colaboradores WHERE nome = 'TESTE CORREÇÃO';

-- Remover o teste
DELETE FROM colaboradores WHERE nome = 'TESTE CORREÇÃO';
*/

-- ============================================================================
-- RESULTADO ESPERADO:
-- column_default deve mostrar: gen_random_uuid()
-- ============================================================================