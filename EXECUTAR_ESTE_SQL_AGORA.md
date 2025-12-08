# 🚨 EXECUTE ESTE SQL AGORA NO SUPABASE

## ⚡ Copie e Cole Este SQL

```sql
-- Habilitar adiantamento salarial
UPDATE parametros_folha
SET 
  adiantamento_habilitado = true,
  adiantamento_percentual = 40,
  adiantamento_dia_pagamento = 20;

-- Verificar se funcionou
SELECT 
  id,
  adiantamento_habilitado,
  adiantamento_percentual,
  adiantamento_dia_pagamento
FROM parametros_folha;
```

## 📋 Passo a Passo

1. **Abra o Supabase**: https://supabase.com/dashboard
2. **Selecione seu projeto**: Qualitec RH
3. **Clique em**: SQL Editor (ícone de código no menu lateral)
4. **Cole o SQL acima**
5. **Clique em**: Run (ou pressione Ctrl+Enter)
6. **Verifique**: Deve aparecer uma linha com:
   - `adiantamento_habilitado`: `true`
   - `adiantamento_percentual`: `40`
   - `adiantamento_dia_pagamento`: `20`

## ✅ Depois de Executar

1. **Recarregue** a página de Folha de Pagamento
2. **Clique** em "💰 Adiantamento Salarial"
3. **Selecione** os colaboradores
4. **Gere** os adiantamentos

## 🎯 Resultado Esperado

Você verá algo assim no Supabase:

```
id | adiantamento_habilitado | adiantamento_percentual | adiantamento_dia_pagamento
---|------------------------|------------------------|---------------------------
1  | true                   | 40                     | 20
```

## ⚠️ Se Não Funcionar

Execute este SQL alternativo:

```sql
-- Criar registro se não existir
INSERT INTO parametros_folha (
  adiantamento_habilitado,
  adiantamento_percentual,
  adiantamento_dia_pagamento,
  created_at,
  updated_at
)
VALUES (
  true,
  40,
  20,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  adiantamento_habilitado = true,
  adiantamento_percentual = 40,
  adiantamento_dia_pagamento = 20;
```

## 🔍 Verificar Estrutura da Tabela

Se ainda não funcionar, verifique se a tabela tem as colunas:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'parametros_folha'
  AND column_name LIKE '%adiantamento%';
```

Deve retornar:
- `adiantamento_habilitado` (boolean)
- `adiantamento_percentual` (numeric)
- `adiantamento_dia_pagamento` (integer)

## 🆘 Se as Colunas Não Existirem

Execute a migration 29:

```sql
-- Adicionar colunas de adiantamento
ALTER TABLE parametros_folha
ADD COLUMN IF NOT EXISTS adiantamento_habilitado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS adiantamento_percentual NUMERIC(5,2) DEFAULT 40,
ADD COLUMN IF NOT EXISTS adiantamento_dia_pagamento INTEGER DEFAULT 20;

-- Habilitar
UPDATE parametros_folha
SET 
  adiantamento_habilitado = true,
  adiantamento_percentual = 40,
  adiantamento_dia_pagamento = 20;
```

## ✅ Pronto!

Após executar o SQL, o sistema estará pronto para gerar adiantamentos! 🎉
