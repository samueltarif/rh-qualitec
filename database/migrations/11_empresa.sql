-- ============================================================================
-- 11_empresa.sql - Tabela de Dados da Empresa
-- ============================================================================
-- Descrição: Armazena informações da empresa (razão social, CNPJ, etc)
-- ============================================================================

CREATE TABLE IF NOT EXISTS empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  inscricao_estadual VARCHAR(50),
  inscricao_municipal VARCHAR(50),
  
  -- Endereço
  cep VARCHAR(9),
  logradouro VARCHAR(255),
  numero VARCHAR(20),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  
  -- Contatos
  telefone VARCHAR(20),
  celular VARCHAR(20),
  email VARCHAR(255),
  site VARCHAR(255),
  
  -- Dados Bancários
  banco_codigo VARCHAR(10),
  banco_nome VARCHAR(100),
  agencia VARCHAR(20),
  conta VARCHAR(30),
  
  -- Responsável Legal
  responsavel_nome VARCHAR(255),
  responsavel_cpf VARCHAR(14),
  responsavel_cargo VARCHAR(100),
  responsavel_email VARCHAR(255),
  responsavel_telefone VARCHAR(20),
  
  -- Logo e Branding
  logo_url TEXT,
  cor_primaria VARCHAR(7) DEFAULT '#DC2626', -- Vermelho Qualitec
  cor_secundaria VARCHAR(7) DEFAULT '#1F2937', -- Cinza escuro
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_empresa_cnpj ON empresa(cnpj);

-- Trigger para updated_at
CREATE TRIGGER tr_empresa_updated_at
  BEFORE UPDATE ON empresa
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Comentários
COMMENT ON TABLE empresa IS 'Dados da empresa - configurações gerais';
COMMENT ON COLUMN empresa.cnpj IS 'CNPJ no formato 00.000.000/0000-00';
COMMENT ON COLUMN empresa.cor_primaria IS 'Cor primária em hexadecimal (#RRGGBB)';

-- Inserir dados iniciais da Qualitec
INSERT INTO empresa (
  razao_social,
  nome_fantasia,
  cnpj,
  cep,
  logradouro,
  numero,
  bairro,
  cidade,
  estado,
  telefone,
  email,
  cor_primaria,
  cor_secundaria
) VALUES (
  'QUALITEC INDUSTRIA E COMERCIO LTDA',
  'Qualitec',
  '00.000.000/0001-00',
  '00000-000',
  'Rua Exemplo',
  '123',
  'Centro',
  'São Paulo',
  'SP',
  '(11) 0000-0000',
  'contato@qualitec.ind.br',
  '#DC2626',
  '#1F2937'
) ON CONFLICT (cnpj) DO NOTHING;

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

ALTER TABLE empresa ENABLE ROW LEVEL SECURITY;

-- Admin pode ver e editar
CREATE POLICY "admin_all_empresa" ON empresa
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE auth_uid = auth.uid() 
      AND role = 'admin'
    )
  );

-- Funcionários podem apenas visualizar
CREATE POLICY "employee_view_empresa" ON empresa
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE auth_uid = auth.uid() 
      AND ativo = true
    )
  );

-- ============================================================================
-- FIM
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Tabela empresa criada com sucesso!';
  RAISE NOTICE '📋 Dados iniciais da Qualitec inseridos';
END $$;
