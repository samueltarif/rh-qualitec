-- CRIAR ASSINATURAS DE TESTE

-- 1. Primeiro, ver quais colaboradores existem
SELECT id, nome, email FROM colaboradores LIMIT 5;

-- 2. Criar assinaturas de teste para colaboradores existentes
INSERT INTO assinaturas_ponto (
    colaborador_id,
    mes,
    ano,
    data_assinatura,
    ip_assinatura,
    user_agent,
    hash_assinatura,
    created_at
) VALUES 
-- Assinatura para dezembro 2024
(
    (SELECT id FROM colaboradores LIMIT 1),
    12,
    2024,
    NOW(),
    '192.168.1.100',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    NOW()
),
-- Assinatura para novembro 2024
(
    (SELECT id FROM colaboradores LIMIT 1 OFFSET 1),
    11,
    2024,
    NOW() - INTERVAL '5 days',
    '192.168.1.101',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567',
    NOW() - INTERVAL '5 days'
),
-- Assinatura para dezembro 2024 (outro colaborador)
(
    (SELECT id FROM colaboradores LIMIT 1 OFFSET 2),
    12,
    2024,
    NOW() - INTERVAL '2 days',
    '192.168.1.102',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678',
    NOW() - INTERVAL '2 days'
);

-- 3. Verificar se foram criadas
SELECT 
    'ASSINATURAS CRIADAS' as status,
    ap.id,
    c.nome as colaborador,
    ap.mes,
    ap.ano,
    ap.data_assinatura,
    ap.ip_assinatura
FROM assinaturas_ponto ap
LEFT JOIN colaboradores c ON ap.colaborador_id = c.id
ORDER BY ap.created_at DESC;