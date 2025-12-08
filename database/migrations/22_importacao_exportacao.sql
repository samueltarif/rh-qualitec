-- =====================================================
-- MIGRATION 22: SISTEMA DE IMPORTAÇÃO/EXPORTAÇÃO
-- =====================================================
-- Descrição: Sistema completo para importar/exportar dados em lote
-- Data: 2024
-- =====================================================

-- Tabela de templates de importação/exportação
CREATE TABLE IF NOT EXISTS templates_importacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  tipo_entidade VARCHAR(50) NOT NULL, -- 'colaboradores', 'usuarios', 'documentos', 'ferias', 'ponto', 'folha', etc
  formato VARCHAR(20) NOT NULL DEFAULT 'csv', -- 'csv', 'xlsx', 'json'
  campos_mapeamento JSONB NOT NULL DEFAULT '[]', -- Array de campos e suas configurações
  validacoes JSONB DEFAULT '{}', -- Regras de validação
  transformacoes JSONB DEFAULT '{}', -- Transformações de dados
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de histórico de importações
CREATE TABLE IF NOT EXISTS historico_importacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES templates_importacao(id) ON DELETE SET NULL,
  tipo_entidade VARCHAR(50) NOT NULL,
  arquivo_nome VARCHAR(500) NOT NULL,
  arquivo_tamanho INTEGER,
  formato VARCHAR(20) NOT NULL,
  total_registros INTEGER DEFAULT 0,
  registros_sucesso INTEGER DEFAULT 0,
  registros_erro INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'processando', -- 'processando', 'concluido', 'erro', 'parcial'
  erros_detalhes JSONB DEFAULT '[]', -- Array de erros encontrados
  dados_importados JSONB, -- Resumo dos dados importados
  usuario_id UUID REFERENCES auth.users(id),
  tempo_processamento INTEGER, -- em segundos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de histórico de exportações
CREATE TABLE IF NOT EXISTS historico_exportacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_entidade VARCHAR(50) NOT NULL,
  formato VARCHAR(20) NOT NULL,
  filtros JSONB DEFAULT '{}', -- Filtros aplicados na exportação
  campos_exportados JSONB DEFAULT '[]', -- Campos incluídos
  total_registros INTEGER DEFAULT 0,
  arquivo_nome VARCHAR(500),
  arquivo_url TEXT, -- URL temporária do arquivo gerado
  arquivo_tamanho INTEGER,
  status VARCHAR(50) DEFAULT 'processando', -- 'processando', 'concluido', 'erro'
  erro_mensagem TEXT,
  usuario_id UUID REFERENCES auth.users(id),
  tempo_processamento INTEGER,
  expira_em TIMESTAMP WITH TIME ZONE, -- Data de expiração do arquivo
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de configurações de importação/exportação
CREATE TABLE IF NOT EXISTS config_importacao_exportacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tamanho_maximo_arquivo INTEGER DEFAULT 10485760, -- 10MB em bytes
  formatos_permitidos JSONB DEFAULT '["csv", "xlsx", "json"]',
  validacao_automatica BOOLEAN DEFAULT true,
  backup_antes_importacao BOOLEAN DEFAULT true,
  notificar_conclusao BOOLEAN DEFAULT true,
  tempo_expiracao_exportacao INTEGER DEFAULT 24, -- horas
  limite_registros_exportacao INTEGER DEFAULT 50000,
  permitir_importacao_paralela BOOLEAN DEFAULT false,
  encoding_padrao VARCHAR(20) DEFAULT 'UTF-8',
  delimitador_csv VARCHAR(5) DEFAULT ',',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configuração padrão
INSERT INTO config_importacao_exportacao (id) 
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Tabela de mapeamentos de campos (para facilitar importações futuras)
CREATE TABLE IF NOT EXISTS mapeamentos_campos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(200) NOT NULL,
  tipo_entidade VARCHAR(50) NOT NULL,
  mapeamento JSONB NOT NULL, -- { "campo_arquivo": "campo_sistema", ... }
  usado_count INTEGER DEFAULT 0,
  ultima_utilizacao TIMESTAMP WITH TIME ZONE,
  usuario_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates padrão de importação para Colaboradores
