-- FIX COMPLETO: Assinaturas Fantasma e Problemas de Ponto
-- Problema: Todos colaboradores aparecem como tendo assinado, mas não há registros na tabela

-- 1. VERIFICAR SE A TABELA ASSINATURAS_PONTO EXISTE
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'assinaturas_ponto') THEN
        -- Criar tabela se não existir
        CREATE TABLE assinaturas_ponto (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
            mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
            ano INTEGER NOT NULL CHECK (ano >= 2020 AND ano <= 2030),
            data_assinatura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            total_dias INTEGER DEFAULT 0,
            total_horas TEXT DEFAULT '0h00',
            hash_assinatura TEXT,
            ip_origem INET,
            observacoes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(colaborador_id, mes, ano)
        );
        
        -- Habilitar RLS
        ALTER TABLE assinaturas_ponto ENABLE ROW LEVEL SECURITY;
        
        -- Política para funcionários (só veem suas próprias assinaturas)
        CREATE POLICY "Funcionarios podem ver suas assinaturas" ON assinaturas_ponto
            FOR SELECT USING (
                colaborador_id IN (
                    SELECT colaborador_id FROM app_users 
                    WHERE auth_uid = auth.uid()
                )
            );
        
        -- Política para admins (veem todas)
        CREATE POLICY "Admins podem ver todas assinaturas" ON assinaturas_ponto
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM app_users 
                    WHERE auth_uid = auth.uid() 
                    AND role IN ('admin', 'super_admin')
                )
            );
        
        RAISE NOTICE 'Tabela assinaturas_ponto criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela assinaturas_ponto já existe';
    END IF;
END $$;

-- 2. LIMPAR QUALQUER ASSINATURA FANTASMA (se houver)
DELETE FROM assinaturas_ponto WHERE hash_assinatura IS NULL OR hash_assinatura = '';

-- 3. CORRIGIR PROBLEMAS DE AUTH_UID NOS APP_USERS
-- Atualizar auth_uid para usuários que estão com undefined ou null
UPDATE app_users 
SET auth_uid = (
    SELECT au.id 
    FROM auth.users au 
    WHERE au.email = app_users.email
    LIMIT 1
)
WHERE auth_uid IS NULL 
   OR auth_uid = 'undefined'
   OR auth_uid = '';

-- 4. VERIFICAR E CORRIGIR VÍNCULOS COLABORADOR-USUÁRIO
-- Garantir que todos os colaboradores ativos tenham um usuário vinculado
INSERT INTO app_users (colaborador_id, nome, email, role, auth_uid)
SELECT 
    c.id,
    c.nome,
    COALESCE(c.email_corporativo, c.email_pessoal, c.nome || '@temp.com'),
    'funcionario',
    au.id
FROM colaboradores c
LEFT JOIN app_users ap ON ap.colaborador_id = c.id
LEFT JOIN auth.users au ON au.email = COALESCE(c.email_corporativo, c.email_pessoal)
WHERE c.status = 'Ativo' 
  AND ap.id IS NULL
  AND au.id IS NOT NULL
ON CONFLICT (colaborador_id) DO NOTHING;

-- 5. CORRIGIR EMPRESA_ID NOS APP_USERS
UPDATE app_users 
SET empresa_id = (
    SELECT c.empresa_id 
    FROM colaboradores c 
    WHERE c.id = app_users.colaborador_id
)
WHERE empresa_id IS NULL 
  AND colaborador_id IS NOT NULL;

-- 6. VERIFICAR REGISTROS DE PONTO ÓRFÃOS
-- Garantir que todos os registros de ponto tenham colaborador_id válido
DELETE FROM registros_ponto 
WHERE colaborador_id IS NULL 
   OR colaborador_id NOT IN (SELECT id FROM colaboradores);

-- 7. CRIAR FUNÇÃO PARA VERIFICAR SE PONTO ESTÁ ASSINADO
CREATE OR REPLACE FUNCTION verificar_ponto_assinado(
    p_colaborador_id UUID,
    p_mes INTEGER,
    p_ano INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM assinaturas_ponto 
        WHERE colaborador_id = p_colaborador_id 
          AND mes = p_mes 
          AND ano = p_ano
          AND hash_assinatura IS NOT NULL
          AND hash_assinatura != ''
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. CRIAR VIEW PARA STATUS DE ASSINATURAS
CREATE OR REPLACE VIEW vw_status_assinaturas AS
SELECT 
    c.id as colaborador_id,
    c.nome,
    c.email_corporativo,
    EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER as mes_atual,
    EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER as ano_atual,
    CASE 
        WHEN ap.id IS NOT NULL THEN true
        ELSE false
    END as tem_assinatura,
    ap.data_assinatura,
    ap.total_dias,
    ap.total_horas
FROM colaboradores c
LEFT JOIN assinaturas_ponto ap ON (
    ap.colaborador_id = c.id 
    AND ap.mes = EXTRACT(MONTH FROM CURRENT_DATE)
    AND ap.ano = EXTRACT(YEAR FROM CURRENT_DATE)
)
WHERE c.status = 'Ativo';

-- 9. ATUALIZAR POLÍTICAS RLS PARA REGISTROS_PONTO
DROP POLICY IF EXISTS "Funcionarios podem ver seus registros" ON registros_ponto;
CREATE POLICY "Funcionarios podem ver seus registros" ON registros_ponto
    FOR SELECT USING (
        colaborador_id IN (
            SELECT colaborador_id FROM app_users 
            WHERE auth_uid = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Funcionarios podem inserir seus registros" ON registros_ponto;
CREATE POLICY "Funcionarios podem inserir seus registros" ON registros_ponto
    FOR INSERT WITH CHECK (
        colaborador_id IN (
            SELECT colaborador_id FROM app_users 
            WHERE auth_uid = auth.uid()
        )
    );

-- 10. VERIFICAÇÃO FINAL
DO $$
DECLARE
    total_colaboradores INTEGER;
    total_usuarios INTEGER;
    total_assinaturas INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_colaboradores FROM colaboradores WHERE status = 'Ativo';
    SELECT COUNT(*) INTO total_usuarios FROM app_users WHERE colaborador_id IS NOT NULL;
    SELECT COUNT(*) INTO total_assinaturas FROM assinaturas_ponto;
    
    RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';
    RAISE NOTICE 'Colaboradores ativos: %', total_colaboradores;
    RAISE NOTICE 'Usuários vinculados: %', total_usuarios;
    RAISE NOTICE 'Assinaturas reais: %', total_assinaturas;
    
    IF total_assinaturas = 0 THEN
        RAISE NOTICE '✅ CORRETO: Nenhuma assinatura fantasma encontrada';
    ELSE
        RAISE NOTICE '⚠️ ATENÇÃO: % assinaturas encontradas - verificar se são legítimas', total_assinaturas;
    END IF;
END $$;

-- 11. GRANT PERMISSIONS
GRANT SELECT ON vw_status_assinaturas TO authenticated;
GRANT EXECUTE ON FUNCTION verificar_ponto_assinado(UUID, INTEGER, INTEGER) TO authenticated;