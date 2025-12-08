-- ============================================================================
-- FIX: 2ª PARCELA DO 13º SALÁRIO - CORRIGIR ERRO nome_colaborador NULL
-- ============================================================================
-- Problema: Colaborador não encontrado ao gerar 2ª parcela
-- Solução: Verificar e corrigir dados + RLS

-- PASSO 1: Verificar se o colaborador existe
SELECT 
  id,
  nome,
  cpf,
  salario,
  cargo_id,
  departamento_id,
  data_admissao,
  status
FROM colaboradores
WHERE id = '3e37b565-9ce3-4917-851f-7d50e2669e6c';

-- PASSO 2: Se não aparecer nada, desabilitar RLS temporariamente
-- (Execute no Supabase SQL Editor como admin)
ALTER TABLE colaboradores DISABLE ROW LEVEL SECURITY;

-- PASSO 3: Verificar novamente
SELECT 
  c.id,
  c.nome,
  c.cpf,
  c.salario,
  car.nome as cargo_nome,
  dep.nome as departamento_nome,
  c.data_admissao,
  c.status
FROM colaboradores c
LEFT JOIN cargos car ON c.cargo_id = car.id
LEFT JOIN departamentos dep ON c.departamento_id = dep.id
WHERE c.id = '3e37b565-9ce3-4917-851f-7d50e2669e6c';

-- PASSO 4: Ver TODOS os colaboradores ativos
SELECT 
  c.id,
  c.nome,
  c.cpf,
  c.salario,
  car.nome as cargo_nome,
  dep.nome as departamento_nome,
  c.status
FROM colaboradores c
LEFT JOIN cargos car ON c.cargo_id = car.id
LEFT JOIN departamentos dep ON c.departamento_id = dep.id
WHERE c.status = 'ativo'
ORDER BY c.nome;

-- PASSO 5: Reabilitar RLS
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;

-- PASSO 6: Garantir política de SELECT para service_role
DROP POLICY IF EXISTS "service_role_all_colaboradores" ON colaboradores;
CREATE POLICY "service_role_all_colaboradores"
ON colaboradores
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- PASSO 7: Garantir política de SELECT para authenticated
DROP POLICY IF EXISTS "authenticated_select_colaboradores" ON colaboradores;
CREATE POLICY "authenticated_select_colaboradores"
ON colaboradores
FOR SELECT
TO authenticated
USING (true);

-- ============================================================================
-- ALTERNATIVA: Se o ID estiver errado, use o ID correto
-- ============================================================================
-- Encontrar o colaborador pelo nome
SELECT 
  id,
  nome,
  cpf,
  salario,
  status
FROM colaboradores
WHERE nome ILIKE '%SAMUEL%'  -- Ajuste o nome conforme necessário
ORDER BY nome;

-- ============================================================================
-- TESTE RÁPIDO: Gerar 2ª parcela manualmente
-- ============================================================================
-- Substitua o ID pelo correto encontrado acima
DO $$
DECLARE
  v_colaborador_id UUID := '3e37b565-9ce3-4917-851f-7d50e2669e6c'; -- AJUSTE AQUI
  v_colaborador RECORD;
  v_salario_base NUMERIC;
  v_meses_trabalhados INTEGER;
  v_valor_13 NUMERIC;
  v_inss NUMERIC;
  v_irrf NUMERIC;
  v_liquido NUMERIC;
BEGIN
  -- Buscar colaborador
  SELECT 
    c.*,
    car.nome as cargo_nome,
    dep.nome as departamento_nome
  INTO v_colaborador
  FROM colaboradores c
  LEFT JOIN cargos car ON c.cargo_id = car.id
  LEFT JOIN departamentos dep ON c.departamento_id = dep.id
  WHERE c.id = v_colaborador_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Colaborador % não encontrado', v_colaborador_id;
  END IF;

  -- Calcular valores
  v_salario_base := COALESCE(v_colaborador.salario, 0);
  v_meses_trabalhados := 12; -- Ajuste conforme necessário
  v_valor_13 := (v_salario_base / 12) * v_meses_trabalhados;
  v_inss := LEAST(v_valor_13 * 0.14, 908.85); -- Simplificado
  v_irrf := GREATEST((v_valor_13 - v_inss) * 0.15 - 381.44, 0); -- Simplificado
  v_liquido := (v_valor_13 / 2) - v_inss - v_irrf;

  -- Inserir holerite da 2ª parcela
  INSERT INTO holerites (
    colaborador_id,
    mes,
    ano,
    tipo,
    parcela_13,
    nome_colaborador,
    cpf,
    cargo,
    departamento,
    salario_base,
    salario_bruto,
    total_proventos,
    inss,
    irrf,
    total_descontos,
    salario_liquido,
    fgts,
    meses_trabalhados,
    observacoes,
    status
  ) VALUES (
    v_colaborador_id,
    12, -- Dezembro
    2025,
    'decimo_terceiro',
    '2',
    v_colaborador.nome,
    v_colaborador.cpf,
    COALESCE(v_colaborador.cargo_nome, 'Não informado'),
    COALESCE(v_colaborador.departamento_nome, 'Não informado'),
    v_salario_base,
    v_valor_13,
    v_valor_13 / 2,
    v_inss,
    v_irrf,
    v_inss + v_irrf,
    v_liquido,
    v_valor_13 * 0.08,
    v_meses_trabalhados,
    '13º Salário - 2ª Parcela (Com Descontos) - 2025',
    'gerado'
  )
  ON CONFLICT (colaborador_id, mes, ano) 
  DO UPDATE SET
    tipo = EXCLUDED.tipo,
    parcela_13 = EXCLUDED.parcela_13,
    nome_colaborador = EXCLUDED.nome_colaborador,
    cpf = EXCLUDED.cpf,
    cargo = EXCLUDED.cargo,
    departamento = EXCLUDED.departamento,
    salario_base = EXCLUDED.salario_base,
    salario_bruto = EXCLUDED.salario_bruto,
    total_proventos = EXCLUDED.total_proventos,
    inss = EXCLUDED.inss,
    irrf = EXCLUDED.irrf,
    total_descontos = EXCLUDED.total_descontos,
    salario_liquido = EXCLUDED.salario_liquido,
    fgts = EXCLUDED.fgts,
    meses_trabalhados = EXCLUDED.meses_trabalhados,
    observacoes = EXCLUDED.observacoes,
    updated_at = NOW();

  RAISE NOTICE 'Holerite da 2ª parcela gerado com sucesso para %', v_colaborador.nome;
END $$;

-- ============================================================================
-- VERIFICAR RESULTADO
-- ============================================================================
SELECT 
  h.id,
  h.nome_colaborador,
  h.mes,
  h.ano,
  h.tipo,
  h.parcela_13,
  h.salario_base,
  h.total_proventos,
  h.total_descontos,
  h.salario_liquido,
  h.status
FROM holerites h
WHERE h.colaborador_id = '3e37b565-9ce3-4917-851f-7d50e2669e6c'
  AND h.ano = 2025
  AND h.tipo = 'decimo_terceiro'
ORDER BY h.mes;