INSERT INTO templates_importacao (nome, descricao, tipo_entidade, formato, campos_mapeamento, validacoes) VALUES
('Importação Completa de Colaboradores', 'Template para importar todos os dados de colaboradores', 'colaboradores', 'csv', 
'[
  {"campo": "nome_completo", "obrigatorio": true, "tipo": "string"},
  {"campo": "cpf", "obrigatorio": true, "tipo": "string", "validacao": "cpf"},
  {"campo": "data_nascimento", "obrigatorio": true, "tipo": "date"},
  {"campo": "email", "obrigatorio": false, "tipo": "email"},
  {"campo": "telefone", "obrigatorio": false, "tipo": "string"},
  {"campo": "cargo", "obrigatorio": true, "tipo": "string"},
  {"campo": "departamento", "obrigatorio": true, "tipo": "string"},
  {"campo": "data_admissao", "obrigatorio": true, "tipo": "date"},
  {"campo": "salario", "obrigatorio": true, "tipo": "decimal"},
  {"campo": "tipo_contrato", "obrigatorio": true, "tipo": "string"},
  {"campo": "jornada_trabalho", "obrigatorio": false, "tipo": "string"},
  {"campo": "status", "obrigatorio": false, "tipo": "string", "default": "ativo"}
]'::jsonb,
'{"cpf": {"unique": true}, "email": {"unique": true, "format": "email"}}'::jsonb),

('Importação Básica de Colaboradores', 'Template simplificado com campos essenciais', 'colaboradores', 'csv',
'[
  {"campo": "nome_completo", "obrigatorio": true, "tipo": "string"},
  {"campo": "cpf", "obrigatorio": true, "tipo": "string"},
  {"campo": "cargo", "obrigatorio": true, "tipo": "string"},
  {"campo": "data_admissao", "obrigatorio": true, "tipo": "date"},
  {"campo": "salario", "obrigatorio": true, "tipo": "decimal"}
]'::jsonb,
'{"cpf": {"unique": true}}'::jsonb),

('Importação de Férias', 'Template para importar períodos de férias', 'ferias', 'csv',
'[
  {"campo": "colaborador_cpf", "obrigatorio": true, "tipo": "string"},
  {"campo": "data_inicio", "obrigatorio": true, "tipo": "date"},
  {"campo": "data_fim", "obrigatorio": true, "tipo": "date"},
  {"campo": "dias_corridos", "obrigatorio": true, "tipo": "integer"},
  {"campo": "periodo_aquisitivo_inicio", "obrigatorio": true, "tipo": "date"},
  {"campo": "periodo_aquisitivo_fim", "obrigatorio": true, "tipo": "date"},
  {"campo": "abono_pecuniario", "obrigatorio": false, "tipo": "boolean", "default": false}
]'::jsonb,
'{}'::jsonb),

('Importação de Documentos', 'Template para importar metadados de documentos', 'documentos', 'csv',
'[
  {"campo": "colaborador_cpf", "obrigatorio": true, "tipo": "string"},
  {"campo": "tipo_documento", "obrigatorio": true, "tipo": "string"},
  {"campo": "numero_documento", "obrigatorio": false, "tipo": "string"},
  {"campo": "data_emissao", "obrigatorio": false, "tipo": "date"},
  {"campo": "data_validade", "obrigatorio": false, "tipo": "date"},
  {"campo": "observacoes", "obrigatorio": false, "tipo": "text"}
]'::jsonb,
'{}'::jsonb);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_historico_importacoes_tipo ON historico_importacoes(tipo_entidade);
CREATE INDEX IF NOT EXISTS idx_historico_importacoes_status ON historico_importacoes(status);
CREATE INDEX IF NOT EXISTS idx_historico_importacoes_created ON historico_importacoes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_historico_importacoes_usuario ON historico_importacoes(usuario_id);

