-- =====================================================
-- MIGRAÇÃO COMPLETA: Unificar IDs usando UUID
-- =====================================================
-- Este script transforma colaboradores.id de SERIAL para UUID
-- usando o mesmo UUID de app_users (auth_uid do Supabase)
-- =====================================================

-- PASSO 1: Diagnóstico inicial
SELECT 
  '📊 DIAGNÓSTICO INICIAL' as etapa,
  COUNT(*) as total_colaboradores,
  COUNT(DISTINCT email_pessoal) as emails_unicos
FROM colaboradores;

-- Ver vínculos atuais por email
SELECT 
  c.id as colaborador_id_atual,
  c.nome as colaborador_nome,
  au.id as app_user_uuid,
  au.nome as app_user_nome,
  au.email,
  CASE 
    WHEN au.id IS NOT NULL THEN '✅ TEM VÍNCULO'
    ELSE '❌ SEM VÍNCULO'
  END as status
FROM colaboradores c
LEFT JOIN app_users au ON (
  LOWER(TRIM(au.email)) = LOWER(TRIM(c.email_pessoal))
  OR LOWER(TRIM(au.email)) = LOWER(TRIM(c.email_corporativo))
)
ORDER BY c.nome;

-- PASSO 2: Criar coluna UUID temporária
ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS new_id UUID;

-- PASSO 3: Vincular UUIDs baseado no email
UPDATE colaboradores c
SET new_id = au.id
FROM app_users au
WHERE (
  LOWER(TRIM(au.email)) = LOWER(TRIM(c.email_pessoal))
  OR LOWER(TRIM(au.email)) = LOWER(TRIM(c.email_corporativo))
);

-- PASSO 4: Verificar vinculação
SELECT 
  '🔍 VERIFICAÇÃO DE VÍNCULOS' as etapa,
  COUNT(*) FILTER (WHERE new_id IS NOT NULL) as vinculados,
  COUNT(*) FILTER (WHERE new_id IS NULL) as sem_vinculo,
  COUNT(*) as total
FROM colaboradores;

-- Mostrar quem não foi vinculado
SELECT 
  '⚠️ COLABORADORES SEM VÍNCULO' as alerta,
  id, nome, email_pessoal, email_corporativo
FROM colaboradores
WHERE new_id IS NULL;

-- =====================================================
-- ATENÇÃO: Só execute daqui pra frente se TODOS os
-- colaboradores tiverem sido vinculados!
-- =====================================================

-- PASSO 5: Backup das foreign keys
-- Listar todas as tabelas que referenciam colaboradores
SELECT 
  '📋 TABELAS QUE REFERENCIAM COLABORADORES' as info,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'colaboradores'
  AND ccu.column_name = 'id';

-- PASSO 6: Remover constraints de foreign key temporariamente
-- (Você precisará executar DROP CONSTRAINT para cada uma encontrada acima)

-- Exemplo para holerites:
ALTER TABLE holerites DROP CONSTRAINT IF EXISTS holerites_colaborador_id_fkey;

-- Exemplo para registros_ponto:
ALTER TABLE registros_ponto DROP CONSTRAINT IF EXISTS registros_ponto_colaborador_id_fkey;

-- Exemplo para ferias:
ALTER TABLE ferias DROP CONSTRAINT IF EXISTS ferias_colaborador_id_fkey;

-- Exemplo para solicitacoes_alteracao_dados:
ALTER TABLE solicitacoes_alteracao_dados DROP CONSTRAINT IF EXISTS solicitacoes_alteracao_dados_colaborador_id_fkey;

-- PASSO 7: Adicionar colunas UUID temporárias nas tabelas relacionadas
ALTER TABLE holerites ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE registros_ponto ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE ferias ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE solicitacoes_alteracao_dados ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;

-- PASSO 8: Migrar os dados para as novas colunas UUID
UPDATE holerites h
SET new_colaborador_id = c.new_id
FROM colaboradores c
WHERE h.colaborador_id = c.id;

UPDATE registros_ponto rp
SET new_colaborador_id = c.new_id
FROM colaboradores c
WHERE rp.colaborador_id = c.id;

UPDATE ferias f
SET new_colaborador_id = c.new_id
FROM colaboradores c
WHERE f.colaborador_id = c.id;

UPDATE solicitacoes_alteracao_dados sad
SET new_colaborador_id = c.new_id
FROM colaboradores c
WHERE sad.colaborador_id = c.id;

-- PASSO 9: Verificar migração das tabelas relacionadas
SELECT '✅ HOLERITES' as tabela, 
  COUNT(*) as total,
  COUNT(new_colaborador_id) as migrados
