-- ============================================================================
-- ✅ A CONSTRAINT JÁ EXISTE! Só falta adicionar o email
-- ============================================================================

-- Adicionar email do Samuel
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
-- ✅ PRONTO! Agora teste gerar o 13º salário
-- ============================================================================
