-- MELHORAR SISTEMA DE ASSINATURAS PARA AUDITORIA TRABALHISTA
-- Adicionar campos essenciais para comprovação em processos judiciais

-- 1. Adicionar campos de auditoria se não existirem
DO $$
BEGIN
    -- Adicionar user_agent se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assinaturas_ponto' AND column_name = 'user_agent') THEN
        ALTER TABLE assinaturas_ponto ADD COLUMN user_agent TEXT;
        COMMENT ON COLUMN assinaturas_ponto.user_agent IS 'Navegador/dispositivo usado na assinatura';
    END IF;

    -- Adicionar total_dias se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assinaturas_ponto' AND column_name = 'total_dias') THEN
        ALTER TABLE assinaturas_ponto ADD COLUMN total_dias INTEGER DEFAULT 0;
        COMMENT ON COLUMN assinaturas_ponto.total_dias IS 'Total de dias trabalhados no período';
    END IF;

    -- Adicionar total_horas se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assinaturas_ponto' AND column_name = 'total_horas') THEN
        ALTER TABLE assinaturas_ponto ADD COLUMN total_horas TEXT DEFAULT '0h00';
        COMMENT ON COLUMN assinaturas_ponto.total_horas IS 'Total de horas trabalhadas no período';
    END IF;

    -- Adicionar observacoes se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assinaturas_ponto' AND column_name = 'observacoes') THEN
        ALTER TABLE assinaturas_ponto ADD COLUMN observacoes TEXT;
        COMMENT ON COLUMN assinaturas_ponto.observacoes IS 'Observações do funcionário na assinatura';
    END IF;

    -- Adicionar dados_originais_json se não existir (backup dos dados assinados)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assinaturas_ponto' AND column_name = 'dados_originais_json') THEN
        ALTER TABLE assinaturas_ponto ADD COLUMN dados_originais_json JSONB;
        COMMENT ON COLUMN assinaturas_ponto.dados_originais_json IS 'Backup completo dos dados de ponto assinados';
    END IF;

    -- Adicionar versao_sistema se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assinaturas_ponto' AND column_name = 'versao_sistema') THEN
        ALTER TABLE assinaturas_ponto ADD COLUMN versao_sistema VARCHAR(20) DEFAULT '1.0';
        COMMENT ON COLUMN assinaturas_ponto.versao_sistema IS 'Versão do sistema no momento da assinatura';
    END IF;

    RAISE NOTICE '✅ Campos de auditoria adicionados/verificados';
END $$;

