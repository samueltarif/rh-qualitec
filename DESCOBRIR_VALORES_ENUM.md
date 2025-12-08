# Descobrir Valores Corretos do ENUM

## Problema

O erro indica que o ENUM `estado_civil` não aceita os valores que estamos tentando usar.

## Passo 1: Descobrir os Valores Válidos

Execute este SQL no Supabase:

```sql
SELECT 
    enumlabel as "Valores Válidos"
FROM pg_enum
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'estado_civil'
)
ORDER BY enumsortorder;
```

## Passo 2: Ver o Valor Atual do Samuel

```sql
SELECT 
    nome,
    cpf,
    estado_civil::text AS "Estado Civil",
    sexo
FROM colaboradores
WHERE cpf = '43396431812';
```

## Passo 3: Me Envie os Resultados

Copie e cole aqui os resultados das duas queries acima para eu ajustar o formulário corretamente.

Os valores válidos provavelmente são algo como:
- `"Solteiro(a)"` (com maiúscula e parênteses)
- `"Casado(a)"`
- `"Divorciado(a)"`
- `"Viúvo(a)"`
- `"União Estável"`

Ou podem ser:
- `"solteiro"` (lowercase sem parênteses)
- `"casado"`
- etc.

Preciso saber exatamente quais são para ajustar o formulário!
