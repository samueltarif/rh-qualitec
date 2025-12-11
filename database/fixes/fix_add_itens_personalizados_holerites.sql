-- ============================================================================
-- FIX: Adicionar campo para itens personalizados nos holerites
-- ============================================================================
-- Adiciona campo JSONB para armazenar itens personalizados (proventos e descontos customizados)
-- ============================================================================

-- Adicionar coluna itens_personalizados
ALTER TABLE holerites 
ADD COLUMN IF NOT EXISTS itens_personalizados JSONB DEFAULT '[]'::jsonb;

-- Comentário explicativo
COMMENT ON COLUMN holerites.itens_personalizados IS 'Array JSON com itens personalizados (proventos e descontos customizados com código, descrição, referência e valor)';

-- Exemplo de estrutura esperada:
-- [
--   {
--     "tipo": "provento",
--     "codigo": "105",
--     "descricao": "BONIFICAÇÃO ESPECIAL",
--     "referencia": "1,00",
--     "valor": 500.00
--   },
--   {
--     "tipo": "desconto",
--     "codigo": "901",
--     "descricao": "DESCONTO UNIFORME",
--     "referencia": "2 unidades",
--     "valor": 150.00
--   }
-- ]

SELECT 'Campo itens_personalizados adicionado com sucesso!' as status;
