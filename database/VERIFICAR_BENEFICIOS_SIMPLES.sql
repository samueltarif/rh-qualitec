-- ============================================
-- VERIFICAR BENEFÍCIOS - VERSÃO SIMPLES
-- ============================================

-- 1. Ver TODAS as colunas da tabela colaboradores
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name = 'colaboradores'
ORDER BY ordinal_position;

-- 2. Verificar se as colunas de benefícios existem
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

-- 3. Ver dados básicos dos colaboradores (SEM campo cargo)
SELECT 
  id,
  nome,
  cpf,
  salario,
  recebe_vt,
  valor_vt,
  recebe_vr,
  valor_vr,
  recebe_va,
  valor_va
FROM colaboradores
ORDER BY nome
LIMIT 5;

-- 4. Contar colaboradores com benefícios
SELECT 
  COUNT(*) as total_colaboradores,
  COUNT(CASE WHEN recebe_vt = true THEN 1 END) as com_vt,
  COUNT(CASE WHEN recebe_vr = true THEN 1 END) as com_vr,
  COUNT(CASE WHEN recebe_va = true THEN 1 END) as com_va,
  COUNT(CASE WHEN plano_saude = true THEN 1 END) as com_plano_saude,
  COUNT(CASE WHEN plano_odonto = true THEN 1 END) as com_plano_odonto
FROM colaboradores;

-- 5. Ver um colaborador específico (substitua o nome)
SELECT 
  id,
  nome,
  cpf,
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
LIMIT 1;
