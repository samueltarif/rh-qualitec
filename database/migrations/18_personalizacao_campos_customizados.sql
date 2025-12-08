-- ============================================================================
-- 18_personalizacao_campos_customizados.sql - Sistema de Campos Customizados
-- ============================================================================
-- Descrição: Adiciona campos customizados para diferentes entidades do sistema
-- ============================================================================

-- ============================================================================
-- 0. PREPARAÇÃO - DROPAR VIEW EXISTENTE
-- ============================================================================

-- Dropar view se existir (será recriada com nova estrutura)
DROP VIEW IF EXISTS vw_colaboradores_completo CASCADE;

-- ============================================================================
-- 1. ADICIONAR CAMPOS FALTANTES NA TABELA EMPRESA
-- ============================================================================

-- Adicionar configurações fiscais que faltavam
ALTER TABLE empresa
ADD COLUMN IF NOT EXISTS regime_tributario VARCHAR(50),
ADD COLUMN IF NOT EXISTS porte_empresa VARCHAR(50);

-- ============================================================================
-- 2. TABELA DE CAMPOS CUSTOMIZADOS
-- ============================================================================
-- Permite criar campos adicionais para colaboradores, documentos, etc

CREATE TABLE IF NOT EXISTS campos_customizados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  nome VARCHAR(100) NOT NULL,
  label VARCHAR(255) NOT NULL,
  descricao TEXT,
  
  -- Configuração
  entidade VARCHAR(50) NOT NULL, -- 'colaborador', 'empresa', 'documento', etc
  tipo_campo VARCHAR(50) NOT NULL, -- 'texto', 'numero', 'data', 'select', 'checkbox', 'textarea', 'email', 'telefone', 'cpf', 'cnpj'
  opcoes JSONB, -- Para campos tipo select/radio: ["Opção 1", "Opção 2"]
  
  -- Validação
  obrigatorio BOOLEAN DEFAULT false,
  valor_padrao TEXT,
  mascara VARCHAR(100), -- Máscara de formatação (ex: "000.000.000-00")
  validacao_regex VARCHAR(255), -- Regex para validação customizada
  mensagem_erro VARCHAR(255),
  
  -- Exibição
  ordem INTEGER DEFAULT 0,
  grupo VARCHAR(100), -- Agrupar campos (ex: "Dados Pessoais", "Endereço")
  visivel BOOLEAN DEFAULT true,
  editavel BOOLEAN DEFAULT true,
  
  -- Permissões
  visivel_para JSONB DEFAULT '["admin", "rh"]'::jsonb, -- Roles que podem ver
  editavel_por JSONB DEFAULT '["admin", "rh"]'::jsonb, -- Roles que podem editar
  
  -- Integração
  sincronizar_com VARCHAR(100), -- Campo do sistema para sincronizar
  formula TEXT, -- Fórmula para campos calculados
  
  -- Metadados
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES app_users(id),
  
  CONSTRAINT uk_campo_customizado UNIQUE(entidade, nome)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_campos_customizados_entidade ON campos_customizados(entidade);
CREATE INDEX IF NOT EXISTS idx_campos_customizados_ativo ON campos_customizados(ativo);
CREATE INDEX IF NOT EXISTS idx_campos_customizados_ordem ON campos_customizados(ordem);

-- Trigger
CREATE TRIGGER tr_campos_customizados_updated_at
  BEFORE UPDATE ON campos_customizados
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE campos_customizados IS 'Definição de campos customizados para diferentes entidades';
COMMENT ON COLUMN campos_customizados.entidade IS 'Entidade onde o campo será usado';
COMMENT ON COLUMN campos_customizados.tipo_campo IS 'Tipo do campo (texto, numero, data, select, etc)';
COMMENT ON COLUMN campos_customizados.opcoes IS 'Opções para campos select/radio em formato JSON';

