-- Associar TODOS os colaboradores à empresa Qualitec
-- UUID CORRETO (com todos os caracteres)
UPDATE colaboradores
SET empresa_id = '00eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
WHERE empresa_id IS NULL;

-- Verificar se funcionou
SELECT id, nome, cpf, empresa_id FROM colaboradores;
