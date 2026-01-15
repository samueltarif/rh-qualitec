-- ========================================
-- ⚠️ EXECUTE ESTE SQL NO SUPABASE SQL EDITOR
-- ========================================
-- Acesse: https://supabase.com/dashboard/project/[seu-projeto]/sql/new
-- Cole este código e clique em "Run"

-- Adicionar coluna faixa_irrf na tabela holerites
ALTER TABLE holerites 
ADD COLUMN IF NOT EXISTS faixa_irrf TEXT;

-- Verificar se foi adicionada
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'holerites'
AND column_name = 'faixa_irrf';

-- ✅ Você deve ver: faixa_irrf | text | YES
