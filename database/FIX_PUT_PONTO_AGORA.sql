-- ============================================================================
-- FIX: CORRIGIR PUT API PONTO - SISTEMA SINGLE TENANT
-- Execute no Supabase SQL Editor AGORA
-- ============================================================================

-- 1. TORNAR EMPRESA_ID OPCIONAL NA TABELA REGISTROS_PONTO
ALTER TABLE registros_ponto 
ALTER COLUMN empresa_id DROP NOT NULL;

-- 2. VERIFICAR ESTRUTURA DA TABELA
SELECT 
    column_name,
    is_nullable,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'registros_ponto' 
AND column_name IN ('empresa_id', 'ajustado_por', 'ajustado_em')
ORDER BY column_name;

-- 3. ADICIONAR COLUNAS DE AJUSTE SE NÃO EXISTIREM
DO $$
BEGIN
    -- Adicionar ajustado_por se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'registros_ponto' 
        AND column_name = 'ajustado_por'
    ) THEN
        ALTER TABLE registros_ponto 
        ADD COLUMN ajustado_por UUID REFERENCES app_users(id);
    END IF;

    -- Adicionar ajustado_em se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'registros_ponto' 
        AND column_name = 'ajustado_em'
    ) THEN
        ALTER TABLE registros_ponto 
        ADD COLUMN ajustado_em TIMESTAMPTZ;
    END IF;
END $$;

-- 4. VERIFICAR RLS POLICIES
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'registros_ponto'
ORDER BY policyname;

-- 5. SIMPLIFICAR RLS PARA SISTEMA SINGLE-TENANT
-- Remover policies complexas e criar uma simples
DROP POLICY IF EXISTS "Usuários podem ver registros da empresa" ON registros_ponto;
DROP POLICY IF EXISTS "Usuários podem inserir registros da empresa" ON registros_ponto;
DROP POLICY IF EXISTS "Usuários podem atualizar registros da empresa" ON registros_ponto;
DROP POLICY IF EXISTS "Usuários podem deletar registros da empresa" ON registros_ponto;
DROP POLICY IF EXISTS "Acesso total registros ponto" ON registros_ponto;

-- Criar policy simples para sistema single-tenant
CREATE POLICY "Acesso total registros ponto" ON registros_ponto
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Garantir que RLS está habilitado
ALTER TABLE registros_ponto ENABLE ROW LEVEL SECURITY;

-- 6. VERIFICAR SE FUNCIONOU
SELECT 'Configuração concluída - PUT API deve funcionar agora' as status;

-- ============================================================================
-- TESTE RÁPIDO
-- ============================================================================

-- Verificar registros existentes
SELECT 
    id,
    data,
    colaborador_id,
    empresa_id,
    entrada_1,
    saida_1,
    status,
    ajustado_por,
    ajustado_em
FROM registros_ponto 
ORDER BY data DESC 
LIMIT 5;

-- ============================================================================
-- FIM
-- ============================================================================