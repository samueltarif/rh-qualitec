-- VERIFICAÇÃO RÁPIDA: Salário dos colaboradores

-- Ver todos os colaboradores e seus salários
SELECT 
  id,
  nome,  -- ou nome_completo, dependendo da estrutura
  cpf,
  cargo,
  salario,
  CASE 
    WHEN salario IS NULL THEN '❌ SALÁRIO É NULL - PRECISA CORRIGIR'
    WHEN salario = 0 THEN '❌ SALÁRIO É ZERO - PRECISA CORRIGIR'
    WHEN salario > 0 THEN '✅ SALÁRIO OK - PODE GERAR HOLERITE'
  END as status,
  status as status_colaborador
FROM colaboradores
ORDER BY nome;

-- Se encontrar colaboradores sem salário, execute:
-- UPDATE colaboradores SET salario = 8000.00 WHERE nome = 'SAMUEL BARRETOS TARIF';
-- UPDATE colaboradores SET salario = 4000.00 WHERE nome = 'Silvana Administradora';
