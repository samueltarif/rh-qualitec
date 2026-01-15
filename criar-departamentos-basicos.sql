-- Criar departamentos básicos
INSERT INTO departamentos (nome, descricao, responsavel) VALUES
  ('Recursos Humanos', 'Gestão de pessoas e benefícios', 'Silvana Qualitec'),
  ('Financeiro', 'Controle financeiro e contabilidade', 'Silvana Qualitec'),
  ('TI', 'Tecnologia da Informação', 'Silvana Qualitec'),
  ('Comercial', 'Vendas e relacionamento com clientes', 'Silvana Qualitec'),
  ('Produção', 'Fabricação e controle de qualidade', 'Silvana Qualitec'),
  ('Administrativo', 'Suporte administrativo geral', 'Silvana Qualitec')
ON CONFLICT DO NOTHING;

-- Verificar departamentos criados
SELECT id, nome, descricao, responsavel FROM departamentos ORDER BY id;
