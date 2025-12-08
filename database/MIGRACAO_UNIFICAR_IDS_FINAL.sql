-- =====================================================
-- MIGRAÇÃO COMPLETA: Unificar IDs usando UUID
-- =====================================================
-- Versão 3.0 - Remove policies, views e constraints
-- =====================================================

-- PASSO 1: Diagnóstico inicial
SELECT 
  '📊 DIAGNÓSTICO INICIAL' as etapa,
  COUNT(*) as total_colaboradores,
  COUNT(DISTINCT email_pessoal) as emails_unicos
FROM colaboradores;

-- PASSO 2: Criar coluna UUID temporária em colaboradores
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

-- =====================================================
-- PASSO 5: Remover PRIMARY KEY com CASCADE
-- Isso remove automaticamente todas as foreign keys
-- =====================================================
ALTER TABLE colaboradores DROP CONSTRAINT IF EXISTS colaboradores_pkey CASCADE;

-- =====================================================
-- PASSO 6: Adicionar colunas UUID temporárias
-- =====================================================

-- Tabelas principais
ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS new_gestor_id UUID;
ALTER TABLE holerites ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE registros_ponto ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE ferias ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE ferias ADD COLUMN IF NOT EXISTS new_aprovador_colaborador_id UUID;
ALTER TABLE solicitacoes_alteracao_dados ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE departamentos ADD COLUMN IF NOT EXISTS new_gestor_id UUID;
ALTER TABLE dependentes ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE contratos_pj ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE patrimonio ADD COLUMN IF NOT EXISTS new_responsavel_id UUID;
ALTER TABLE ponto ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE banco_horas ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE folha_items ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE beneficio_adesao ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE vagas ADD COLUMN IF NOT EXISTS new_gestor_responsavel_id UUID;
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS new_avaliado_id UUID;
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS new_avaliador_id UUID;
ALTER TABLE saude_exames ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE saude_mental ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE esocial_events ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE reembolsos ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE curso_inscricoes ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE colaborador_documentos ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE cargo_gestores ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE documentos_rh ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE alertas ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE eventos_esocial ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE programacao_ferias ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE solicitacoes_funcionario ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE documentos_funcionario ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;
ALTER TABLE comunicados_lidos ADD COLUMN IF NOT EXISTS new_colaborador_id UUID;

-- =====================================================
-- PASSO 7: Migrar dados para as novas colunas UUID
-- =====================================================

