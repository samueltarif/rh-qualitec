-- ============================================================================
-- DEBUG: Verificar estrutura e dados da tabela colaboradores
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- 1. Ver TODAS as colunas da tabela colaboradores
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'colaboradores'
ORDER BY ordinal_position;

-- 2. Ver um colaborador completo (todos os campos)
SELECT * FROM colaboradores LIMIT 1;

-- 3. Ver campos específicos que podem estar vazios
SELECT 
    id,
    nome,
    cpf,
    matricula,
    email_corporativo,
    celular,
    cargo_id,
    departamento_id,
    tipo_contrato,
    salario,
    data_admissao,
    data_nascimento,
    status,
    -- Endereço
    cep,
    logradouro,
    cidade,
    estado,
    -- Bancário
    banco_nome,
    agencia,
    conta,
    -- Benefícios
    recebe_vt,
    valor_vt,
    recebe_va_vr,
    valor_va_vr
FROM colaboradores
ORDER BY created_at DESC
LIMIT 3;

-- 4. Contar campos NULL por colaborador
SELECT 
    id,
    nome,
    -- Contar quantos campos estão NULL
    (CASE WHEN matricula IS NULL THEN 1 ELSE 0 END +
     CASE WHEN email_corporativo IS NULL THEN 1 ELSE 0 END +
     CASE WHEN celular IS NULL THEN 1 ELSE 0 END +
     CASE WHEN cargo_id IS NULL THEN 1 ELSE 0 END +
     CASE WHEN departamento_id IS NULL THEN 1 ELSE 0 END +
     CASE WHEN data_nascimento IS NULL THEN 1 ELSE 0 END +
     CASE WHEN data_admissao IS NULL THEN 1 ELSE 0 END +
     CASE WHEN salario IS NULL THEN 1 ELSE 0 END +
     CASE WHEN cep IS NULL THEN 1 ELSE 0 END +
     CASE WHEN banco_nome IS NULL THEN 1 ELSE 0 END) as campos_vazios
FROM colaboradores
ORDER BY created_at DESC;
