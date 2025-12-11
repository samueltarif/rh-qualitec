-- ============================================
-- FIX COMPLETO - SISTEMA DE ASSINATURA DIGITAL
-- ============================================

BEGIN;

-- 1. Criar tabela de assinaturas se não existir
CREATE TABLE IF NOT EXISTS assinaturas_ponto (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  ano INTEGER NOT NULL CHECK (ano >= 2020 AND ano <= 2100),
  data_assinatura TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_assinatura VARCHAR(50),
  assinatura_digital TEXT, -- Base64 da assinatura
  arquivo_csv TEXT, -- Conteúdo do CSV em base64
  total_dias INTEGER NOT NULL DEFAULT 0,
  total_horas VARCHAR(20),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(colaborador_id, mes, ano)
);

-- 2. Adicionar coluna assinatura_digital se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assinaturas_ponto' 
    AND column_name = 'assinatura_digital'
  ) THEN
    ALTER TABLE assinaturas_ponto ADD COLUMN assinatura_digital TEXT;
  END IF;
END $$;

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_assinaturas_ponto_colaborador ON assinaturas_ponto(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_ponto_periodo ON assinaturas_ponto(ano, mes);
CREATE INDEX IF NOT EXISTS idx_assinaturas_ponto_data ON assinaturas_ponto(data_assinatura);

-- 4. Habilitar RLS
ALTER TABLE assinaturas_ponto ENABLE ROW LEVEL SECURITY;

-- 5. Remover políticas existentes
DROP POLICY IF EXISTS "Funcionários podem ver suas assinaturas" ON assinaturas_ponto;
DROP POLICY IF EXISTS "Funcionários podem criar assinaturas" ON assinaturas_ponto;
DROP POLICY IF EXISTS "Funcionários podem atualizar assinaturas" ON assinaturas_ponto;
DROP POLICY IF EXISTS "Admins podem ver todas assinaturas" ON assinaturas_ponto;
DROP POLICY IF EXISTS "Admins podem gerenciar assinaturas" ON assinaturas_ponto;

-- 6. Criar políticas RLS
-- Funcionários podem ver apenas suas próprias assinaturas
CREATE POLICY "Funcionários podem ver suas assinaturas"
  ON assinaturas_ponto FOR SELECT
  USING (
    colaborador_id IN (
      SELECT id FROM colaboradores 
      WHERE auth_uid = auth.uid()
    )
  );

-- Funcionários podem criar suas próprias assinaturas
CREATE POLICY "Funcionários podem criar assinaturas"
  ON assinaturas_ponto FOR INSERT
  WITH CHECK (
    colaborador_id IN (
      SELECT id FROM colaboradores 
      WHERE auth_uid = auth.uid()
    )
  );

-- Funcionários podem atualizar suas próprias assinaturas
CREATE POLICY "Funcionários podem atualizar assinaturas"
  ON assinaturas_ponto FOR UPDATE
  USING (
    colaborador_id IN (
      SELECT id FROM colaboradores 
      WHERE auth_uid = auth.uid()
    )
  );

-- Admins podem ver todas as assinaturas
CREATE POLICY "Admins podem ver todas assinaturas"
  ON assinaturas_ponto FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE auth_uid = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Admins podem gerenciar todas as assinaturas
CREATE POLICY "Admins podem gerenciar assinaturas"
  ON assinaturas_ponto FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE auth_uid = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 7. Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_assinaturas_ponto_updated_at()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- 8. Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_assinaturas_ponto_updated_at ON assinaturas_ponto;
CREATE TRIGGER trigger_update_assinaturas_ponto_updated_at
  BEFORE UPDATE ON assinaturas_ponto
  FOR EACH ROW
  EXECUTE FUNCTION update_assinaturas_ponto_updated_at();

-- 9. Comentários
COMMENT ON TABLE assinaturas_ponto IS 'Armazena assinaturas digitais mensais de ponto dos funcionários';
COMMENT ON COLUMN assinaturas_ponto.assinatura_digital IS 'Assinatura digital em base64';
COMMENT ON COLUMN assinaturas_ponto.arquivo_csv IS 'Conteúdo do arquivo CSV em base64 para download';

-- 10. Verificação final
SELECT 'Tabela assinaturas_ponto configurada com sucesso!' as resultado;

SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'assinaturas_ponto'
ORDER BY ordinal_position;

COMMIT;