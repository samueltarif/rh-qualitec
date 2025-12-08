-- ============================================================================
-- DEBUG DETALHADO: Ver campos preenchidos vs vazios por colaborador
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- 1. RELATÓRIO DETALHADO - Mostra status de cada campo (✓ ou ✗)
SELECT 
    id,
    nome,
    '--- DADOS PESSOAIS ---' as secao1,
    CASE WHEN cpf IS NOT NULL AND cpf != '' THEN '✓ ' || cpf ELSE '✗ VAZIO' END as cpf_status,
    CASE WHEN matricula IS NOT NULL AND matricula != '' THEN '✓ ' || matricula ELSE '✗ VAZIO' END as matricula_status,
    CASE WHEN email_corporativo IS NOT NULL AND email_corporativo != '' THEN '✓ ' || email_corporativo ELSE '✗ VAZIO' END as email_status,
    CASE WHEN celular IS NOT NULL AND celular != '' THEN '✓ ' || celular ELSE '✗ VAZIO' END as celular_status,
    CASE WHEN data_nascimento IS NOT NULL THEN '✓ ' || data_nascimento::text ELSE '✗ VAZIO' END as nascimento_status,
    '--- TRABALHO ---' as secao2,
    CASE WHEN cargo_id IS NOT NULL THEN '✓ ' || cargo_id::text ELSE '✗ VAZIO' END as cargo_status,
    CASE WHEN departamento_id IS NOT NULL THEN '✓ ' || departamento_id::text ELSE '✗ VAZIO' END as depto_status,
    CASE WHEN tipo_contrato IS NOT NULL THEN '✓ ' || tipo_contrato::text ELSE '✗ VAZIO' END as contrato_status,
    CASE WHEN salario IS NOT NULL THEN '✓ R$ ' || salario::text ELSE '✗ VAZIO' END as salario_status,
    CASE WHEN data_admissao IS NOT NULL THEN '✓ ' || data_admissao::text ELSE '✗ VAZIO' END as admissao_status,
    '--- ENDEREÇO ---' as secao3,
    CASE WHEN cep IS NOT NULL AND cep != '' THEN '✓ ' || cep ELSE '✗ VAZIO' END as cep_status,
    CASE WHEN logradouro IS NOT NULL AND logradouro != '' THEN '✓ ' || logradouro ELSE '✗ VAZIO' END as logradouro_status,
    CASE WHEN numero IS NOT NULL AND numero != '' THEN '✓ ' || numero ELSE '✗ VAZIO' END as numero_status,
    CASE WHEN bairro IS NOT NULL AND bairro != '' THEN '✓ ' || bairro ELSE '✗ VAZIO' END as bairro_status,
    CASE WHEN cidade IS NOT NULL AND cidade != '' THEN '✓ ' || cidade ELSE '✗ VAZIO' END as cidade_status,
    CASE WHEN estado IS NOT NULL AND estado != '' THEN '✓ ' || estado ELSE '✗ VAZIO' END as estado_status,
    '--- BANCÁRIO ---' as secao4,
    CASE WHEN banco_nome IS NOT NULL AND banco_nome != '' THEN '✓ ' || banco_nome ELSE '✗ VAZIO' END as banco_status,
    CASE WHEN agencia IS NOT NULL AND agencia != '' THEN '✓ ' || agencia ELSE '✗ VAZIO' END as agencia_status,
    CASE WHEN conta IS NOT NULL AND conta != '' THEN '✓ ' || conta ELSE '✗ VAZIO' END as conta_status,
    CASE WHEN pix IS NOT NULL AND pix != '' THEN '✓ ' || pix ELSE '✗ VAZIO' END as pix_status,
    '--- BENEFÍCIOS ---' as secao5,
    CASE WHEN recebe_vt IS NOT NULL THEN '✓ ' || recebe_vt::text ELSE '✗ VAZIO' END as vt_status,
    CASE WHEN valor_vt IS NOT NULL THEN '✓ R$ ' || valor_vt::text ELSE '✗ VAZIO' END as valor_vt_status,
    CASE WHEN recebe_va_vr IS NOT NULL THEN '✓ ' || recebe_va_vr::text ELSE '✗ VAZIO' END as va_vr_status,
    CASE WHEN valor_va_vr IS NOT NULL THEN '✓ R$ ' || valor_va_vr::text ELSE '✗ VAZIO' END as valor_va_vr_status
FROM colaboradores
ORDER BY created_at DESC;


