-- VER COLABORADORES - VERSÃO RESUMIDA
-- Mostra apenas os campos mais importantes

SELECT 
  c.id,
  c.nome,
  c.cpf,
  c.email_corporativo,
  cg.nome as cargo,
  d.nome as departamento,
  c.salario,
  c.data_admissao,
  c.status,
  c.tipo_contrato
FROM colaboradores c
LEFT JOIN cargos cg ON cg.id = c.cargo_id
LEFT JOIN departamentos d ON d.id = c.departamento_id
ORDER BY c.nome;

-- Se quiser ver apenas campos específicos de um colaborador:
-- SELECT * FROM colaboradores WHERE nome ILIKE '%samuel%';

-- Contar total de colaboradores
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'Ativo' THEN 1 END) as ativos,
  COUNT(CASE WHEN salario > 0 THEN 1 END) as com_salario
FROM colaboradores;
