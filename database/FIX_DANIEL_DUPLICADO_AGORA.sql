-- INVESTIGAÇÃO URGENTE: Usuários criados automaticamente
-- Data: 17/12/2024 - Problema reportado novamente

-- 1. VERIFICAR OS USUÁRIOS ESPECÍFICOS MENCIONADOS
SELECT 
    'USUARIOS_SUSPEITOS' as tipo,
    id, nome, email, auth_uid, colaborador_id, 
    created_at, updated_at, empresa_id
FROM app_users 
WHERE id IN (
    'e4df4e2a-2496-4462-a937-4a8875ae3477',
    '68cb640b-dae3-4059-b6e9-6884a6f4b63a'
)
ORDER BY created_at DESC;

-- 2. VERIFICAR USUÁRIOS CRIADOS NAS ÚLTIMAS 2 HORAS
SELECT 
    'USUARIOS_RECENTES' as tipo,
    id, nome, email, auth_uid, colaborador_id, 
    created_at, updated_at, empresa_id
FROM app_users 
WHERE created_at >= NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC;

-- 3. VERIFICAR USUÁRIOS COM EMAILS TEMPORÁRIOS
SELECT 
    'USUARIOS_TEMPORARIOS' as tipo,
    id, nome, email, auth_uid, colaborador_id, 
    created_at, updated_at, empresa_id
FROM app_users 
WHERE email LIKE '%@temp.com'
ORDER BY created_at DESC;

-- 4. VERIFICAR USUÁRIOS ÓRFÃOS (SEM COLABORADOR_ID)
SELECT 
    'USUARIOS_ORFAOS' as tipo,
    id, nome, email, auth_uid, colaborador_id, 
    created_at, updated_at, empresa_id
FROM app_users 
WHERE colaborador_id IS NULL
ORDER BY created_at DESC;

-- 5. VERIFICAR COLABORADORES COM NOMES HUGO, DANIEL, EDUARDO
SELECT 
    'COLABORADORES_NOMES' as tipo,
    id, nome, cpf, email_corporativo, email_pessoal,
    created_at, updated_at, empresa_id
FROM colaboradores 
WHERE nome ILIKE '%hugo%' 
   OR nome ILIKE '%daniel%' 
   OR nome ILIKE '%eduardo%'
ORDER BY created_at DESC;

-- 6. VERIFICAR SE EXISTEM TRIGGERS AUTOMÁTICOS
SELECT 
    'TRIGGERS_AUTOMATICOS' as tipo,
    trigger_name, event_manipulation, event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'public'
  AND (event_object_table = 'colaboradores' OR event_object_table = 'app_users')
ORDER BY trigger_name;

-- 7. CONTAR TOTAIS
SELECT 
    'RESUMO_CONTADORES' as tipo,
    (SELECT COUNT(*) FROM app_users WHERE id IN ('e4df4e2a-2496-4462-a937-4a8875ae3477','68cb640b-dae3-4059-b6e9-6884a6f4b63a')) as usuarios_suspeitos,
    (SELECT COUNT(*) FROM app_users WHERE created_at >= NOW() - INTERVAL '2 hours') as usuarios_recentes_2h,
    (SELECT COUNT(*) FROM app_users WHERE email LIKE '%@temp.com') as usuarios_temporarios,
    (SELECT COUNT(*) FROM app_users WHERE colaborador_id IS NULL) as usuarios_orfaos,
    (SELECT COUNT(*) FROM colaboradores WHERE nome ILIKE '%hugo%' OR nome ILIKE '%daniel%' OR nome ILIKE '%eduardo%') as colaboradores_nomes;

-- 8. VERIFICAR FUNÇÕES AUTOMÁTICAS NO BANCO
SELECT 
    'FUNCOES_AUTOMATICAS' as tipo,
    routine_name, routine_type, routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND (routine_name ILIKE '%colaborador%' OR routine_name ILIKE '%app_user%' OR routine_name ILIKE '%usuario%')
ORDER BY routine_name;