-- ============================================================================
-- 2. RESUMO POR COLABORADOR - Contagem de campos preenchidos vs vazios
-- ============================================================================
SELECT 
    id,
    nome,
    -- Campos preenchidos
    (CASE WHEN cpf IS NOT NULL AND cpf != '' THEN 1 ELSE 0 END +
     CASE WHEN matricula IS NOT NULL AND matricula != '' THEN 1 ELSE 0 END +
     CASE WHEN email_corporativo IS NOT NULL AND email_corporativo != '' THEN 1 ELSE 0 END +
     CASE WHEN celular IS NOT NULL AND celular != '' THEN 1 ELSE 0 END +
     CASE WHEN data_nascimento IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN cargo_id IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN departamento_id IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN tipo_contrato IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN salario IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN data_admissao IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN cep IS NOT NULL AND cep != '' THEN 1 ELSE 0 END +
     CASE WHEN logradouro IS NOT NULL AND logradouro != '' THEN 1 ELSE 0 END +
     CASE WHEN cidade IS NOT NULL AND cidade != '' THEN 1 ELSE 0 END +
     CASE WHEN estado IS NOT NULL AND estado != '' THEN 1 ELSE 0 END +
     CASE WHEN banco_nome IS NOT NULL AND banco_nome != '' THEN 1 ELSE 0 END +
     CASE WHEN agencia IS NOT NULL AND agencia != '' THEN 1 ELSE 0 END +
     CASE WHEN conta IS NOT NULL AND conta != '' THEN 1 ELSE 0 END) as campos_preenchidos,
    -- Total de campos verificados
    17 as total_campos,
    -- Porcentagem
    ROUND(
        (CASE WHEN cpf IS NOT NULL AND cpf != '' THEN 1 ELSE 0 END +
         CASE WHEN matricula IS NOT NULL AND matricula != '' THEN 1 ELSE 0 END +
         CASE WHEN email_corporativo IS NOT NULL AND email_corporativo != '' THEN 1 ELSE 0 END +
         CASE WHEN celular IS NOT NULL AND celular != '' THEN 1 ELSE 0 END +
         CASE WHEN data_nascimento IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN cargo_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN departamento_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN tipo_contrato IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN salario IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN data_admissao IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN cep IS NOT NULL AND cep != '' THEN 1 ELSE 0 END +
         CASE WHEN logradouro IS NOT NULL AND logradouro != '' THEN 1 ELSE 0 END +
         CASE WHEN cidade IS NOT NULL AND cidade != '' THEN 1 ELSE 0 END +
         CASE WHEN estado IS NOT NULL AND estado != '' THEN 1 ELSE 0 END +
         CASE WHEN banco_nome IS NOT NULL AND banco_nome != '' THEN 1 ELSE 0 END +
         CASE WHEN agencia IS NOT NULL AND agencia != '' THEN 1 ELSE 0 END +
         CASE WHEN conta IS NOT NULL AND conta != '' THEN 1 ELSE 0 END)::numeric / 17 * 100
    , 1) || '%' as percentual_preenchido
FROM colaboradores
ORDER BY created_at DESC;

-- ============================================================================
-- 3. LISTA DE CAMPOS VAZIOS POR COLABORADOR (formato vertical)
-- ============================================================================
SELECT 
    c.id,
    c.nome,
    campo.nome_campo,
    campo.valor
FROM colaboradores c
CROSS JOIN LATERAL (
    VALUES 
        ('CPF', c.cpf),
        ('Matrícula', c.matricula),
        ('Email Corporativo', c.email_corporativo),
        ('Celular', c.celular),
        ('Data Nascimento', c.data_nascimento::text),
        ('Cargo ID', c.cargo_id::text),
        ('Departamento ID', c.departamento_id::text),
        ('Tipo Contrato', c.tipo_contrato::text),
        ('Salário', c.salario::text),
        ('Data Admissão', c.data_admissao::text),
        ('CEP', c.cep),
        ('Logradouro', c.logradouro),
        ('Número', c.numero),
        ('Bairro', c.bairro),
        ('Cidade', c.cidade),
        ('Estado', c.estado),
        ('Banco', c.banco_nome),
        ('Agência', c.agencia),
        ('Conta', c.conta),
        ('PIX', c.pix),
        ('Recebe VT', c.recebe_vt::text),
        ('Valor VT', c.valor_vt::text),
        ('Recebe VA/VR', c.recebe_va_vr::text),
        ('Valor VA/VR', c.valor_va_vr::text)
) AS campo(nome_campo, valor)
WHERE campo.valor IS NULL OR campo.valor = ''
ORDER BY c.nome, campo.nome_campo;

