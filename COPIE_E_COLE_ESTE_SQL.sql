
-- ============================================================================
-- 🎯 COPIE E COLE ESTE SQL NO SUPABASE
-- ============================================================================
-- Isso vai corrigir o erro de chave duplicada
-- ============================================================================

-- Remover constraint antiga
ALTER TABLE holerites 
DROP CONSTRAINT IF EXISTS holerites_colaborador_id_mes_ano_key;

-- Criar nova constraint incluindo o tipo
ALTER TABLE holerites 
ADD CONSTRAINT holerites_colaborador_mes_ano_tipo_key 
UNIQUE (colaborador_id, mes, ano, tipo);

-- Adicionar email do Samuel (opcional)
UPDATE colaboradores
SET email = 'samuel.tarif@gmail.com'
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38';

-- ============================================================================
-- ✅ PRONTO! Agora teste gerar o 13º salário
-- ============================================================================