CREATE INDEX IF NOT EXISTS idx_historico_exportacoes_tipo ON historico_exportacoes(tipo_entidade);
CREATE INDEX IF NOT EXISTS idx_historico_exportacoes_status ON historico_exportacoes(status);
CREATE INDEX IF NOT EXISTS idx_historico_exportacoes_created ON historico_exportacoes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_historico_exportacoes_usuario ON historico_exportacoes(usuario_id);

CREATE INDEX IF NOT EXISTS idx_templates_importacao_tipo ON templates_importacao(tipo_entidade);
CREATE INDEX IF NOT EXISTS idx_templates_importacao_ativo ON templates_importacao(ativo);

CREATE INDEX IF NOT EXISTS idx_mapeamentos_campos_tipo ON mapeamentos_campos(tipo_entidade);
CREATE INDEX IF NOT EXISTS idx_mapeamentos_campos_usuario ON mapeamentos_campos(usuario_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_templates_importacao_updated_at
    BEFORE UPDATE ON templates_importacao
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_config_importacao_exportacao_updated_at
    BEFORE UPDATE ON config_importacao_exportacao
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE templates_importacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_importacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_exportacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_importacao_exportacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE mapeamentos_campos ENABLE ROW LEVEL SECURITY;

-- Policies para templates_importacao
CREATE POLICY "Usuários autenticados podem ver templates" ON templates_importacao
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins podem gerenciar templates" ON templates_importacao
    FOR ALL TO authenticated 
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Policies para historico_importacoes
CREATE POLICY "Usuários podem ver suas importações" ON historico_importacoes
    FOR SELECT TO authenticated 
    USING (usuario_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Usuários podem criar importações" ON historico_importacoes
    FOR INSERT TO authenticated 
    WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuários podem atualizar suas importações" ON historico_importacoes
    FOR UPDATE TO authenticated 
    USING (usuario_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- Policies para historico_exportacoes
CREATE POLICY "Usuários podem ver suas exportações" ON historico_exportacoes
    FOR SELECT TO authenticated 
    USING (usuario_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Usuários podem criar exportações" ON historico_exportacoes
    FOR INSERT TO authenticated 
    WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuários podem atualizar suas exportações" ON historico_exportacoes
    FOR UPDATE TO authenticated 
    USING (usuario_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- Policies para config_importacao_exportacao
CREATE POLICY "Todos podem ver configurações" ON config_importacao_exportacao
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Apenas admins podem alterar configurações" ON config_importacao_exportacao
    FOR ALL TO authenticated 
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Policies para mapeamentos_campos
CREATE POLICY "Usuários podem ver seus mapeamentos" ON mapeamentos_campos
    FOR SELECT TO authenticated 
    USING (usuario_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Usuários podem criar mapeamentos" ON mapeamentos_campos
    FOR INSERT TO authenticated 
    WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuários podem atualizar seus mapeamentos" ON mapeamentos_campos
    FOR UPDATE TO authenticated 
    USING (usuario_id = auth.uid());

CREATE POLICY "Usuários podem deletar seus mapeamentos" ON mapeamentos_campos
    FOR DELETE TO authenticated 
    USING (usuario_id = auth.uid());

-- Função para limpar exportações expiradas
CREATE OR REPLACE FUNCTION limpar_exportacoes_expiradas()
RETURNS void AS $$
BEGIN
  UPDATE historico_exportacoes
  SET arquivo_url = NULL,
      status = 'expirado'
  WHERE expira_em < NOW()
    AND status = 'concluido'
    AND arquivo_url IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários
COMMENT ON TABLE templates_importacao IS 'Templates reutilizáveis para importação de dados';
COMMENT ON TABLE historico_importacoes IS 'Histórico de todas as importações realizadas';
COMMENT ON TABLE historico_exportacoes IS 'Histórico de todas as exportações realizadas';
COMMENT ON TABLE config_importacao_exportacao IS 'Configurações globais do sistema de importação/exportação';
COMMENT ON TABLE mapeamentos_campos IS 'Mapeamentos salvos de campos para facilitar importações futuras';

-- =====================================================
-- FIM DA MIGRATION 22
-- =====================================================
