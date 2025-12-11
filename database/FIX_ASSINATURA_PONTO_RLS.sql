-- Fix para RLS da tabela assinaturas_ponto
-- Corrige a política de admins para usar auth_uid corretamente

-- Remover política antiga
DROP POLICY IF EXISTS "Admins podem ver todas assinaturas" ON assinaturas_ponto;

-- Recriar política correta
CREATE POLICY "Admins podem ver todas assinaturas"
  ON assinaturas_ponto FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE auth_uid = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );
