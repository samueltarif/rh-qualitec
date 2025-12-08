# ⚡ EXECUTAR AGORA: Corrigir Constraint da Tabela Holerites

## 🎯 Problema

A tabela `holerites` tem uma constraint (chave única) que **NÃO inclui o campo `tipo`**, causando conflito quando você tenta ter:
- Holerite mensal de dezembro
- 2ª parcela do 13º (também de dezembro)

**Resultado:** O sistema apaga um e substitui pelo outro! 💥

## 🔍 Diagnóstico

A constraint atual provavelmente é:
```sql
UNIQUE (colaborador_id, mes, ano)
```

Mas deveria ser:
```sql
UNIQUE (colaborador_id, mes, ano, tipo)
```

## ✅ Solução

Execute este SQL no Supabase SQL Editor:

```sql
-- 1. Ver constraints atuais
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'holerites'::regclass
  AND contype = 'u'
ORDER BY conname;

-- 2. Remover constraint antiga
DO $$ 
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'holerites'::regclass
    AND contype = 'u'
    AND pg_get_constraintdef(oid) LIKE '%colaborador_id%'
    AND pg_get_constraintdef(oid) LIKE '%mes%'
    AND pg_get_constraintdef(oid) LIKE '%ano%'
    AND pg_get_constraintdef(oid) NOT LIKE '%tipo%'
  LIMIT 1;
  
  IF constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE holerites DROP CONSTRAINT IF EXISTS ' || constraint_name;
    RAISE NOTICE 'Constraint removida: %', constraint_name;
  END IF;
END $$;

-- 3. Criar nova constraint CORRETA
ALTER TABLE holerites 
DROP CONSTRAINT IF EXISTS holerites_colaborador_mes_ano_tipo_unique;

ALTER TABLE holerites 
ADD CONSTRAINT holerites_colaborador_mes_ano_tipo_unique 
UNIQUE (colaborador_id, mes, ano, tipo);
```

## 🔍 Verificar

Após executar, verifique:

```sql
-- Ver a nova constraint
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'holerites'::regclass
  AND contype = 'u';
```

Você deve ver algo como:
```
holerites_colaborador_mes_ano_tipo_unique | UNIQUE (colaborador_id, mes, ano, tipo)
```

## 🎯 Testar

Agora tente:

1. **Gerar 1ª parcela do 13º** (novembro)
2. **Gerar 2ª parcela do 13º** (dezembro)
3. **Gerar holerite mensal de dezembro**

**Resultado esperado:** Os 3 holerites devem coexistir! ✅

Verifique com:

```sql
SELECT 
  nome_colaborador,
  mes,
  ano,
  tipo,
  parcela_13,
  salario_liquido
FROM holerites
WHERE colaborador_id = (SELECT id FROM colaboradores WHERE nome LIKE '%SAMUEL%' LIMIT 1)
  AND ano = 2025
ORDER BY mes, tipo;
```

Você deve ver:
- Mês 11, tipo `decimo_terceiro`, parcela `1`
- Mês 12, tipo `decimo_terceiro`, parcela `2`
- Mês 12, tipo `mensal`, parcela `null`

## 📝 Observação

Depois de executar este SQL, você precisará:

1. **Excluir** os holerites que foram sobrescritos
2. **Regerar** todos os holerites (mensais e de 13º)

Agora eles não vão mais conflitar!
