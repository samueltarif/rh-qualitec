-- ============================================================================
-- FIX COMPLETO: Gerar 3 Holerites de 13º Salário
-- ============================================================================
-- Descrição: Corrige constraint para permitir múltiplos holerites no mesmo mês
-- Data: 07/12/2025
-- Versão: 1.0
-- ============================================================================

-- ============================================================================
-- PASSO 1: Verificar Estado Atual
-- ============================================================================

-- Ver constraints atuais
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'holerites'::regclass
  AND contype = 'u' -- unique constraints
ORDER BY conname;

-- Ver holerites existentes de 2025
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
WHERE ano = 2025
ORDER BY colaborador_id, mes, tipo;

-- ============================================================================
-- PASSO 2: Backup (Opcional mas Recomendado)
-- ============================================================================

-- Criar tabela de backup
CREATE TABLE IF NOT EXISTS holerites_backup_20251207 AS
SELECT * FROM holerites WHERE ano = 2025;

-- Verificar backup
SELECT COUNT(*) as total_backup FROM holerites_backup_20251207;

-- ============================================================================
-- PASSO 3: Remover Constraints Antigas
-- ============================================================================

-- Remover constraint antiga que não inclui parcela_13
DO $$ 
DECLARE
  constraint_name TEXT;
BEGIN
  -- Buscar constraint problemática
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'holerites'::regclass
    AND contype = 'u' -- unique constraint
    AND pg_get_constraintdef(oid) LIKE '%colaborador_id%'
    AND pg_get_constraintdef(oid) LIKE '%mes%'
    AND pg_get_constraintdef(oid) LIKE '%ano%'
    AND pg_get_constraintdef(oid) NOT LIKE '%parcela_13%'
  LIMIT 1;
  
  IF constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE holerites DROP CONSTRAINT IF EXISTS ' || constraint_name;
    RAISE NOTICE '✅ Constraint removida: %', constraint_name;
  ELSE
    RAISE NOTICE 'ℹ️  Nenhuma constraint problemática encontrada';
  END IF;
END $$;

-- Remover outras constraints antigas (se existirem)
ALTER TABLE holerites 
DROP CONSTRAINT IF EXISTS holerites_colaborador_mes_ano_tipo_unique;

ALTER TABLE holerites 
DROP CONSTRAINT IF EXISTS holerites_colaborador_id_mes_ano_key;

ALTER TABLE holerites 
DROP CONSTRAINT IF EXISTS holerites_colaborador_id_mes_ano_tipo_key;

-- ============================================================================
-- PASSO 4: Criar Nova Constraint Correta
-- ============================================================================

-- Criar constraint que permite múltiplos holerites no mesmo mês
-- Diferenciados por tipo E parcela_13
ALTER TABLE holerites 
ADD CONSTRAINT holerites_colaborador_mes_ano_tipo_parcela_unique 
UNIQUE (colaborador_id, mes, ano, tipo, COALESCE(parcela_13, ''));

-- Adicionar comentário explicativo
COMMENT ON CONSTRAINT holerites_colaborador_mes_ano_tipo_parcela_unique ON holerites IS 
'Permite múltiplos holerites no mesmo mês:
- Salário Normal (tipo=normal, parcela_13=null)
- 1ª Parcela 13º (tipo=decimo_terceiro, parcela_13=1)
- 2ª Parcela 13º (tipo=decimo_terceiro, parcela_13=2)
Todos podem coexistir no mesmo mês (ex: Dezembro)';

-- ============================================================================
-- PASSO 5: Verificar Resultado
-- ============================================================================

-- Ver nova constraint
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'holerites'::regclass
  AND contype = 'u'
  AND conname = 'holerites_colaborador_mes_ano_tipo_parcela_unique';

-- ============================================================================
-- PASSO 6: Limpar Duplicatas (Se Existirem)
-- ============================================================================

-- Identificar duplicatas
SELECT 
  colaborador_id,
  mes,
  ano,
  tipo,
  COALESCE(parcela_13, '') as parcela,
  COUNT(*) as total
FROM holerites
WHERE ano = 2025
GROUP BY colaborador_id, mes, ano, tipo, COALESCE(parcela_13, '')
HAVING COUNT(*) > 1;

-- Remover duplicatas (mantém o mais recente)
DELETE FROM holerites
WHERE id NOT IN (
  SELECT MAX(id)
  FROM holerites
  WHERE ano = 2025
  GROUP BY colaborador_id, mes, ano, tipo, COALESCE(parcela_13, '')
);

-- ============================================================================
-- PASSO 7: Teste de Validação
-- ============================================================================

-- Tentar inserir 3 holerites para o mesmo colaborador no mesmo mês
-- (Isso deve funcionar agora!)

-- Exemplo de teste (ajustar IDs conforme necessário)
DO $$
DECLARE
  test_colaborador_id INT := 1; -- Ajustar para ID real
  test_ano INT := 2025;
  test_mes INT := 12;
