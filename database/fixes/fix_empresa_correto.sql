-- Associar colaboradores à empresa Qualitec
UPDATE colaboradores
SET empresa_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
WHERE empresa_id IS NULL;

-- Verificar resultado
SELECT id, nome, cpf, empresa_id FROM colaboradores;
