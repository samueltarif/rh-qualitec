# Guia Passo a Passo: Fazer Samuel Aparecer no 13º Salário

## 🎯 Problema

Samuel (UUID: `84165a85-616f-4709-9069-54cfd46d6a38`) não aparece no modal de 13º salário.

## 🔍 Causa

O campo `status` na tabela `colaboradores` é um **ENUM** (não texto simples), e a API busca especificamente por `'Ativo'`.

## 📋 Solução em 2 Passos

### PASSO 1: Descobrir o Valor Correto do ENUM

**Execute no Supabase SQL Editor:**

```sql
-- Cole o conteúdo de: database/DESCOBRIR_ENUM_STATUS.sql

SELECT 
  enumlabel as valor_enum
FROM pg_enum
WHERE enumtypid = (
  SELECT oid FROM pg_type WHERE typname = 'status_colaborador'
)
ORDER BY enumsortorder;
```

**Você verá algo como:**
```
valor_enum
----------
Ativo
Inativo
Afastado
Demitido
```

**Anote qual é o valor para "ativo"** (pode ser `Ativo`, `ativo`, `ATIVO`, etc.)

---

### PASSO 2: Corrigir Samuel

**Execute no Supabase SQL Editor:**

```sql
-- Se o enum tem 'Ativo' (com A maiúsculo):
UPDATE colaboradores
SET 
  status = 'Ativo'::status_colaborador,
  salario_base = COALESCE(NULLIF(salario_base, 0), 3015.64),
  data_admissao = COALESCE(data_admissao, '2024-01-01'),
  cargo = COALESCE(NULLIF(cargo, ''), 'Desenvolvedor'),
  departamento = COALESCE(NULLIF(departamento, ''), 'TI')
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;

-- Verificar:
SELECT 
  nome,
  status::text,
  salario_base,
  '✅ Pronto!' as resultado
FROM colaboradores
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;
```

---

### PASSO 3: Testar

1. **Recarregue** a página de Folha de Pagamento
2. **Clique** em "Gerar 13º Salário"
3. **Samuel deve aparecer** na lista!

---

## 🚨 Se Ainda Não Funcionar

### Verificar a API

A API em `server/api/colaboradores/index.get.ts` busca por:

```typescript
.eq('status', 'Ativo')  // ← Valor exato que deve estar no banco
```

### Verificar Samuel no Banco

```sql
SELECT 
  nome,
  status::text as status_atual,
  'Ativo' as status_que_api_busca,
  CASE 
    WHEN status::text = 'Ativo' THEN '✅ MATCH'
    ELSE '❌ DIFERENTE: ' || status::text
  END as comparacao
FROM colaboradores
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;
```

### Atualizar a API (Alternativa)

Se não conseguir mudar o status de Samuel, você pode atualizar a API para buscar pelo valor correto:

**Arquivo:** `server/api/colaboradores/index.get.ts`

```typescript
// ANTES:
.eq('status', 'Ativo')

// DEPOIS (use o valor que está no seu banco):
.eq('status', 'ativo')  // ou 'ATIVO', ou o que você descobriu
```

---

## 📁 Arquivos de Ajuda

1. **`database/DESCOBRIR_ENUM_STATUS.sql`**
   - Descobre os valores do ENUM
   - Mostra o status atual de Samuel

2. **`database/CORRIGIR_SAMUEL_DEFINITIVO_ENUM.sql`**
   - Corrige Samuel com o valor correto
   - Garante todos os campos necessários

3. **`database/FIX_SAMUEL_ENUM_STATUS.sql`**
   - Script completo com todas as opções

---

## ✅ Checklist Final

Antes de Samuel aparecer no modal, ele precisa:

- [ ] `status` = valor correto do ENUM (geralmente 'Ativo')
- [ ] `salario_base` > 0
- [ ] `data_admissao` preenchida
- [ ] `nome` preenchido
- [ ] `cpf` preenchido

---

## 🎯 Resumo Rápido

```sql
-- 1. Descobrir valor do ENUM
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'status_colaborador');

-- 2. Corrigir Samuel (substitua 'Ativo' pelo valor correto)
UPDATE colaboradores
SET status = 'Ativo'::status_colaborador
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;

-- 3. Verificar
SELECT nome, status::text FROM colaboradores 
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;
```

---

**Tempo Estimado:** 2 minutos  
**Dificuldade:** Fácil  
**Resultado:** Samuel aparecerá no modal de 13º salário! 🎉