-- ============================================================================
-- 3. TABELA DE VALORES DOS CAMPOS CUSTOMIZADOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS valores_campos_customizados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacionamentos
  campo_id UUID NOT NULL REFERENCES campos_customizados(id) ON DELETE CASCADE,
  entidade_tipo VARCHAR(50) NOT NULL, -- 'colaborador', 'empresa', etc
  entidade_id UUID NOT NULL, -- ID do registro relacionado
  
  -- Valor
  valor TEXT,
  valor_numerico DECIMAL(15,2),
  valor_data DATE,
  valor_boolean BOOLEAN,
  valor_json JSONB,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES app_users(id),
  
  CONSTRAINT uk_valor_campo UNIQUE(campo_id, entidade_tipo, entidade_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_valores_campos_entidade ON valores_campos_customizados(entidade_tipo, entidade_id);
CREATE INDEX IF NOT EXISTS idx_valores_campos_campo ON valores_campos_customizados(campo_id);

-- Trigger
CREATE TRIGGER tr_valores_campos_updated_at
  BEFORE UPDATE ON valores_campos_customizados
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE valores_campos_customizados IS 'Valores dos campos customizados para cada registro';
COMMENT ON COLUMN valores_campos_customizados.entidade_tipo IS 'Tipo da entidade (colaborador, empresa, etc)';
COMMENT ON COLUMN valores_campos_customizados.entidade_id IS 'ID do registro da entidade';

-- ============================================================================
-- 4. DADOS INICIAIS - CAMPOS CUSTOMIZADOS PARA COLABORADORES
-- ============================================================================

-- Campos customizados úteis para RH
INSERT INTO campos_customizados (nome, label, descricao, entidade, tipo_campo, grupo, ordem, obrigatorio) VALUES
-- Dados Pessoais Adicionais
('nome_social', 'Nome Social', 'Nome pelo qual prefere ser chamado', 'colaborador', 'texto', 'Dados Pessoais', 1, false),
('genero', 'Gênero', 'Identidade de gênero', 'colaborador', 'select', 'Dados Pessoais', 2, false),
('estado_civil_detalhado', 'Estado Civil Detalhado', 'Informação detalhada do estado civil', 'colaborador', 'select', 'Dados Pessoais', 3, false),
('nacionalidade', 'Nacionalidade', 'País de origem', 'colaborador', 'texto', 'Dados Pessoais', 4, false),
('naturalidade', 'Naturalidade', 'Cidade de nascimento', 'colaborador', 'texto', 'Dados Pessoais', 5, false),

-- Documentação Adicional
('rg_orgao_emissor', 'RG - Órgão Emissor', 'Órgão que emitiu o RG', 'colaborador', 'texto', 'Documentação', 10, false),
('rg_data_emissao', 'RG - Data de Emissão', 'Data de emissão do RG', 'colaborador', 'data', 'Documentação', 11, false),
('cnh_numero', 'CNH - Número', 'Número da Carteira Nacional de Habilitação', 'colaborador', 'texto', 'Documentação', 12, false),
('cnh_categoria', 'CNH - Categoria', 'Categoria da CNH', 'colaborador', 'select', 'Documentação', 13, false),
('cnh_validade', 'CNH - Validade', 'Data de validade da CNH', 'colaborador', 'data', 'Documentação', 14, false),
('titulo_eleitor', 'Título de Eleitor', 'Número do título de eleitor', 'colaborador', 'texto', 'Documentação', 15, false),
('reservista', 'Certificado de Reservista', 'Número do certificado de reservista', 'colaborador', 'texto', 'Documentação', 16, false),

-- Dados Bancários Adicionais
('pix_tipo', 'PIX - Tipo de Chave', 'Tipo da chave PIX', 'colaborador', 'select', 'Dados Bancários', 20, false),
('pix_chave', 'PIX - Chave', 'Chave PIX do colaborador', 'colaborador', 'texto', 'Dados Bancários', 21, false),

-- Formação e Qualificação
('escolaridade', 'Escolaridade', 'Nível de escolaridade', 'colaborador', 'select', 'Formação', 30, false),
('curso_formacao', 'Curso de Formação', 'Nome do curso de formação', 'colaborador', 'texto', 'Formação', 31, false),
('instituicao_ensino', 'Instituição de Ensino', 'Nome da instituição', 'colaborador', 'texto', 'Formação', 32, false),
('ano_conclusao', 'Ano de Conclusão', 'Ano de conclusão do curso', 'colaborador', 'numero', 'Formação', 33, false),

-- Saúde e Segurança
('tipo_sanguineo', 'Tipo Sanguíneo', 'Tipo sanguíneo e fator RH', 'colaborador', 'select', 'Saúde', 40, false),
('alergias', 'Alergias', 'Alergias conhecidas', 'colaborador', 'textarea', 'Saúde', 41, false),
('medicamentos_uso', 'Medicamentos em Uso', 'Medicamentos de uso contínuo', 'colaborador', 'textarea', 'Saúde', 42, false),
('plano_saude', 'Plano de Saúde', 'Possui plano de saúde da empresa', 'colaborador', 'checkbox', 'Saúde', 43, false),
('plano_saude_numero', 'Número do Plano', 'Número da carteirinha do plano', 'colaborador', 'texto', 'Saúde', 44, false),

-- Dependentes
('tem_dependentes', 'Possui Dependentes', 'Possui dependentes para IR', 'colaborador', 'checkbox', 'Dependentes', 50, false),
('numero_dependentes', 'Número de Dependentes', 'Quantidade de dependentes', 'colaborador', 'numero', 'Dependentes', 51, false),

-- Transporte
('vale_transporte', 'Vale Transporte', 'Utiliza vale transporte', 'colaborador', 'checkbox', 'Benefícios', 60, false),
('linhas_transporte', 'Linhas de Transporte', 'Linhas utilizadas', 'colaborador', 'textarea', 'Benefícios', 61, false),
('vale_refeicao', 'Vale Refeição', 'Utiliza vale refeição', 'colaborador', 'checkbox', 'Benefícios', 62, false),
('vale_alimentacao', 'Vale Alimentação', 'Utiliza vale alimentação', 'colaborador', 'checkbox', 'Benefícios', 63, false),

-- Informações Adicionais
('observacoes', 'Observações', 'Observações gerais sobre o colaborador', 'colaborador', 'textarea', 'Outros', 70, false),
('tamanho_uniforme', 'Tamanho do Uniforme', 'Tamanho do uniforme', 'colaborador', 'select', 'Outros', 71, false),
('tamanho_calcado', 'Tamanho do Calçado', 'Tamanho do calçado', 'colaborador', 'numero', 'Outros', 72, false)

ON CONFLICT (entidade, nome) DO NOTHING;

-- Atualizar opções para campos select
UPDATE campos_customizados SET opcoes = '["Masculino", "Feminino", "Não-binário", "Prefiro não informar"]'::jsonb 
WHERE nome = 'genero';

UPDATE campos_customizados SET opcoes = '["Solteiro(a)", "Casado(a)", "União Estável", "Divorciado(a)", "Viúvo(a)", "Separado(a)"]'::jsonb 
WHERE nome = 'estado_civil_detalhado';

UPDATE campos_customizados SET opcoes = '["A", "B", "C", "D", "E", "AB", "AC", "AD", "AE"]'::jsonb 
WHERE nome = 'cnh_categoria';

UPDATE campos_customizados SET opcoes = '["CPF", "CNPJ", "E-mail", "Telefone", "Chave Aleatória"]'::jsonb 
WHERE nome = 'pix_tipo';

UPDATE campos_customizados SET opcoes = '["Fundamental Incompleto", "Fundamental Completo", "Médio Incompleto", "Médio Completo", "Superior Incompleto", "Superior Completo", "Pós-graduação", "Mestrado", "Doutorado"]'::jsonb 
WHERE nome = 'escolaridade';

UPDATE campos_customizados SET opcoes = '["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]'::jsonb 
WHERE nome = 'tipo_sanguineo';

UPDATE campos_customizados SET opcoes = '["PP", "P", "M", "G", "GG", "XG", "XXG"]'::jsonb 
WHERE nome = 'tamanho_uniforme';

-- ============================================================================
-- 5. RLS (Row Level Security)
-- ============================================================================

ALTER TABLE campos_customizados ENABLE ROW LEVEL SECURITY;
ALTER TABLE valores_campos_customizados ENABLE ROW LEVEL SECURITY;

-- Admin e RH podem gerenciar campos customizados
CREATE POLICY "admin_rh_all_campos_customizados" ON campos_customizados
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE auth_uid = auth.uid() 
      AND role IN ('admin', 'rh')
    )
  );

