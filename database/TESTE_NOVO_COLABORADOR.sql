-- TESTE PARA NOVOS COLABORADORES
-- Simular cadastro de novo colaborador e verificar vinculação automática

-- 1. Verificar situação antes do teste
SELECT 
  'ANTES_DO_TESTE' as momento,
  (SELECT COUNT(*) FROM colaboradores) as total_colaboradores,
  (SELECT COUNT(*) FROM app_users) as total_app_users,
  (SELECT COUNT(*) FROM colaboradores c LEFT JOIN app_users au ON au.colaborador_id = c.id WHERE au.id IS NULL) as colaboradores_sem_app_user;

-- 2. Inserir colaborador de teste
INSERT INTO colaboradores (
  nome,
  cpf,
  email_corporativo,
  telefone,
  data_admissao,
  salario,
  status
) VALUES (
  'TESTE NOVO COLABORADOR',
  '12345678901',
  'teste.novo@qualitec.com',
  '(11) 99999-9999',
  CURRENT_DATE,
  3000.00,
  'ativo'
) RETURNING id, nome, empresa_id;

-- 3. Verificar se vinculação foi criada automaticamente
SELECT 
  'APOS_INSERCAO' as momento,
  c.id as colaborador_id,
  c.nome as colaborador_nome,
  c.empresa_id as colaborador_empresa_id,
  au.id as app_user_id,
  au.auth_uid,
  au.nome as app_user_nome,
  au.empresa_id as app_user_empresa_id,
  CASE 
    WHEN au.id IS NOT NULL THEN 'VINCULACAO_OK'
    ELSE 'VINCULACAO_FALTANDO'
  END as status_vinculacao
FROM colaboradores c
LEFT JOIN app_users au ON au.colaborador_id = c.id
WHERE c.nome = 'TESTE NOVO COLABORADOR';

-- 4. Verificar situação após o teste
SELECT 
  'DEPOIS_DO_TESTE' as momento,
  (SELECT COUNT(*) FROM colaboradores) as total_colaboradores,
  (SELECT COUNT(*) FROM app_users) as total_app_users,
  (SELECT COUNT(*) FROM colaboradores c LEFT JOIN app_users au ON au.colaborador_id = c.id WHERE au.id IS NULL) as colaboradores_sem_app_user;

-- 5. Limpar teste (opcional)
-- DELETE FROM app_users WHERE nome = 'TESTE NOVO COLABORADOR';
-- DELETE FROM colaboradores WHERE nome = 'TESTE NOVO COLABORADOR';