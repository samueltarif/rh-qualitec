-- Verificar o estado civil do Samuel
SELECT 
  id,
  nome,
  cpf,
  estado_civil,
  sexo,
  tipo_conta,
  length(estado_civil) as tamanho_estado_civil,
  pg_typeof(estado_civil) as tipo_estado_civil
FROM colaboradores
WHERE cpf = '43396431812' OR nome ILIKE '%SAMUEL%';

-- Ver todos os valores únicos de estado_civil na tabela
SELECT DISTINCT 
  estado_civil,
  length(estado_civil) as tamanho,
  COUNT(*) as quantidade
FROM colaboradores
WHERE estado_civil IS NOT NULL
GROUP BY estado_civil
ORDER BY estado_civil;
