-- ============================================================================
-- MIGRATION 21: POLÍTICAS E COMPLIANCE
-- ============================================================================
-- Sistema de gestão de políticas internas, LGPD, termos de uso e compliance
-- SEM RLS (Row Level Security) para evitar erros 403
-- ============================================================================

-- Tabela: Políticas e Documentos de Compliance
CREATE TABLE IF NOT EXISTS politicas_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  
  -- Identificação
  codigo VARCHAR(100) NOT NULL UNIQUE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(50) NOT NULL, -- 'lgpd', 'termo_uso', 'politica_interna', 'codigo_conduta', 'regulamento', 'outro'
  categoria VARCHAR(100), -- 'privacidade', 'seguranca', 'rh', 'ti', 'financeiro', 'operacional'
  
  -- Conteúdo
  conteudo_html TEXT NOT NULL,
  conteudo_texto TEXT,
  resumo TEXT,
  
  -- Versão e Controle
  versao VARCHAR(20) NOT NULL DEFAULT '1.0',
  versao_anterior_id UUID REFERENCES politicas_compliance(id),
  data_vigencia DATE NOT NULL,
  data_expiracao DATE,
  
  -- Aprovação
  aprovado_por UUID,
  aprovado_em TIMESTAMP,
  status VARCHAR(30) NOT NULL DEFAULT 'rascunho', -- 'rascunho', 'em_revisao', 'aprovado', 'publicado', 'arquivado'
  
  -- Publicação
  publicado BOOLEAN DEFAULT FALSE,
  publicado_em TIMESTAMP,
  obrigatorio_aceite BOOLEAN DEFAULT FALSE,
  
  -- Aplicabilidade
  aplica_todos_colaboradores BOOLEAN DEFAULT TRUE,
  aplica_departamentos JSONB DEFAULT '[]', -- ['TI', 'RH', 'Financeiro']
  aplica_cargos JSONB DEFAULT '[]', -- ['Gerente', 'Analista']
  
  -- Anexos e Referências
  anexos JSONB DEFAULT '[]', -- [{nome, url, tipo, tamanho}]
  referencias JSONB DEFAULT '[]', -- [{titulo, url, tipo}]
  palavras_chave JSONB DEFAULT '[]', -- ['LGPD', 'Privacidade', 'Dados']
  
  -- Notificações
  notificar_colaboradores BOOLEAN DEFAULT TRUE,
  notificar_gestores BOOLEAN DEFAULT TRUE,
  prazo_aceite_dias INTEGER DEFAULT 30,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'
);

-- Tabela: Aceites de Políticas pelos Colaboradores
CREATE TABLE IF NOT EXISTS politicas_aceites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  politica_id UUID NOT NULL REFERENCES politicas_compliance(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL,
  
  -- Aceite
  aceito BOOLEAN DEFAULT FALSE,
  aceito_em TIMESTAMP,
  ip_aceite VARCHAR(50),
  user_agent TEXT,
  
  -- Leitura
  lido BOOLEAN DEFAULT FALSE,
  lido_em TIMESTAMP,
  tempo_leitura_segundos INTEGER,
  
  -- Prazo
  prazo_aceite DATE,
  atrasado BOOLEAN DEFAULT FALSE,
  
  -- Recusa (se aplicável)
  recusado BOOLEAN DEFAULT FALSE,
  recusado_em TIMESTAMP,
  motivo_recusa TEXT,
  
  -- Notificações
  notificado BOOLEAN DEFAULT FALSE,
  notificado_em TIMESTAMP,
  total_notificacoes INTEGER DEFAULT 0,
  ultima_notificacao TIMESTAMP,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(politica_id, colaborador_id)
);

-- Tabela: Histórico de Alterações de Políticas
CREATE TABLE IF NOT EXISTS politicas_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  politica_id UUID NOT NULL REFERENCES politicas_compliance(id) ON DELETE CASCADE,
  
  -- Alteração
  versao_anterior VARCHAR(20),
  versao_nova VARCHAR(20),
  tipo_alteracao VARCHAR(50), -- 'criacao', 'atualizacao', 'aprovacao', 'publicacao', 'arquivamento'
  descricao_alteracao TEXT,
  
  -- Campos Alterados
  campos_alterados JSONB DEFAULT '[]', -- ['conteudo_html', 'data_vigencia']
  
  -- Responsável
  alterado_por UUID,
  alterado_em TIMESTAMP DEFAULT NOW(),
  
  -- Snapshot (opcional - para auditoria completa)
  snapshot_anterior JSONB,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'
);

