-- ============================================================================
-- CORREÇÃO SIMPLES DOS CÁLCULOS DOS HOLERITES
-- ============================================================================

-- 1. CORRIGIR ADIANTAMENTOS (40% do salário base)
UPDATE holerites 
SET 
    total_proventos = ROUND(salario_base * 0.40, 2),
    salario_liquido = ROUND(salario_base * 0.40, 2),
    valor_adiantamento = ROUND(salario_base * 0.40, 2),
    inss = 0,
    irrf = 0,
    total_descontos = 0,
    observacoes = CONCAT(
        'Adiantamento Salarial - 40% do salário', E'\n',
        'Pagamento previsto: dia 20/', mes, '/', ano, E'\n',
        'Sem descontos (INSS, IRRF)', E'\n',
        'Valor será descontado no holerite final do mês', E'\n\n',
        'Cálculo: R$ ', salario_base::text, ' × 40% = R$ ', ROUND(salario_base * 0.40, 2)::text
    ),
    updated_at = NOW()
WHERE tipo = 'adiantamento'
AND ano = '2025';

-- 2. CORRIGIR 13º SALÁRIO - 2ª PARCELA
-- Para salários até R$ 1.520,00 (como Claudia)
UPDATE holerites 
SET 
    -- INSS: 7,5% sobre o valor total do 13º
    inss = ROUND(salario_bruto * 0.075, 2),
    -- IRRF: isento (base de cálculo menor que R$ 2.259,20)
    irrf = 0,
    -- Total de descontos
    total_descontos = ROUND(salario_bruto * 0.075, 2),
    -- 2ª parcela = 50% do 13º - descontos
    total_proventos = ROUND(salario_bruto / 2, 2),
    salario_liquido = ROUND(salario_bruto / 2, 2) - ROUND(salario_bruto * 0.075, 2),
    observacoes = CONCAT(
        '13º Salário - 2ª Parcela (Com Descontos) - ', ano, E'\n',
        COALESCE(meses_trabalhados::text, '12'), ' Meses Trabalhados', E'\n\n',
        'CÁLCULO DETALHADO:', E'\n',
        '• 13º Total: R$ ', salario_bruto::text, E'\n',
        '• 1ª Parcela (já paga): R$ ', ROUND(salario_bruto / 2, 2)::text, E'\n',
        '• 2ª Parcela (bruto): R$ ', ROUND(salario_bruto / 2, 2)::text, E'\n',
        '• INSS (7,5% sobre total): R$ ', ROUND(salario_bruto * 0.075, 2)::text, E'\n',
        '• IRRF: R$ 0,00 (isento)', E'\n',
        '• Valor líquido: R$ ', (ROUND(salario_bruto / 2, 2) - ROUND(salario_bruto * 0.075, 2))::text
    ),
    updated_at = NOW()
WHERE tipo = 'decimo_terceiro' 
AND parcela_13 = '2'
AND ano = '2025'
AND salario_bruto <= 1600; -- Para salários baixos

-- Para salários entre R$ 1.600,01 e R$ 2.000,00 (como Enoa)
UPDATE holerites 
SET 
    -- INSS: cálculo progressivo
    inss = ROUND(
        (1412.00 * 0.075) + ((salario_bruto - 1412.00) * 0.09), 
        2
    ),
    -- IRRF: isento (base de cálculo menor que R$ 2.259,20)
    irrf = 0,
    -- Total de descontos
    total_descontos = ROUND(
        (1412.00 * 0.075) + ((salario_bruto - 1412.00) * 0.09), 
        2
    ),
    -- 2ª parcela = 50% do 13º - descontos
    total_proventos = ROUND(salario_bruto / 2, 2),
    salario_liquido = ROUND(salario_bruto / 2, 2) - ROUND(
        (1412.00 * 0.075) + ((salario_bruto - 1412.00) * 0.09), 
        2
    ),
    observacoes = CONCAT(
        '13º Salário - 2ª Parcela (Com Descontos) - ', ano, E'\n',
        COALESCE(meses_trabalhados::text, '12'), ' Meses Trabalhados', E'\n\n',
        'CÁLCULO DETALHADO:', E'\n',
        '• 13º Total: R$ ', salario_bruto::text, E'\n',
        '• 1ª Parcela (já paga): R$ ', ROUND(salario_bruto / 2, 2)::text, E'\n',
        '• 2ª Parcela (bruto): R$ ', ROUND(salario_bruto / 2, 2)::text, E'\n',
        '• INSS (progressivo): R$ ', ROUND((1412.00 * 0.075) + ((salario_bruto - 1412.00) * 0.09), 2)::text, E'\n',
        '• IRRF: R$ 0,00 (isento)', E'\n',
        '• Valor líquido: R$ ', (ROUND(salario_bruto / 2, 2) - ROUND((1412.00 * 0.075) + ((salario_bruto - 1412.00) * 0.09), 2))::text
    ),
    updated_at = NOW()
WHERE tipo = 'decimo_terceiro' 
AND parcela_13 = '2'
AND ano = '2025'
AND salario_bruto > 1600 AND salario_bruto <= 2666.68;

-- 3. CAMPO DIAS_TRABALHADOS NÃO EXISTE NA TABELA
-- Este campo será adicionado em futuras atualizações da estrutura

-- 4. VERIFICAR RESULTADOS
SELECT 
    'RESUMO DAS CORREÇÕES' as titulo,
    '' as separador;

SELECT 
    'ADIANTAMENTOS' as tipo,
    nome_colaborador,
    salario_base,
    salario_liquido as valor_adiantamento,
    ROUND(salario_base * 0.40, 2) as deveria_ser
FROM holerites 
WHERE tipo = 'adiantamento' AND ano = '2025'
ORDER BY nome_colaborador;

SELECT 
    '13º SALÁRIO 2ª PARCELA' as tipo,
    nome_colaborador,
    salario_bruto as valor_13_total,
    total_proventos as segunda_parcela_bruto,
    inss,
    irrf,
    salario_liquido as valor_liquido
FROM holerites 
WHERE tipo = 'decimo_terceiro' AND parcela_13 = '2' AND ano = '2025'
ORDER BY nome_colaborador;

SELECT 
    'HOLERITES MENSAIS' as tipo,
    nome_colaborador,
    salario_base,
    salario_liquido,
    'Campo dias_trabalhados não existe' as observacao
FROM holerites 
WHERE tipo = 'mensal' AND ano = '2025' AND mes = '12'
ORDER BY nome_colaborador;