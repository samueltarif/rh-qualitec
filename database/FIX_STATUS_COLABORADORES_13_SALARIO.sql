-- ============================================================================
-- FIX: Corrigir Status dos Colaboradores para 13º Salário
-- ============================================================================

-- SOLUÇÃO: Padronizar todos os status para 'Ativo' (com A maiúsculo)
-- para que a API consiga encontrar os colaboradores

-- 1. Corrigir Samuel especificamente
UPDATE colaboradores
SET 
  status = 'Ativo',
  updated_at = NOW()
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;

-- 2. Corrigir todos os colaboradores com status em minúsculo
UPDATE colaboradores
SET 
  status = 'Ativo',
  updated_at = NOW()
WHERE LOWER(status) = 'ativo'
AND status != 'Ativo';

-- 3. Corrigir colaboradores com status NULL (definir como Ativo se tiver salário)
UPDATE colaboradores
SET 
  status = 'Ativo',
  updated_at = NOW()
WHERE status IS NULL
AND salario_base > 0;

-- 4. Verificar resultado - Samuel
SELECT 
  id,
  nome,
  cpf,
  status,
  salario_base,
  CASE 
    WHEN status = 'Ativo' THEN '✅ CORRIGIDO - Aparecerá no modal de 13º'
    ELSE '❌ AINDA COM PROBLEMA'
  END as resultado
FROM colaboradores
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;

-- 5. Verificar todos os colaboradores ativos
SELECT 
  id,
  nome,
  cpf,
  status,
  salario_base,
  cargo,
  departamento
FROM colaboradores
WHERE status = 'Ativo'
ORDER BY nome;

-- 6. Contar colaboradores por status após correção
SELECT 
  status,
  COUNT(*) as total
FROM colaboradores
GROUP BY status
ORDER BY total DESC;

-- 7. Verificar se há colaboradores que ainda não aparecerão
SELECT 
  id,
  nome,
  status,
  'Não aparecerá no modal' as alerta
FROM colaboradores
WHERE status != 'Ativo' OR status IS NULL;
