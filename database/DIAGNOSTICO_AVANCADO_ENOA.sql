-- DIAGNÓSTICO AVANÇADO - PROBLEMA PAINEL ENOA
-- Execute este SQL no Supabase para investigar mais profundamente

-- 1. VERIFICAR SE EXISTE ALGUM REGISTRO OCULTO
SELECT 
    'REGISTROS OCULTOS' as tipo,
    COUNT(*) as total,
    STRING_AGG(DISTINCT rp.status, ', ') as status_encontrados
FROM registros_ponto rp
LEFT JOIN colaboradores c ON c.id = rp.colaborador_id
WHERE c.nome ILIKE '%enoa%'
   OR rp.colaborador_id = '43678ebd-27ee-49f1-9192-327c6e434d68';

-- 2. VERIFICAR DADOS NA API DO FUNCIONÁRIO (simulação)
SELECT 
    'SIMULACAO API FUNCIONARIO' as tipo,
    rp.id,
    rp.data,
    rp.entrada_1,
    rp.saida_1,
    rp.entrada_2,
    rp.saida_2,
    rp.status,
    rp.created_at,
    c.nome as colaborador_nome
FROM registros_ponto rp
LEFT JOIN colaboradores c ON c.id = rp.colaborador_id
WHERE rp.colaborador_id = '43678ebd-27ee-49f1-9192-327c6e434d68'
ORDER BY rp.data DESC
LIMIT 10;

-- 3. VERIFICAR SE HÁ PROBLEMA COM AUTH_UID
SELECT 
    'VERIFICACAO AUTH_UID' as tipo,
    au.id,
    au.auth_uid,
    au.colaborador_id,
    au.role,
    c.nome as colaborador_nome,
    c.email
FROM app_users au
LEFT JOIN colaboradores c ON c.id = au.colaborador_id
WHERE c.nome ILIKE '%enoa%'
   OR au.colaborador_id = '43678ebd-27ee-49f1-9192-327c6e434d68';

-- 4. VERIFICAR REGISTROS EM OUTRAS TABELAS RELACIONADAS
SELECT 
    'ASSINATURAS PONTO' as tipo,
    COUNT(*) as total
FROM assinaturas_ponto ap
WHERE ap.colaborador_id = '43678ebd-27ee-49f1-9192-327c6e434d68';

-- 5. VERIFICAR SE HÁ REGISTROS COM DATA FUTURA OU MUITO ANTIGA
SELECT 
    'REGISTROS ANOMALOS' as tipo,
    rp.id,
    rp.data,
    rp.created_at,
    CASE 
        WHEN rp.data > CURRENT_DATE + INTERVAL '1 day' THEN 'FUTURO'
        WHEN rp.data < CURRENT_DATE - INTERVAL '365 days' THEN 'MUITO_ANTIGO'
        ELSE 'NORMAL'
    END as anomalia
FROM registros_ponto rp
LEFT JOIN colaboradores c ON c.id = rp.colaborador_id
WHERE c.nome ILIKE '%enoa%'
   OR rp.colaborador_id = '43678ebd-27ee-49f1-9192-327c6e434d68';

-- 6. VERIFICAR LOGS DE ATIVIDADE
SELECT 
    'LOGS ATIVIDADE' as tipo,
    la.acao,
    la.tabela,
    la.created_at,
    la.detalhes
FROM log_atividades la
WHERE la.detalhes ILIKE '%enoa%'
   OR la.detalhes ILIKE '%43678ebd-27ee-49f1-9192-327c6e434d68%'
ORDER BY la.created_at DESC
LIMIT 5;

-- 7. VERIFICAR SE O PROBLEMA É COM A VIEW/FUNÇÃO
SELECT 
    'TESTE FUNCAO RLS' as tipo,
    current_setting('request.jwt.claims', true)::json->>'sub' as current_user_auth_uid,
    current_setting('request.jwt.claims', true)::json->>'role' as current_user_role;