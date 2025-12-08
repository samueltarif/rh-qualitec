-- ============================================================================
-- Associar colaboradores órfãos à primeira empresa
-- Execute APENAS este SQL
-- ============================================================================

UPDATE colaboradores
SET empresa_id = (SELECT id FROM empresas LIMIT 1)
WHERE empresa_id IS NULL;

-- Verificar se funcionou
SELECT COUNT(*) as total_colaboradores FROM colaboradores;
SELECT COUNT(*) as sem_empresa FROM colaboradores WHERE empresa_id IS NULL;