UPDATE colaboradores c1 SET new_gestor_id = c2.new_id FROM colaboradores c2 WHERE c1.gestor_id = c2.id;
UPDATE holerites h SET new_colaborador_id = c.new_id FROM colaboradores c WHERE h.colaborador_id = c.id;
UPDATE registros_ponto rp SET new_colaborador_id = c.new_id FROM colaboradores c WHERE rp.colaborador_id = c.id;
UPDATE ferias f SET new_colaborador_id = c.new_id FROM colaboradores c WHERE f.colaborador_id = c.id;
UPDATE ferias f SET new_aprovador_colaborador_id = c.new_id FROM colaboradores c WHERE f.aprovador_colaborador_id = c.id;
UPDATE solicitacoes_alteracao_dados sad SET new_colaborador_id = c.new_id FROM colaboradores c WHERE sad.colaborador_id = c.id;
UPDATE departamentos d SET new_gestor_id = c.new_id FROM colaboradores c WHERE d.gestor_id = c.id;
UPDATE dependentes dep SET new_colaborador_id = c.new_id FROM colaboradores c WHERE dep.colaborador_id = c.id;
UPDATE documentos doc SET new_colaborador_id = c.new_id FROM colaboradores c WHERE doc.colaborador_id = c.id;
UPDATE contratos_pj cp SET new_colaborador_id = c.new_id FROM colaboradores c WHERE cp.colaborador_id = c.id;
UPDATE patrimonio p SET new_responsavel_id = c.new_id FROM colaboradores c WHERE p.responsavel_id = c.id;
UPDATE ponto pt SET new_colaborador_id = c.new_id FROM colaboradores c WHERE pt.colaborador_id = c.id;
UPDATE banco_horas bh SET new_colaborador_id = c.new_id FROM colaboradores c WHERE bh.colaborador_id = c.id;
UPDATE folha_items fi SET new_colaborador_id = c.new_id FROM colaboradores c WHERE fi.colaborador_id = c.id;
UPDATE beneficio_adesao ba SET new_colaborador_id = c.new_id FROM colaboradores c WHERE ba.colaborador_id = c.id;
UPDATE vagas v SET new_gestor_responsavel_id = c.new_id FROM colaboradores c WHERE v.gestor_responsavel_id = c.id;
UPDATE avaliacoes a SET new_avaliado_id = c.new_id FROM colaboradores c WHERE a.avaliado_id = c.id;
UPDATE avaliacoes a SET new_avaliador_id = c.new_id FROM colaboradores c WHERE a.avaliador_id = c.id;
UPDATE saude_exames se SET new_colaborador_id = c.new_id FROM colaboradores c WHERE se.colaborador_id = c.id;
UPDATE saude_mental sm SET new_colaborador_id = c.new_id FROM colaboradores c WHERE sm.colaborador_id = c.id;
UPDATE esocial_events ee SET new_colaborador_id = c.new_id FROM colaboradores c WHERE ee.colaborador_id = c.id;
UPDATE solicitacoes s SET new_colaborador_id = c.new_id FROM colaboradores c WHERE s.colaborador_id = c.id;
UPDATE reembolsos r SET new_colaborador_id = c.new_id FROM colaboradores c WHERE r.colaborador_id = c.id;
UPDATE curso_inscricoes ci SET new_colaborador_id = c.new_id FROM colaboradores c WHERE ci.colaborador_id = c.id;
UPDATE app_users au SET new_colaborador_id = c.new_id FROM colaboradores c WHERE au.colaborador_id = c.id;
UPDATE colaborador_documentos cd SET new_colaborador_id = c.new_id FROM colaboradores c WHERE cd.colaborador_id = c.id;
UPDATE cargo_gestores cg SET new_colaborador_id = c.new_id FROM colaboradores c WHERE cg.colaborador_id = c.id;
UPDATE documentos_rh dr SET new_colaborador_id = c.new_id FROM colaboradores c WHERE dr.colaborador_id = c.id;
UPDATE alertas al SET new_colaborador_id = c.new_id FROM colaboradores c WHERE al.colaborador_id = c.id;
UPDATE eventos_esocial ees SET new_colaborador_id = c.new_id FROM colaboradores c WHERE ees.colaborador_id = c.id;
UPDATE programacao_ferias pf SET new_colaborador_id = c.new_id FROM colaboradores c WHERE pf.colaborador_id = c.id;
UPDATE solicitacoes_funcionario sf SET new_colaborador_id = c.new_id FROM colaboradores c WHERE sf.colaborador_id = c.id;
UPDATE documentos_funcionario df SET new_colaborador_id = c.new_id FROM colaboradores c WHERE df.colaborador_id = c.id;
UPDATE comunicados_lidos cl SET new_colaborador_id = c.new_id FROM colaboradores c WHERE cl.colaborador_id = c.id;

-- =====================================================
-- PASSO 8: Remover coluna id antiga com CASCADE
-- Isso remove policies e views que dependem dela
-- =====================================================
ALTER TABLE colaboradores DROP COLUMN IF EXISTS id CASCADE;
ALTER TABLE colaboradores DROP COLUMN IF EXISTS gestor_id CASCADE;

-- =====================================================
-- PASSO 9: Renomear new_id para id
-- =====================================================
ALTER TABLE colaboradores RENAME COLUMN new_id TO id;
ALTER TABLE colaboradores RENAME COLUMN new_gestor_id TO gestor_id;

