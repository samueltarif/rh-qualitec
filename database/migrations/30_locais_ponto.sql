-- Migration 30: Locais permitidos para bater ponto
-- Adiciona suporte a geolocalização para controle de ponto

-- Tabela de locais permitidos
CREATE TABLE IF NOT EXISTS locais_ponto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  raio_metros INTEGER NOT NULL DEFAULT 100, -- raio em metros
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar campos de geolocalização na tabela de registros_ponto
ALTER TABLE registros_ponto 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS local_id UUID REFERENCES locais_ponto(id),
ADD COLUMN IF NOT EXISTS distancia_metros INTEGER,
ADD COLUMN IF NOT EXISTS fora_do_raio BOOLEAN DEFAULT false;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_locais_ponto_ativo ON locais_ponto(ativo);
CREATE INDEX IF NOT EXISTS idx_registros_ponto_local ON registros_ponto(local_id);
CREATE INDEX IF NOT EXISTS idx_registros_ponto_fora_raio ON registros_ponto(fora_do_raio);

-- Função para calcular distância entre dois pontos (Haversine)
CREATE OR REPLACE FUNCTION calcular_distancia_metros(
  lat1 DECIMAL, lon1 DECIMAL,
  lat2 DECIMAL, lon2 DECIMAL
) RETURNS INTEGER AS $$
DECLARE
  r INTEGER := 6371000; -- Raio da Terra em metros
  dlat DECIMAL;
  dlon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  
  a := sin(dlat/2) * sin(dlat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dlon/2) * sin(dlon/2);
  
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN CAST(r * c AS INTEGER);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para verificar se está dentro do raio permitido
CREATE OR REPLACE FUNCTION verificar_local_permitido(
  p_latitude DECIMAL,
  p_longitude DECIMAL
) RETURNS TABLE(
  local_id UUID,
  local_nome VARCHAR,
  distancia INTEGER,
  dentro_raio BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.nome,
    calcular_distancia_metros(p_latitude, p_longitude, l.latitude, l.longitude) as dist,
    calcular_distancia_metros(p_latitude, p_longitude, l.latitude, l.longitude) <= l.raio_metros as dentro
  FROM locais_ponto l
  WHERE l.ativo = true
  ORDER BY dist ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- RLS para locais_ponto
ALTER TABLE locais_ponto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem gerenciar locais"
  ON locais_ponto FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth_uid = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Funcionários podem ver locais ativos"
  ON locais_ponto FOR SELECT
  USING (ativo = true);

-- Inserir local padrão (exemplo - Qualitec)
INSERT INTO locais_ponto (nome, descricao, latitude, longitude, raio_metros)
VALUES (
  'Sede Qualitec',
  'Escritório principal',
  -23.550520,  -- Exemplo: São Paulo (ajuste para seu endereço)
  -46.633308,
  100  -- 100 metros de raio
) ON CONFLICT DO NOTHING;

COMMENT ON TABLE locais_ponto IS 'Locais permitidos para registro de ponto';
COMMENT ON COLUMN locais_ponto.raio_metros IS 'Raio permitido em metros para bater ponto';
COMMENT ON FUNCTION calcular_distancia_metros IS 'Calcula distância entre coordenadas usando fórmula de Haversine';
