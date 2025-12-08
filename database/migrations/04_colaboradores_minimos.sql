-- ============================================================================
-- TORNAR CAMPOS OPCIONAIS NA TABELA COLABORADORES
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================
-- Apenas NOME e CPF serão obrigatórios
-- Todos os outros campos se tornam opcionais
-- ============================================================================

-- Remover NOT NULL de data_nascimento
ALTER TABLE colaboradores ALTER COLUMN data_nascimento DROP NOT NULL;

-- Remover NOT NULL de data_admissao
ALTER TABLE colaboradores ALTER COLUMN data_admissao DROP NOT NULL;

-- Remover NOT NULL de salario
ALTER TABLE colaboradores ALTER COLUMN salario DROP NOT NULL;

-- Remover constraint CHECK de salario e recriar sem NOT NULL
ALTER TABLE colaboradores DROP CONSTRAINT IF EXISTS colaboradores_salario_check;
ALTER TABLE colaboradores ADD CONSTRAINT colaboradores_salario_check CHECK (salario IS NULL OR salario >= 0);

-- Tornar tipo_contrato opcional (remover NOT NULL e default)
ALTER TABLE colaboradores ALTER COLUMN tipo_contrato DROP NOT NULL;
ALTER TABLE colaboradores ALTER COLUMN tipo_contrato DROP DEFAULT;

-- Remover constraints UNIQUE de matricula e email_corporativo
-- (permitir NULL, mas se preenchido deve ser único)
ALTER TABLE colaboradores DROP CONSTRAINT IF EXISTS colaboradores_empresa_id_matricula_key;
ALTER TABLE colaboradores DROP CONSTRAINT IF EXISTS colaboradores_empresa_id_email_corporativo_key;

-- Recriar constraints UNIQUE permitindo NULL
-- No PostgreSQL, NULL não é considerado igual a NULL em UNIQUE constraints
-- Então múltiplos NULLs são permitidos automaticamente
CREATE UNIQUE INDEX IF NOT EXISTS idx_colaboradores_empresa_matricula 
  ON colaboradores(empresa_id, matricula) 
  WHERE matricula IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_colaboradores_empresa_email 
  ON colaboradores(empresa_id, email_corporativo) 
  WHERE email_corporativo IS NOT NULL;

-- ============================================================================
-- RESUMO DOS CAMPOS OBRIGATÓRIOS APÓS ESTE SCRIPT:
-- ============================================================================
-- ✅ OBRIGATÓRIOS (NOT NULL):
--    - empresa_id (FK)
--    - nome
--    - cpf
--
-- ✅ OPCIONAIS (podem ser NULL):
--    - matricula (se preenchida, deve ser única por empresa)
--    - email_corporativo (se preenchido, deve ser único por empresa)
--    - data_nascimento
--    - data_admissao
--    - salario
--    - tipo_contrato
--    - status (tem default 'Ativo')
--    - todos os outros campos
-- ============================================================================

-- Comentários
COMMENT ON COLUMN colaboradores.nome IS 'Nome completo - OBRIGATÓRIO';
COMMENT ON COLUMN colaboradores.cpf IS 'CPF - OBRIGATÓRIO e único por empresa';
COMMENT ON COLUMN colaboradores.matricula IS 'Matrícula - OPCIONAL, mas se preenchida deve ser única por empresa';
COMMENT ON COLUMN colaboradores.email_corporativo IS 'Email corporativo - OPCIONAL, mas se preenchido deve ser único por empresa';
COMMENT ON COLUMN colaboradores.data_nascimento IS 'Data de nascimento - OPCIONAL';
COMMENT ON COLUMN colaboradores.data_admissao IS 'Data de admissão - OPCIONAL';
COMMENT ON COLUMN colaboradores.salario IS 'Salário - OPCIONAL';
COMMENT ON COLUMN colaboradores.tipo_contrato IS 'Tipo de contrato - OPCIONAL';
