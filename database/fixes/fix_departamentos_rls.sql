-- Desabilitar RLS para departamentos
ALTER TABLE departamentos DISABLE ROW LEVEL SECURITY;

-- Verificar
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'departamentos';
