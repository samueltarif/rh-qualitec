-- ============================================
-- VERIFICAR BENEFÍCIOS DOS COLABORADORES
-- ============================================

-- 1. Verificar se as colunas existem
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name = 'colaboradores' 
  AND column_name IN (
    'recebe_vt', 'valor_vt', 
    'recebe_vr', 'valor_vr', 
    'recebe_va', 'valor_va',
    'recebe_va_vr', 'valor_va_vr',
    'plano_saude', 'plano_odonto'
  )
ORDER BY column_name;

-- 2. Ver dados de benefícios dos colaboradores
SELECT 
  id,
  nome,
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
ORDER BY nome
LIMIT 10;

-- 3. Contar colaboradores com benefícios
SELECT 
  COUNT(*) as total_colaboradores,
  COUNT(CASE WHEN recebe_vt = true THEN 1 END) as com_vt,
  COUNT(CASE WHEN recebe_vr = true THEN 1 END) as com_vr,
  COUNT(CASE WHEN recebe_va = true THEN 1 END) as com_va,
  COUNT(CASE WHEN plano_saude = true THEN 1 END) as com_plano_saude,
  COUNT(CASE WHEN plano_odonto = true THEN 1 END) as com_plano_odonto
FROM colaboradores;

-- 4. Ver valores médios dos benefícios
SELECT 
  ROUND(AVG(CASE WHEN recebe_vt THEN valor_vt ELSE 0 END), 2) as media_vt,
  ROUND(AVG(CASE WHEN recebe_vr THEN valor_vr ELSE 0 END), 2) as media_vr,
  ROUND(AVG(CASE WHEN recebe_va THEN valor_va ELSE 0 END), 2) as media_va
FROM colaboradores;

-- 5. Buscar colaborador específico (substitua o nome)
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
  plano_saude,
  plano_odonto
FROM colaboradores
WHERE nome ILIKE '%samuel%'
   OR nome ILIKE '%maria%'
   OR nome ILIKE '%joao%'
LIMIT 5;

-- 6. Ver colaboradores SEM benefícios cadastrados
SELECT 
  id,
  nome,
  cargo,
  salario
FROM colaboradores
WHERE (recebe_vt IS NULL OR recebe_vt = false)
  AND (recebe_vr IS NULL OR recebe_vr = false)
  AND (recebe_va IS NULL OR recebe_va = false)
  AND (plano_saude IS NULL OR plano_saude = false)
  AND (plano_odonto IS NULL OR plano_odonto = false)
ORDER BY nome
LIMIT 10;

-- 7. Ver valores NULL (problemas potenciais)
SELECT 
  id,
  nome,
  CASE WHEN recebe_vt IS NULL THEN 'NULL' ELSE recebe_vt::text END as recebe_vt,
  CASE WHEN valor_vt IS NULL THEN 'NULL' ELSE valor_vt::text END as valor_vt,
  CASE WHEN recebe_va IS NULL THEN 'NULL' ELSE recebe_va::text END as recebe_va,
  CASE WHEN valor_va IS NULL THEN 'NULL' ELSE valor_va::text END as valor_va
FROM colaboradores
WHERE recebe_vt IS NULL 
   OR valor_vt IS NULL 
   OR recebe_va IS NULL 
   OR valor_va IS NULL
LIMIT 10;
