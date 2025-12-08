-- ============================================================================
-- Verificar por que Samuel não aparece no modal de 13º salário
-- ============================================================================

-- 1. Verificar se Samuel existe na tabela colaboradores
SELECT 
  id,
  nome,
  cpf,
  email,
  status,
  salario_base,
  data_admissao,
  cargo,
  departamento,
  created_at
FROM colaboradores
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;

-- 2. Verificar todos os colaboradores ativos
SELECT 
  id,
  nome,
  cpf,
  status,
  salario_base,
  data_admissao
FROM colaboradores
WHERE status = 'ativo'
ORDER BY nome;

-- 3. Verificar se há algum problema com o status
SELECT 
  id,
  nome,
  status,
  CASE 
    WHEN status IS NULL THEN 'STATUS É NULL'
    WHEN status = '' THEN 'STATUS É VAZIO'
    WHEN status = 'ativo' THEN 'STATUS OK'
    ELSE 'STATUS DIFERENTE: ' || status
  END as status_check
FROM colaboradores
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;

-- 4. Verificar a estrutura da coluna status
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'colaboradores'
AND column_name = 'status';

-- 5. Contar colaboradores por status
SELECT 
  status,
  COUNT(*) as total
FROM colaboradores
GROUP BY status;

-- 6. Verificar se Samuel tem salário base
SELECT 
  id,
  nome,
  salario_base,
  CASE 
    WHEN salario_base IS NULL THEN 'SALÁRIO NULL'
    WHEN salario_base = 0 THEN 'SALÁRIO ZERO'
    WHEN salario_base > 0 THEN 'SALÁRIO OK: ' || salario_base::text
    ELSE 'SALÁRIO NEGATIVO'
  END as salario_check
FROM colaboradores
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;

-- 7. Verificar RLS (Row Level Security) na tabela colaboradores
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'colaboradores';

-- 8. Verificar políticas RLS ativas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'colaboradores';

-- 9. Tentar buscar Samuel sem filtro de status
SELECT 
  id,
  nome,
  cpf,
  email,
  status,
  salario_base
FROM colaboradores
WHERE nome ILIKE '%samuel%'
OR cpf LIKE '%433%';

-- 10. Verificar se há duplicatas
SELECT 
  nome,
  cpf,
  COUNT(*) as total
FROM colaboradores
GROUP BY nome, cpf
HAVING COUNT(*) > 1;
