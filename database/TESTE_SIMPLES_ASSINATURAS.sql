-- Teste simples para verificar assinaturas de ponto

-- 1. Verificar se a tabela existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'assinaturas_ponto'
) as tabela_existe;

-- 2. Contar registros
SELECT COUNT(*) as total_assinaturas FROM assinaturas_ponto;

-- 3. Ver estrutura básica
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'assinaturas_ponto'
ORDER BY ordinal_position;

-- 4. Ver assinaturas existentes (se houver)
SELECT 
    ap.id,
    ap.mes,
    ap.ano,
    ap.data_assinatura,
    c.nome as colaborador_nome
FROM assinaturas_ponto ap
LEFT JOIN colaboradores c ON ap.colaborador_id = c.id
ORDER BY ap.data_assinatura DESC 
LIMIT 5;