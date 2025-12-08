-- ============================================================================
-- FIX: Corrigir vínculos para holerites aparecerem no perfil do usuário
-- ============================================================================
-- EXECUTE ESTE SCRIPT APÓS RODAR O DIAGNÓSTICO
-- ============================================================================

-- PASSO 1: Garantir que app_users tem a coluna colaborador_id
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS colaborador_id UUID REFERENCES colaboradores(id);

-- PASSO 2: Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_app_users_colaborador_id ON app_users(colaborador_id);

-- PASSO 3: Sincronizar colaborador_id em app_users
-- Opção A: Por email (mais confiável)
UPDATE app_users u
SET colaborador_id = c.id,
    updated_at = NOW()
FROM colaboradores c
WHERE u.colaborador_id IS NULL
  AND LOWER(u.email) = LOWER(c.email_corporativo)
  AND c.email_corporativo IS NOT NULL
  AND c.status = 'Ativo';

-- Opção B: Por user_id (relacionamento antigo)
UPDATE app_users u
SET colaborador_id = c.id,
    updated_at = NOW()
FROM colaboradores c
WHERE u.colaborador_id IS NULL
  AND c.user_id = u.id
  AND c.status = 'Ativo';

-- PASSO 4: Verificar sincronização
SELECT 
  '✅ Sincronização concluída' as status,
  u.nome as usuario,
  u.email,
  u.role,
  u.colaborador_id,
  c.nome as colaborador_nome,
  c.email_corporativo,
  (SELECT COUNT(*) FROM holerites h WHERE h.colaborador_id = u.colaborador_id) as total_holerites
FROM app_users u
LEFT JOIN colaboradores c ON c.id = u.colaborador_id
WHERE u.role = 'funcionario'
ORDER BY u.nome;

-- PASSO 5: Verificar políticas RLS (devem estar corretas)
-- As políticas já devem estar usando colaborador_id
-- Se não estiverem, execute o script abaixo:

-- Remover políticas antigas
DROP POLICY IF EXISTS "Funcionário pode ver seus próprios holerites" ON holerites;
DROP POLICY IF EXISTS "Funcionário pode marcar holerite como visualizado" ON holerites;

-- Criar políticas corretas usando colaborador_id
CREATE POLICY "Funcionário pode ver seus próprios holerites"
  ON holerites FOR SELECT
  TO authenticated
  USING (
    colaborador_id IN (
      SELECT colaborador_id 
      FROM app_users 
      WHERE auth_uid = auth.uid()
      AND role = 'funcionario'
      AND colaborador_id IS NOT NULL
    )
  );

CREATE POLICY "Funcionário pode marcar holerite como visualizado"
  ON holerites FOR UPDATE
  TO authenticated
  USING (
    colaborador_id IN (
      SELECT colaborador_id 
      FROM app_users 
      WHERE auth_uid = auth.uid()
      AND role = 'funcionario'
      AND colaborador_id IS NOT NULL
    )
  )
  WITH CHECK (
    colaborador_id IN (
      SELECT colaborador_id 
      FROM app_users 
      WHERE auth_uid = auth.uid()
      AND role = 'funcionario'
      AND colaborador_id IS NOT NULL
    )
  );

-- PASSO 6: Teste final
SELECT 
  '🎯 TESTE FINAL' as titulo,
  u.nome as usuario,
  u.email,
  u.colaborador_id,
  c.nome as colaborador,
  COUNT(h.id) as holerites_visiveis
FROM app_users u
LEFT JOIN colaboradores c ON c.id = u.colaborador_id
LEFT JOIN holerites h ON h.colaborador_id = u.colaborador_id
WHERE u.role = 'funcionario'
GROUP BY u.id, u.nome, u.email, u.colaborador_id, c.nome
ORDER BY u.nome;

-- ============================================================================
-- RESULTADO ESPERADO:
-- ✅ Todos os funcionários devem ter colaborador_id preenchido
-- ✅ Holerites devem aparecer na contagem
-- ✅ Políticas RLS devem permitir acesso
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Script de correção executado!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Próximos passos:';
  RAISE NOTICE '1. Verifique a tabela acima';
  RAISE NOTICE '2. Faça login como funcionário';
  RAISE NOTICE '3. Acesse /employee e vá na aba Holerites';
  RAISE NOTICE '4. Os holerites devem aparecer agora!';
END $$;
