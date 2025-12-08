-- ============================================================================
-- FIX: ADICIONAR EMAIL DO SAMUEL NO COLABORADOR
-- Execute no Supabase SQL Editor
-- ============================================================================

-- Atualizar o email do Samuel no registro de colaborador
UPDATE colaboradores
SET email = 'samuel.tarif@gmail.com'
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38';

-- Verificar se foi atualizado
SELECT 
  id,
  nome,
  cpf,
  email,
  status
FROM colaboradores
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38';

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- O email deve aparecer como: samuel.tarif@gmail.com
-- ============================================================================
