-- ============================================================================
-- VERIFICAR COLABORADOR PARA 13º SALÁRIO
-- ============================================================================

-- 1. Ver o colaborador específico que está dando erro
SELECT 
  id,
  nome,
  cpf,
  salario,
  cargo_id,
  departamento_id,
  data_admissao,
  status
FROM colaboradores
WHERE id = '3e37b565-9ce3-4917-851f-7d50e2669e6c';

-- 2. Ver com cargo e departamento
SELECT 
  c.id,
  c.nome,
  c.cpf,
  c.salario,
  car.nome as cargo_nome,
  dep.nome as departamento_nome,
  c.data_admissao
FROM colaboradores c
LEFT JOIN cargos car ON c.cargo_id = car.id
LEFT JOIN departamentos dep ON c.departamento_id = dep.id
WHERE c.id = '3e37b565-9ce3-4917-851f-7d50e2669e6c';

-- 3. Ver TODOS os colaboradores disponíveis
SELECT 
  c.id,
  c.nome,
  c.cpf,
  c.salario,
  car.nome as cargo_nome,
  dep.nome as departamento_nome,
  c.status
FROM colaboradores c
LEFT JOIN cargos car ON c.cargo_id = car.id
LEFT JOIN departamentos dep ON c.departamento_id = dep.id
ORDER BY c.nome;

-- 4. Verificar políticas RLS da tabela colaboradores
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

-- 5. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'colaboradores';
