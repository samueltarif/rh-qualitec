-- ============================================================================
-- FIX RÁPIDO: Permitir Samuel ver seus holerites
-- ============================================================================

-- Passo 1: Verificar o colaborador_id correto do Samuel
DO $$
DECLARE
  v_colaborador_id UUID;
  v_user_id UUID;
  v_holerite_count INTEGER;
BEGIN
  -- Buscar colaborador_id do Samuel
  SELECT id INTO v_colaborador_id
  FROM colaboradores
  WHERE nome ILIKE '%SAMUEL%'
  LIMIT 1;
  
  RAISE NOTICE 'Colaborador ID do Samuel: %', v_colaborador_id;
  
  -- Buscar user_id do Samuel
  SELECT id INTO v_user_id
  FROM app_users
  WHERE email = 'samuel.tarif@gmail.com';
  
  RAISE NOTICE 'User ID do Samuel: %', v_user_id;
  
  -- Atualizar colaborador_id no app_users se necessário
  UPDATE app_users
  SET colaborador_id = v_colaborador_id
  WHERE email = 'samuel.tarif@gmail.com'
  AND (colaborador_id IS NULL OR colaborador_id != v_colaborador_id);
  
  RAISE NOTICE 'App_users atualizado!';
  
  -- Verificar quantos holerites existem para o Samuel
  SELECT COUNT(*) INTO v_holerite_count
  FROM holerites
  WHERE colaborador_id = v_colaborador_id;
  
  RAISE NOTICE 'Holerites encontrados: %', v_holerite_count;
  
  IF v_holerite_count = 0 THEN
    RAISE NOTICE '⚠️ NENHUM HOLERITE ENCONTRADO! Gere um holerite primeiro.';
  ELSE
    RAISE NOTICE '✅ Holerites existem! Problema pode ser RLS.';
  END IF;
END $$;

-- Passo 2: Recriar política RLS para funcionários (mais permissiva)
DROP POLICY IF EXISTS "funcionario_own_holerites" ON holerites;

CREATE POLICY "funcionario_own_holerites"
  ON holerites
  FOR SELECT
  TO authenticated
  USING (
    -- Permitir se o colaborador_id corresponde ao do usuário
    colaborador_id IN (
      SELECT u.colaborador_id
      FROM app_users u
      WHERE u.auth_uid = auth.uid()
      AND u.role = 'funcionario'
      AND u.colaborador_id IS NOT NULL
    )
  );

-- Passo 3: Verificar se funcionou
SELECT 
  'Teste de acesso' as teste,
  h.id,
  h.nome_colaborador,
  h.mes,
  h.ano,
  h.salario_liquido,
  u.email,
  u.colaborador_id as user_colaborador_id,
  h.colaborador_id as holerite_colaborador_id,
  CASE 
    WHEN h.colaborador_id = u.colaborador_id THEN '✅ IDs CORRESPONDEM'
    ELSE '❌ IDs NÃO CORRESPONDEM'
  END as status_vinculo
FROM holerites h
CROSS JOIN app_users u
WHERE u.email = 'samuel.tarif@gmail.com'
AND h.nome_colaborador ILIKE '%SAMUEL%';

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Fix aplicado!';
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Verifique o resultado acima:';
  RAISE NOTICE '   - Se IDs CORRESPONDEM: Samuel deve ver o holerite';
  RAISE NOTICE '   - Se IDs NÃO CORRESPONDEM: há problema no vínculo';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Próximos passos:';
  RAISE NOTICE '   1. Faça logout e login novamente como Samuel';
  RAISE NOTICE '   2. Acesse a aba Holerites';
  RAISE NOTICE '   3. O holerite deve aparecer';
END $$;