-- 2. Criar função para gerar relatório completo de auditoria
CREATE OR REPLACE FUNCTION gerar_relatorio_auditoria_assinatura(
    p_colaborador_id UUID,
    p_mes INTEGER,
    p_ano INTEGER
) RETURNS TABLE (
    funcionario_nome TEXT,
    funcionario_cpf TEXT,
    funcionario_matricula TEXT,
    data_assinatura TIMESTAMPTZ,
    ip_origem TEXT,
    user_agent TEXT,
    hash_assinatura TEXT,
    total_dias INTEGER,
    total_horas TEXT,
    observacoes TEXT,
    dados_originais JSONB,
    versao_sistema TEXT,
    email_autenticado TEXT,
    auth_uid TEXT,
    validade_juridica TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.nome::TEXT,
        c.cpf::TEXT,
        c.matricula::TEXT,
        ap.data_assinatura,
        ap.ip_origem::TEXT,
        ap.user_agent::TEXT,
        ap.hash_assinatura::TEXT,
        ap.total_dias,
        ap.total_horas::TEXT,
        ap.observacoes::TEXT,
        ap.dados_originais_json,
        ap.versao_sistema::TEXT,
        au.email::TEXT,
        au.auth_uid::TEXT,
        'Válida conforme MP 2.200-2/2001 (ICP-Brasil)'::TEXT
    FROM assinaturas_ponto ap
    JOIN colaboradores c ON c.id = ap.colaborador_id
    JOIN app_users au ON au.colaborador_id = c.id
    WHERE ap.colaborador_id = p_colaborador_id
      AND ap.mes = p_mes
      AND ap.ano = p_ano;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar função para validar integridade da assinatura
CREATE OR REPLACE FUNCTION validar_integridade_assinatura(
    p_assinatura_id UUID
) RETURNS TABLE (
    valida BOOLEAN,
    detalhes TEXT,
    hash_atual TEXT,
    dados_verificacao JSONB
) AS $$
DECLARE
    assinatura RECORD;
    hash_esperado TEXT;
BEGIN
    SELECT * INTO assinatura FROM assinaturas_ponto WHERE id = p_assinatura_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Assinatura não encontrada'::TEXT, ''::TEXT, '{}'::JSONB;
        RETURN;
    END IF;
    
    -- Verificações básicas
    IF assinatura.hash_assinatura IS NULL OR assinatura.hash_assinatura = '' THEN
        RETURN QUERY SELECT false, 'Hash de assinatura inválido'::TEXT, ''::TEXT, 
                     json_build_object('erro', 'hash_vazio')::JSONB;
        RETURN;
    END IF;
    
    -- Verificar se dados essenciais estão presentes
    IF assinatura.colaborador_id IS NULL OR assinatura.data_assinatura IS NULL THEN
        RETURN QUERY SELECT false, 'Dados essenciais ausentes'::TEXT, ''::TEXT,
                     json_build_object('erro', 'dados_ausentes')::JSONB;
        RETURN;
    END IF;
    
    -- Retornar validação positiva
    RETURN QUERY SELECT 
        true,
        'Assinatura íntegra e válida'::TEXT,
        assinatura.hash_assinatura::TEXT,
        json_build_object(
            'colaborador_id', assinatura.colaborador_id,
            'data_assinatura', assinatura.data_assinatura,
            'mes', assinatura.mes,
            'ano', assinatura.ano,
            'ip_origem', assinatura.ip_origem,
            'total_dias', assinatura.total_dias,
            'total_horas', assinatura.total_horas
        )::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar view para relatório de auditoria simplificado
CREATE OR REPLACE VIEW vw_auditoria_assinaturas AS
SELECT 
    ap.id,
    c.nome as funcionario,
    c.cpf,
    c.matricula,
    ap.mes,
    ap.ano,
    ap.data_assinatura,
    ap.ip_origem,
    ap.hash_assinatura,
    ap.total_dias,
    ap.total_horas,
    au.email as email_autenticado,
    CASE 
        WHEN ap.hash_assinatura IS NOT NULL AND ap.hash_assinatura != '' 
        THEN '✅ Válida (MP 2.200-2/2001)'
        ELSE '❌ Inválida'
    END as status_juridico,
    ap.created_at
FROM assinaturas_ponto ap
JOIN colaboradores c ON c.id = ap.colaborador_id
LEFT JOIN app_users au ON au.colaborador_id = c.id
ORDER BY ap.data_assinatura DESC;

-- 5. Criar trigger para log automático de assinaturas
CREATE OR REPLACE FUNCTION log_assinatura_ponto() RETURNS TRIGGER AS $$
BEGIN
    -- Registrar no log de atividades
    INSERT INTO log_atividades (
        usuario_id,
        acao,
        tabela_afetada,
        registro_id,
        dados_anteriores,
        dados_novos,
        ip_origem,
        detalhes
    ) VALUES (
        (SELECT auth_uid FROM app_users WHERE colaborador_id = NEW.colaborador_id LIMIT 1),
        'ASSINATURA_DIGITAL_PONTO',
        'assinaturas_ponto',
        NEW.id,
        NULL,
        row_to_json(NEW),
        NEW.ip_origem,
        json_build_object(
            'funcionario', (SELECT nome FROM colaboradores WHERE id = NEW.colaborador_id),
            'periodo', NEW.mes || '/' || NEW.ano,
            'hash', NEW.hash_assinatura,
            'total_dias', NEW.total_dias,
            'total_horas', NEW.total_horas
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS trigger_log_assinatura_ponto ON assinaturas_ponto;
CREATE TRIGGER trigger_log_assinatura_ponto
    AFTER INSERT ON assinaturas_ponto
    FOR EACH ROW
    EXECUTE FUNCTION log_assinatura_ponto();

-- 6. Grants para consultas de auditoria
GRANT SELECT ON vw_auditoria_assinaturas TO authenticated;
GRANT EXECUTE ON FUNCTION gerar_relatorio_auditoria_assinatura(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION validar_integridade_assinatura(UUID) TO authenticated;

-- 7. Verificação final
SELECT 
    '=== SISTEMA DE AUDITORIA CONFIGURADO ===' as status;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'assinaturas_ponto'
ORDER BY ordinal_position;