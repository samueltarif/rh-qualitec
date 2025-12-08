-- =====================================================
-- RECRIAR RLS POLICIES E VIEWS APÓS MIGRAÇÃO UUID
-- =====================================================
-- Execute este script APÓS a migração de IDs
-- =====================================================

-- =====================================================
-- PARTE 1: RECRIAR RLS POLICIES
-- =====================================================

-- Habilitar RLS nas tabelas principais
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE holerites ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_ponto ENABLE ROW LEVEL SECURITY;
ALTER TABLE ferias ENABLE ROW LEVEL SECURITY;
ALTER TABLE dependentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ponto ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficio_adesao ENABLE ROW LEVEL SECURITY;
ALTER TABLE reembolsos ENABLE ROW LEVEL SECURITY;
ALTER TABLE saude_exames ENABLE ROW LEVEL SECURITY;
ALTER TABLE saude_mental ENABLE ROW LEVEL SECURITY;
ALTER TABLE curso_inscricoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos_pj ENABLE ROW LEVEL SECURITY;
ALTER TABLE banco_horas ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes_alteracao_dados ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- COLABORADORES - Policies
-- =====================================================

-- Admin pode ver todos
CREATE POLICY admin_view_colaboradores ON colaboradores
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.id = auth.uid() 
      AND app_users.role IN ('admin', 'super_admin')
    )
  );

-- Admin pode gerenciar todos
CREATE POLICY admin_manage_colaboradores ON colaboradores
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.id = auth.uid() 
      AND app_users.role IN ('admin', 'super_admin')
    )
  );

-- Funcionário pode ver seu próprio registro
CREATE POLICY funcionario_own_colaborador ON colaboradores
  FOR SELECT
  USING (id = auth.uid());

-- Gestor pode ver sua equipe
CREATE POLICY gestor_view_team ON colaboradores
  FOR SELECT
  USING (gestor_id = auth.uid());

-- =====================================================
-- HOLERITES - Policies
-- =====================================================

-- Admin pode ver todos os holerites
CREATE POLICY admin_view_holerites ON holerites
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.id = auth.uid() 
      AND app_users.role IN ('admin', 'super_admin')
    )
  );

-- Admin pode gerenciar todos os holerites
CREATE POLICY admin_manage_holerites ON holerites
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.id = auth.uid() 
      AND app_users.role IN ('admin', 'super_admin')
    )
  );

-- Funcionário pode ver seus próprios holerites
CREATE POLICY funcionario_view_holerites ON holerites
  FOR SELECT
  USING (colaborador_id = auth.uid());

-- Funcionário pode marcar holerite como visualizado
CREATE POLICY funcionario_update_visualizado ON holerites
  FOR UPDATE
  USING (colaborador_id = auth.uid())
  WITH CHECK (colaborador_id = auth.uid());

-- =====================================================
-- REGISTROS_PONTO - Policies
-- =====================================================

-- Admin pode ver todos
CREATE POLICY admin_view_registros_ponto ON registros_ponto
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.id = auth.uid() 
      AND app_users.role IN ('admin', 'super_admin')
    )
  );

-- Admin pode gerenciar todos
CREATE POLICY admin_manage_registros_ponto ON registros_ponto
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.id = auth.uid() 
      AND app_users.role IN ('admin', 'super_admin')
    )
  );

-- Funcionário pode ver seus próprios registros
CREATE POLICY funcionario_view_registros_ponto ON registros_ponto
  FOR SELECT
  USING (colaborador_id = auth.uid());

-- Funcionário pode inserir seus próprios registros
CREATE POLICY funcionario_insert_registros_ponto ON registros_ponto
  FOR INSERT
  WITH CHECK (colaborador_id = auth.uid());

-- =====================================================
-- FERIAS - Policies
-- =====================================================

-- Admin pode ver todas
CREATE POLICY admin_view_ferias ON ferias
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.id = auth.uid() 
      AND app_users.role IN ('admin', 'super_admin')
    )
  );

-- Admin pode gerenciar todas
CREATE POLICY admin_manage_ferias ON ferias
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.id = auth.uid() 
      AND app_users.role IN ('admin', 'super_admin')
    )
  );

-- Funcionário pode ver suas próprias férias
CREATE POLICY funcionario_view_ferias ON ferias
  FOR SELECT
  USING (colaborador_id = auth.uid());

-- =====================================================
-- SOLICITACOES_ALTERACAO_DADOS - Policies
-- =====================================================

-- Admin pode ver todas
CREATE POLICY admin_view_solicitacoes ON solicitacoes_alteracao_dados
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.id = auth.uid() 
      AND app_users.role IN ('admin', 'super_admin')
    )
  );

-- Admin pode gerenciar todas
CREATE POLICY admin_manage_solicitacoes ON solicitacoes_alteracao_dados
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.id = auth.uid() 
      AND app_users.role IN ('admin', 'super_admin')
    )
  );

-- Funcionário pode ver suas próprias solicitações
CREATE POLICY funcionario_suas_solicitacoes ON solicitacoes_alteracao_dados
  FOR SELECT
  USING (colaborador_id = auth.uid());

-- Funcionário pode criar solicitações
CREATE POLICY funcionario_criar_solicitacoes ON solicitacoes_alteracao_dados
  FOR INSERT
  WITH CHECK (colaborador_id = auth.uid());

-- =====================================================
-- DEPENDENTES - Policies
-- =====================================================

