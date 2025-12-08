-- ============================================
-- ATENÇÃO: ISSO NÃO É A SOLUÇÃO IDEAL!
-- ============================================
-- Estes campos são temporários do formulário e não deveriam
-- estar na tabela colaboradores. A solução correta seria
-- filtrar esses campos antes de salvar.
--
-- Mas se você quer parar o erro rapidamente, execute isso:

ALTER TABLE colaboradores
ADD COLUMN IF NOT EXISTS criar_usuario BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS usuario_email TEXT,
ADD COLUMN IF NOT EXISTS usuario_senha TEXT,
ADD COLUMN IF NOT EXISTS usuario_role TEXT DEFAULT 'funcionario',
ADD COLUMN IF NOT EXISTS usuario_ativo BOOLEAN DEFAULT TRUE;

-- Verificar colunas adicionadas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'colaboradores'
AND column_name LIKE 'usuario_%' OR column_name = 'criar_usuario'
ORDER BY column_name;

-- ============================================
-- NOTA IMPORTANTE:
-- ============================================
-- Esses campos NÃO serão usados pelo sistema.
-- Eles só existem para evitar o erro 400.
-- O vínculo real entre colaborador e usuário
-- é feito pela coluna user_id que já existe.
