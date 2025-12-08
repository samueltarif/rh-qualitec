-- ============================================
-- ADICIONAR BENEFÍCIOS DE TESTE
-- ============================================

-- 1. Ver colaboradores disponíveis
SELECT id, nome, cpf, salario
FROM colaboradores
ORDER BY nome
LIMIT 5;

-- 2. Adicionar benefícios ao primeiro colaborador
-- (Substitua o WHERE com o nome do seu colaborador)
UPDATE colaboradores 
SET 
  recebe_vt = true,
  valor_vt = 220.00,
  recebe_va = true,
  valor_va = 280.00,
  plano_saude = true,
  plano_odonto = false
WHERE nome ILIKE '%samuel%'
   OR id = (SELECT id FROM colaboradores ORDER BY nome LIMIT 1)
RETURNING id, nome, valor_vt, valor_va;

-- 3. Verificar se foi atualizado
SELECT 
  id,
  nome,
  cpf,
  salario,
  recebe_vt,
  valor_vt,
  recebe_vr,
  valor_vr,
  recebe_va,
  valor_va,
  plano_saude,
  plano_odonto
FROM colaboradores
WHERE recebe_vt = true OR recebe_va = true
ORDER BY nome;

-- 4. Adicionar benefícios a TODOS os colaboradores (OPCIONAL)
-- Descomente as linhas abaixo se quiser adicionar a todos

/*
UPDATE colaboradores 
SET 
  recebe_vt = true,
  valor_vt = 220.00,
  recebe_va = true,
  valor_va = 280.00,
  plano_saude = true
WHERE salario > 0;

SELECT COUNT(*) as colaboradores_atualizados
FROM colaboradores
WHERE recebe_vt = true;
*/
