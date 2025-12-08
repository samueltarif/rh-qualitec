-- ============================================================================
-- 🚨 COPIE E COLE ESTE SQL NO SUPABASE AGORA
-- ============================================================================
-- Problema: Holerites não aparecem no perfil do funcionário
-- Causa: Campo colaborador_id está NULL em app_users
-- Solução: Sincronizar vínculos automaticamente
-- ============================================================================

-- PASSO 1: Garantir coluna existe
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS colaborador_id UUID REFERENCES colaboradores(id);
CREATE INDEX IF NOT EXISTS idx_app_users_colaborador_id ON app_users(colaborador_id);

-- PASSO 2: Sincronizar por email (mais confiável)
UPDATE app_users u
SET colaborador_id = c.id,
    updated_at = NOW()
FROM colaboradores c
WHERE u.colaborador_id IS NULL
  AND LOWER(u.email) = LOWER(c.email_corporativo)
  AND c.email_corporativo IS NOT NULL
  AND c.status = 'Ativo';

-- PASSO 3: Sincronizar por user_id (fallback)
UPDATE app_users u
SET colaborador_id = c.id,
    updated_at = NOW()
FROM colaboradores c
WHERE u.colaborador_id IS NULL
  AND c.user_id = u.id
  AND c.status = 'Ativo';

-- PASSO 4: Recriar políticas RLS corretas
DROP POLICY IF EXISTS "Funcionário pode ver seus próprios holerites" ON holerites;
DROP POLICY IF EXISTS "Funcionário pode marcar holerite como visualizado" ON holerites;

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

-- PASSO 5: Verificar resultado
SELECT 
  '✅ CORREÇÃO CONCLUÍDA' as status,
  u.nome as usuario,
  u.email,
  u.role,
  u.colaborador_id,
  c.nome as colaborador_nome,
  (SELECT COUNT(*) FROM holerites h WHERE h.colaborador_id = u.colaborador_id) as total_holerites
FROM app_users u
LEFT JOIN colaboradores c ON c.id = u.colaborador_id
WHERE u.role = 'funcionario'
ORDER BY u.nome;

-- ============================================================================
-- ✅ PRONTO! Agora faça:
-- 1. Faça login como funcionário
-- 2. Acesse /employee
-- 3. Clique na aba "Holerites"
-- 4. Os holerites devem aparecer! 🎉
-- ============================================================================
