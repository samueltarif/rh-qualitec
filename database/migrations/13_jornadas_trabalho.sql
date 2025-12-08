-- ============================================================================
-- 13_jornadas_trabalho.sql - Jornadas de Trabalho
-- ============================================================================
-- Descrição: Configuração de horários, escalas e turnos de trabalho
-- Integração: Colaboradores, Ponto, Folha de Pagamento
-- ============================================================================

-- Tabela de Jornadas de Trabalho
CREATE TABLE IF NOT EXISTS jornadas_trabalho (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  codigo VARCHAR(20) UNIQUE,
  
  -- Tipo de Jornada
  tipo VARCHAR(30) DEFAULT 'padrao' CHECK (tipo IN ('padrao', 'escala', '12x36', '6x1', '5x2', 'flexivel', 'parcial', 'noturno', 'personalizado')),
  
  -- Carga Horária
  carga_horaria_semanal DECIMAL(5,2) DEFAULT 44.00,
  carga_horaria_diaria DECIMAL(5,2) DEFAULT 8.00,
  
  -- Horários Padrão (para jornada padrão)
  hora_entrada TIME DEFAULT '08:00',
  hora_saida TIME DEFAULT '17:00',
  hora_intervalo_inicio TIME DEFAULT '12:00',
  hora_intervalo_fim TIME DEFAULT '13:00',
  
  -- Intervalo
  intervalo_minutos INTEGER DEFAULT 60,
  intervalo_minimo_minutos INTEGER DEFAULT 60,
  
  -- Tolerância
  tolerancia_entrada_minutos INTEGER DEFAULT 10,
  tolerancia_saida_minutos INTEGER DEFAULT 10,
  
  -- Dias da Semana (bitmask: 1=Dom, 2=Seg, 4=Ter, 8=Qua, 16=Qui, 32=Sex, 64=Sab)
  -- Ou usar JSONB para mais flexibilidade
  dias_trabalho JSONB DEFAULT '{"domingo": false, "segunda": true, "terca": true, "quarta": true, "quinta": true, "sexta": true, "sabado": false}',
  
  -- Configurações de Hora Extra
  permite_hora_extra BOOLEAN DEFAULT true,
  hora_extra_apos_minutos INTEGER DEFAULT 0,
  percentual_hora_extra_50 DECIMAL(5,2) DEFAULT 50.00,
  percentual_hora_extra_100 DECIMAL(5,2) DEFAULT 100.00,
  
  -- Adicional Noturno
  adicional_noturno BOOLEAN DEFAULT false,
  hora_inicio_noturno TIME DEFAULT '22:00',
  hora_fim_noturno TIME DEFAULT '05:00',
  percentual_adicional_noturno DECIMAL(5,2) DEFAULT 20.00,
  
  -- DSR (Descanso Semanal Remunerado)
  dsr_dia VARCHAR(10) DEFAULT 'domingo',
  
  -- Status
  ativo BOOLEAN DEFAULT true,
  padrao BOOLEAN DEFAULT false,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Horários por Dia (para jornadas personalizadas)
CREATE TABLE IF NOT EXISTS jornada_horarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jornada_id UUID NOT NULL REFERENCES jornadas_trabalho(id) ON DELETE CASCADE,
  
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Domingo, 6=Sábado
  
  hora_entrada TIME,
  hora_saida TIME,
  hora_intervalo_inicio TIME,
  hora_intervalo_fim TIME,
  
  trabalha BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(jornada_id, dia_semana)
);

-- Trigger para updated_at
CREATE TRIGGER tr_jornadas_trabalho_updated_at
  BEFORE UPDATE ON jornadas_trabalho
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Índices
CREATE INDEX IF NOT EXISTS idx_jornadas_trabalho_ativo ON jornadas_trabalho(ativo);
CREATE INDEX IF NOT EXISTS idx_jornadas_trabalho_tipo ON jornadas_trabalho(tipo);
CREATE INDEX IF NOT EXISTS idx_jornada_horarios_jornada ON jornada_horarios(jornada_id);

