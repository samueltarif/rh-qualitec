-- ============================================================================
-- DESCOBRIR VALORES DO ENUM status_colaborador
-- ============================================================================

-- Ver os valores aceitos pelo enum
SELECT 
  n.nspname as schema,
  t.typname as enum_name,
  e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE t.typname = 'status_colaborador'
ORDER BY e.enumsortorder;

-- Ver TODOS os colaboradores SEM filtro de status
SELECT 
  c.id,
  c.nome,
  c.cpf,
  c.salario,
  c.status,
  car.nome as cargo_nome,
  dep.nome as departamento_nome,
  c.data_admissao
FROM colaboradores c
LEFT JOIN cargos car ON c.cargo_id = car.id
LEFT JOIN departamentos dep ON c.departamento_id = dep.id
ORDER BY c.nome;
