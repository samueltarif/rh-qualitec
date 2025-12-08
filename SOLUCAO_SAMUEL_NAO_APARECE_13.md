# Solução: Samuel Não Aparece no Modal de 13º Salário

## 🔍 Problema Identificado

O colaborador Samuel (UUID: `84165a85-616f-4709-9069-54cfd46d6a38`) não aparece no modal de 13º salário.

## 🎯 Causa Raiz

A API de colaboradores (`/api/colaboradores`) busca apenas colaboradores com status **`'Ativo'`** (com A maiúsculo):

```typescript
.eq('status', 'Ativo')  // ← Case sensitive!
```

Se Samuel estiver com status `'ativo'` (minúsculo) ou qualquer outra variação, ele **NÃO** será encontrado.

## 🔧 Solução Rápida

### Passo 1: Diagnosticar

Execute no Supabase SQL Editor:

```sql
-- Ver arquivo: database/DIAGNOSTICO_STATUS_COLABORADORES.sql

SELECT 
  id,
  nome,
  status,
  CASE 
    WHEN status = 'Ativo' THEN '✅ OK'
    ELSE '❌ PROBLEMA: ' || COALESCE(status, 'NULL')
  END as diagnostico
FROM colaboradores
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;
```

### Passo 2: Corrigir

Execute no Supabase SQL Editor:

```sql
-- Ver arquivo: database/FIX_STATUS_COLABORADORES_13_SALARIO.sql

-- Corrigir Samuel
UPDATE colaboradores
SET 
  status = 'Ativo',
  updated_at = NOW()
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;

-- Corrigir todos os colaboradores com status em minúsculo
UPDATE colaboradores
SET 
  status = 'Ativo',
  updated_at = NOW()
WHERE LOWER(status) = 'ativo'
AND status != 'Ativo';
```

### Passo 3: Verificar

```sql
-- Verificar se Samuel agora aparecerá
SELECT 
  id,
  nome,
  status,
  salario_base
FROM colaboradores
WHERE status = 'Ativo'
ORDER BY nome;
```

## 📋 Checklist de Verificação

Para que um colaborador apareça no modal de 13º salário, ele precisa:

- [ ] **status = 'Ativo'** (com A maiúsculo, exatamente assim)
- [ ] **salario_base > 0** (não pode ser NULL ou zero)
- [ ] **data_admissao** preenchida (para cálculo proporcional)
- [ ] **nome** preenchido
- [ ] **cpf** preenchido

## 🧪 Teste Completo

Execute este script para verificar Samuel:

```sql
-- Ver arquivo: database/VERIFICAR_SAMUEL_13_SALARIO.sql

SELECT 
  id,
  nome,
  cpf,
  email,
  status,
  salario_base,
  data_admissao,
  cargo,
  departamento,
  CASE 
    WHEN status = 'Ativo' AND salario_base > 0 THEN '✅ PRONTO PARA 13º'
    WHEN status != 'Ativo' THEN '❌ Status incorreto: ' || COALESCE(status, 'NULL')
    WHEN salario_base IS NULL OR salario_base = 0 THEN '❌ Sem salário base'
    ELSE '❌ Outro problema'
  END as diagnostico
FROM colaboradores
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;
```

## 🚀 Após Correção

1. **Recarregue a página** de Folha de Pagamento
2. **Clique em "Gerar 13º Salário"**
3. **Samuel deve aparecer** na lista de colaboradores

## 📊 Valores Esperados para Samuel

```
ID: 84165a85-616f-4709-9069-54cfd46d6a38
Nome: SAMUEL BARRETOS TARIF
CPF: 433.964.318-12
Status: Ativo  ← IMPORTANTE: Com A maiúsculo
Salário Base: R$ 3.015,64
Cargo: Desenvolvedor
Departamento: TI
```

## 🔄 Solução Alternativa (Se o problema persistir)

Se mesmo após corrigir o status Samuel não aparecer, pode ser um problema de cache ou RLS:

### Opção 1: Limpar Cache do Navegador

```
1. Pressione Ctrl + Shift + Delete
2. Limpe cache e cookies
3. Recarregue a página
```

### Opção 2: Verificar RLS (Row Level Security)

```sql
-- Verificar políticas RLS
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'colaboradores';
```

### Opção 3: Testar API Diretamente

Abra o console do navegador (F12) e execute:

```javascript
// Testar API de colaboradores
fetch('/api/colaboradores?status=ativo')
  .then(r => r.json())
  .then(data => console.log('Colaboradores:', data))
```

## 📝 Arquivos de Diagnóstico

1. **`database/DIAGNOSTICO_STATUS_COLABORADORES.sql`**
   - Verifica todos os status
   - Identifica problemas de case sensitivity

2. **`database/VERIFICAR_SAMUEL_13_SALARIO.sql`**
   - Verifica especificamente Samuel
   - Checa todos os campos necessários

3. **`database/FIX_STATUS_COLABORADORES_13_SALARIO.sql`**
   - Corrige status de Samuel
   - Padroniza todos os colaboradores

4. **`database/FIX_SAMUEL_13_SALARIO.sql`**
   - Correção completa de Samuel
   - Garante todos os campos

## ⚠️ Importante

O PostgreSQL é **case sensitive** em comparações de strings. Isso significa:

- `'Ativo'` ≠ `'ativo'`
- `'Ativo'` ≠ `'ATIVO'`
- `'Ativo'` = `'Ativo'` ✅

A API busca exatamente por `'Ativo'` (com A maiúsculo), então todos os colaboradores devem ter esse valor exato.

## 🎯 Resumo da Solução

```sql
-- Execute este comando no Supabase SQL Editor:
UPDATE colaboradores
SET status = 'Ativo'
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;

-- Verifique:
SELECT nome, status FROM colaboradores 
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;
```

Resultado esperado:
```
nome                  | status
----------------------|--------
SAMUEL BARRETOS TARIF | Ativo
```

Agora Samuel deve aparecer no modal de 13º salário! 🎉

---

**Status:** ✅ Solução Identificada  
**Causa:** Case sensitivity no campo status  
**Fix:** Padronizar para 'Ativo' (com A maiúsculo)  
**Tempo:** < 1 minuto