-- Comentários
COMMENT ON TABLE jornadas_trabalho IS 'Configuração de jornadas de trabalho';
COMMENT ON COLUMN jornadas_trabalho.tipo IS 'Tipo: padrao, escala, 12x36, 6x1, 5x2, flexivel, parcial, noturno, personalizado';
COMMENT ON COLUMN jornadas_trabalho.dias_trabalho IS 'JSON com dias da semana que trabalha';
COMMENT ON COLUMN jornadas_trabalho.padrao IS 'Se é a jornada padrão da empresa';

-- Inserir jornadas padrão
INSERT INTO jornadas_trabalho (nome, descricao, codigo, tipo, carga_horaria_semanal, carga_horaria_diaria, hora_entrada, hora_saida, hora_intervalo_inicio, hora_intervalo_fim, intervalo_minutos, padrao) VALUES
('Qualitec Padrão', 'Seg-Qui: 07:30-17:30 | Sex: 07:30-16:30 | Almoço: 1h15 + Café: 15min', 'QUAL-44', 'personalizado', 44.00, 8.75, '07:30', '17:30', '12:00', '13:15', 90, true),
('Comercial 44h', 'Segunda a Sexta, 08h às 17h com 1h de almoço', 'COM-44', 'padrao', 44.00, 8.00, '08:00', '17:00', '12:00', '13:00', 60, false),
('Comercial 40h', 'Segunda a Sexta, 08h às 17h com 1h de almoço (40h)', 'COM-40', 'padrao', 40.00, 8.00, '08:00', '17:00', '12:00', '13:00', 60, false),
('Escala 12x36', 'Trabalha 12h, folga 36h', 'ESC-12X36', '12x36', 36.00, 12.00, '07:00', '19:00', '12:00', '13:00', 60, false),
('Escala 6x1', 'Trabalha 6 dias, folga 1', 'ESC-6X1', '6x1', 44.00, 7.33, '08:00', '16:20', '12:00', '13:00', 60, false),
('Meio Período Manhã', 'Segunda a Sexta, 08h às 12h', 'PARC-M', 'parcial', 20.00, 4.00, '08:00', '12:00', NULL, NULL, 0, false),
('Meio Período Tarde', 'Segunda a Sexta, 13h às 17h', 'PARC-T', 'parcial', 20.00, 4.00, '13:00', '17:00', NULL, NULL, 0, false),
('Noturno', 'Segunda a Sexta, 22h às 06h', 'NOT-44', 'noturno', 44.00, 8.00, '22:00', '06:00', '02:00', '03:00', 60, false)
ON CONFLICT (codigo) DO NOTHING;

-- Inserir horários personalizados para a jornada Qualitec (sexta-feira diferente)
INSERT INTO jornada_horarios (jornada_id, dia_semana, hora_entrada, hora_saida, hora_intervalo_inicio, hora_intervalo_fim, trabalha)
SELECT 
  id,
  5, -- Sexta-feira (0=Dom, 5=Sex)
  '07:30'::TIME,
  '16:30'::TIME,
  '12:00'::TIME,
  '13:15'::TIME,
  true
FROM jornadas_trabalho 
WHERE codigo = 'QUAL-44'
ON CONFLICT (jornada_id, dia_semana) DO NOTHING;

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

ALTER TABLE jornadas_trabalho ENABLE ROW LEVEL SECURITY;
ALTER TABLE jornada_horarios ENABLE ROW LEVEL SECURITY;

-- Admin pode tudo
CREATE POLICY "admin_all_jornadas" ON jornadas_trabalho
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM app_users WHERE auth_uid = auth.uid() AND role = 'admin'));

CREATE POLICY "admin_all_jornada_horarios" ON jornada_horarios
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM app_users WHERE auth_uid = auth.uid() AND role = 'admin'));

-- Funcionários podem visualizar
CREATE POLICY "employee_view_jornadas" ON jornadas_trabalho
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM app_users WHERE auth_uid = auth.uid() AND ativo = true));

CREATE POLICY "employee_view_jornada_horarios" ON jornada_horarios
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM app_users WHERE auth_uid = auth.uid() AND ativo = true));

-- ============================================================================
-- FIM
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Tabelas de jornadas de trabalho criadas com sucesso!';
  RAISE NOTICE '📋 7 jornadas padrão inseridas';
  RAISE NOTICE '💡 Configure em /configuracoes/jornadas';
END $$;
