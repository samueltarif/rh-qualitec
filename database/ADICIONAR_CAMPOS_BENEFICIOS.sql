-- ============================================
-- ADICIONAR CAMPOS DE BENEFÍCIOS
-- Execute este SQL se os campos não existirem
-- ============================================

-- Adicionar campos de Vale Transporte
ALTER TABLE colaboradores 
ADD COLUMN IF NOT EXISTS recebe_vt BOOLEAN DEFAULT false;

ALTER TABLE colaboradores 
ADD COLUMN IF NOT EXISTS valor_vt DECIMAL(10,2) DEFAULT 0;

-- Adicionar campos de Vale Refeição
ALTER TABLE colaboradores 
ADD COLUMN IF NOT EXISTS recebe_vr BOOLEAN DEFAULT false;

ALTER TABLE colaboradores 
ADD COLUMN IF NOT EXISTS valor_vr DECIMAL(10,2) DEFAULT 0;

-- Adicionar campos de Vale Alimentação
ALTER TABLE colaboradores 
ADD COLUMN IF NOT EXISTS recebe_va BOOLEAN DEFAULT false;

ALTER TABLE colaboradores 
ADD COLUMN IF NOT EXISTS valor_va DECIMAL(10,2) DEFAULT 0;

-- Adicionar campos de VA/VR Combinado
ALTER TABLE colaboradores 
ADD COLUMN IF NOT EXISTS recebe_va_vr BOOLEAN DEFAULT false;

ALTER TABLE colaboradores 
ADD COLUMN IF NOT EXISTS valor_va_vr DECIMAL(10,2) DEFAULT 0;

-- Adicionar campos de Planos
ALTER TABLE colaboradores 
ADD COLUMN IF NOT EXISTS plano_saude BOOLEAN DEFAULT false;

ALTER TABLE colaboradores 
ADD COLUMN IF NOT EXISTS plano_odonto BOOLEAN DEFAULT false;

-- Adicionar campo de desconto INSS padrão
ALTER TABLE colaboradores 
ADD COLUMN IF NOT EXISTS desconto_inss_padrao BOOLEAN DEFAULT true;

-- Verificar se foi criado
SELECT 
  column_name, 
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name = 'colaboradores' 
  AND column_name IN (
    'recebe_vt', 'valor_vt', 
    'recebe_vr', 'valor_vr', 
    'recebe_va', 'valor_va',
    'recebe_va_vr', 'valor_va_vr',
    'plano_saude', 'plano_odonto',
    'desconto_inss_padrao'
  )
ORDER BY column_name;

-- Atualizar valores NULL para 0
UPDATE colaboradores 
SET 
  valor_vt = COALESCE(valor_vt, 0),
  valor_vr = COALESCE(valor_vr, 0),
  valor_va = COALESCE(valor_va, 0),
  valor_va_vr = COALESCE(valor_va_vr, 0),
  recebe_vt = COALESCE(recebe_vt, false),
  recebe_vr = COALESCE(recebe_vr, false),
  recebe_va = COALESCE(recebe_va, false),
  recebe_va_vr = COALESCE(recebe_va_vr, false),
  plano_saude = COALESCE(plano_saude, false),
  plano_odonto = COALESCE(plano_odonto, false),
  desconto_inss_padrao = COALESCE(desconto_inss_padrao, true);

-- Mensagem de sucesso
SELECT 'Campos de benefícios adicionados com sucesso!' as resultado;
