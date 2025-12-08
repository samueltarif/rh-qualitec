-- ============================================================================
-- VERIFICAR E CORRIGIR DADOS DO PONTO
-- Execute no Supabase SQL Editor
-- ============================================================================

-- 1️⃣ VERIFICAR VÍNCULO DO USUÁRIO COM COLABORADOR
SELECT 
  au.id as app_user_id,
  au.email,
  au.nome,
  au.colaborador_id,
  c.id as colaborador_real_id,
  c.nome as colaborador_nome
FROM app_users au
LEFT JOIN colaboradores c ON au.colaborador_id = c.id
WHERE au.email LIKE '%samuel%';

-- 2️⃣ VERIFICAR SE EXISTE A TABELA registros_ponto
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'registros_ponto'
) as tabela_existe;

-- 3️⃣ VER REGISTROS DE PONTO DO COLABORADOR
-- Substitua o UUID pelo colaborador_id correto
SELECT * FROM registros_ponto 
WHERE colaborador_id = '84165a85-616f-4709-9069-54cfd46d6a38'
ORDER BY data DESC
LIMIT 10;

-- 4️⃣ CORRIGIR VÍNCULO (se necessário)
-- Primeiro, encontre o ID correto do colaborador Samuel:
SELECT id, nome, email_corporativo FROM colaboradores 
WHERE nome LIKE '%SAMUEL%';

-- Depois atualize o app_users com o ID correto:
-- UPDATE app_users 
-- SET colaborador_id = 'ID_DO_COLABORADOR_AQUI'
-- WHERE email = 'samuel.tarif@gmail.com';


-- ============================================================================
-- 5️⃣ CRIAR REGISTROS DE PONTO DE EXEMPLO (para teste)
-- ============================================================================
-- Substitua o empresa_id e colaborador_id pelos valores corretos

-- Primeiro, pegue o empresa_id:
SELECT id FROM empresas LIMIT 1;

-- Depois insira registros de exemplo para dezembro/2024:
INSERT INTO registros_ponto (empresa_id, colaborador_id, data, entrada_1, saida_1, entrada_2, saida_2, status)
SELECT 
  (SELECT id FROM empresas LIMIT 1),
  '84165a85-616f-4709-9069-54cfd46d6a38',
  d::date,
  '08:00'::time,
  '12:00'::time,
  '13:00'::time,
  '17:00'::time,
  'Normal'
FROM generate_series('2024-12-02'::date, '2024-12-04'::date, '1 day'::interval) d
ON CONFLICT (colaborador_id, data) DO NOTHING;

-- Verificar se inseriu:
SELECT * FROM registros_ponto 
WHERE colaborador_id = '84165a85-616f-4709-9069-54cfd46d6a38'
ORDER BY data DESC;

-- ============================================================================
-- RESUMO DO PROBLEMA:
-- ============================================================================
-- O componente EmployeePontoTab recebe os dados via props do employee.vue
-- O employee.vue chama fetchPonto() do useFuncionario
-- O useFuncionario chama /api/funcionario/ponto
-- A API busca o colaborador_id do app_users e depois busca em registros_ponto
--
-- Se não aparecem dados, pode ser:
-- 1. colaborador_id não está vinculado no app_users
-- 2. Não existem registros na tabela registros_ponto para esse colaborador
-- 3. O mês/ano selecionado não tem registros
-- ============================================================================