CREATE POLICY admin_view_dependentes ON dependentes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.id = auth.uid() 
      AND app_users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY admin_manage_dependentes ON dependentes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.id = auth.uid() 
      AND app_users.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- DOCUMENTOS - Policies
-- =====================================================

CREATE POLICY admin_view_documentos ON documentos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.id = auth.uid() 
      AND app_users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY admin_manage_documentos ON documentos
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.id = auth.uid() 
      AND app_users.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- PONTO - Policies
-- =====================================================

CREATE POLICY admin_manage_ponto ON ponto
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.id = auth.uid() 
      AND app_users.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- BENEFICIO_ADESAO - Policies
-- =====================================================

CREATE POLICY admin_manage_adesao ON beneficio_adesao
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.id = auth.uid() 
      AND app_users.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- REEMBOLSOS - Policies
-- =====================================================

CREATE POLICY admin_manage_reembolsos ON reembolsos
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.id = auth.uid() 
      AND app_users.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- SAUDE_EXAMES - Policies
-- =====================================================

CREATE POLICY admin_manage_exames ON saude_exames
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.id = auth.uid() 
      AND app_users.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- SAUDE_MENTAL - Policies
-- =====================================================

CREATE POLICY admin_view_saude_mental ON saude_mental
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.id = auth.uid() 
      AND app_users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY admin_manage_saude_mental ON saude_mental
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.id = auth.uid() 
      AND app_users.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- CURSO_INSCRICOES - Policies
-- =====================================================

CREATE POLICY admin_manage_inscricoes ON curso_inscricoes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.id = auth.uid() 
      AND app_users.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- CONTRATOS_PJ - Policies
-- =====================================================

CREATE POLICY dp_view_contratos_pj ON contratos_pj
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.id = auth.uid() 
      AND app_users.role IN ('admin', 'super_admin', 'dp')
    )
  );

CREATE POLICY dp_manage_contratos_pj ON contratos_pj
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.id = auth.uid() 
      AND app_users.role IN ('admin', 'super_admin', 'dp')
    )
  );

-- =====================================================
-- BANCO_HORAS - Policies
-- =====================================================

CREATE POLICY dp_manage_banco_horas ON banco_horas
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.id = auth.uid() 
      AND app_users.role IN ('admin', 'super_admin', 'dp')
    )
  );

-- =====================================================
-- PARTE 2: RECRIAR VIEWS
-- =====================================================

-- View de colaboradores completo
CREATE OR REPLACE VIEW vw_colaboradores_completo AS
SELECT 
  c.*,
  d.nome as departamento_nome,
  ca.nome as cargo_nome,
  g.nome as gestor_nome
FROM colaboradores c
LEFT JOIN departamentos d ON c.departamento_id = d.id
LEFT JOIN cargos ca ON c.cargo_id = ca.id
LEFT JOIN colaboradores g ON c.gestor_id = g.id;

-- View de férias completo
CREATE OR REPLACE VIEW vw_ferias_completo AS
SELECT 
  f.*,
  c.nome as colaborador_nome,
  c.matricula,
  d.nome as departamento_nome
FROM ferias f
INNER JOIN colaboradores c ON f.colaborador_id = c.id
LEFT JOIN departamentos d ON c.departamento_id = d.id;

-- View de aniversariantes
CREATE OR REPLACE VIEW vw_aniversariantes AS
SELECT 
  c.id,
  c.nome,
  c.data_nascimento,
  EXTRACT(MONTH FROM c.data_nascimento) as mes_aniversario,
  EXTRACT(DAY FROM c.data_nascimento) as dia_aniversario,
  d.nome as departamento_nome
FROM colaboradores c
LEFT JOIN departamentos d ON c.departamento_id = d.id
WHERE c.status = 'ativo'
  AND c.data_nascimento IS NOT NULL;

-- View de dashboard KPIs
CREATE OR REPLACE VIEW vw_dashboard_kpis AS
SELECT 
  (SELECT COUNT(*) FROM colaboradores WHERE status = 'ativo') as total_colaboradores,
  (SELECT COUNT(*) FROM colaboradores WHERE status = 'ativo' AND data_admissao >= CURRENT_DATE - INTERVAL '30 days') as admissoes_mes,
  (SELECT COUNT(*) FROM colaboradores WHERE status = 'desligado' AND updated_at >= CURRENT_DATE - INTERVAL '30 days') as desligamentos_mes,
  (SELECT COUNT(*) FROM ferias WHERE status = 'aprovada' AND data_inicio <= CURRENT_DATE AND data_fim >= CURRENT_DATE) as colaboradores_ferias;

-- View de pendências de aprovação
CREATE OR REPLACE VIEW vw_pendencias_aprovacao AS
SELECT 
  'ferias' as tipo,
  f.id,
  c.nome as colaborador_nome,
  f.created_at as data_solicitacao
FROM ferias f
INNER JOIN colaboradores c ON f.colaborador_id = c.id
WHERE f.status = 'pendente'
UNION ALL
SELECT 
  'alteracao_dados' as tipo,
  s.id,
  c.nome as colaborador_nome,
  s.created_at as data_solicitacao
FROM solicitacoes_alteracao_dados s
INNER JOIN colaboradores c ON s.colaborador_id = c.id
WHERE s.status = 'pendente';

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

SELECT '✅ RLS Policies recriadas!' as status;
SELECT '✅ Views recriadas!' as status;

-- Listar policies criadas
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
