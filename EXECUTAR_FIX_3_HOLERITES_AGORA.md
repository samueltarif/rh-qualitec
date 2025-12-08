# 🚀 EXECUTAR FIX: Gerar 3 Holerites de 13º Salário

## ⚡ Ação Rápida

### 1️⃣ Executar SQL no Supabase

Copie e cole este SQL no **Supabase SQL Editor**:

```sql
-- Remover constraint antiga
DO $ 
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
    AND pg_get_constraintdef(oid) NOT LIKE '%parcela_13%'
  LIMIT 1;
  
  IF constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE holerites DROP CONSTRAINT IF EXISTS ' || constraint_name;
    RAISE NOTICE 'Constraint removida: %', constraint_name;
  END IF;
END $;

-- Criar constraint correta
ALTER TABLE holerites 
DROP CONSTRAINT IF EXISTS holerites_colaborador_mes_ano_tipo_parcela_unique;

ALTER TABLE holerites 
ADD CONSTRAINT holerites_colaborador_mes_ano_tipo_parcela_unique 
UNIQUE (colaborador_id, mes, ano, tipo, COALESCE(parcela_13, ''));

-- Verificar
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'holerites'::regclass
  AND contype = 'u'
ORDER BY conname;
```

### 2️⃣ Reiniciar Servidor Nuxt

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

### 3️⃣ Testar Geração

1. Acesse: http://localhost:3000/folha-pagamento
2. Clique em **"Gerar 13º Salário"**
3. Selecione **"1ª Parcela"**
4. Selecione um colaborador (ex: Samuel)
5. Clique em **"Gerar Holerites"**

### 4️⃣ Verificar Resultado

Abra o modal **"Gerenciar Holerites"** e verifique:

✅ **3 holerites** devem aparecer:
- 📄 Samuel - Nov/2025 - 13º (1ª Parcela)
- 📄 Samuel - Dez/2025 - 13º (2ª Parcela)
- 📄 Samuel - Dez/2025 - Salário Normal

## 🔍 Verificar no Banco

```sql
SELECT 
  id,
  nome_colaborador,
  mes,
  ano,
  tipo,
  parcela_13,
  salario_liquido,
  created_at
FROM holerites
WHERE ano = 2025
  AND nome_colaborador LIKE '%SAMUEL%'
ORDER BY mes, tipo;
```

## ✅ Resultado Esperado

```
ID | Nome   | Mês | Ano  | Tipo            | Parcela | Líquido
---|--------|-----|------|-----------------|---------|----------
1  | Samuel | 11  | 2025 | decimo_terceiro | 1       | 1.005,00
2  | Samuel | 12  | 2025 | decimo_terceiro | 2       | 845,28
3  | Samuel | 12  | 2025 | normal          | null    | 2.010,00
```

## 🎯 Pronto!

Agora o sistema gera corretamente os **3 holerites** necessários:
- ✅ 1ª Parcela do 13º (Novembro)
- ✅ 2ª Parcela do 13º (Dezembro)
- ✅ Salário Normal (Dezembro)

## 📞 Problemas?

Se ainda aparecer erro, execute:

```sql
-- Limpar holerites de teste
DELETE FROM holerites 
WHERE ano = 2025 
  AND mes IN (11, 12);

-- Tentar novamente
```
