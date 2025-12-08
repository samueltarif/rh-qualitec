-- ============================================================================
-- 19_relatorios_personalizados.sql - Sistema de Relatórios Personalizados
-- ============================================================================
-- Descrição: Sistema completo para criar, agendar e gerar relatórios customizados
-- ============================================================================

-- ============================================================================
-- 1. TABELA DE TEMPLATES DE RELATÓRIOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS relatorios_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100), -- 'colaboradores', 'folha', 'ponto', 'ferias', 'documentos', 'geral'
  
  -- Configuração da Query
  entidade_principal VARCHAR(100) NOT NULL, -- Tabela/view principal
  campos_selecionados JSONB NOT NULL, -- ["campo1", "campo2", ...]
  joins JSONB, -- Joins com outras tabelas
  filtros JSONB, -- Filtros padrão
  ordenacao JSONB, -- Ordenação padrão
  agrupamento JSONB, -- Agrupamento (GROUP BY)
  
  -- SQL Customizado (opcional - para relatórios avançados)
  sql_customizado TEXT,
  
  -- Formato e Apresentação
  formato_padrao VARCHAR(50) DEFAULT 'pdf', -- 'pdf', 'excel', 'csv', 'json'
  orientacao VARCHAR(20) DEFAULT 'portrait', -- 'portrait', 'landscape'
  incluir_logo BOOLEAN DEFAULT true,
  incluir_cabecalho BOOLEAN DEFAULT true,
  incluir_rodape BOOLEAN DEFAULT true,
  titulo_customizado VARCHAR(255),
  
  -- Colunas e Formatação
  colunas_config JSONB, -- Configuração de cada coluna (largura, alinhamento, formato)
  totalizadores JSONB, -- Campos para totalizar
  
  -- Permissões
  visivel_para JSONB DEFAULT '["admin", "rh"]'::jsonb,
  executavel_por JSONB DEFAULT '["admin", "rh"]'::jsonb,
  
  -- Compartilhamento
  publico BOOLEAN DEFAULT false,
  compartilhado_com JSONB, -- IDs de usuários com acesso
  
  -- Metadados
  ativo BOOLEAN DEFAULT true,
  favorito BOOLEAN DEFAULT false,
  tags JSONB, -- Tags para organização
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES app_users(id),
  ultima_execucao TIMESTAMPTZ,
  total_execucoes INTEGER DEFAULT 0,
  
  CONSTRAINT uk_relatorio_nome UNIQUE(nome)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_relatorios_categoria ON relatorios_templates(categoria);
CREATE INDEX IF NOT EXISTS idx_relatorios_ativo ON relatorios_templates(ativo);
CREATE INDEX IF NOT EXISTS idx_relatorios_created_by ON relatorios_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_relatorios_favorito ON relatorios_templates(favorito);

-- Trigger
CREATE TRIGGER tr_relatorios_templates_updated_at
  BEFORE UPDATE ON relatorios_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE relatorios_templates IS 'Templates de relatórios personalizados';
COMMENT ON COLUMN relatorios_templates.campos_selecionados IS 'Campos a serem incluídos no relatório';
COMMENT ON COLUMN relatorios_templates.sql_customizado IS 'SQL customizado para relatórios avançados';

