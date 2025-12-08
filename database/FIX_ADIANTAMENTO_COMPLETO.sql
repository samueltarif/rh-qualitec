-- ============================================
-- FIX COMPLETO: ADIANTAMENTO SALARIAL
-- ============================================
-- Execute TODO este SQL no Supabase SQL Editor

-- PASSO 1: Verificar se as colunas existem
DO $$
BEGIN
    -- Adicionar coluna adiantamento_habilitado se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'parametros_folha' 
        AND column_name = 'adiantamento_habilitado'
    ) THEN
        ALTER TABLE parametros_folha
        ADD COLUMN adiantamento_habilitado BOOLEAN DEFAULT false;
        RAISE NOTICE 'Coluna adiantamento_habilitado criada';
    ELSE
        RAISE NOTICE 'Coluna adiantamento_habilitado já existe';
    END IF;

    -- Adicionar coluna adiantamento_percentual se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'parametros_folha' 
        AND column_name = 'adiantamento_percentual'
    ) THEN
        ALTER TABLE parametros_folha
        ADD COLUMN adiantamento_percentual NUMERIC(5,2) DEFAULT 40;
        RAISE NOTICE 'Coluna adiantamento_percentual criada';
    ELSE
        RAISE NOTICE 'Coluna adiantamento_percentual já existe';
    END IF;

    -- Adicionar coluna adiantamento_dia_pagamento se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'parametros_folha' 
        AND column_name = 'adiantamento_dia_pagamento'
    ) THEN
        ALTER TABLE parametros_folha
        ADD COLUMN adiantamento_dia_pagamento INTEGER DEFAULT 20;
        RAISE NOTICE 'Coluna adiantamento_dia_pagamento criada';
    ELSE
        RAISE NOTICE 'Coluna adiantamento_dia_pagamento já existe';
    END IF;
END $$;

-- PASSO 2: Verificar se existe registro em parametros_folha
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM parametros_folha LIMIT 1) THEN
        -- Criar registro inicial
        INSERT INTO parametros_folha (
            adiantamento_habilitado,
            adiantamento_percentual,
            adiantamento_dia_pagamento,
            fgts_aliquota,
            vale_transporte_desconto_max,
            created_at,
            updated_at
        ) VALUES (
            true,
            40,
            20,
            8.0,
            6.0,
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Registro de parâmetros criado com adiantamento habilitado';
    ELSE
        -- Atualizar registro existente
        UPDATE parametros_folha
        SET 
            adiantamento_habilitado = true,
            adiantamento_percentual = 40,
            adiantamento_dia_pagamento = 20,
            updated_at = NOW();
        RAISE NOTICE 'Registro de parâmetros atualizado com adiantamento habilitado';
    END IF;
END $$;

-- PASSO 3: Verificar resultado
SELECT 
    id,
    adiantamento_habilitado,
    adiantamento_percentual,
    adiantamento_dia_pagamento,
    created_at,
    updated_at
FROM parametros_folha;

-- PASSO 4: Verificar estrutura das colunas
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'parametros_folha'
    AND column_name LIKE '%adiantamento%'
ORDER BY column_name;

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- Deve mostrar:
-- - adiantamento_habilitado = true
-- - adiantamento_percentual = 40
-- - adiantamento_dia_pagamento = 20
-- ============================================