-- ============================================================================
-- 4. ESTATÍSTICAS GERAIS - Quantos colaboradores têm cada campo preenchido
-- ============================================================================
SELECT 
    'CPF' as campo,
    COUNT(*) FILTER (WHERE cpf IS NOT NULL AND cpf != '') as preenchidos,
    COUNT(*) FILTER (WHERE cpf IS NULL OR cpf = '') as vazios,
    COUNT(*) as total
FROM colaboradores
UNION ALL
SELECT 'Matrícula', COUNT(*) FILTER (WHERE matricula IS NOT NULL AND matricula != ''), COUNT(*) FILTER (WHERE matricula IS NULL OR matricula = ''), COUNT(*) FROM colaboradores
UNION ALL
SELECT 'Email Corp.', COUNT(*) FILTER (WHERE email_corporativo IS NOT NULL AND email_corporativo != ''), COUNT(*) FILTER (WHERE email_corporativo IS NULL OR email_corporativo = ''), COUNT(*) FROM colaboradores
UNION ALL
SELECT 'Celular', COUNT(*) FILTER (WHERE celular IS NOT NULL AND celular != ''), COUNT(*) FILTER (WHERE celular IS NULL OR celular = ''), COUNT(*) FROM colaboradores
UNION ALL
SELECT 'Data Nasc.', COUNT(*) FILTER (WHERE data_nascimento IS NOT NULL), COUNT(*) FILTER (WHERE data_nascimento IS NULL), COUNT(*) FROM colaboradores
UNION ALL
SELECT 'Cargo', COUNT(*) FILTER (WHERE cargo_id IS NOT NULL), COUNT(*) FILTER (WHERE cargo_id IS NULL), COUNT(*) FROM colaboradores
UNION ALL
SELECT 'Departamento', COUNT(*) FILTER (WHERE departamento_id IS NOT NULL), COUNT(*) FILTER (WHERE departamento_id IS NULL), COUNT(*) FROM colaboradores
UNION ALL
SELECT 'Tipo Contrato', COUNT(*) FILTER (WHERE tipo_contrato IS NOT NULL), COUNT(*) FILTER (WHERE tipo_contrato IS NULL), COUNT(*) FROM colaboradores
UNION ALL
SELECT 'Salário', COUNT(*) FILTER (WHERE salario IS NOT NULL), COUNT(*) FILTER (WHERE salario IS NULL), COUNT(*) FROM colaboradores
UNION ALL
SELECT 'Data Admissão', COUNT(*) FILTER (WHERE data_admissao IS NOT NULL), COUNT(*) FILTER (WHERE data_admissao IS NULL), COUNT(*) FROM colaboradores
UNION ALL
SELECT 'CEP', COUNT(*) FILTER (WHERE cep IS NOT NULL AND cep != ''), COUNT(*) FILTER (WHERE cep IS NULL OR cep = ''), COUNT(*) FROM colaboradores
UNION ALL
SELECT 'Logradouro', COUNT(*) FILTER (WHERE logradouro IS NOT NULL AND logradouro != ''), COUNT(*) FILTER (WHERE logradouro IS NULL OR logradouro = ''), COUNT(*) FROM colaboradores
UNION ALL
SELECT 'Cidade', COUNT(*) FILTER (WHERE cidade IS NOT NULL AND cidade != ''), COUNT(*) FILTER (WHERE cidade IS NULL OR cidade = ''), COUNT(*) FROM colaboradores
UNION ALL
SELECT 'Estado', COUNT(*) FILTER (WHERE estado IS NOT NULL AND estado != ''), COUNT(*) FILTER (WHERE estado IS NULL OR estado = ''), COUNT(*) FROM colaboradores
UNION ALL
SELECT 'Banco', COUNT(*) FILTER (WHERE banco_nome IS NOT NULL AND banco_nome != ''), COUNT(*) FILTER (WHERE banco_nome IS NULL OR banco_nome = ''), COUNT(*) FROM colaboradores
UNION ALL
SELECT 'Agência', COUNT(*) FILTER (WHERE agencia IS NOT NULL AND agencia != ''), COUNT(*) FILTER (WHERE agencia IS NULL OR agencia = ''), COUNT(*) FROM colaboradores
UNION ALL
SELECT 'Conta', COUNT(*) FILTER (WHERE conta IS NOT NULL AND conta != ''), COUNT(*) FILTER (WHERE conta IS NULL OR conta = ''), COUNT(*) FROM colaboradores
UNION ALL
SELECT 'PIX', COUNT(*) FILTER (WHERE pix IS NOT NULL AND pix != ''), COUNT(*) FILTER (WHERE pix IS NULL OR pix = ''), COUNT(*) FROM colaboradores;
