-- ============================================
-- FIX ASSINATURA DIGITAL - EXECUTAR AGORA
-- ============================================

-- 1. Adicionar coluna assinatura_digital se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assinaturas_ponto' 
        AND column_name = 'assinatura_digital'
    ) THEN
        ALTER TABLE assinaturas_ponto 
        ADD COLUMN assinatura_digital TEXT;
        
        RAISE NOTICE '✅ Coluna assinatura_digital adicionada';
    ELSE
        RAISE NOTICE '✅ Coluna assinatura_digital já existe';
    END IF;
END $$;

-- 2. Adicionar outras colunas necessárias se não existirem
DO $$ 
BEGIN
    -- Coluna arquivo_csv
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assinaturas_ponto' 
        AND column_name = 'arquivo_csv'
    ) THEN
        ALTER TABLE assinaturas_ponto 
        ADD COLUMN arquivo_csv TEXT;
        
        RAISE NOTICE '✅ Coluna arquivo_csv adicionada';
    END IF;
    
    -- Coluna ip_assinatura
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assinaturas_ponto' 
        AND column_name = 'ip_assinatura'
    ) THEN
        ALTER TABLE assinaturas_ponto 
        ADD COLUMN ip_assinatura VARCHAR(45);
        
        RAISE NOTICE '✅ Coluna ip_assinatura adicionada';
    END IF;
    
    -- Coluna data_assinatura
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assinaturas_ponto' 
        AND column_name = 'data_assinatura'
    ) THEN
        ALTER TABLE assinaturas_ponto 
        ADD COLUMN data_assinatura TIMESTAMPTZ DEFAULT NOW();
        
        RAISE NOTICE '✅ Coluna data_assinatura adicionada';
    END IF;
    
    -- Coluna total_dias
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assinaturas_ponto' 
        AND column_name = 'total_dias'
    ) THEN
        ALTER TABLE assinaturas_ponto 
        ADD COLUMN total_dias INTEGER DEFAULT 0;
        
        RAISE NOTICE '✅ Coluna total_dias adicionada';
    END IF;
    
    -- Coluna total_horas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assinaturas_ponto' 
        AND column_name = 'total_horas'
    ) THEN
        ALTER TABLE assinaturas_ponto 
        ADD COLUMN total_horas VARCHAR(10);
        
        RAISE NOTICE '✅ Coluna total_horas adicionada';
    END IF;
    
    -- Coluna observacoes
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assinaturas_ponto' 
        AND column_name = 'observacoes'
    ) THEN
        ALTER TABLE assinaturas_ponto 
        ADD COLUMN observacoes TEXT;
        
        RAISE NOTICE '✅ Coluna observacoes adicionada';
    END IF;
END $$;

-- 3. Verificar se RLS está habilitado e criar políticas se necessário
DO $$
BEGIN
    -- Habilitar RLS se não estiver
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'assinaturas_ponto' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE assinaturas_ponto ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ RLS habilitado para assinaturas_ponto';
    END IF;
END $$;

-- 4. Criar políticas RLS para funcionários
DROP POLICY IF EXISTS "Funcionários podem ver suas próprias assinaturas" ON assinaturas_ponto;
CREATE POLICY "Funcionários podem ver suas próprias assinaturas" ON assinaturas_ponto
    FOR SELECT USING (
        colaborador_id IN (
            SELECT id FROM colaboradores 
            WHERE auth_uid = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Funcionários podem inserir suas próprias assinaturas" ON assinaturas_ponto;
CREATE POLICY "Funcionários podem inserir suas próprias assinaturas" ON assinaturas_ponto
    FOR INSERT WITH CHECK (
        colaborador_id IN (
            SELECT id FROM colaboradores 
            WHERE auth_uid = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Funcionários podem atualizar suas próprias assinaturas" ON assinaturas_ponto;
CREATE POLICY "Funcionários podem atualizar suas próprias assinaturas" ON assinaturas_ponto
    FOR UPDATE USING (
        colaborador_id IN (
            SELECT id FROM colaboradores 
            WHERE auth_uid = auth.uid()
        )
    );

-- 5. Criar políticas para administradores
DROP POLICY IF EXISTS "Administradores podem ver todas as assinaturas" ON assinaturas_ponto;
CREATE POLICY "Administradores podem ver todas as assinaturas" ON assinaturas_ponto
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM app_users 
            WHERE auth_uid = auth.uid() 
            AND role = 'admin'
        )
    );

-- 6. Verificar estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'assinaturas_ponto'
ORDER BY ordinal_position;

RAISE NOTICE '🎉 Fix da assinatura digital concluído com sucesso!';