-- ============================================================================
-- 2. TABELA DE AGENDAMENTOS DE RELATÓRIOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS relatorios_agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacionamento
  template_id UUID NOT NULL REFERENCES relatorios_templates(id) ON DELETE CASCADE,
  
  -- Configuração do Agendamento
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  
  -- Frequência
  frequencia VARCHAR(50) NOT NULL, -- 'diario', 'semanal', 'quinzenal', 'mensal', 'trimestral', 'anual', 'customizado'
  dia_semana INTEGER, -- 0-6 (Domingo-Sábado) para semanal
  dia_mes INTEGER, -- 1-31 para mensal
  hora TIME DEFAULT '08:00:00',
  
  -- Cron customizado (para frequências complexas)
  cron_expression VARCHAR(100),
  
  -- Filtros Dinâmicos
  filtros_dinamicos JSONB, -- Filtros que mudam a cada execução (ex: mês atual)
  
  -- Destinatários
  enviar_email BOOLEAN DEFAULT true,
  emails_destinatarios JSONB, -- ["email1@example.com", "email2@example.com"]
  usuarios_destinatarios JSONB, -- IDs de usuários
  
  -- Formato de Envio
  formato VARCHAR(50) DEFAULT 'pdf',
  incluir_anexo BOOLEAN DEFAULT true,
  incluir_link BOOLEAN DEFAULT false,
  
  -- Mensagem
  assunto_email VARCHAR(255),
  mensagem_email TEXT,
  
  -- Controle de Execução
  proxima_execucao TIMESTAMPTZ,
  ultima_execucao TIMESTAMPTZ,
  total_execucoes INTEGER DEFAULT 0,
  ultima_execucao_sucesso BOOLEAN,
  ultimo_erro TEXT,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES app_users(id),
  
  CONSTRAINT chk_dia_semana CHECK (dia_semana IS NULL OR (dia_semana >= 0 AND dia_semana <= 6)),
  CONSTRAINT chk_dia_mes CHECK (dia_mes IS NULL OR (dia_mes >= 1 AND dia_mes <= 31))
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_agendamentos_template ON relatorios_agendamentos(template_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_ativo ON relatorios_agendamentos(ativo);
CREATE INDEX IF NOT EXISTS idx_agendamentos_proxima_exec ON relatorios_agendamentos(proxima_execucao);

-- Trigger
CREATE TRIGGER tr_relatorios_agendamentos_updated_at
  BEFORE UPDATE ON relatorios_agendamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE relatorios_agendamentos IS 'Agendamentos automáticos de relatórios';
COMMENT ON COLUMN relatorios_agendamentos.frequencia IS 'Frequência de execução do relatório';
COMMENT ON COLUMN relatorios_agendamentos.cron_expression IS 'Expressão cron para agendamentos complexos';

-- ============================================================================
-- 3. TABELA DE HISTÓRICO DE EXECUÇÕES
-- ============================================================================

CREATE TABLE IF NOT EXISTS relatorios_execucoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacionamentos
  template_id UUID NOT NULL REFERENCES relatorios_templates(id) ON DELETE CASCADE,
  agendamento_id UUID REFERENCES relatorios_agendamentos(id) ON DELETE SET NULL,
  
  -- Informações da Execução
  tipo_execucao VARCHAR(50) NOT NULL, -- 'manual', 'agendada'
  status VARCHAR(50) NOT NULL, -- 'processando', 'concluido', 'erro', 'cancelado'
  
  -- Parâmetros Utilizados
  filtros_aplicados JSONB,
  parametros JSONB,
  
  -- Resultado
  formato_gerado VARCHAR(50),
  arquivo_url TEXT, -- URL do arquivo gerado (storage)
  arquivo_nome VARCHAR(255),
  arquivo_tamanho BIGINT, -- Tamanho em bytes
  total_registros INTEGER,
  
  -- Tempo de Processamento
  iniciado_em TIMESTAMPTZ DEFAULT NOW(),
  concluido_em TIMESTAMPTZ,
  duracao_segundos INTEGER,
  
  -- Erro (se houver)
  erro_mensagem TEXT,
  erro_detalhes JSONB,
  
  -- Envio de E-mail
  email_enviado BOOLEAN DEFAULT false,
  email_enviado_em TIMESTAMPTZ,
  emails_destinatarios JSONB,
  
  -- Metadados
  executado_por UUID REFERENCES app_users(id),
  ip_origem VARCHAR(50),
  user_agent TEXT,
  
  -- Expiração (para limpeza automática)
  expira_em TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days'),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_execucoes_template ON relatorios_execucoes(template_id);
CREATE INDEX IF NOT EXISTS idx_execucoes_agendamento ON relatorios_execucoes(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_execucoes_status ON relatorios_execucoes(status);
CREATE INDEX IF NOT EXISTS idx_execucoes_executado_por ON relatorios_execucoes(executado_por);
CREATE INDEX IF NOT EXISTS idx_execucoes_created_at ON relatorios_execucoes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_execucoes_expira_em ON relatorios_execucoes(expira_em);

COMMENT ON TABLE relatorios_execucoes IS 'Histórico de execuções de relatórios';
COMMENT ON COLUMN relatorios_execucoes.expira_em IS 'Data de expiração para limpeza automática';

-- ============================================================================
-- 4. TEMPLATES PRÉ-CONFIGURADOS
-- ============================================================================

-- Template: Lista de Colaboradores Ativos
INSERT INTO relatorios_templates (
  nome, descricao, categoria, entidade_principal,
  campos_selecionados, ordenacao, formato_padrao
) VALUES (
  'Lista de Colaboradores Ativos',
  'Relatório completo de todos os colaboradores ativos',
  'colaboradores',
  'colaboradores',
  '["nome", "cpf", "cargo", "departamento", "data_admissao", "salario", "email", "telefone"]'::jsonb,
  '{"campo": "nome", "direcao": "asc"}'::jsonb,
  'pdf'
) ON CONFLICT (nome) DO NOTHING;

-- Template: Aniversariantes do Mês
INSERT INTO relatorios_templates (
  nome, descricao, categoria, entidade_principal,
  campos_selecionados, filtros, ordenacao
) VALUES (
  'Aniversariantes do Mês',
  'Lista de colaboradores que fazem aniversário no mês atual',
  'colaboradores',
  'colaboradores',
  '["nome", "data_nascimento", "cargo", "departamento", "email", "telefone"]'::jsonb,
  '{"data_nascimento": {"operador": "mes_atual"}}'::jsonb,
  '{"campo": "data_nascimento", "direcao": "asc"}'::jsonb
) ON CONFLICT (nome) DO NOTHING;

-- Template: Folha de Pagamento Mensal
INSERT INTO relatorios_templates (
  nome, descricao, categoria, entidade_principal,
  campos_selecionados, totalizadores
) VALUES (
  'Folha de Pagamento Mensal',
  'Resumo da folha de pagamento do mês',
  'folha',
  'folha_pagamento',
  '["colaborador_nome", "cargo", "salario_base", "total_proventos", "total_descontos", "salario_liquido"]'::jsonb,
  '["salario_base", "total_proventos", "total_descontos", "salario_liquido"]'::jsonb
) ON CONFLICT (nome) DO NOTHING;

-- Template: Controle de Ponto Mensal
INSERT INTO relatorios_templates (
  nome, descricao, categoria, entidade_principal,
  campos_selecionados
) VALUES (
  'Controle de Ponto Mensal',
  'Relatório de ponto dos colaboradores no mês',
  'ponto',
  'registros_ponto',
  '["colaborador_nome", "data", "entrada", "saida_almoco", "retorno_almoco", "saida", "total_horas"]'::jsonb
) ON CONFLICT (nome) DO NOTHING;

-- Template: Férias Programadas
INSERT INTO relatorios_templates (
  nome, descricao, categoria, entidade_principal,
  campos_selecionados, ordenacao
) VALUES (
  'Férias Programadas',
  'Relatório de férias programadas e períodos aquisitivos',
  'ferias',
  'ferias',
  '["colaborador_nome", "periodo_aquisitivo_inicio", "periodo_aquisitivo_fim", "data_inicio", "data_fim", "dias", "status"]'::jsonb,
  '{"campo": "data_inicio", "direcao": "asc"}'::jsonb
) ON CONFLICT (nome) DO NOTHING;

-- Template: Documentos Pendentes
INSERT INTO relatorios_templates (
  nome, descricao, categoria, entidade_principal,
  campos_selecionados, filtros
) VALUES (
  'Documentos Pendentes',
  'Lista de documentos pendentes de colaboradores',
  'documentos',
  'documentos_colaboradores',
  '["colaborador_nome", "tipo_documento", "status", "data_solicitacao", "prazo"]'::jsonb,
  '{"status": {"operador": "in", "valor": ["pendente", "em_analise"]}}'::jsonb
) ON CONFLICT (nome) DO NOTHING;

-- Template: Admissões do Período
INSERT INTO relatorios_templates (
  nome, descricao, categoria, entidade_principal,
  campos_selecionados, ordenacao
) VALUES (
  'Admissões do Período',
  'Relatório de colaboradores admitidos em um período',
  'colaboradores',
  'colaboradores',
  '["nome", "cpf", "cargo", "departamento", "data_admissao", "salario", "tipo_contrato"]'::jsonb,
  '{"campo": "data_admissao", "direcao": "desc"}'::jsonb
) ON CONFLICT (nome) DO NOTHING;

-- Template: Desligamentos do Período
INSERT INTO relatorios_templates (
  nome, descricao, categoria, entidade_principal,
  campos_selecionados, filtros, ordenacao
) VALUES (
  'Desligamentos do Período',
  'Relatório de colaboradores desligados em um período',
  'colaboradores',
  'colaboradores',
  '["nome", "cpf", "cargo", "departamento", "data_admissao", "data_demissao", "motivo_demissao"]'::jsonb,
  '{"ativo": false}'::jsonb,
  '{"campo": "data_demissao", "direcao": "desc"}'::jsonb
) ON CONFLICT (nome) DO NOTHING;

-- Template: Headcount por Departamento
INSERT INTO relatorios_templates (
  nome, descricao, categoria, entidade_principal,
  campos_selecionados, agrupamento
) VALUES (
  'Headcount por Departamento',
  'Quantidade de colaboradores por departamento',
  'colaboradores',
  'colaboradores',
  '["departamento", "COUNT(*) as total"]'::jsonb,
  '["departamento"]'::jsonb
) ON CONFLICT (nome) DO NOTHING;

-- Template: Custos com Pessoal
INSERT INTO relatorios_templates (
  nome, descricao, categoria, entidade_principal,
  campos_selecionados, totalizadores
) VALUES (
  'Custos com Pessoal',
  'Relatório de custos totais com pessoal',
  'folha',
  'colaboradores',
  '["departamento", "cargo", "COUNT(*) as total_colaboradores", "SUM(salario) as total_salarios"]'::jsonb,
  '["total_colaboradores", "total_salarios"]'::jsonb
) ON CONFLICT (nome) DO NOTHING;

-- ============================================================================
-- 5. RLS (Row Level Security)
-- ============================================================================

ALTER TABLE relatorios_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios_agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios_execucoes ENABLE ROW LEVEL SECURITY;

-- Admin e RH podem gerenciar templates
CREATE POLICY "admin_rh_all_templates" ON relatorios_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE auth_uid = auth.uid() 
      AND role IN ('admin', 'rh')
    )
  );

