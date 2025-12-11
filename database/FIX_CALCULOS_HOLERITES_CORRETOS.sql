-- ============================================================================
-- CORREÇÃO DOS CÁLCULOS INCORRETOS NOS HOLERITES
-- ============================================================================
-- Este script corrige:
-- 1. Adiantamentos com valores incorretos (deve ser 40% do salário)
-- 2. 13º Salário 2ª parcela com cálculo incorreto
-- 3. Dias trabalhados incorretos
-- ============================================================================

-- 1. CORRIGIR ADIANTAMENTOS (40% do salário base)
UPDATE holerites 
SET 
    total_proventos = ROUND(salario_base * 0.40, 2),
    salario_liquido = ROUND(salario_base * 0.40, 2),
    valor_adiantamento = ROUND(salario_base * 0.40, 2),
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
-- Remover funções existentes se houver
DROP FUNCTION IF EXISTS calcular_inss_2025(DECIMAL);
DROP FUNCTION IF EXISTS calcular_irrf_2025(DECIMAL, DECIMAL, INTEGER);
DROP FUNCTION IF EXISTS calcular_dias_trabalhados(DATE, INTEGER, INTEGER);

-- Corrigir 13º Salário - 2ª Parcela
UPDATE holerites 
SET 
    -- Recalcular valores corretos
    inss = calcular_inss_2025(salario_bruto),
    irrf = calcular_irrf_2025(salario_bruto, calcular_inss_2025(salario_bruto), 0),
    total_descontos = calcular_inss_2025(salario_bruto) + calcular_irrf_2025(salario_bruto, calcular_inss_2025(salario_bruto), 0),
    -- 2ª parcela = 50% do 13º - descontos
    total_proventos = salario_bruto / 2,
    salario_liquido = (salario_bruto / 2) - calcular_inss_2025(salario_bruto) - calcular_irrf_2025(salario_bruto, calcular_inss_2025(salario_bruto), 0),
    observacoes = CONCAT(
        '13º Salário - 2ª Parcela (Com Descontos) - ', ano, E'\n',
        COALESCE(meses_trabalhados::text, '12'), ' Meses Trabalhados', E'\n\n',
        'CÁLCULO DETALHADO:', E'\n',
        '• 13º Total: R$ ', salario_bruto::text, E'\n',
        '• 1ª Parcela (já paga): R$ ', ROUND(salario_bruto / 2, 2)::text, E'\n',
        '• 2ª Parcela (bruto): R$ ', ROUND(salario_bruto / 2, 2)::text, E'\n',
        '• INSS (sobre total): R$ ', calcular_inss_2025(salario_bruto)::text, E'\n',
        '• IRRF (sobre total): R$ ', calcular_irrf_2025(salario_bruto, calcular_inss_2025(salario_bruto), 0)::text, E'\n',
        '• Valor líquido: R$ ', ((salario_bruto / 2) - calcular_inss_2025(salario_bruto) - calcular_irrf_2025(salario_bruto, calcular_inss_2025(salario_bruto), 0))::text
    ),
    updated_at = NOW()
WHERE tipo = 'decimo_terceiro' 
AND parcela_13 = '2'
AND ano = '2025';

-- 3. CORRIGIR DIAS TRABALHADOS NOS HOLERITES MENSAIS
-- Função para calcular dias trabalhados
CREATE OR REPLACE FUNCTION calcular_dias_trabalhados(data_admissao DATE, mes INTEGER, ano INTEGER) 
RETURNS INTEGER AS $$
DECLARE
    primeiro_dia_mes DATE;
    ultimo_dia_mes DATE;
    dias_trabalhados INTEGER;
BEGIN
    -- Se não tem data de admissão, assume 30 dias
    IF data_admissao IS NULL THEN
        RETURN 30;
    END IF;
    
    primeiro_dia_mes := DATE(ano || '-' || LPAD(mes::text, 2, '0') || '-01');
    ultimo_dia_mes := (primeiro_dia_mes + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    
    -- Se foi admitido depois do mês, não trabalhou
    IF data_admissao > ultimo_dia_mes THEN
        RETURN 0;
    END IF;
    
    -- Se foi admitido antes do mês, trabalhou o mês todo
    IF data_admissao < primeiro_dia_mes THEN
        RETURN EXTRACT(DAY FROM ultimo_dia_mes);
    END IF;
    
    -- Foi admitido durante o mês
    dias_trabalhados := EXTRACT(DAY FROM ultimo_dia_mes) - EXTRACT(DAY FROM data_admissao) + 1;
    RETURN GREATEST(dias_trabalhados, 0);
END;
$$ LANGUAGE plpgsql;

-- Atualizar dias trabalhados nos holerites mensais
UPDATE holerites 
SET 
    dias_trabalhados = calcular_dias_trabalhados(data_admissao::DATE, mes::INTEGER, ano::INTEGER),
    updated_at = NOW()
WHERE tipo = 'mensal'
AND ano = '2025';

-- 4. VERIFICAR RESULTADOS
SELECT 
    'ADIANTAMENTOS CORRIGIDOS' as tipo,
    COUNT(*) as total,
    SUM(salario_liquido) as valor_total
FROM holerites 
WHERE tipo = 'adiantamento' AND ano = '2025'

UNION ALL

SELECT 
    '13º SALÁRIO 2ª PARCELA CORRIGIDOS' as tipo,
    COUNT(*) as total,
    SUM(salario_liquido) as valor_total
FROM holerites 
WHERE tipo = 'decimo_terceiro' AND parcela_13 = '2' AND ano = '2025'

UNION ALL

SELECT 
    'HOLERITES MENSAIS COM DIAS CORRIGIDOS' as tipo,
    COUNT(*) as total,
    AVG(dias_trabalhados) as media_dias
FROM holerites 
WHERE tipo = 'mensal' AND ano = '2025';

-- 5. MOSTRAR EXEMPLOS DOS CÁLCULOS CORRIGIDOS
SELECT 
    nome_colaborador,
    tipo,
    parcela_13,
    salario_base,
    total_proventos,
    inss,
    irrf,
    total_descontos,
    salario_liquido,
    dias_trabalhados,
    LEFT(observacoes, 100) || '...' as observacoes_resumo
FROM holerites 
WHERE ano = '2025'
AND mes = '12'
ORDER BY nome_colaborador, tipo, parcela_13;

-- Limpar funções auxiliares (opcional)
-- DROP FUNCTION IF EXISTS calcular_inss_2025(DECIMAL);
-- DROP FUNCTION IF EXISTS calcular_irrf_2025(DECIMAL, DECIMAL, INTEGER);
-- DROP FUNCTION IF EXISTS calcular_dias_trabalhados(DATE, INTEGER, INTEGER);