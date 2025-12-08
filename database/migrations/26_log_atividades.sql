-- Migration 26: Sistema de Log de Atividades
-- Registra todas as ações dos usuários no sistema

-- Tabela de log de atividades
CREATE TABLE IF NOT EXISTS log_atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo_acao VARCHAR(50) NOT NULL, -- login, logout, create, update, delete, download, upload, approve, reject
  modulo VARCHAR(50) NOT NULL, -- colaboradores, ferias, documentos, ponto, folha, etc
  descricao TEXT NOT NULL,
  detalhes JSONB, -- dados adicionais da ação
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_log_atividades_user ON log_atividades(user_id);
CREATE INDEX idx_log_atividades_tipo ON log_atividades(tipo_acao);
CREATE INDEX idx_log_atividades_modulo ON log_atividades(modulo);
CREATE INDEX idx_log_atividades_created ON log_atividades(created_at DESC);

-- RLS Policies
ALTER TABLE log_atividades ENABLE ROW LEVEL SECURITY;

-- Admins podem ver todas as atividades
CREATE POLICY "Admins podem ver todas atividades"
  ON log_atividades FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN user_roles ur ON ur.user_id = u.id
      JOIN roles r ON r.id = ur.role_id
      WHERE u.auth_uid = auth.uid()
      AND r.nivel IN ('Super_Admin', 'Gestor_RH')
    )
  );

-- Usuários podem ver suas próprias atividades
CREATE POLICY "Usuários podem ver suas atividades"
  ON log_atividades FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_uid = auth.uid()
    )
  );

-- Todos podem inserir suas próprias atividades
CREATE POLICY "Usuários podem inserir suas atividades"
  ON log_atividades FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_uid = auth.uid()
    )
  );

-- View para atividades com informações do usuário
CREATE OR REPLACE VIEW vw_atividades_recentes AS
SELECT 
  la.id,
  la.user_id,
  u.nome,
  u.email,
  COALESCE(
    (SELECT r.nivel::text 
     FROM user_roles ur 
     JOIN roles r ON r.id = ur.role_id 
     WHERE ur.user_id = u.id 
     LIMIT 1),
    'Colaborador'
  ) as role,
  la.tipo_acao,
  la.modulo,
  la.descricao,
  la.detalhes,
  la.ip_address,
  la.created_at
FROM log_atividades la
JOIN users u ON u.id = la.user_id
ORDER BY la.created_at DESC;

-- Função para registrar atividade
CREATE OR REPLACE FUNCTION fn_registrar_atividade(
  p_tipo_acao VARCHAR,
  p_modulo VARCHAR,
  p_descricao TEXT,
  p_detalhes JSONB DEFAULT NULL,
  p_ip_address VARCHAR DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_user_id UUID;
BEGIN
  -- Buscar o user_id a partir do auth.uid()
  SELECT id INTO v_user_id FROM users WHERE auth_uid = auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;
  
  INSERT INTO log_atividades (
    user_id,
    tipo_acao,
    modulo,
    descricao,
    detalhes,
    ip_address,
    user_agent
  ) VALUES (
    v_user_id,
    p_tipo_acao,
    p_modulo,
    p_descricao,
    p_detalhes,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para registrar login automaticamente
CREATE OR REPLACE FUNCTION fn_registrar_login()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ultimo_acesso IS DISTINCT FROM OLD.ultimo_acesso THEN
    INSERT INTO log_atividades (
      user_id,
      tipo_acao,
      modulo,
      descricao
    ) VALUES (
      NEW.id,
      'login',
      'autenticacao',
      'Usuário realizou login no sistema'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_registrar_login
  AFTER UPDATE OF ultimo_acesso ON users
  FOR EACH ROW
  EXECUTE FUNCTION fn_registrar_login();

-- Comentários
COMMENT ON TABLE log_atividades IS 'Registro de todas as atividades dos usuários no sistema';
COMMENT ON COLUMN log_atividades.tipo_acao IS 'Tipo de ação: login, logout, create, update, delete, download, upload, approve, reject';
COMMENT ON COLUMN log_atividades.modulo IS 'Módulo do sistema: colaboradores, ferias, documentos, ponto, folha, etc';
COMMENT ON COLUMN log_atividades.detalhes IS 'Dados adicionais em formato JSON';
