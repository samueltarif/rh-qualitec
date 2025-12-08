-- DESABILITAR RLS temporariamente para testar
ALTER TABLE colaboradores DISABLE ROW LEVEL SECURITY;

-- Testar
SELECT id, nome, cpf FROM colaboradores;
