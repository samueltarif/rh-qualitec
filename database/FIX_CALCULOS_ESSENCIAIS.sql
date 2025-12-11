-- ============================================================================
-- CORREÇÃO ESSENCIAL DOS CÁLCULOS DOS HOLERITES (SEM CAMPOS INEXISTENTES)
-- ============================================================================

-- 1. CORRIGIR ADIANTAMENTOS (40% do salário base)
UPDATE holerites 
SET 
    total_proventos = ROUND(salario_base * 0.40, 2),
    salario_liquido = ROUND(salario_base * 0.40, 2),
    inss = 0,
    irrf = 0,
    total_descontos = 0,
    observacoes = CONCAT(
        'Adiantamento Salarial - 40% do salário', E'\n',
        'Cálculo: R$ ', salario_base::text, ' × 40% = R$ ', ROUND(salario_base * 0.40, 2)::text
    ),
    updated_at = NOW()
WHERE tipo = 'adiantamento'
AND ano = '2025';

-- 2. CORRIGIR 13º SALÁRIO - 2ª PARCELA (Salários baixos até R$ 1.600)
UPDATE holerites 
SET 
    inss = ROUND(salario_bruto * 0.075, 2),
    irrf = 0,
    total_descontos = ROUND(salario_bruto * 0.075, 2),
    total_proventos = ROUND(salario_bruto / 2, 2),
    salario_liquido = ROUND(salario_bruto / 2, 2) - ROUND(salario_bruto * 0.075, 2),
    observacoes = CONCAT(
        '13º Salário - 2ª Parcela - ', ano, E'\n',
        '13º Total: R$ ', salario_bruto::text, E'\n',
        '2ª Parcela: R$ ', ROUND(salario_bruto / 2, 2)::text, E'\n',
        'INSS: R$ ', ROUND(salario_bruto * 0.075, 2)::text, E'\n',
        'Líquido: R$ ', (ROUND(salario_bruto / 2, 2) - ROUND(salario_bruto * 0.075, 2))::text
    ),
    updated_at = NOW()
WHERE tipo = 'decimo_terceiro' 
AND parcela_13 = '2'
AND ano = '2025'
AND salario_bruto <= 1600;

-- 3. CORRIGIR 13º SALÁRIO - 2ª PARCELA (Salários médios R$ 1.600 - R$ 2.666)
UPDATE holerites 
SET 
    inss = ROUND((1412.00 * 0.075) + ((salario_bruto - 1412.00) * 0.09), 2),
    irrf = 0,
    total_descontos = ROUND((1412.00 * 0.075) + ((salario_bruto - 1412.00) * 0.09), 2),
    total_proventos = ROUND(salario_bruto / 2, 2),
    salario_liquido = ROUND(salario_bruto / 2, 2) - ROUND((1412.00 * 0.075) + ((salario_bruto - 1412.00) * 0.09), 2),
    observacoes = CONCAT(
        '13º Salário - 2ª Parcela - ', ano, E'\n',
        '13º Total: R$ ', salario_bruto::text, E'\n',
        '2ª Parcela: R$ ', ROUND(salario_bruto / 2, 2)::text, E'\n',
        'INSS: R$ ', ROUND((1412.00 * 0.075) + ((salario_bruto - 1412.00) * 0.09), 2)::text, E'\n',
        'Líquido: R$ ', (ROUND(salario_bruto / 2, 2) - ROUND((1412.00 * 0.075) + ((salario_bruto - 1412.00) * 0.09), 2))::text
    ),
    updated_at = NOW()
WHERE tipo = 'decimo_terceiro' 
AND parcela_13 = '2'
AND ano = '2025'
AND salario_bruto > 1600 AND salario_bruto <= 2666.68;

-- 4. VERIFICAR RESULTADOS
SELECT 'ADIANTAMENTOS CORRIGIDOS' as resultado;
SELECT 
    nome_colaborador,
    salario_base,
    salario_liquido as valor_adiantamento,
    CASE 
        WHEN salario_liquido = ROUND(salario_base * 0.40, 2) THEN '✅ CORRETO'
        ELSE '❌ INCORRETO'
    END as status
FROM holerites 
WHERE tipo = 'adiantamento' AND ano = '2025'
ORDER BY nome_colaborador;

SELECT '13º SALÁRIO 2ª PARCELA CORRIGIDOS' as resultado;
SELECT 
    nome_colaborador,
    salario_bruto as valor_13_total,
    total_proventos as segunda_parcela_bruto,
    inss,
    salario_liquido as valor_liquido
FROM holerites 
WHERE tipo = 'decimo_terceiro' AND parcela_13 = '2' AND ano = '2025'
ORDER BY nome_colaborador;

-- 5. TOTAIS GERAIS
SELECT 
    'RESUMO FINAL' as titulo,
    COUNT(*) FILTER (WHERE tipo = 'adiantamento') as total_adiantamentos,
    SUM(salario_liquido) FILTER (WHERE tipo = 'adiantamento') as valor_total_adiantamentos,
    COUNT(*) FILTER (WHERE tipo = 'decimo_terceiro' AND parcela_13 = '2') as total_13_segunda_parcela,
    SUM(salario_liquido) FILTER (WHERE tipo = 'decimo_terceiro' AND parcela_13 = '2') as valor_total_13_segunda_parcela
FROM holerites 
WHERE ano = '2025';