-- Ver o estado atual dos colaboradores
SELECT id, nome, cpf, empresa_id FROM colaboradores;

-- Forçar UPDATE em TODOS os colaboradores
UPDATE colaboradores
SET empresa_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- Verificar novamente
SELECT id, nome, cpf, empresa_id FROM colaboradores;
