-- ============================================
-- FIX: ADICIONAR COLUNAS FALTANTES NA TABELA ASSINATURAS_PONTO
-- ============================================

-- 1. Verificar se a tabela existe e adicionar colunas faltantes
DO $$
BEGIN
    -- Adicionar coluna assinatura_digital se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assinaturas_ponto' 
        AND column_name = 'assinatura_digital'
    ) THEN
        ALTER TABLE assinaturas_ponto ADD COLUMN assinatura_digital TEXT;
    END IF;

    -- Adicionar coluna arquivo_csv se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assinaturas_ponto' 
        AND column_name = 'arquivo_csv'
    ) THEN
        ALTER TABLE assinaturas_ponto ADD COLUMN arquivo_csv TEXT;
    END IF;

    -- Adicionar coluna total_dias se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assinaturas_ponto' 
        AND column_name = 'total_dias'
    ) THEN
        ALTER TABLE assinaturas_ponto ADD COLUMN total_dias INTEGER NOT NULL DEFAULT 0;
    END IF;

    -- Adicionar coluna total_horas se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assinaturas_ponto' 
        AND column_name = 'total_horas'
    ) THEN
        ALTER TABLE assinaturas_ponto ADD COLUMN total_horas VARCHAR(20);
    END IF;

    -- Adicionar coluna observacoes se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assinaturas_ponto' 
        AND column_name = 'observacoes'
    ) THEN
        ALTER TABLE assinaturas_ponto ADD COLUMN observacoes TEXT;
    END IF;

    -- Adicionar coluna ip_assinatura se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assinaturas_ponto' 
        AND column_name = 'ip_assinatura'
    ) THEN
        ALTER TABLE assinaturas_ponto ADD COLUMN ip_assinatura VARCHAR(50);
    END IF;
END $$;

-- 2. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_assinaturas_ponto_colaborador ON assinaturas_ponto(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_ponto_periodo ON assinaturas_ponto(ano, mes);
CREATE INDEX IF NOT EXISTS idx_assinaturas_ponto_data ON assinaturas_ponto(data_assinatura);

-- 3. Habilitar RLS se não estiver habilitado
ALTER TABLE assinaturas_ponto ENABLE ROW LEVEL SECURITY;

-- 4. Remover políticas existentes se existirem
DROP POLICY IF EXISTS "Funcionários podem ver suas assinaturas" ON assinaturas_ponto;
DROP POLICY IF EXISTS "Funcionários podem criar assinaturas" ON assinaturas_ponto;
DROP POLICY IF EXISTS "Funcionários podem atualizar assinaturas" ON assinaturas_ponto;
DROP POLICY IF EXISTS "Admins podem ver todas assinaturas" ON assinaturas_ponto;
DROP POLICY IF EXISTS "Admins podem gerenciar assinaturas" ON assinaturas_ponto;

-- 5. Criar políticas RLS
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

-- 6. Adicionar comentários
COMMENT ON TABLE assinaturas_ponto IS 'Armazena assinaturas digitais mensais de ponto dos funcionários';
COMMENT ON COLUMN assinaturas_ponto.assinatura_digital IS 'Assinatura digital em base64';
COMMENT ON COLUMN assinaturas_ponto.arquivo_csv IS 'Conteúdo do arquivo CSV em base64 para download';

-- 7. Verificação final
SELECT 'Colunas adicionadas com sucesso na tabela assinaturas_ponto!' as resultado;

-- 8. Mostrar estrutura atual da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'assinaturas_ponto'
ORDER BY ordinal_position;