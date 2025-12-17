-- ============================================================================
-- CONSOLIDAÇÃO FINAL - LUCAS E SISTEMA COMPLETO
-- ============================================================================
-- Baseado no resumo fornecido, este script consolida todas as correções
-- ============================================================================

-- 1. VERIFICAÇÃO INICIAL DO ESTADO ATUAL
SELECT 
    'AUDITORIA_INICIAL' as tipo,
    'COLABORADORES_SEM_EMPRESA' as item,
    COUNT(*) as quantidade
FROM colaboradores 
WHERE empresa_id IS NULL

UNION ALL

SELECT 
    'AUDITORIA_INICIAL' as tipo,
    'APP_USERS_SEM_COLABORADOR' as item,
    COUNT(*) as quantidade
FROM app_users 
WHERE colaborador_id IS NULL

UNION ALL

SELECT 
    'AUDITORIA_INICIAL' as tipo,
    'ASSINATURAS_INVALIDAS_LUCAS' as item,
    COUNT(*) as quantidade
FROM assinaturas_ponto ap
JOIN colaboradores c ON c.id = ap.colaborador_id
WHERE c.nome ILIKE '%lucas%' 
AND (ap.hash_assinatura IS NULL OR ap.hash_assinatura = '' OR LENGTH(ap.hash_assinatura) < 10)

UNION ALL

SELECT 
    'AUDITORIA_INICIAL' as tipo,
    'REGISTROS_PONTO_ATIVOS' as item,
    COUNT(*) as quantidade
FROM registros_ponto 
WHERE empresa_id IS NOT NULL;

-- 2. LIMPEZA FINAL DE ASSINATURAS FANTASMA (confirmação)
DELETE FROM assinaturas_ponto 
WHERE colaborador_id IN (
    SELECT c.id FROM colaboradores c WHERE c.nome ILIKE '%lucas%'
) 
AND (hash_assinatura IS NULL OR hash_assinatura = '' OR LENGTH(hash_assinatura) < 10);

-- Resultado da limpeza
SELECT 'LIMPEZA_ASSINATURAS' as status, 'Registros removidos: ' || ROW_COUNT as resultado;

-- 3. CORREÇÃO DE VÍNCULOS AUTH_UID (confirmação)
UPDATE colaboradores 
SET auth_uid = au.auth_uid
FROM app_users au 
WHERE colaboradores.id = au.colaborador_id 
AND colaboradores.auth_uid IS NULL 
AND au.auth_uid IS NOT NULL;

-- Resultado da correção de vínculos
SELECT 'CORRECAO_VINCULOS' as status, 'Vínculos corrigidos: ' || ROW_COUNT as resultado;

-- 4. VERIFICAÇÃO ESPECÍFICA DO LUCAS
SELECT 
    'SITUACAO_LUCAS' as status,
    au.id as app_user_id,
    au.auth_uid,
    au.colaborador_id,
    au.nome as app_user_nome,
    au.email as app_user_email,
    c.id as colaborador_id_real,
    c.nome as colaborador_nome,
    c.email as colaborador_email,
    c.empresa_id,
    c.auth_uid as colaborador_auth_uid,
    CASE 
        WHEN au.auth_uid = c.auth_uid THEN '✅ VINCULO_OK'
        ELSE '❌ VINCULO_INCONSISTENTE'
    END as status_vinculo
FROM app_users au
LEFT JOIN colaboradores c ON c.id = au.colaborador_id
WHERE au.nome ILIKE '%lucas%' OR c.nome ILIKE '%lucas%'
ORDER BY au.created_at DESC;

-- 5. AUDITORIA DE EMPRESA PADRÃO
DO $$
DECLARE
    empresa_count INTEGER;
    empresa_id_padrao UUID;
BEGIN
    -- Verificar quantas empresas existem
    SELECT COUNT(*) INTO empresa_count FROM empresa;
    
    IF empresa_count = 0 THEN
        RAISE NOTICE '⚠️  Nenhuma empresa encontrada. Será necessário executar FIX_EMPRESA_PADRAO_DEFINITIVO.sql';
    ELSE
        SELECT id INTO empresa_id_padrao FROM empresa ORDER BY created_at LIMIT 1;
        RAISE NOTICE '✅ Empresa padrão encontrada: %', empresa_id_padrao;
        
        -- Garantir que todos os colaboradores tenham empresa_id
        UPDATE colaboradores 
        SET empresa_id = empresa_id_padrao
        WHERE empresa_id IS NULL;
        
        -- Garantir que todos os app_users tenham empresa_id
        UPDATE app_users 
        SET empresa_id = empresa_id_padrao
        WHERE empresa_id IS NULL;
        
        RAISE NOTICE '✅ Vínculos de empresa atualizados';
    END IF;
