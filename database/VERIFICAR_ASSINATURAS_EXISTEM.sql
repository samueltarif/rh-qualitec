-- VERIFICAR SE EXISTEM ASSINATURAS NO BANCO

-- 1. Ver se a tabela existe e tem dados
SELECT 
    'TABELA ASSINATURAS' as status,
    COUNT(*) as total_assinaturas
FROM assinaturas_ponto;

-- 2. Ver todas as assinaturas que existem
SELECT 
    id,
    colaborador_id,
    mes,
    ano,
    data_assinatura,
    ip_assinatura,
    hash_assinatura,
    created_at
FROM assinaturas_ponto
ORDER BY created_at DESC;

-- 3. Ver colaboradores que têm assinaturas
SELECT 
    ap.colaborador_id,
    c.nome as colaborador_nome,
    ap.mes,
    ap.ano,
    ap.data_assinatura
FROM assinaturas_ponto ap
LEFT JOIN colaboradores c ON ap.colaborador_id = c.id
ORDER BY ap.created_at DESC;

-- 4. Ver estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'assinaturas_ponto'
ORDER BY ordinal_position;