-- ============================================
-- VERIFICAR SE EXISTE EMPRESA NO SISTEMA
-- ============================================

-- 1. Verificar se existe tabela empresas
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'empresas';

-- 2. Verificar se há empresas cadastradas
SELECT id, nome, cnpj, created_at 
FROM empresas 
LIMIT 5;

-- 3. Se não houver empresa, criar uma padrão
-- (Execute apenas se a consulta acima retornar vazio)
/*
INSERT INTO empresas (nome, cnpj, razao_social) 
VALUES (
  'Empresa Padrão', 
  '00.000.000/0001-00',
  'Empresa Padrão LTDA'
);
*/

-- 4. Verificar novamente após inserção
SELECT COUNT(*) as total_empresas FROM empresas;