-- Usuários podem ver templates públicos ou compartilhados
CREATE POLICY "users_view_templates" ON relatorios_templates
  FOR SELECT
  TO authenticated
  USING (
    publico = true OR
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE auth_uid = auth.uid() 
      AND (
        role IN ('admin', 'rh') OR
        id = ANY(SELECT jsonb_array_elements_text(compartilhado_com)::uuid)
      )
    )
  );

-- Admin e RH podem gerenciar agendamentos
CREATE POLICY "admin_rh_all_agendamentos" ON relatorios_agendamentos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE auth_uid = auth.uid() 
      AND role IN ('admin', 'rh')
    )
  );

-- Admin e RH podem ver todas as execuções
CREATE POLICY "admin_rh_view_execucoes" ON relatorios_execucoes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE auth_uid = auth.uid() 
      AND role IN ('admin', 'rh')
    )
  );

-- Usuários podem ver suas próprias execuções
CREATE POLICY "users_view_own_execucoes" ON relatorios_execucoes
  FOR SELECT
  TO authenticated
  USING (
    executado_por IN (
      SELECT id FROM app_users WHERE auth_uid = auth.uid()
    )
  );

-- ============================================================================
-- 6. FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para calcular próxima execução de agendamento
CREATE OR REPLACE FUNCTION calcular_proxima_execucao(
  p_frequencia VARCHAR,
  p_dia_semana INTEGER,
  p_dia_mes INTEGER,
  p_hora TIME,
  p_ultima_execucao TIMESTAMPTZ
)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  v_proxima TIMESTAMPTZ;
  v_base TIMESTAMPTZ;
