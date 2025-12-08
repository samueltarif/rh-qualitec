-- ============================================
-- FIX ESTADO CIVIL - EXECUTE ESTE SCRIPT AGORA
-- ============================================

-- 1. Ver o problema atual
SELECT 
  id,
  nome,
  estado_civil AS "Estado Civil Atual",
  CASE
    WHEN estado_civil IN ('solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel') THEN '✅ Correto'
    ELSE '❌ Precisa Corrigir'
  END AS "Status"
FROM colaboradores
WHERE estado_civil IS NOT NULL
ORDER BY nome;

-- 2. Corrigir TODOS os valores
UPDATE colaboradores
SET estado_civil = LOWER(
  CASE
    WHEN estado_civil ILIKE 'Solteiro%' THEN 'solteiro'
    WHEN estado_civil ILIKE 'Casado%' THEN 'casado'
    WHEN estado_civil ILIKE 'Divorciado%' THEN 'divorciado'
    WHEN estado_civil ILIKE 'Viúvo%' OR estado_civil ILIKE 'Viuvo%' THEN 'viuvo'
    WHEN estado_civil ILIKE '%União%' OR estado_civil ILIKE '%Uniao%' THEN 'uniao_estavel'
    WHEN estado_civil = 'Uniao_Estavel' THEN 'uniao_estavel'
    ELSE estado_civil
  END
)
WHERE estado_civil IS NOT NULL;

-- 3. Verificar se funcionou
SELECT 
  estado_civil AS "Estado Civil",
  COUNT(*) AS "Quantidade"
FROM colaboradores
WHERE estado_civil IS NOT NULL
GROUP BY estado_civil
ORDER BY estado_civil;

-- 4. Ver o Samuel especificamente
SELECT 
  nome,
  cpf,
  estado_civil,
  sexo,
  tipo_conta
FROM colaboradores
WHERE cpf = '43396431812';