-- =====================================================
-- PASSO 10: Definir novo id como PRIMARY KEY
-- =====================================================
ALTER TABLE colaboradores ADD PRIMARY KEY (id);

-- =====================================================
-- PASSO 11: Atualizar TODAS as tabelas relacionadas
-- =====================================================

ALTER TABLE holerites DROP COLUMN IF EXISTS colaborador_id CASCADE;
ALTER TABLE holerites RENAME COLUMN new_colaborador_id TO colaborador_id;

ALTER TABLE registros_ponto DROP COLUMN IF EXISTS colaborador_id CASCADE;
ALTER TABLE registros_ponto RENAME COLUMN new_colaborador_id TO colaborador_id;

ALTER TABLE ferias DROP COLUMN IF EXISTS colaborador_id CASCADE;
ALTER TABLE ferias RENAME COLUMN new_colaborador_id TO colaborador_id;
ALTER TABLE ferias DROP COLUMN IF EXISTS aprovador_colaborador_id CASCADE;
ALTER TABLE ferias RENAME COLUMN new_aprovador_colaborador_id TO aprovador_colaborador_id;

ALTER TABLE solicitacoes_alteracao_dados DROP COLUMN IF EXISTS colaborador_id CASCADE;
ALTER TABLE solicitacoes_alteracao_dados RENAME COLUMN new_colaborador_id TO colaborador_id;

ALTER TABLE departamentos DROP COLUMN IF EXISTS gestor_id CASCADE;
ALTER TABLE departamentos RENAME COLUMN new_gestor_id TO gestor_id;

ALTER TABLE dependentes DROP COLUMN IF EXISTS colaborador_id CASCADE;
ALTER TABLE dependentes RENAME COLUMN new_colaborador_id TO colaborador_id;

ALTER TABLE documentos DROP COLUMN IF EXISTS colaborador_id CASCADE;
ALTER TABLE documentos RENAME COLUMN new_colaborador_id TO colaborador_id;

ALTER TABLE contratos_pj DROP COLUMN IF EXISTS colaborador_id CASCADE;
ALTER TABLE contratos_pj RENAME COLUMN new_colaborador_id TO colaborador_id;

ALTER TABLE patrimonio DROP COLUMN IF EXISTS responsavel_id CASCADE;
ALTER TABLE patrimonio RENAME COLUMN new_responsavel_id TO responsavel_id;

ALTER TABLE ponto DROP COLUMN IF EXISTS colaborador_id CASCADE;
ALTER TABLE ponto RENAME COLUMN new_colaborador_id TO colaborador_id;

ALTER TABLE banco_horas DROP COLUMN IF EXISTS colaborador_id CASCADE;
ALTER TABLE banco_horas RENAME COLUMN new_colaborador_id TO colaborador_id;

ALTER TABLE folha_items DROP COLUMN IF EXISTS colaborador_id CASCADE;
ALTER TABLE folha_items RENAME COLUMN new_colaborador_id TO colaborador_id;

ALTER TABLE beneficio_adesao DROP COLUMN IF EXISTS colaborador_id CASCADE;
ALTER TABLE beneficio_adesao RENAME COLUMN new_colaborador_id TO colaborador_id;

ALTER TABLE vagas DROP COLUMN IF EXISTS gestor_responsavel_id CASCADE;
ALTER TABLE vagas RENAME COLUMN new_gestor_responsavel_id TO gestor_responsavel_id;

ALTER TABLE avaliacoes DROP COLUMN IF EXISTS avaliado_id CASCADE;
ALTER TABLE avaliacoes RENAME COLUMN new_avaliado_id TO avaliado_id;
ALTER TABLE avaliacoes DROP COLUMN IF EXISTS avaliador_id CASCADE;
ALTER TABLE avaliacoes RENAME COLUMN new_avaliador_id TO avaliador_id;