BEGIN
  v_base := COALESCE(p_ultima_execucao, NOW());
  
  CASE p_frequencia
    WHEN 'diario' THEN
      v_proxima := (DATE(v_base) + INTERVAL '1 day' + p_hora)::TIMESTAMPTZ;
    
    WHEN 'semanal' THEN
      v_proxima := (DATE(v_base) + ((p_dia_semana - EXTRACT(DOW FROM v_base)::INTEGER + 7) % 7 + 7) * INTERVAL '1 day' + p_hora)::TIMESTAMPTZ;
      IF v_proxima <= v_base THEN
        v_proxima := v_proxima + INTERVAL '7 days';
      END IF;
    
    WHEN 'quinzenal' THEN
      v_proxima := (DATE(v_base) + INTERVAL '15 days' + p_hora)::TIMESTAMPTZ;
    
    WHEN 'mensal' THEN
      v_proxima := (DATE_TRUNC('month', v_base) + INTERVAL '1 month' + (p_dia_mes - 1) * INTERVAL '1 day' + p_hora)::TIMESTAMPTZ;
    
    WHEN 'trimestral' THEN
      v_proxima := (DATE_TRUNC('month', v_base) + INTERVAL '3 months' + p_hora)::TIMESTAMPTZ;
    
    WHEN 'anual' THEN
      v_proxima := (DATE_TRUNC('year', v_base) + INTERVAL '1 year' + p_hora)::TIMESTAMPTZ;
    
    ELSE
      v_proxima := NULL;
  END CASE;
  
  RETURN v_proxima;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar estatísticas do template após execução
CREATE OR REPLACE FUNCTION atualizar_stats_template()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'concluido' THEN
    UPDATE relatorios_templates
    SET 
      ultima_execucao = NEW.concluido_em,
      total_execucoes = total_execucoes + 1
    WHERE id = NEW.template_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_atualizar_stats_template
  AFTER INSERT OR UPDATE ON relatorios_execucoes
  FOR EACH ROW
  WHEN (NEW.status = 'concluido')
  EXECUTE FUNCTION atualizar_stats_template();

-- ============================================================================
-- FIM
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Sistema de Relatórios Personalizados criado!';
  RAISE NOTICE '📋 Tabelas: relatorios_templates, relatorios_agendamentos, relatorios_execucoes';
  RAISE NOTICE '📊 %s templates pré-configurados criados', 
    (SELECT COUNT(*) FROM relatorios_templates);
  RAISE NOTICE '💡 Acesse Configurações → Relatórios Personalizados';
END $$;
