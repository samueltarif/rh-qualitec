-- ============================================================================
-- Fix: Atualizar jornada para o padrão Qualitec
-- ============================================================================
-- Descrição: Atualiza a jornada padrão com os horários corretos da Qualitec
-- Segunda a Quinta: 07:30-17:30 | Sexta: 07:30-16:30
-- ============================================================================

-- 1. Atualizar ou criar a jornada Qualitec Padrão
INSERT INTO jornadas_trabalho (
  nome, 
  descricao, 
  codigo, 
  tipo, 
  carga_horaria_semanal, 
  carga_horaria_diaria, 
  hora_entrada, 
  hora_saida, 
  hora_intervalo_inicio, 
  hora_intervalo_fim, 
  intervalo_minutos,
  tolerancia_entrada_minutos,
  tolerancia_saida_minutos,
  permite_hora_extra,
  percentual_hora_extra_50,
  percentual_hora_extra_100,
  padrao,
  ativo
) VALUES (
  'Qualitec Padrão',
  'Seg-Qui: 07:30-17:30 | Sex: 07:30-16:30 | Almoço: 1h15 + Café: 15min',
  'QUAL-44',
  'personalizado',
  44.00,
  8.75,
  '07:30',
  '17:30',
  '12:00',
  '13:15',
  90,
  10,
  10,
  true,
  50.00,
  100.00,
  true,
  true
)
ON CONFLICT (codigo) 
DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  tipo = EXCLUDED.tipo,
  carga_horaria_semanal = EXCLUDED.carga_horaria_semanal,
  carga_horaria_diaria = EXCLUDED.carga_horaria_diaria,
  hora_entrada = EXCLUDED.hora_entrada,
  hora_saida = EXCLUDED.hora_saida,
  hora_intervalo_inicio = EXCLUDED.hora_intervalo_inicio,
  hora_intervalo_fim = EXCLUDED.hora_intervalo_fim,
  intervalo_minutos = EXCLUDED.intervalo_minutos,
  padrao = EXCLUDED.padrao,
  ativo = EXCLUDED.ativo,
  updated_at = NOW();

-- 2. Remover o padrão de outras jornadas
UPDATE jornadas_trabalho 
SET padrao = false, updated_at = NOW()
WHERE codigo != 'QUAL-44' AND padrao = true;

-- 3. Inserir horário especial da sexta-feira
INSERT INTO jornada_horarios (
  jornada_id, 
  dia_semana, 
  hora_entrada, 
  hora_saida, 
  hora_intervalo_inicio, 
  hora_intervalo_fim, 
  trabalha
)
SELECT 
  id,
  5, -- Sexta-feira (0=Domingo, 5=Sexta)
  '07:30'::TIME,
  '16:30'::TIME,
  '12:00'::TIME,
  '13:15'::TIME,
  true
FROM jornadas_trabalho 
WHERE codigo = 'QUAL-44'
ON CONFLICT (jornada_id, dia_semana) 
DO UPDATE SET
  hora_entrada = EXCLUDED.hora_entrada,
  hora_saida = EXCLUDED.hora_saida,
  hora_intervalo_inicio = EXCLUDED.hora_intervalo_inicio,
  hora_intervalo_fim = EXCLUDED.hora_intervalo_fim,
  trabalha = EXCLUDED.trabalha;

-- ============================================================================
-- FIM
-- ============================================================================

DO $$
DECLARE
  v_jornada_id UUID;
BEGIN
  -- Pegar o ID da jornada Qualitec
  SELECT id INTO v_jornada_id FROM jornadas_trabalho WHERE codigo = 'QUAL-44';
  
  RAISE NOTICE '✅ Jornada Qualitec atualizada com sucesso!';
  RAISE NOTICE '📋 ID da jornada: %', v_jornada_id;
  RAISE NOTICE '⏰ Segunda a Quinta: 07:30 - 17:30 (8h45min)';
  RAISE NOTICE '⏰ Sexta-feira: 07:30 - 16:30 (7h45min)';
  RAISE NOTICE '🍽️  Almoço: 12:00 - 13:15 (1h15min)';
  RAISE NOTICE '☕ Café: 15min (incluído no intervalo)';
  RAISE NOTICE '📊 Carga semanal: 44 horas';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Acesse /configuracoes/jornadas para visualizar';
END $$;
