-- ============================================================================
-- DIAGNÓSTICO DOS PROBLEMAS NOS CÁLCULOS DOS HOLERITES
-- ============================================================================

-- 1. Verificar holerites com problemas de dias trabalhados
SELECT 
    h.id,
    h.nome_colaborador,
    h.tipo,
    h.mes,
    h.ano,
    h.dias_trabalhados,
    h.salario_base,
    h.total_proventos,
    h.inss,
    h.irrf,
    h.total_descontos,
    h.salario_liquido,
    h.valor_adiantamento,
    h.observacoes
FROM holerites h
WHERE h.mes = '12' AND h.ano = '2025'
ORDER BY h.nome_colaborador, h.tipo;

-- 2. Verificar colaboradores e seus salários
SELECT 
    c.id,
    c.nome,
    c.salario,
    c.data_admissao,
    c.status
FROM colaboradores c
WHERE c.status = 'Ativo'
ORDER BY c.nome;

-- 3. Verificar se há problemas na estrutura da tabela holerites
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'holerites' 
ORDER BY ordinal_position;

-- 4. Verificar adiantamentos que podem estar causando problemas
SELECT 
    h.colaborador_id,
    h.nome_colaborador,
    h.mes,
    h.ano,
    h.tipo,
    h.salario_liquido as valor_adiantamento,
    h.observacoes
FROM holerites h
WHERE h.tipo = 'adiantamento'
AND h.ano = '2025'
ORDER BY h.colaborador_id, h.mes;

-- 5. Verificar cálculos de INSS que podem estar incorretos
SELECT 
    h.nome_colaborador,
    h.tipo,
    h.salario_base,
    h.inss,
    h.irrf,
    h.total_descontos,
    h.salario_liquido,
    -- Calcular INSS esperado (aproximado)
    CASE 
        WHEN h.salario_base <= 1412.00 THEN h.salario_base * 0.075
        WHEN h.salario_base <= 2666.68 THEN (1412.00 * 0.075) + ((h.salario_base - 1412.00) * 0.09)
        WHEN h.salario_base <= 4000.03 THEN (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((h.salario_base - 2666.68) * 0.12)
        ELSE LEAST(908.85, (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((4000.03 - 2666.68) * 0.12) + ((h.salario_base - 4000.03) * 0.14))
    END as inss_esperado
FROM holerites h
WHERE h.mes = '12' AND h.ano = '2025'
AND h.tipo IN ('mensal', 'decimo_terceiro')
ORDER BY h.nome_colaborador, h.tipo;