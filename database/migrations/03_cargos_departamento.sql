-- Adicionar coluna departamento_id na tabela cargos
ALTER TABLE cargos ADD COLUMN IF NOT EXISTS departamento_id UUID REFERENCES departamentos(id) ON DELETE SET NULL;

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_cargos_departamento ON cargos(departamento_id);

-- Comentário
COMMENT ON COLUMN cargos.departamento_id IS 'Departamento ao qual este cargo pertence (opcional)';
