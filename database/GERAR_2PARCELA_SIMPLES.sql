-- ============================================================================
-- GERAR 2ª PARCELA DO 13º - VERSÃO SIMPLIFICADA
-- ============================================================================
-- Copie e cole este SQL completo no Supabase SQL Editor

DO $$
DECLARE
  v_colaborador RECORD;
  v_salario_base NUMERIC;
  v_valor_13_total NUMERIC;
  v_inss NUMERIC;
  v_irrf NUMERIC;
  v_liquido NUMERIC;
  v_total INTEGER := 0;
BEGIN
  -- Loop em todos os colaboradores ativos
  FOR v_colaborador IN 
    SELECT 
      c.id,
      c.nome,
      c.cpf,
      c.salario,
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
      v_salario_base := v_colaborador.salario;
      v_valor_13_total := v_salario_base; -- 13º = 1 salário completo
      
      -- INSS: 14% com teto de R$ 908,85
      v_inss := LEAST(v_valor_13_total * 0.14, 908.85);
      
      -- IRRF: 15% com dedução de R$ 381,44 (simplificado)
      v_irrf := GREATEST((v_valor_13_total - v_inss) * 0.15 - 381.44, 0);
      
      -- 2ª parcela = 50% - descontos
      v_liquido := (v_valor_13_total / 2) - v_inss - v_irrf;

      -- Inserir ou atualizar holerite
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
        12,
        2025,
        'decimo_terceiro',
        '2',
        v_colaborador.nome,
        v_colaborador.cpf,
        v_colaborador.cargo_nome,
        v_colaborador.departamento_nome,
        v_salario_base,
        v_valor_13_total,
        v_valor_13_total / 2,
        v_inss,
        v_irrf,
        v_inss + v_irrf,
        v_liquido,
        v_valor_13_total * 0.08,
        12,
        '13º Salário - 2ª Parcela (Com Descontos) - 2025',
        'gerado',
        NOW()
      )
      ON CONFLICT (colaborador_id, mes, ano) 
      DO UPDATE SET
        tipo = EXCLUDED.tipo,
        parcela_13 = EXCLUDED.parcela_13,
        nome_colaborador = EXCLUDED.nome_colaborador,
        salario_base = EXCLUDED.salario_base,
        salario_bruto = EXCLUDED.salario_bruto,
        total_proventos = EXCLUDED.total_proventos,
        inss = EXCLUDED.inss,
        irrf = EXCLUDED.irrf,
        total_descontos = EXCLUDED.total_descontos,
        salario_liquido = EXCLUDED.salario_liquido,
        updated_at = NOW();

      v_total := v_total + 1;
      RAISE NOTICE '✓ % - R$ %', v_colaborador.nome, v_liquido;
      
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '✗ Erro: % - %', v_colaborador.nome, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total gerado: %', v_total;
END $$;

-- Ver resultado
SELECT 
  nome_colaborador,
  parcela_13,
  salario_base,
  total_proventos,
  inss,
  irrf,
  total_descontos,
  salario_liquido
FROM holerites
WHERE ano = 2025
  AND tipo = 'decimo_terceiro'
  AND parcela_13 = '2'
ORDER BY nome_colaborador;
