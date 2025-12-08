-- Ver dados completos de um colaborador específico
SELECT
  id,
  nome,
  cpf,
  cargo,
  salario,
  recebe_vt,
  valor_vt,
  recebe_vr,
  valor_vr,
  recebe_va,
  valor_va,
  recebe_va_vr,
  valor_va_vr,
  plano_saude,
  plano_odonto
FROM colaboradores
WHERE nome ILIKE '%samuel%'
LIMIT 1;

-- Ver estrutura da tabela
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name = 'colaboradores'
  AND column_name LIKE '%v%'
ORDER BY column_name;
