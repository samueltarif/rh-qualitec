-- Testar se a política RLS está funcionando
-- Execute como o usuário admin logado

-- Ver todas as políticas ativas
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'colaboradores';

-- Testar se você consegue ver os colaboradores
SELECT id, nome, cpf FROM colaboradores;

-- Se não aparecer nada, desabilite RLS temporariamente para testar:
-- ALTER TABLE colaboradores DISABLE ROW LEVEL SECURITY;

-- Depois reabilite:
-- ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
