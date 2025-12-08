-- ============================================
-- HABILITAR ADIANTAMENTO SALARIAL
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- para habilitar a funcionalidade de adiantamento

-- Atualizar parâmetros da folha para habilitar adiantamento
UPDATE parametros_folha
SET 
  adiantamento_habilitado = true,
  adiantamento_percentual = 40,
  adiantamento_dia_pagamento = 20
WHERE id = (SELECT id FROM parametros_folha LIMIT 1);

-- Verificar se foi atualizado
SELECT 
  adiantamento_habilitado,
  adiantamento_percentual,
  adiantamento_dia_pagamento
FROM parametros_folha;

-- Se não existir registro, criar um
INSERT INTO parametros_folha (
  adiantamento_habilitado,
  adiantamento_percentual,
  adiantamento_dia_pagamento,
  created_at,
  updated_at
)
SELECT 
  true,
  40,
  20,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM parametros_folha);

-- Verificar resultado final
SELECT 
  id,
  adiantamento_habilitado,
  adiantamento_percentual,
  adiantamento_dia_pagamento,
  created_at
FROM parametros_folha;
