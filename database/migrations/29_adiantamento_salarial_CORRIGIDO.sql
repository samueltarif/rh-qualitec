-- =====================================================
-- MIGRATION 29: SISTEMA DE ADIANTAMENTO SALARIAL
-- =====================================================
-- Versão CORRIGIDA - Sem dependência de ENUM
-- =====================================================

-- 1. Adicionar configurações de adiantamento na tabela parametros_folha
ALTER TABLE parametros_folha
ADD COLUMN IF NOT EXISTS adiantamento_habilitado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS adiantamento_percentual DECIMAL(5,2) DEFAULT 40.00,
ADD COLUMN IF NOT EXISTS adiantamento_dia_pagamento INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS adiantamento_gerar_holerite BOOLEAN DEFAULT true;

COMMENT ON COLUMN parametros_folha.adiantamento_habilitado IS 'Se o adiantamento salarial está ativo';
COMMENT ON COLUMN parametros_folha.adiantamento_percentual IS 'Percentual do salário bruto para adiantamento (ex: 40.00 = 40%)';
COMMENT ON COLUMN parametros_folha.adiantamento_dia_pagamento IS 'Dia do mês para pagamento do adiantamento (ex: 20)';
COMMENT ON COLUMN parametros_folha.adiantamento_gerar_holerite IS 'Se deve gerar holerite separado para o adiantamento';

-- 2. Adicionar campo de adiantamento na tabela holerites
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'holerites' 
        AND column_name = 'valor_adiantamento'
    ) THEN
        ALTER TABLE holerites
        ADD COLUMN valor_adiantamento DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;

COMMENT ON COLUMN holerites.valor_adiantamento IS 'Valor do adiantamento pago (descontado no holerite final)';

-- 3. Verificar se a coluna 'tipo' existe e qual é seu tipo
DO $$ 
DECLARE
    v_tipo_coluna TEXT;
BEGIN
    -- Verificar o tipo da coluna 'tipo'
    SELECT data_type INTO v_tipo_coluna
    FROM information_schema.columns
    WHERE table_name = 'holerites' 
    AND column_name = 'tipo';

    -- Se for VARCHAR/TEXT, não precisa fazer nada
    -- Se for ENUM, precisamos converter
    IF v_tipo_coluna LIKE 'USER-DEFINED' THEN
        -- É um ENUM, vamos adicionar o valor 'adiantamento'
        BEGIN
            -- Tentar adicionar o valor ao enum
            EXECUTE 'ALTER TYPE tipo_holerite ADD VALUE IF NOT EXISTS ''adiantamento''';
        EXCEPTION
            WHEN duplicate_object THEN
                -- Valor já existe, tudo bem
                NULL;
            WHEN undefined_object THEN
                -- ENUM não existe, vamos converter a coluna para VARCHAR
                ALTER TABLE holerites 
                ALTER COLUMN tipo TYPE VARCHAR(50);
                
                -- Adicionar constraint para validar valores
                ALTER TABLE holerites
                DROP CONSTRAINT IF EXISTS holerites_tipo_check;
                
                ALTER TABLE holerites
                ADD CONSTRAINT holerites_tipo_check 
                CHECK (tipo IN ('mensal', 'decimo_terceiro', 'adiantamento', 'ferias', 'rescisao'));
        END;
    ELSIF v_tipo_coluna IN ('character varying', 'varchar', 'text') THEN
        -- Já é VARCHAR/TEXT, só adicionar/atualizar a constraint
        ALTER TABLE holerites
        DROP CONSTRAINT IF EXISTS holerites_tipo_check;
        
        ALTER TABLE holerites
        ADD CONSTRAINT holerites_tipo_check 
        CHECK (tipo IN ('mensal', 'decimo_terceiro', 'adiantamento', 'ferias', 'rescisao'));
    END IF;
END $$;

-- 4. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_holerites_tipo_adiantamento 
ON holerites(tipo) WHERE tipo = 'adiantamento';

CREATE INDEX IF NOT EXISTS idx_holerites_mes_ano_tipo 
ON holerites(mes, ano, tipo);

CREATE INDEX IF NOT EXISTS idx_holerites_colaborador_mes_ano 
ON holerites(colaborador_id, mes, ano);

-- 5. Atualizar configuração padrão
DO $$
BEGIN
    -- Verificar se já existe registro em parametros_folha
    IF EXISTS (SELECT 1 FROM parametros_folha LIMIT 1) THEN
        UPDATE parametros_folha
        SET 
            adiantamento_habilitado = COALESCE(adiantamento_habilitado, false),
            adiantamento_percentual = COALESCE(adiantamento_percentual, 40.00),
            adiantamento_dia_pagamento = COALESCE(adiantamento_dia_pagamento, 20),
            adiantamento_gerar_holerite = COALESCE(adiantamento_gerar_holerite, true);
    ELSE
        -- Se não existe, inserir registro padrão
        INSERT INTO parametros_folha (
            salario_minimo,
            adiantamento_habilitado,
            adiantamento_percentual,
            adiantamento_dia_pagamento,
            adiantamento_gerar_holerite
        ) VALUES (
            1412.00,
            false,
            40.00,
            20,
            true
        );
    END IF;
END $$;

-- 6. Criar função para calcular valor do adiantamento
CREATE OR REPLACE FUNCTION calcular_adiantamento(
    p_salario_bruto DECIMAL,
    p_percentual DECIMAL DEFAULT 40.00
)
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
DECLARE
    v_valor_adiantamento DECIMAL;
BEGIN
    -- Calcular percentual do salário bruto
    v_valor_adiantamento := (p_salario_bruto * p_percentual) / 100;
    
    -- Arredondar para 2 casas decimais
    v_valor_adiantamento := ROUND(v_valor_adiantamento, 2);
    
    RETURN v_valor_adiantamento;
END;
$$;

COMMENT ON FUNCTION calcular_adiantamento IS 'Calcula o valor do adiantamento baseado no salário bruto e percentual';

-- 7. Criar view para relatório de adiantamentos
CREATE OR REPLACE VIEW vw_adiantamentos_mes AS
SELECT 
    h.id,
    h.colaborador_id,
    h.nome_colaborador,
    h.cpf,
    h.cargo,
    h.departamento,
    h.mes,
    h.ano,
    h.salario_base,
    h.salario_liquido as valor_adiantamento,
    h.valor_adiantamento as valor_adiantamento_campo,
    h.status,
    h.created_at as data_geracao,
    h.banco,
    h.agencia,
    h.conta
FROM holerites h
WHERE h.tipo = 'adiantamento'
ORDER BY h.ano DESC, h.mes DESC, h.nome_colaborador;

COMMENT ON VIEW vw_adiantamentos_mes IS 'View para consulta rápida de adiantamentos por mês';

-- =====================================================
-- RESUMO DA MIGRATION
-- =====================================================
-- ✅ Configurações de adiantamento em parametros_folha
-- ✅ Campo valor_adiantamento em holerites
-- ✅ Tipo 'adiantamento' adicionado (VARCHAR ou ENUM)
-- ✅ Índices para performance
-- ✅ Função de cálculo de adiantamento
-- ✅ View para relatórios
-- =====================================================

-- Verificar estrutura criada
SELECT 
    'parametros_folha' as tabela,
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'parametros_folha'
AND column_name LIKE 'adiantamento%'
UNION ALL
SELECT 
    'holerites' as tabela,
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'holerites'
AND column_name = 'valor_adiantamento'
ORDER BY tabela, column_name;