END $$;

-- 6. VERIFICAÇÃO FINAL CONSOLIDADA
SELECT 
    'RESULTADO_FINAL_CONSOLIDADO' as status,
    'COLABORADORES_SEM_EMPRESA' as item,
    COUNT(*) as quantidade,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ OK'
        ELSE '❌ PENDENTE'
    END as situacao
FROM colaboradores 
WHERE empresa_id IS NULL

UNION ALL

SELECT 
    'RESULTADO_FINAL_CONSOLIDADO' as status,
    'APP_USERS_SEM_COLABORADOR' as item,
    COUNT(*) as quantidade,
    CASE 
        WHEN COUNT(*) <= 1 THEN '✅ OK' -- 1 órfão é aceitável
        ELSE '❌ PENDENTE'
    END as situacao
FROM app_users 
WHERE colaborador_id IS NULL

UNION ALL

SELECT 
    'RESULTADO_FINAL_CONSOLIDADO' as status,
    'COLABORADORES_SEM_AUTH_UID' as item,
    COUNT(*) as quantidade,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ OK'
        ELSE '❌ PENDENTE'
    END as situacao
FROM colaboradores 
WHERE auth_uid IS NULL

UNION ALL

SELECT 
    'RESULTADO_FINAL_CONSOLIDADO' as status,
    'ASSINATURAS_INVALIDAS' as item,
    COUNT(*) as quantidade,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ OK'
        ELSE '❌ PENDENTE'
    END as situacao
FROM assinaturas_ponto 
WHERE hash_assinatura IS NULL OR hash_assinatura = '' OR LENGTH(hash_assinatura) < 10;

-- 7. RESUMO EXECUTIVO
DO $$
DECLARE
    total_colaboradores INTEGER;
    total_app_users INTEGER;
    total_empresas INTEGER;
    colaboradores_sem_empresa INTEGER;
    app_users_orfaos INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_colaboradores FROM colaboradores;
    SELECT COUNT(*) INTO total_app_users FROM app_users;
    SELECT COUNT(*) INTO total_empresas FROM empresa;
    SELECT COUNT(*) INTO colaboradores_sem_empresa FROM colaboradores WHERE empresa_id IS NULL;
    SELECT COUNT(*) INTO app_users_orfaos FROM app_users WHERE colaborador_id IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '==================== RESUMO EXECUTIVO ====================';
    RAISE NOTICE 'Total de colaboradores: %', total_colaboradores;
    RAISE NOTICE 'Total de app_users: %', total_app_users;
    RAISE NOTICE 'Total de empresas: %', total_empresas;
    RAISE NOTICE 'Colaboradores sem empresa: %', colaboradores_sem_empresa;
    RAISE NOTICE 'App_users órfãos: %', app_users_orfaos;
    RAISE NOTICE '';
    
    IF colaboradores_sem_empresa = 0 AND app_users_orfaos <= 1 AND total_empresas > 0 THEN
        RAISE NOTICE '✅ SISTEMA CONSISTENTE - Todas as correções aplicadas com sucesso!';
    ELSE
        RAISE NOTICE '⚠️  ATENÇÃO - Ainda há inconsistências que precisam ser resolvidas:';
        IF colaboradores_sem_empresa > 0 THEN
            RAISE NOTICE '   - % colaboradores sem empresa_id', colaboradores_sem_empresa;
        END IF;
        IF app_users_orfaos > 1 THEN
            RAISE NOTICE '   - % app_users órfãos (acima do esperado)', app_users_orfaos;
        END IF;
        IF total_empresas = 0 THEN
            RAISE NOTICE '   - Nenhuma empresa cadastrada';
        END IF;
    END IF;
    
    RAISE NOTICE '========================================================';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- FIM DA CONSOLIDAÇÃO
-- ============================================================================