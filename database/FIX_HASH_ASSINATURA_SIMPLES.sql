-- ============================================
-- FIX HASH ASSINATURA - VERSÃO SIMPLES
-- ============================================

-- 1. Verificar estrutura atual da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'assinaturas_ponto'
ORDER BY ordinal_position;

-- 2. Verificar se há registros com hash_assinatura NULL
SELECT 
    COUNT(*) as total_registros,
    COUNT(hash_assinatura) as com_hash,
    COUNT(*) - COUNT(hash_assinatura) as sem_hash
FROM assinaturas_ponto;

-- 3. Atualizar registros existentes sem hash (se houver)
UPDATE assinaturas_ponto 
SET hash_assinatura = encode(sha256(
    (colaborador_id::text || '-' || mes::text || '-' || ano::text || '-' || 
     COALESCE(assinatura_digital, 'sem-assinatura') || '-' || 
     COALESCE(data_assinatura::text, created_at::text))::bytea
), 'hex')
WHERE hash_assinatura IS NULL;

-- 4. Verificar resultado final
SELECT 
    'Tabela assinaturas_ponto configurada corretamente!' as status,
    COUNT(*) as total_assinaturas,
    COUNT(hash_assinatura) as com_hash_agora
FROM assinaturas_ponto;