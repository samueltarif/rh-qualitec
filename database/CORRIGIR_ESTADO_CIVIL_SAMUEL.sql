-- Corrigir o estado civil do Samuel para o formato correto
-- Execute este script no Supabase SQL Editor

-- Primeiro, vamos ver o valor atual
SELECT id, nome, estado_civil, sexo 
FROM colaboradores 
WHERE cpf = '43396431812';

-- Atualizar para o formato correto (lowercase com underscore)
UPDATE colaboradores
SET estado_civil = CASE
  WHEN estado_civil ILIKE 'Solteiro%' OR estado_civil = 'Solteiro(a)' THEN 'solteiro'
  WHEN estado_civil ILIKE 'Casado%' OR estado_civil = 'Casado(a)' THEN 'casado'
  WHEN estado_civil ILIKE 'Divorciado%' OR estado_civil = 'Divorciado(a)' THEN 'divorciado'
  WHEN estado_civil ILIKE 'Viúvo%' OR estado_civil = 'Viúvo(a)' OR estado_civil ILIKE 'Viuvo%' THEN 'viuvo'
  WHEN estado_civil ILIKE '%União%' OR estado_civil ILIKE '%Uniao%' OR estado_civil = 'União Estável' THEN 'uniao_estavel'
  ELSE estado_civil
END
WHERE estado_civil IS NOT NULL
  AND estado_civil NOT IN ('solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel');

-- Verificar o resultado
SELECT id, nome, estado_civil, sexo 
FROM colaboradores 
WHERE cpf = '43396431812';

-- Ver todos os valores após a correção
SELECT DISTINCT estado_civil, COUNT(*) 
FROM colaboradores 
WHERE estado_civil IS NOT NULL
GROUP BY estado_civil
ORDER BY estado_civil;