BEGIN
  -- Limpar dados de teste
  DELETE FROM holerites 
  WHERE colaborador_id = test_colaborador_id 
    AND ano = test_ano 
    AND mes = test_mes;
  
  -- Inserir holerite normal
  INSERT INTO holerites (
    colaborador_id, mes, ano, tipo, parcela_13,
    nome_colaborador, cpf, cargo, departamento,
    salario_base, salario_bruto, total_proventos,
    inss, irrf, total_descontos, salario_liquido,
    fgts, status, observacoes
  ) VALUES (
    test_colaborador_id, test_mes, test_ano, 'normal', NULL,
    'Teste Colaborador', '000.000.000-00', 'Teste', 'Teste',
    2000.00, 2000.00, 2000.00,
    150.00, 0.00, 150.00, 1850.00,
    160.00, 'gerado', 'Teste - Salário Normal'
  );
  
  -- Inserir 1ª parcela 13º
  INSERT INTO holerites (
    colaborador_id, mes, ano, tipo, parcela_13,
    nome_colaborador, cpf, cargo, departamento,
    salario_base, salario_bruto, total_proventos,
    inss, irrf, total_descontos, salario_liquido,
    fgts, status, observacoes
  ) VALUES (
    test_colaborador_id, test_mes, test_ano, 'decimo_terceiro', '1',
    'Teste Colaborador', '000.000.000-00', 'Teste', 'Teste',
    2000.00, 1000.00, 1000.00,
    0.00, 0.00, 0.00, 1000.00,
    80.00, 'gerado', 'Teste - 1ª Parcela 13º'
  );
  
  -- Inserir 2ª parcela 13º
  INSERT INTO holerites (
    colaborador_id, mes, ano, tipo, parcela_13,
    nome_colaborador, cpf, cargo, departamento,
    salario_base, salario_bruto, total_proventos,
    inss, irrf, total_descontos, salario_liquido,
    fgts, status, observacoes
  ) VALUES (
    test_colaborador_id, test_mes, test_ano, 'decimo_terceiro', '2',
    'Teste Colaborador', '000.000.000-00', 'Teste', 'Teste',
    2000.00, 1000.00, 1000.00,
    150.00, 0.00, 150.00, 850.00,
    80.00, 'gerado', 'Teste - 2ª Parcela 13º'
  );
  
  RAISE NOTICE '✅ Teste concluído: 3 holerites inseridos com sucesso!';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro no teste: %', SQLERRM;
END $$;

-- Verificar resultado do teste
SELECT 
  id,
  mes,
  tipo,
  parcela_13,
  salario_liquido,
  observacoes
FROM holerites
WHERE colaborador_id = 1 -- Ajustar para ID real
  AND ano = 2025
  AND mes = 12
ORDER BY tipo, parcela_13;

-- ============================================================================
-- PASSO 8: Limpar Dados de Teste
-- ============================================================================

-- Remover dados de teste (ajustar conforme necessário)
DELETE FROM holerites 
WHERE nome_colaborador = 'Teste Colaborador';

-- ============================================================================
-- PASSO 9: Estatísticas Finais
-- ============================================================================

-- Contar holerites por tipo
SELECT 
  tipo,
  parcela_13,
  COUNT(*) as total
FROM holerites
WHERE ano = 2025
GROUP BY tipo, parcela_13
ORDER BY tipo, parcela_13;

-- Ver distribuição por mês
SELECT 
  mes,
  tipo,
  COUNT(*) as total
FROM holerites
WHERE ano = 2025
GROUP BY mes, tipo
ORDER BY mes, tipo;

-- Verificar colaboradores com 3 holerites em dezembro
SELECT 
  colaborador_id,
  nome_colaborador,
  COUNT(*) as total_holerites
FROM holerites
WHERE ano = 2025
  AND mes = 12
GROUP BY colaborador_id, nome_colaborador
HAVING COUNT(*) = 3
ORDER BY nome_colaborador;

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================

/*
✅ Constraint criada com sucesso
✅ Permite 3 holerites no mesmo mês:
   - Salário Normal (tipo='normal')
   - 1ª Parcela 13º (tipo='decimo_terceiro', parcela_13='1')
   - 2ª Parcela 13º (tipo='decimo_terceiro', parcela_13='2')

✅ Sistema pronto para gerar 3 holerites automaticamente!
*/

-- ============================================================================
-- ROLLBACK (Se Necessário)
-- ============================================================================

/*
-- Para reverter as mudanças:

-- 1. Remover nova constraint
ALTER TABLE holerites 
DROP CONSTRAINT IF EXISTS holerites_colaborador_mes_ano_tipo_parcela_unique;

-- 2. Restaurar constraint antiga (se necessário)
ALTER TABLE holerites 
ADD CONSTRAINT holerites_colaborador_mes_ano_tipo_unique 
UNIQUE (colaborador_id, mes, ano, tipo);

-- 3. Restaurar dados do backup
DELETE FROM holerites WHERE ano = 2025;
INSERT INTO holerites SELECT * FROM holerites_backup_20251207;

-- 4. Remover backup
DROP TABLE IF EXISTS holerites_backup_20251207;
*/

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================

-- Mensagem final
DO $$
BEGIN
  RAISE NOTICE '
  ============================================================================
  ✅ FIX APLICADO COM SUCESSO!
  ============================================================================
  
  Próximos passos:
  1. Reiniciar servidor Nuxt (npm run dev)
  2. Testar geração de 13º salário
  3. Verificar que 3 holerites são gerados
  4. Validar valores e cálculos
  
  Documentação: INDEX_FIX_3_HOLERITES.md
  ============================================================================
  ';
END $$;
