# 🔧 Correção: Adicionar Coluna faixa_irrf

## ❌ Erro Encontrado
```
Could not find the 'faixa_irrf' column of 'holerites' in the schema cache
```

## 📋 Solução

A coluna `faixa_irrf` precisa ser adicionada à tabela `holerites` no banco de dados Supabase.

### Passo a Passo:

1. **Acesse o Supabase Dashboard:**
   - URL: https://supabase.com/dashboard
   - Projeto: `rqryspxfvfzfghrfqtbm`

2. **Abra o SQL Editor:**
   - No menu lateral, clique em **"SQL Editor"**
   - Clique em **"New query"**

3. **Execute o SQL:**
   ```sql
   ALTER TABLE holerites 
   ADD COLUMN IF NOT EXISTS faixa_irrf TEXT;
   ```

4. **Clique em "Run"** (ou pressione `Ctrl+Enter`)

5. **Resultado esperado:**
   ```
   Success. No rows returned
   ```

6. **Verificar (opcional):**
   ```sql
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'holerites'
   AND column_name = 'faixa_irrf';
   ```
   
   Deve retornar:
   ```
   faixa_irrf | text | YES
   ```

## ✅ Após Executar

Rode novamente a geração de holerites no sistema. O erro não deve mais aparecer!

## 📊 O que é faixa_irrf?

Esta coluna armazena a faixa de IRRF aplicada no cálculo:
- `"Isento (até R$ 5.000,00)"` - Salários isentos
- `"Transição c/ Redutor"` - Faixa de transição (R$ 5.000 a R$ 7.350)
- `"7,5%"`, `"15%"`, `"22,5%"`, `"27,5%"` - Faixas da tabela progressiva

Isso facilita a auditoria e compreensão dos cálculos de IRRF 2026.
