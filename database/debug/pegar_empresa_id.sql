-- Pegar o ID correto da empresa
SELECT id FROM empresas LIMIT 1;

-- Depois use esse ID no UPDATE abaixo (substitua SEU_ID_AQUI):
-- UPDATE colaboradores SET empresa_id = 'SEU_ID_AQUI' WHERE empresa_id IS NULL;
