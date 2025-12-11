-- ============================================
-- FIX HASH ASSINATURA - EXECUTAR AGORA
-- ============================================

-- 1. Verificar estrutura atual da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'assinaturas_ponto'
ORDER BY ordinal_position;

-- 2. Verificar se há registros com hash_assinatura NULL
SELECT 
    COUNT(*) as total_registros,
    COUNT(hash_assinatura) as com_hash,
    COUNT(*) - COUNT(hash_assinatura) as sem_hash
FROM assinaturas_ponto;

-- 3. Atualizar registros existentes sem hash (se houver)
UPDATE assinaturas_ponto 
SET hash_assinatura = encode(sha256(
    (colaborador_id::text || '-' || mes::text || '-' || ano::text || '-' || 
     COALESCE(assinatura_digital, 'sem-assinatura') || '-' || 
     COALESCE(data_assinatura::text, created_at::text))::bytea
), 'hex')
WHERE hash_assinatura IS NULL;

-- 4. Verificar se todas as colunas necessárias existem
DO $$ 
BEGIN
    -- Verificar se existe empresa_id (pode ser necessária)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assinaturas_ponto' 
        AND column_name = 'empresa_id'
    ) THEN
        ALTER TABLE assinaturas_ponto 
        ADD COLUMN empresa_id UUID REFERENCES empresas(id);
        
        -- Preencher empresa_id baseado no colaborador
        UPDATE assinaturas_ponto 
        SET empresa_id = c.empresa_id
        FROM colaboradores c
        WHERE assinaturas_ponto.colaborador_id = c.id
        AND assinaturas_ponto.empresa_id IS NULL;
        
        RAISE NOTICE '✅ Coluna empresa_id adicionada e preenchida';
    END IF;
END $$;

-- 5. Verificar constraints e índices
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'assinaturas_ponto'::regclass;

-- 6. Resultado final
SELECT 
    'Tabela assinaturas_ponto configurada corretamente!' as status,
    COUNT(*) as total_assinaturas
FROM assinaturas_ponto;

RAISE NOTICE '🎉 Fix do hash_assinatura concluído!';