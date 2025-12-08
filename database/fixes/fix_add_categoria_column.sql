-- ============================================================================
-- FIX: Adicionar coluna categoria que está faltando
-- ============================================================================
-- Execute este script no Supabase SQL Editor
-- ============================================================================

-- Verificar se a tabela existe
DO $$
BEGIN
    -- Se a tabela templates_email existe mas não tem a coluna categoria
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'templates_email'
    ) THEN
        -- Adicionar coluna categoria se não existir
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'templates_email' 
            AND column_name = 'categoria'
        ) THEN
            ALTER TABLE templates_email ADD COLUMN categoria VARCHAR(50) NOT NULL DEFAULT 'sistema';
            RAISE NOTICE '✅ Coluna categoria adicionada com sucesso!';
        ELSE
            RAISE NOTICE 'ℹ️ Coluna categoria já existe';
        END IF;
    ELSE
        RAISE NOTICE '⚠️ Tabela templates_email não existe ainda';
    END IF;
END $$;

-- Inserir templates padrão
DO $$
DECLARE
    v_empresa_id UUID;
BEGIN
    SELECT id INTO v_empresa_id FROM empresa LIMIT 1;
    
    IF v_empresa_id IS NOT NULL THEN
        INSERT INTO templates_email (codigo, nome, descricao, categoria, assunto, corpo_html, corpo_texto, variaveis_disponiveis, sistema, empresa_id)
        VALUES 
        ('bem_vindo', 'Boas-vindas ao Colaborador', 'E-mail de boas-vindas enviado na admissão', 'rh', 'Bem-vindo(a) à {{nome_empresa}}!', '<h2>Olá {{nome_colaborador}}!</h2><p>É com grande satisfação que damos as boas-vindas à equipe da <strong>{{nome_empresa}}</strong>.</p>', 'Olá {{nome_colaborador}}! Bem-vindo à {{nome_empresa}}.', '[{"nome":"nome_colaborador","descricao":"Nome do colaborador"}]'::jsonb, true, v_empresa_id),
        ('aniversario', 'Feliz Aniversário', 'E-mail de parabéns no aniversário', 'rh', 'Feliz Aniversário, {{nome_colaborador}}! 🎉', '<h2>Parabéns, {{nome_colaborador}}! 🎂</h2><p>A equipe da <strong>{{nome_empresa}}</strong> deseja um feliz aniversário!</p>', 'Parabéns! Feliz aniversário!', '[{"nome":"nome_colaborador","descricao":"Nome do colaborador"}]'::jsonb, true, v_empresa_id),
        ('ferias_aprovadas', 'Férias Aprovadas', 'Notificação de aprovação de férias', 'ferias', 'Suas férias foram aprovadas!', '<h2>Olá {{nome_colaborador}}!</h2><p>Suas férias foram <strong>aprovadas</strong>!</p>', 'Suas férias foram aprovadas!', '[{"nome":"nome_colaborador","descricao":"Nome do colaborador"}]'::jsonb, true, v_empresa_id),
        ('documento_vencendo', 'Documento Vencendo', 'Alerta de documento próximo ao vencimento', 'documentos', 'Atenção: {{tipo_documento}} vencendo em breve', '<h2>Olá {{nome_colaborador}}!</h2><p>Seu documento <strong>{{tipo_documento}}</strong> está próximo ao vencimento.</p>', 'Seu documento está vencendo.', '[{"nome":"nome_colaborador","descricao":"Nome do colaborador"}]'::jsonb, true, v_empresa_id),
        ('holerite_disponivel', 'Holerite Disponível', 'Notificação de holerite disponível', 'folha', 'Seu holerite de {{mes_referencia}} está disponível', '<h2>Olá {{nome_colaborador}}!</h2><p>Seu holerite já está disponível para consulta.</p>', 'Seu holerite está disponível.', '[{"nome":"nome_colaborador","descricao":"Nome do colaborador"}]'::jsonb, true, v_empresa_id)
        ON CONFLICT (empresa_id, codigo) DO NOTHING;
        
        RAISE NOTICE '✅ Templates inseridos com sucesso!';
    ELSE
        RAISE NOTICE '⚠️ Nenhuma empresa encontrada';
    END IF;
END $$;

-- Verificar resultado
SELECT 
    'templates_email' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT categoria) as total_categorias
FROM templates_email;
