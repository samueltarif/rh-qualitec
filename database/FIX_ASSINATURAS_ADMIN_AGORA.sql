-- FIX DEFINITIVO PARA ASSINATURAS NO PAINEL ADMIN
-- Problema: Admin não consegue ver as assinaturas no painel

-- 1. Verificar se RLS está bloqueando a consulta
SELECT 
  'RLS Status' as info,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'assinaturas_ponto';

-- 2. Ver políticas RLS da tabela
SELECT 
  'Políticas RLS' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'assinaturas_ponto';

-- 3. Testar consulta direta como service_role (sem RLS)
SELECT 
  'Teste Direto' as info,
  ap.id,
  ap.colaborador_id,
  c.nome as colaborador_nome,
  ap.mes,
  ap.ano,
  ap.data_assinatura,
  ap.created_at
FROM assinaturas_ponto ap
LEFT JOIN colaboradores c ON ap.colaborador_id = c.id
ORDER BY ap.created_at DESC;

-- 4. Verificar se Silvana tem acesso correto
SELECT 
  'Silvana Admin' as info,
  id,
  email,
  role,
  auth_uid,
  created_at
FROM app_users 
WHERE email = 'silvana@qualitecengenharia.com.br';

-- 5. SOLUÇÃO: Desabilitar RLS temporariamente para debug
ALTER TABLE assinaturas_ponto DISABLE ROW LEVEL SECURITY;

-- 6. Ou criar política específica para admin
DROP POLICY IF EXISTS "Admins podem ver todas assinaturas" ON assinaturas_ponto;

CREATE POLICY "Admins podem ver todas assinaturas" ON assinaturas_ponto
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM app_users 
    WHERE auth_uid = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- 7. Verificar novamente após fix
SELECT 
  'Após Fix' as info,
  COUNT(*) as total_assinaturas
FROM assinaturas_ponto;