-- Tabela: Treinamentos e Capacitações sobre Políticas
CREATE TABLE IF NOT EXISTS politicas_treinamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  politica_id UUID NOT NULL REFERENCES politicas_compliance(id) ON DELETE CASCADE,
  
  -- Treinamento
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(50), -- 'presencial', 'online', 'video', 'documento', 'quiz'
  
  -- Conteúdo
  conteudo_url TEXT,
  duracao_minutos INTEGER,
  
  -- Obrigatoriedade
  obrigatorio BOOLEAN DEFAULT FALSE,
  prazo_conclusao_dias INTEGER,
  
  -- Avaliação
  possui_avaliacao BOOLEAN DEFAULT FALSE,
  nota_minima_aprovacao DECIMAL(5,2),
  
  -- Status
  ativo BOOLEAN DEFAULT TRUE,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID
);

-- Tabela: Participação em Treinamentos
CREATE TABLE IF NOT EXISTS politicas_treinamentos_participantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treinamento_id UUID NOT NULL REFERENCES politicas_treinamentos(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL,
  
  -- Participação
  iniciado BOOLEAN DEFAULT FALSE,
  iniciado_em TIMESTAMP,
  concluido BOOLEAN DEFAULT FALSE,
  concluido_em TIMESTAMP,
  
  -- Avaliação
  nota DECIMAL(5,2),
  aprovado BOOLEAN,
  tentativas INTEGER DEFAULT 0,
  
  -- Certificado
  certificado_url TEXT,
  certificado_gerado_em TIMESTAMP,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(treinamento_id, colaborador_id)
);

-- Tabela: Incidentes e Violações de Políticas
CREATE TABLE IF NOT EXISTS politicas_incidentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  politica_id UUID REFERENCES politicas_compliance(id),
  
  -- Incidente
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  tipo VARCHAR(50), -- 'violacao', 'suspeita', 'denuncia', 'auditoria'
  gravidade VARCHAR(30), -- 'baixa', 'media', 'alta', 'critica'
  
  -- Envolvidos
  colaborador_envolvido_id UUID,
  departamento VARCHAR(100),
  
  -- Detalhes
  data_ocorrencia TIMESTAMP NOT NULL,
  local_ocorrencia VARCHAR(255),
  testemunhas JSONB DEFAULT '[]',
  evidencias JSONB DEFAULT '[]', -- [{tipo, url, descricao}]
  
  -- Tratamento
  status VARCHAR(50) DEFAULT 'aberto', -- 'aberto', 'em_investigacao', 'resolvido', 'arquivado'
  responsavel_investigacao_id UUID,
  data_inicio_investigacao TIMESTAMP,
  data_conclusao TIMESTAMP,
  
  -- Resultado
  resultado TEXT,
  medidas_tomadas TEXT,
  medidas_preventivas TEXT,
  
  -- Confidencialidade
  confidencial BOOLEAN DEFAULT TRUE,
  anonimo BOOLEAN DEFAULT FALSE,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'
);

-- Tabela: Auditorias de Compliance
CREATE TABLE IF NOT EXISTS politicas_auditorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Auditoria
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(50), -- 'interna', 'externa', 'regulatoria', 'lgpd'
  escopo TEXT,
  
  -- Período
  data_inicio DATE NOT NULL,
  data_fim DATE,
  
  -- Políticas Auditadas
  politicas_ids JSONB DEFAULT '[]', -- [uuid1, uuid2, uuid3]
  
  -- Responsáveis
  auditor_responsavel VARCHAR(255),
  auditor_externo VARCHAR(255),
  equipe_auditoria JSONB DEFAULT '[]',
  
  -- Status
  status VARCHAR(50) DEFAULT 'planejada', -- 'planejada', 'em_andamento', 'concluida', 'cancelada'
  
  -- Resultados
  conformidade_geral DECIMAL(5,2), -- Percentual de conformidade
  nao_conformidades INTEGER DEFAULT 0,
  observacoes INTEGER DEFAULT 0,
  recomendacoes INTEGER DEFAULT 0,
  
  -- Relatório
  relatorio_url TEXT,
  relatorio_gerado_em TIMESTAMP,
  
  -- Plano de Ação
  plano_acao TEXT,
  prazo_adequacao DATE,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

CREATE INDEX idx_politicas_empresa ON politicas_compliance(empresa_id);
CREATE INDEX idx_politicas_tipo ON politicas_compliance(tipo);
CREATE INDEX idx_politicas_status ON politicas_compliance(status);
CREATE INDEX idx_politicas_publicado ON politicas_compliance(publicado);
CREATE INDEX idx_politicas_vigencia ON politicas_compliance(data_vigencia);

