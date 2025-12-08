-- ============================================
-- FIX: VINCULAR USUÁRIOS EXISTENTES A COLABORADORES
-- ============================================
-- Este script vincula usuários que já existem mas não estão
-- conectados aos seus respectivos colaboradores

-- IMPORTANTE: Execute este script APENAS UMA VEZ após a implementação
-- da nova funcionalidade de unificação

-- ============================================
-- PASSO 1: VERIFICAR SITUAÇÃO ATUAL
-- ============================================

-- Ver usuários sem vínculo
SELECT 
  u.id,
  u.nome AS usuario_nome,
  u.email,
  u.role,
  u.colaborador_id
FROM app_users u
WHERE u.colaborador_id IS NULL;

-- Ver colaboradores sem usuário
SELECT 
  c.id,
  c.nome AS colaborador_nome,
  c.cpf,
  c.email_corporativo
FROM colaboradores c
LEFT JOIN app_users u ON c.id = u.colaborador_id
WHERE c.status = 'Ativo' 
  AND u.id IS NULL;

-- ============================================
-- PASSO 2: VINCULAR POR EMAIL CORPORATIVO
-- ============================================
-- Vincula usuários aos colaboradores quando o email bate

-- PREVIEW (não executa, apenas mostra o que seria feito)
SELECT 
  u.id AS usuario_id,
  u.nome AS usuario_nome,
  u.email AS usuario_email,
  c.id AS colaborador_id,
  c.nome AS colaborador_nome,
  c.email_corporativo,
  'SERIA VINCULADO' AS acao
FROM app_users u
INNER JOIN colaboradores c ON LOWER(u.email) = LOWER(c.email_corporativo)
WHERE u.colaborador_id IS NULL
  AND c.status = 'Ativo';

-- EXECUTAR VÍNCULO (descomente para executar)
/*
UPDATE app_users u
SET colaborador_id = c.id,
    updated_at = NOW()
FROM colaboradores c
WHERE LOWER(u.email) = LOWER(c.email_corporativo)
  AND u.colaborador_id IS NULL
  AND c.status = 'Ativo';
*/

-- ============================================
-- PASSO 3: VINCULAR POR CPF (se email não bater)
-- ============================================
-- Vincula usuários aos colaboradores quando o CPF bate

-- PREVIEW
SELECT 
  u.id AS usuario_id,
  u.nome AS usuario_nome,
  u.cpf AS usuario_cpf,
  c.id AS colaborador_id,
  c.nome AS colaborador_nome,
  c.cpf AS colaborador_cpf,
  'SERIA VINCULADO POR CPF' AS acao
FROM app_users u
INNER JOIN colaboradores c ON u.cpf = c.cpf
WHERE u.colaborador_id IS NULL
  AND c.status = 'Ativo'
  AND u.cpf IS NOT NULL
  AND c.cpf IS NOT NULL;

-- EXECUTAR VÍNCULO POR CPF (descomente para executar)
/*
UPDATE app_users u
SET colaborador_id = c.id,
    updated_at = NOW()
FROM colaboradores c
WHERE u.cpf = c.cpf
  AND u.colaborador_id IS NULL
  AND c.status = 'Ativo'
  AND u.cpf IS NOT NULL
  AND c.cpf IS NOT NULL;
*/

-- ============================================
-- PASSO 4: VINCULAR MANUALMENTE (CASOS ESPECÍFICOS)
-- ============================================
-- Use este template para vincular casos específicos

-- Exemplo: Vincular Samuel
/*
UPDATE app_users
SET colaborador_id = (
  SELECT id FROM colaboradores WHERE nome = 'SAMUEL BARRETOS' LIMIT 1
)
WHERE email = 'samuel.tazi@gmail.com';
*/

-- Exemplo: Vincular Silvana
/*
UPDATE app_users
SET colaborador_id = (
  SELECT id FROM colaboradores WHERE nome = 'Silvana Bevilacqua' LIMIT 1
)
WHERE email = 'silvana@qualitec.ind.br';
*/

-- ============================================
-- PASSO 5: VERIFICAR RESULTADO
-- ============================================

-- Ver usuários que foram vinculados
SELECT 
  u.nome AS usuario,
  u.email,
  c.nome AS colaborador,
  c.cpf,
  '✅ Vinculado' AS status
FROM app_users u
INNER JOIN colaboradores c ON u.colaborador_id = c.id
ORDER BY u.nome;

-- Ver usuários que ainda não foram vinculados
SELECT 
  u.nome AS usuario,
  u.email,
  u.role,
  '⚠️ Sem vínculo' AS status,
  CASE 
    WHEN u.role = 'admin' THEN 'OK - Admin pode não ter colaborador'
    ELSE 'ATENÇÃO - Funcionário deveria ter colaborador'
  END AS observacao
FROM app_users u
WHERE u.colaborador_id IS NULL
ORDER BY u.nome;

-- ============================================
-- PASSO 6: ESTATÍSTICAS FINAIS
-- ============================================

SELECT 
  'Total Usuários' AS metrica,
  COUNT(*) AS quantidade
FROM app_users

UNION ALL

SELECT 
  'Usuários Vinculados' AS metrica,
  COUNT(*) AS quantidade
FROM app_users
WHERE colaborador_id IS NOT NULL

UNION ALL

SELECT 
  'Usuários Sem Vínculo' AS metrica,
  COUNT(*) AS quantidade
FROM app_users
WHERE colaborador_id IS NULL

UNION ALL

SELECT 
  'Taxa de Vinculação' AS metrica,
  ROUND(
    (COUNT(*) FILTER (WHERE colaborador_id IS NOT NULL)::NUMERIC / 
     NULLIF(COUNT(*), 0) * 100), 
    2
  ) AS quantidade
FROM app_users;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

/*
1. ANTES DE EXECUTAR:
   - Faça backup do banco de dados
   - Execute os SELECTs de PREVIEW primeiro
   - Verifique se os vínculos estão corretos

2. ORDEM DE EXECUÇÃO:
   - Primeiro: vincular por email (mais confiável)
   - Segundo: vincular por CPF (se email não bater)
   - Terceiro: vincular manualmente casos específicos

3. CASOS ESPECIAIS:
   - Admins podem não ter colaborador (ex: TI, suporte)
   - Funcionários DEVEM ter colaborador
   - Se email corporativo mudou, vincular manualmente

4. APÓS EXECUÇÃO:
   - Verificar resultado com queries do PASSO 5
   - Testar login dos usuários
   - Verificar se dados aparecem corretamente no sistema

5. ROLLBACK (se necessário):
   -- Desvincular todos
   UPDATE app_users SET colaborador_id = NULL WHERE colaborador_id IS NOT NULL;
*/
