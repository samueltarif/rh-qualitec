-- ============================================================================
-- DIAGNÓSTICO DOS VALORES ATUAIS DOS HOLERITES
-- ============================================================================

-- 1. VERIFICAR ADIANTAMENTOS ATUAIS
SELECT 
    '=== ADIANTAMENTOS ATUAIS ===' as titulo;

SELECT 
    nome_colaborador,
    salario_base,
    salario_liquido as valor_atual,
    ROUND(salario_base * 0.40, 2) as valor_correto_40pct,
    CASE 
        WHEN salario_liquido = ROUND(salario_base * 0.40, 2) THEN '✅ CORRETO'
        ELSE CONCAT('❌ ERRO - Diferença: R$ ', 
                   (ROUND(salario_base * 0.40, 2) - salario_liquido)::text)
    END as status,
    inss,
    irrf,
    total_descontos
FROM holerites 
WHERE tipo = 'adiantamento' AND ano = 2025
ORDER BY nome_colaborador;

-- 2. VERIFICAR 13º SALÁRIO 2ª PARCELA ATUAIS
SELECT 
    '=== 13º SALÁRIO 2ª PARCELA ATUAIS ===' as titulo;

SELECT 
    nome_colaborador,
    salario_bruto as valor_13_total,
    total_proventos as segunda_parcela_bruto,
    ROUND(salario_bruto / 2, 2) as deveria_ser_bruto,
    inss as inss_atual,
    CASE 
        WHEN salario_bruto <= 1600 THEN ROUND(salario_bruto * 0.075, 2)
        ELSE ROUND((1412.00 * 0.075) + ((salario_bruto - 1412.00) * 0.09), 2)
    END as inss_correto,
    salario_liquido as valor_liquido_atual,
    CASE 
        WHEN salario_bruto <= 1600 THEN 
            ROUND(salario_bruto / 2, 2) - ROUND(salario_bruto * 0.075, 2)
        ELSE 
            ROUND(salario_bruto / 2, 2) - ROUND((1412.00 * 0.075) + ((salario_bruto - 1412.00) * 0.09), 2)
    END as valor_liquido_correto
FROM holerites 
WHERE tipo = 'decimo_terceiro' AND parcela_13 = '2' AND ano = 2025
ORDER BY nome_colaborador;

-- 3. RESUMO GERAL
SELECT 
    '=== RESUMO GERAL ===' as titulo;

SELECT 
    tipo,
    COUNT(*) as quantidade,
    SUM(salario_liquido) as valor_total_atual,
    AVG(salario_liquido) as valor_medio
FROM holerites 
WHERE ano = 2025
GROUP BY tipo
ORDER BY tipo;

-- 4. VERIFICAR CAMPOS EXISTENTES
SELECT 
    '=== CAMPOS DA TABELA HOLERITES ===' as titulo;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'holerites' 
AND column_name IN (
    'salario_base', 'salario_bruto', 'salario_liquido', 
    'total_proventos', 'total_descontos', 'inss', 'irrf',
    'valor_adiantamento', 'observacoes', 'atualizado_em'
)
ORDER BY column_name;