CREATE INDEX idx_aceites_politica ON politicas_aceites(politica_id);
CREATE INDEX idx_aceites_colaborador ON politicas_aceites(colaborador_id);
CREATE INDEX idx_aceites_status ON politicas_aceites(aceito, atrasado);
CREATE INDEX idx_aceites_prazo ON politicas_aceites(prazo_aceite);

CREATE INDEX idx_historico_politica ON politicas_historico(politica_id);
CREATE INDEX idx_historico_data ON politicas_historico(alterado_em);

CREATE INDEX idx_treinamentos_politica ON politicas_treinamentos(politica_id);
CREATE INDEX idx_treinamentos_ativo ON politicas_treinamentos(ativo);

CREATE INDEX idx_participantes_treinamento ON politicas_treinamentos_participantes(treinamento_id);
CREATE INDEX idx_participantes_colaborador ON politicas_treinamentos_participantes(colaborador_id);
CREATE INDEX idx_participantes_status ON politicas_treinamentos_participantes(concluido, aprovado);

CREATE INDEX idx_incidentes_politica ON politicas_incidentes(politica_id);
CREATE INDEX idx_incidentes_colaborador ON politicas_incidentes(colaborador_envolvido_id);
CREATE INDEX idx_incidentes_status ON politicas_incidentes(status);
CREATE INDEX idx_incidentes_gravidade ON politicas_incidentes(gravidade);
CREATE INDEX idx_incidentes_data ON politicas_incidentes(data_ocorrencia);

CREATE INDEX idx_auditorias_status ON politicas_auditorias(status);
CREATE INDEX idx_auditorias_periodo ON politicas_auditorias(data_inicio, data_fim);

-- ============================================================================
-- COMENTÁRIOS DAS TABELAS
-- ============================================================================

COMMENT ON TABLE politicas_compliance IS 'Políticas internas, LGPD, termos de uso e documentos de compliance';
COMMENT ON TABLE politicas_aceites IS 'Registro de aceites de políticas pelos colaboradores';
COMMENT ON TABLE politicas_historico IS 'Histórico de alterações e versões de políticas';
COMMENT ON TABLE politicas_treinamentos IS 'Treinamentos e capacitações sobre políticas';
COMMENT ON TABLE politicas_treinamentos_participantes IS 'Participação de colaboradores em treinamentos';
COMMENT ON TABLE politicas_incidentes IS 'Incidentes e violações de políticas';
COMMENT ON TABLE politicas_auditorias IS 'Auditorias de compliance e conformidade';

-- ============================================================================
-- DADOS INICIAIS - POLÍTICAS PADRÃO
-- ============================================================================

-- Política de Privacidade (LGPD)
INSERT INTO politicas_compliance (
  empresa_id,
  codigo,
  titulo,
  descricao,
  tipo,
  categoria,
  conteudo_html,
  versao,
  data_vigencia,
  status,
  publicado,
  obrigatorio_aceite
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Será substituído pela empresa real
  'LGPD_PRIVACIDADE_001',
  'Política de Privacidade e Proteção de Dados',
  'Política de privacidade em conformidade com a LGPD',
  'lgpd',
  'privacidade',
  '<h2>Política de Privacidade e Proteção de Dados</h2><p>Esta política estabelece as diretrizes para coleta, uso, armazenamento e proteção de dados pessoais...</p>',
  '1.0',
  CURRENT_DATE,
  'rascunho',
  FALSE,
  TRUE
);

-- Código de Conduta
INSERT INTO politicas_compliance (
  empresa_id,
  codigo,
  titulo,
  descricao,
  tipo,
  categoria,
  conteudo_html,
  versao,
  data_vigencia,
  status,
  publicado,
  obrigatorio_aceite
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'CODIGO_CONDUTA_001',
  'Código de Conduta e Ética',
  'Código de conduta e ética profissional da empresa',
  'codigo_conduta',
  'rh',
  '<h2>Código de Conduta e Ética</h2><p>Este código estabelece os princípios éticos e de conduta esperados de todos os colaboradores...</p>',
  '1.0',
  CURRENT_DATE,
  'rascunho',
  FALSE,
  TRUE
);

-- Política de Segurança da Informação
INSERT INTO politicas_compliance (
  empresa_id,
  codigo,
  titulo,
  descricao,
  tipo,
  categoria,
  conteudo_html,
  versao,
  data_vigencia,
  status,
  publicado,
  obrigatorio_aceite
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'SEGURANCA_INFO_001',
  'Política de Segurança da Informação',
  'Diretrizes para segurança e uso adequado de informações',
  'politica_interna',
  'seguranca',
  '<h2>Política de Segurança da Informação</h2><p>Esta política define as regras para uso, acesso e proteção de informações da empresa...</p>',
  '1.0',
  CURRENT_DATE,
  'rascunho',
  FALSE,
  TRUE
);

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
