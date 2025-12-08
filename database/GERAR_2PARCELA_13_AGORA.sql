-- ============================================================================
-- GERAR 2ª PARCELA DO 13º SALÁRIO - SCRIPT CORRETO
-- ============================================================================
-- Execute este SQL no Supabase SQL Editor

-- PASSO 1: Ver todos os colaboradores ativos (com A maiúsculo)
SELECT 
  c.id,
  c.nome,
  c.cpf,
  c.salario,
  car.nome as cargo_nome,
  dep.nome as departamento_nome,
  c.status,
  c.data_admissao
FROM colaboradores c
LEFT JOIN cargos car ON c.cargo_id = car.id
LEFT JOIN departamentos dep ON c.departamento_id = dep.id
WHERE c.status = 'Ativo'  -- ⚠️ ATENÇÃO: É "Ativo" com A maiúsculo!
ORDER BY c.nome;

-- ============================================================================
-- PASSO 2: Gerar 2ª parcela para TODOS os colaboradores ativos
-- ============================================================================
DO $$
DECLARE
  v_colaborador RECORD;
  v_salario_base NUMERIC;
  v_meses_trabalhados INTEGER;
  v_valor_13_total NUMERIC;
  v_valor_2parcela NUMERIC;
  v_inss NUMERIC;
  v_irrf NUMERIC;
  v_liquido NUMERIC;
  v_total_gerados INTEGER := 0;
BEGIN
  -- Loop em todos os colaboradores ativos
  FOR v_colaborador IN 
    SELECT 
      c.id,
      c.nome,
      c.cpf,
      c.salario,
      c.data_admissao,
      COALESCE(car.nome, 'Não informado') as cargo_nome,
      COALESCE(dep.nome, 'Não informado') as departamento_nome
    FROM colaboradores c
    LEFT JOIN cargos car ON c.cargo_id = car.id
    LEFT JOIN departamentos dep ON c.departamento_id = dep.id
    WHERE c.status = 'Ativo'
      AND c.salario IS NOT NULL
      AND c.salario > 0
  LOOP
    BEGIN
      -- Calcular valores
      v_salario_base := COALESCE(v_colaborador.salario, 0);
      v_meses_trabalhados := 12; -- Ajuste se necessário
      v_valor_13_total := (v_salario_base / 12) * v_meses_trabalhados;
      
      -- Calcular INSS (simplificado - 14% com teto de R$ 908,85)
      v_inss := LEAST(v_valor_13_total * 0.14, 908.85);
      
      -- Calcular IRRF (simplificado - 15% com dedução de R$ 381,44)
      v_irrf := GREATEST((v_valor_13_total - v_inss) * 0.15 - 381.44, 0);
      
      -- 2ª parcela = 50% - descontos
      v_valor_2parcela := v_valor_13_total / 2;
      v_liquido := v_valor_2parcela - v_inss - v_irrf;

      -- Inserir ou atualizar holerite da 2ª parcela
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
        status,
        created_at
      ) VALUES (
        v_colaborador.id,
        12, -- Dezembro
        2025,
        'decimo_terceiro',
        '2',
        v_colaborador.nome,
        v_colaborador.cpf,
        v_colaborador.cargo_nome,
        v_colaborador.departamento_nome,
        v_salario_base,
        v_valor_13_total,
        v_valor_2parcela,
        v_inss,
        v_irrf,
        v_inss + v_irrf,
        v_liquido,
        v_valor_13_total * 0.08,
        v_meses_trabalhados,
        '13º Salário - 2ª Parcela (Com Descontos) - 2025' || E'\n' || 
        'Meses trabalhados: ' || v_meses_trabalhados || '/12',
        'gerado',
        NOW()
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

      v_total_gerados := v_total_gerados + 1;
      RAISE NOTICE '✓ 2ª parcela gerada para: % (R$ %)', v_colaborador.nome, v_liquido;
      
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '✗ Erro ao gerar 2ª parcela para %: %', v_colaborador.nome, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total de 2ª parcelas geradas: %', v_total_gerados;
  RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- PASSO 3: Verificar resultado
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
  h.inss,
  h.irrf,
  h.total_descontos,
  h.salario_liquido,
  h.status,
  h.created_at
FROM holerites h
WHERE h.ano = 2025
  AND h.tipo = 'decimo_terceiro'
  AND h.parcela_13 = '2'
ORDER BY h.nome_colaborador;

-- ============================================================================
-- PASSO 4: Ver resumo de todas as parcelas do 13º
-- ============================================================================
SELECT 
  h.nome_colaborador,
  h.parcela_13,
  h.mes,
  h.salario_base,
  h.total_proventos,
  h.total_descontos,
  h.salario_liquido
FROM holerites h
WHERE h.ano = 2025
  AND h.tipo = 'decimo_terceiro'
ORDER BY h.nome_colaborador, h.parcela_13;
