-- Ver quais são os valores válidos do ENUM estado_civil
SELECT 
    enumlabel as "Valores Válidos do ENUM"
FROM pg_enum
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'estado_civil'
)
ORDER BY enumsortorder;

-- Ver os valores atuais na tabela
SELECT 
    estado_civil::text AS "Estado Civil Atual",
    COUNT(*) AS "Quantidade"
FROM colaboradores
WHERE estado_civil IS NOT NULL
GROUP BY estado_civil::text
ORDER BY estado_civil::text;

-- Ver o Samuel especificamente
SELECT 
    nome,
    cpf,
    estado_civil::text AS "Estado Civil",
    sexo
FROM colaboradores
WHERE cpf = '43396431812';
