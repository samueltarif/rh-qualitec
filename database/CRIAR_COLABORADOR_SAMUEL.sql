-- ============================================================================
-- CRIAR COLABORADOR SAMUEL (se não existir)
-- Execute no Supabase SQL Editor
-- ============================================================================

-- 1️⃣ VERIFICAR SE O COLABORADOR EXISTE
SELECT * FROM colaboradores WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38';

-- Se retornar vazio, o colaborador NÃO EXISTE e precisa ser criado!

-- 2️⃣ CRIAR O COLABORADOR (se não existir)
INSERT INTO colaboradores (
  id,
  empresa_id,
  nome,
  cpf,
  matricula,
  email_corporativo,
  data_nascimento,
  data_admissao,
  status,
  cargo_id,
  departamento_id
)
SELECT
  '84165a85-616f-4709-9069-54cfd46d6a38',
  (SELECT id FROM empresas LIMIT 1),
  'SAMUEL BARRETOS TARIF',
  '43396431812',
  '05',
  'vendas2@qualitec.ind.br',
  '1990-01-01',
  '2020-01-01',
  'Ativo',
  (SELECT id FROM cargos LIMIT 1),
  (SELECT id FROM departamentos LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM colaboradores WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'
);

-- 3️⃣ VINCULAR AO APP_USER
UPDATE app_users 
SET colaborador_id = '84165a85-616f-4709-9069-54cfd46d6a38'
WHERE email = 'samuel.tarif@gmail.com';

-- 4️⃣ VERIFICAR RESULTADO
SELECT 
  au.email,
  au.nome as user_nome,
  au.colaborador_id,
  c.nome as colab_nome,
  c.cpf,
  c.email_corporativo,
  c.matricula
FROM app_users au
LEFT JOIN colaboradores c ON au.colaborador_id = c.id
WHERE au.email = 'samuel.tarif@gmail.com';

-- ============================================================================
-- APÓS EXECUTAR:
-- 1. Faça logout
-- 2. Faça login novamente
-- 3. Vá em "Meu Perfil" - deve mostrar os dados agora!
-- ============================================================================
