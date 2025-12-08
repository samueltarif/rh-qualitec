-- ============================================================================
-- CADASTRAR SILVANA COMO COLABORADORA
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- Inserir Silvana como colaboradora
INSERT INTO colaboradores (
  empresa_id,
  nome,
  cpf,
  email_corporativo,
  status,
  data_admissao,
  salario
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- ID da empresa Qualitec
  'Silvana Administradora',
  '00000000000', -- CPF fictício (ajuste se necessário)
  'silvana@qualitec.ind.br',
  'Ativo',
  CURRENT_DATE,
  0
)
ON CONFLICT (empresa_id, cpf) DO NOTHING;

-- Verificar se foi criada
SELECT id, nome, email_corporativo FROM colaboradores WHERE email_corporativo = 'silvana@qualitec.ind.br';