ALTER TABLE saude_exames DROP COLUMN IF EXISTS colaborador_id CASCADE;
ALTER TABLE saude_exames RENAME COLUMN new_colaborador_id TO colaborador_id;

ALTER TABLE saude_mental DROP COLUMN IF EXISTS colaborador_id CASCADE;
ALTER TABLE saude_mental RENAME COLUMN new_colaborador_id TO colaborador_id;

ALTER TABLE esocial_events DROP COLUMN IF EXISTS colaborador_id CASCADE;
ALTER TABLE esocial_events RENAME COLUMN new_colaborador_id TO colaborador_id;

ALTER TABLE solicitacoes DROP COLUMN IF EXISTS colaborador_id CASCADE;
ALTER TABLE solicitacoes RENAME COLUMN new_colaborador_id TO colaborador_id;

ALTER TABLE reembolsos DROP COLUMN IF EXISTS colaborador_id CASCADE;
ALTER TABLE reembolsos RENAME COLUMN new_colaborador_id TO colaborador_id;

ALTER TABLE curso_inscricoes DROP COLUMN IF EXISTS colaborador_id CASCADE;
ALTER TABLE curso_inscricoes RENAME COLUMN new_colaborador_id TO colaborador_id;

ALTER TABLE app_users DROP COLUMN IF EXISTS colaborador_id CASCADE;
ALTER TABLE app_users RENAME COLUMN new_colaborador_id TO colaborador_id;

ALTER TABLE colaborador_documentos DROP COLUMN IF EXISTS colaborador_id CASCADE;
ALTER TABLE colaborador_documentos RENAME COLUMN new_colaborador_id TO colaborador_id;

ALTER TABLE cargo_gestores DROP COLUMN IF EXISTS colaborador_id CASCADE;
ALTER TABLE cargo_gestores RENAME COLUMN new_colaborador_id TO colaborador_id;

ALTER TABLE documentos_rh DROP COLUMN IF EXISTS colaborador_id CASCADE;
ALTER TABLE documentos_rh RENAME COLUMN new_colaborador_id TO colaborador_id;

ALTER TABLE alertas DROP COLUMN IF EXISTS colaborador_id CASCADE;
ALTER TABLE alertas RENAME COLUMN new_colaborador_id TO colaborador_id;

ALTER TABLE eventos_esocial DROP COLUMN IF EXISTS colaborador_id CASCADE;
ALTER TABLE eventos_esocial RENAME COLUMN new_colaborador_id TO colaborador_id;

ALTER TABLE programacao_ferias DROP COLUMN IF EXISTS colaborador_id CASCADE;
ALTER TABLE programacao_ferias RENAME COLUMN new_colaborador_id TO colaborador_id;

ALTER TABLE solicitacoes_funcionario DROP COLUMN IF EXISTS colaborador_id CASCADE;
ALTER TABLE solicitacoes_funcionario RENAME COLUMN new_colaborador_id TO colaborador_id;

ALTER TABLE documentos_funcionario DROP COLUMN IF EXISTS colaborador_id CASCADE;
ALTER TABLE documentos_funcionario RENAME COLUMN new_colaborador_id TO colaborador_id;

ALTER TABLE comunicados_lidos DROP COLUMN IF EXISTS colaborador_id CASCADE;
ALTER TABLE comunicados_lidos RENAME COLUMN new_colaborador_id TO colaborador_id;

-- =====================================================
-- PASSO 12: Recriar TODAS as foreign keys
-- =====================================================

ALTER TABLE colaboradores ADD CONSTRAINT colaboradores_gestor_id_fkey 
  FOREIGN KEY (gestor_id) REFERENCES colaboradores(id) ON DELETE SET NULL;

ALTER TABLE holerites ADD CONSTRAINT holerites_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE;

ALTER TABLE registros_ponto ADD CONSTRAINT registros_ponto_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE;

ALTER TABLE ferias ADD CONSTRAINT ferias_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE;

