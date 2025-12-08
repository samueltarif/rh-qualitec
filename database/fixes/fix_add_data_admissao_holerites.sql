-- Adicionar coluna data_admissao na tabela holerites
-- Esta coluna é necessária para calcular corretamente os dias trabalhados no holerite

ALTER TABLE holerites 
ADD COLUMN IF NOT EXISTS data_admissao DATE;

COMMENT ON COLUMN holerites.data_admissao IS 'Data de admissão do colaborador (usada para calcular dias trabalhados)';
