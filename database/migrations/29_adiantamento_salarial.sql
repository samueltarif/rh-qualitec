-- =====================================================
-- MIGRATION 29: SISTEMA DE ADIANTAMENTO SALARIAL
-- =====================================================
-- Criado em: 2025-01-XX
-- Descrição: Adiciona suporte para adiantamento salarial
--            com geração de holerites separados
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
-- Verificar se a coluna já existe antes de adicionar
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

-- 3. Atualizar o enum de tipo de holerite para incluir 'adiantamento'
-- Primeiro, verificar se o valor já existe
DO $$ 
BEGIN
    -- Adicionar 'adiantamento' ao enum se não existir
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'adiantamento' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_holerite')
    ) THEN
        ALTER TYPE tipo_holerite ADD VALUE 'adiantamento';
    END IF;
END $$;

-- 4. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_holerites_tipo_adiantamento 
ON holerites(tipo) WHERE tipo = 'adiantamento';

CREATE INDEX IF NOT EXISTS idx_holerites_mes_ano_tipo 
ON holerites(mes, ano, tipo);

-- 5. Atualizar configuração padrão (se não existir)
UPDATE parametros_folha
SET 
    adiantamento_habilitado = false,
    adiantamento_percentual = 40.00,
    adiantamento_dia_pagamento = 20,
    adiantamento_gerar_holerite = true
WHERE adiantamento_habilitado IS NULL;

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
    h.status,
    h.created_at as data_geracao,
    c.banco,
    c.agencia,
    c.conta
FROM holerites h
LEFT JOIN colaboradores c ON c.id = h.colaborador_id
WHERE h.tipo = 'adiantamento'
ORDER BY h.ano DESC, h.mes DESC, h.nome_colaborador;

COMMENT ON VIEW vw_adiantamentos_mes IS 'View para consulta rápida de adiantamentos por mês';

-- =====================================================
-- RESUMO DA MIGRATION
-- =====================================================
-- ✅ Configurações de adiantamento em parametros_folha
-- ✅ Campo valor_adiantamento em holerites
-- ✅ Tipo 'adiantamento' no enum tipo_holerite
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
AND column_name = 'valor_adiantamento';
