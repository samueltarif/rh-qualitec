-- DIAGNÓSTICO UNIVERSAL: Funciona independente da estrutura

-- PASSO 1: Ver estrutura da tabela colaboradores
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'colaboradores'
  AND column_name IN ('nome', 'nome_completo', 'salario', 'salario_base')
ORDER BY column_name;

-- PASSO 2: Ver TODOS os dados dos colaboradores (primeiras 5 linhas)
SELECT * FROM colaboradores LIMIT 5;

-- PASSO 3: Ver apenas campos importantes
-- Ajuste os nomes das colunas conforme o resultado do PASSO 1
SELECT 
  id,
  -- nome ou nome_completo (use o que existir)
  cpf,
  cargo,
  -- salario ou salario_base (use o que existir)
  status
FROM colaboradores;

-- PASSO 4: Contar colaboradores
SELECT 
  COUNT(*) as total_colaboradores,
  COUNT(CASE WHEN salario > 0 THEN 1 END) as com_salario,
  COUNT(CASE WHEN salario IS NULL OR salario = 0 THEN 1 END) as sem_salario
FROM colaboradores;