ALTER TABLE ferias ADD CONSTRAINT ferias_aprovador_colaborador_id_fkey 
  FOREIGN KEY (aprovador_colaborador_id) REFERENCES colaboradores(id) ON DELETE SET NULL;

ALTER TABLE solicitacoes_alteracao_dados ADD CONSTRAINT solicitacoes_alteracao_dados_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE;

ALTER TABLE departamentos ADD CONSTRAINT fk_departamento_gestor 
  FOREIGN KEY (gestor_id) REFERENCES colaboradores(id) ON DELETE SET NULL;

ALTER TABLE dependentes ADD CONSTRAINT dependentes_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE;

ALTER TABLE documentos ADD CONSTRAINT documentos_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE;

ALTER TABLE contratos_pj ADD CONSTRAINT contratos_pj_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE;

ALTER TABLE patrimonio ADD CONSTRAINT patrimonio_responsavel_id_fkey 
  FOREIGN KEY (responsavel_id) REFERENCES colaboradores(id) ON DELETE SET NULL;

ALTER TABLE ponto ADD CONSTRAINT ponto_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE;

ALTER TABLE banco_horas ADD CONSTRAINT banco_horas_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE;

ALTER TABLE folha_items ADD CONSTRAINT folha_items_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE;

ALTER TABLE beneficio_adesao ADD CONSTRAINT beneficio_adesao_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE;

ALTER TABLE vagas ADD CONSTRAINT vagas_gestor_responsavel_id_fkey 
  FOREIGN KEY (gestor_responsavel_id) REFERENCES colaboradores(id) ON DELETE SET NULL;

ALTER TABLE avaliacoes ADD CONSTRAINT avaliacoes_avaliado_id_fkey 
  FOREIGN KEY (avaliado_id) REFERENCES colaboradores(id) ON DELETE CASCADE;

ALTER TABLE avaliacoes ADD CONSTRAINT avaliacoes_avaliador_id_fkey 
  FOREIGN KEY (avaliador_id) REFERENCES colaboradores(id) ON DELETE SET NULL;

ALTER TABLE saude_exames ADD CONSTRAINT saude_exames_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE;

ALTER TABLE saude_mental ADD CONSTRAINT saude_mental_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE;

ALTER TABLE esocial_events ADD CONSTRAINT esocial_events_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE;

ALTER TABLE solicitacoes ADD CONSTRAINT solicitacoes_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE;

ALTER TABLE reembolsos ADD CONSTRAINT reembolsos_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE;

ALTER TABLE curso_inscricoes ADD CONSTRAINT curso_inscricoes_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE;

ALTER TABLE app_users ADD CONSTRAINT app_users_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE SET NULL;

ALTER TABLE colaborador_documentos ADD CONSTRAINT colaborador_documentos_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE;

ALTER TABLE cargo_gestores ADD CONSTRAINT cargo_gestores_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE;

ALTER TABLE documentos_rh ADD CONSTRAINT documentos_rh_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE;

ALTER TABLE alertas ADD CONSTRAINT alertas_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE;

ALTER TABLE eventos_esocial ADD CONSTRAINT eventos_esocial_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE;

ALTER TABLE programacao_ferias ADD CONSTRAINT programacao_ferias_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE;

ALTER TABLE solicitacoes_funcionario ADD CONSTRAINT solicitacoes_funcionario_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE;

ALTER TABLE documentos_funcionario ADD CONSTRAINT documentos_funcionario_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE;

ALTER TABLE comunicados_lidos ADD CONSTRAINT comunicados_lidos_colaborador_id_fkey 
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE;

-- =====================================================
-- PASSO 13: Verificação final
-- =====================================================
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

-- ⚠️ ATENÇÃO: As RLS policies e views foram removidas!
-- Você precisará recriá-las manualmente após a migração
SELECT '⚠️ IMPORTANTE: Recriar RLS policies e views!' as aviso;
