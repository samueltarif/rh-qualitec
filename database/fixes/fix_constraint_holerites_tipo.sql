-- Corrigir constraint da tabela holerites para permitir múltiplos holerites no mesmo mês
-- O problema é que a constraint única não inclui o campo 'tipo', causando conflitos

-- 1. Ver constraints atuais
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'holerites'::regclass
ORDER BY conname;

-- 2. Remover constraint antiga (se existir)
-- A constraint provavelmente se chama algo como: holerites_colaborador_id_mes_ano_key
DO $$ 
DECLARE
  constraint_name TEXT;
BEGIN
  -- Buscar constraint que não inclui 'tipo'
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'holerites'::regclass
    AND contype = 'u' -- unique constraint
    AND pg_get_constraintdef(oid) LIKE '%colaborador_id%'
    AND pg_get_constraintdef(oid) LIKE '%mes%'
    AND pg_get_constraintdef(oid) LIKE '%ano%'
    AND pg_get_constraintdef(oid) NOT LIKE '%tipo%'
  LIMIT 1;
  
  IF constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE holerites DROP CONSTRAINT IF EXISTS ' || constraint_name;
    RAISE NOTICE 'Constraint removida: %', constraint_name;
  ELSE
    RAISE NOTICE 'Nenhuma constraint problemática encontrada';
  END IF;
END $$;

-- 3. Criar nova constraint CORRETA incluindo o tipo E parcela_13
-- Isso permite ter:
-- - Holerite mensal (tipo='normal')
-- - 1ª Parcela 13º (tipo='decimo_terceiro', parcela_13='1')
-- - 2ª Parcela 13º (tipo='decimo_terceiro', parcela_13='2')
-- Tudo no mesmo mês!
ALTER TABLE holerites 
DROP CONSTRAINT IF EXISTS holerites_colaborador_mes_ano_tipo_unique;

ALTER TABLE holerites 
DROP CONSTRAINT IF EXISTS holerites_colaborador_mes_ano_tipo_parcela_unique;

ALTER TABLE holerites 
ADD CONSTRAINT holerites_colaborador_mes_ano_tipo_parcela_unique 
UNIQUE (colaborador_id, mes, ano, tipo, COALESCE(NULLIF(parcela_13, ''), 'null_value'));

-- 4. Verificar resultado
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'holerites'::regclass
  AND contype = 'u'
ORDER BY conname;

-- 5. Testar: Ver holerites de dezembro de 2025
SELECT 
  id,
  colaborador_id,
  nome_colaborador,
  mes,
  ano,
  tipo,
  parcela_13,
  salario_liquido,
  created_at
FROM holerites
WHERE mes = 12 AND ano = 2025
ORDER BY colaborador_id, tipo;

COMMENT ON CONSTRAINT holerites_colaborador_mes_ano_tipo_parcela_unique ON holerites IS 
'Permite múltiplos holerites no mesmo mês: salário mensal + 1ª parcela 13º + 2ª parcela 13º';