-- Funcionários podem ver campos customizados ativos
CREATE POLICY "employee_view_campos_customizados" ON campos_customizados
  FOR SELECT
  TO authenticated
  USING (ativo = true);

-- Admin e RH podem gerenciar valores
CREATE POLICY "admin_rh_all_valores_campos" ON valores_campos_customizados
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE auth_uid = auth.uid() 
      AND role IN ('admin', 'rh')
    )
  );

-- Funcionários podem ver seus próprios valores
CREATE POLICY "employee_view_own_valores" ON valores_campos_customizados
  FOR SELECT
  TO authenticated
  USING (
    entidade_tipo = 'colaborador' AND
    entidade_id IN (
      SELECT id FROM colaboradores 
      WHERE user_id = (
        SELECT id FROM app_users WHERE auth_uid = auth.uid()
      )
    )
  );

-- ============================================================================
-- 6. FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para obter campos customizados de uma entidade
CREATE OR REPLACE FUNCTION get_campos_customizados(p_entidade VARCHAR, p_user_role VARCHAR DEFAULT 'employee')
RETURNS TABLE (
  id UUID,
  nome VARCHAR,
  label VARCHAR,
  descricao TEXT,
  tipo_campo VARCHAR,
  opcoes JSONB,
  obrigatorio BOOLEAN,
  valor_padrao TEXT,
  mascara VARCHAR,
  ordem INTEGER,
  grupo VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cc.id,
    cc.nome,
    cc.label,
    cc.descricao,
    cc.tipo_campo,
    cc.opcoes,
    cc.obrigatorio,
    cc.valor_padrao,
    cc.mascara,
    cc.ordem,
    cc.grupo
  FROM campos_customizados cc
  WHERE cc.entidade = p_entidade
    AND cc.ativo = true
    AND cc.visivel = true
    AND cc.visivel_para ? p_user_role
  ORDER BY cc.ordem, cc.label;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter valores de campos customizados
CREATE OR REPLACE FUNCTION get_valores_campos_customizados(
  p_entidade_tipo VARCHAR,
  p_entidade_id UUID
)
RETURNS TABLE (
  campo_nome VARCHAR,
  campo_label VARCHAR,
  tipo_campo VARCHAR,
  valor TEXT,
  grupo VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cc.nome,
    cc.label,
    cc.tipo_campo,
    COALESCE(
      vcc.valor,
      vcc.valor_numerico::TEXT,
      vcc.valor_data::TEXT,
      vcc.valor_boolean::TEXT,
      vcc.valor_json::TEXT
    ) as valor,
    cc.grupo
  FROM campos_customizados cc
  LEFT JOIN valores_campos_customizados vcc 
    ON vcc.campo_id = cc.id 
    AND vcc.entidade_tipo = p_entidade_tipo
    AND vcc.entidade_id = p_entidade_id
  WHERE cc.entidade = p_entidade_tipo
    AND cc.ativo = true
    AND cc.visivel = true
  ORDER BY cc.ordem, cc.label;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. VIEW PARA FACILITAR CONSULTAS
-- ============================================================================

CREATE OR REPLACE VIEW vw_colaboradores_completo AS
SELECT 
  c.*,
  u.email,
  u.role,
  u.ativo as usuario_ativo,
  -- Agregar campos customizados em JSON
  (
    SELECT jsonb_object_agg(cc.nome, 
      COALESCE(
        vcc.valor,
        vcc.valor_numerico::TEXT,
        vcc.valor_data::TEXT,
        vcc.valor_boolean::TEXT,
        vcc.valor_json::TEXT
      )
    )
    FROM campos_customizados cc
    LEFT JOIN valores_campos_customizados vcc 
      ON vcc.campo_id = cc.id 
      AND vcc.entidade_tipo = 'colaborador'
      AND vcc.entidade_id = c.id
    WHERE cc.entidade = 'colaborador'
      AND cc.ativo = true
  ) as campos_customizados
FROM colaboradores c
LEFT JOIN app_users u ON u.id = c.user_id;

COMMENT ON VIEW vw_colaboradores_completo IS 'View completa de colaboradores incluindo campos customizados';

-- ============================================================================
-- FIM
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Sistema de Campos Customizados criado!';
  RAISE NOTICE '📋 Tabelas: campos_customizados, valores_campos_customizados';
  RAISE NOTICE '📝 %s campos customizados iniciais criados para colaboradores', 
    (SELECT COUNT(*) FROM campos_customizados WHERE entidade = 'colaborador');
  RAISE NOTICE '💡 Use a página de Campos Customizados para gerenciar';
END $$;
