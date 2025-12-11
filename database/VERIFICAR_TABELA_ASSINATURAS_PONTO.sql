-- Verificar se a tabela assinaturas_ponto existe
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'assinaturas_ponto';

-- Se existir, verificar estrutura
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'assinaturas_ponto'
ORDER BY ordinal_position;

-- Verificar se há dados na tabela
SELECT COUNT(*) as total_assinaturas FROM assinaturas_ponto;

-- Ver algumas assinaturas de exemplo (estrutura real)
SELECT 
    id,
    colaborador_id,
    mes,
    ano,
    data_assinatura,
    hash_assinatura,
    created_at
FROM assinaturas_ponto 
ORDER BY data_assinatura DESC 
LIMIT 5;

-- Ver assinaturas com dados do colaborador
SELECT 
    ap.id,
    ap.mes,
    ap.ano,
    ap.data_assinatura,
    c.nome as colaborador_nome,
    c.cpf as colaborador_cpf
FROM assinaturas_ponto ap
LEFT JOIN colaboradores c ON ap.colaborador_id = c.id
ORDER BY ap.data_assinatura DESC 
LIMIT 10;