FROM holerites;

SELECT '✅ REGISTROS_PONTO' as tabela,
  COUNT(*) as total,
  COUNT(new_colaborador_id) as migrados
FROM registros_ponto;

SELECT '✅ FERIAS' as tabela,
  COUNT(*) as total,
  COUNT(new_colaborador_id) as migrados
FROM ferias;

SELECT '✅ SOLICITACOES' as tabela,
  COUNT(*) as total,
  COUNT(new_colaborador_id) as migrados
FROM solicitacoes_alteracao_dados;

-- PASSO 10: Remover primary key antiga de colaboradores
ALTER TABLE colaboradores DROP CONSTRAINT IF EXISTS colaboradores_pkey;

-- PASSO 11: Remover coluna id antiga
ALTER TABLE colaboradores DROP COLUMN IF EXISTS id;

-- PASSO 12: Renomear new_id para id
ALTER TABLE colaboradores RENAME COLUMN new_id TO id;

-- PASSO 13: Definir novo id como PRIMARY KEY
ALTER TABLE colaboradores ADD PRIMARY KEY (id);

-- PASSO 14: Atualizar tabelas relacionadas
-- Remover colunas antigas
ALTER TABLE holerites DROP COLUMN IF EXISTS colaborador_id;
ALTER TABLE registros_ponto DROP COLUMN IF EXISTS colaborador_id;
ALTER TABLE ferias DROP COLUMN IF EXISTS colaborador_id;
ALTER TABLE solicitacoes_alteracao_dados DROP COLUMN IF EXISTS colaborador_id;

-- Renomear novas colunas
ALTER TABLE holerites RENAME COLUMN new_colaborador_id TO colaborador_id;
ALTER TABLE registros_ponto RENAME COLUMN new_colaborador_id TO colaborador_id;
ALTER TABLE ferias RENAME COLUMN new_colaborador_id TO colaborador_id;
ALTER TABLE solicitacoes_alteracao_dados RENAME COLUMN new_colaborador_id TO colaborador_id;

-- PASSO 15: Recriar foreign keys
ALTER TABLE holerites 
  ADD CONSTRAINT holerites_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) 
  REFERENCES colaboradores(id) 
  ON DELETE CASCADE;

ALTER TABLE registros_ponto 
  ADD CONSTRAINT registros_ponto_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) 
  REFERENCES colaboradores(id) 
  ON DELETE CASCADE;

ALTER TABLE ferias 
  ADD CONSTRAINT ferias_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) 
  REFERENCES colaboradores(id) 
  ON DELETE CASCADE;

ALTER TABLE solicitacoes_alteracao_dados 
  ADD CONSTRAINT solicitacoes_alteracao_dados_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) 
  REFERENCES colaboradores(id) 
  ON DELETE CASCADE;

-- PASSO 16: Adicionar NOT NULL nas colunas
ALTER TABLE holerites ALTER COLUMN colaborador_id SET NOT NULL;
ALTER TABLE registros_ponto ALTER COLUMN colaborador_id SET NOT NULL;
ALTER TABLE ferias ALTER COLUMN colaborador_id SET NOT NULL;
ALTER TABLE solicitacoes_alteracao_dados ALTER COLUMN colaborador_id SET NOT NULL;

-- PASSO 17: Verificação final
SELECT 
  '🎉 MIGRAÇÃO CONCLUÍDA!' as status,
  'colaboradores agora usa UUID como PK' as resultado;

SELECT 
  c.id as uuid_colaborador,
  c.nome,
  au.id as uuid_app_user,
  au.email,
  CASE 
    WHEN c.id = au.id THEN '✅ IDs UNIFICADOS'
    ELSE '❌ ERRO: IDs DIFERENTES'
  END as verificacao
FROM colaboradores c
INNER JOIN app_users au ON (
  LOWER(TRIM(au.email)) = LOWER(TRIM(c.email_pessoal))
  OR LOWER(TRIM(au.email)) = LOWER(TRIM(c.email_corporativo))
)
ORDER BY c.nome;

-- Estatísticas finais
SELECT 
  '📊 ESTATÍSTICAS FINAIS' as info,
  (SELECT COUNT(*) FROM colaboradores) as total_colaboradores,
  (SELECT COUNT(*) FROM holerites) as total_holerites,
  (SELECT COUNT(*) FROM registros_ponto) as total_registros_ponto,
  (SELECT COUNT(*) FROM ferias) as total_ferias;
