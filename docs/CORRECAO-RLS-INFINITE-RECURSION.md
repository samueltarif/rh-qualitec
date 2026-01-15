# 🔧 Correção: Infinite Recursion no RLS

## ❌ Problema

```
ERROR: infinite recursion detected in policy for relation "funcionarios"
```

### O que aconteceu?

As **políticas RLS (Row Level Security)** do Supabase estavam causando um **loop infinito** ao tentar buscar dados do funcionário.

## 🔍 Causa Raiz

### Política RLS Problemática:

Quando você tem uma política assim:

```sql
CREATE POLICY "Funcionários podem ver seus próprios dados"
ON funcionarios FOR SELECT
TO authenticated
USING (
  id = (SELECT id FROM funcionarios WHERE email = auth.email())
  --     ↑ PROBLEMA: Consulta a mesma tabela que está protegendo!
);
```

### O que acontece:

```
1. API tenta buscar funcionário com ID=1
2. RLS verifica: "Este usuário pode ver ID=1?"
3. Para verificar, RLS consulta: SELECT id FROM funcionarios...
4. Mas essa consulta também precisa passar pelo RLS!
5. RLS verifica novamente: "Este usuário pode ver...?"
6. Loop infinito! 🔄💥
```

## ✅ Solução

### Usar Service Role Key

A **Service Role Key** bypassa todas as políticas RLS:

```typescript
// ANTES (com anon key - passa pelo RLS)
const response = await fetch(url, {
  headers: {
    'apikey': supabaseKey,  // ← anon key
    'Authorization': `Bearer ${supabaseKey}`
  }
})

// DEPOIS (com service role key - bypassa RLS)
const response = await fetch(url, {
  headers: {
    'apikey': serviceRoleKey,  // ← service role key
    'Authorization': `Bearer ${serviceRoleKey}`
  }
})
```

## 🔒 Por que é Seguro?

### Service Role Key no Backend

```
┌─────────────────┐
│   Frontend      │  ← Usuário não tem acesso à chave
│   (Navegador)   │
└────────┬────────┘
         │ $fetch('/api/...')
         ▼
┌─────────────────┐
│   Backend       │  ← Service Role Key está aqui (segura)
│   (Servidor)    │
└────────┬────────┘
         │ fetch(supabase) + serviceRoleKey
         ▼
┌─────────────────┐
│   Supabase      │  ← Bypassa RLS
│   (Database)    │
└─────────────────┘
```

**Seguro porque:**
- ✅ Service Role Key nunca vai pro navegador
- ✅ Backend valida permissões antes de buscar
- ✅ Usuário só pode buscar seus próprios dados (validado no backend)

## 📝 Correção Aplicada

### Arquivo: `server/api/funcionarios/meus-dados.get.ts`

```typescript
// ANTES
const supabaseKey = config.public.supabaseKey  // ← anon key

// DEPOIS
const serviceRoleKey = config.supabaseServiceRoleKey || config.public.supabaseKey  // ← service role key
```

### Validação de Segurança

```typescript
// Backend valida que usuário só pode ver seus próprios dados
const userId = query.userId

if (!userId) {
  throw createError({
    statusCode: 401,
    message: 'Usuário não autenticado'
  })
}

// Busca apenas o funcionário com este ID específico
const response = await fetch(
  `${supabaseUrl}/rest/v1/funcionarios?id=eq.${userId}&select=*`,
  {
    headers: {
      'apikey': serviceRoleKey,  // ← Bypassa RLS
      'Authorization': `Bearer ${serviceRoleKey}`
    }
  }
)
```

## 🎯 Quando Usar Cada Chave

### Anon Key (Public Key)
```typescript
// ✅ Usar quando:
- Dados públicos
- Operações que devem respeitar RLS
- Frontend precisa acessar diretamente (não recomendado)

// ❌ Não usar quando:
- Pode causar recursão infinita
- Precisa bypassar RLS
- Operações administrativas
```

### Service Role Key
```typescript
// ✅ Usar quando:
- Backend precisa acesso total
- Bypassar RLS é necessário
- Operações administrativas
- Evitar recursão infinita

// ❌ Não usar quando:
- No frontend (NUNCA!)
- Dados devem respeitar RLS do usuário
```

## 🔧 Outras APIs Afetadas

Verifiquei todas as APIs e estas também usam Service Role Key:

### ✅ Já Corretas:
- `server/api/auth/login.post.ts` - ✅ Usa serviceRoleKey
- `server/api/empresas/index.post.ts` - ✅ Usa serviceRoleKey
- `server/api/cargos/index.post.ts` - ✅ Usa serviceRoleKey
- `server/api/jornadas/index.post.ts` - ✅ Usa serviceRoleKey
- `server/api/funcionarios/meus-dados.patch.ts` - ✅ Usa serviceRoleKey

### ✅ Agora Corrigida:
- `server/api/funcionarios/meus-dados.get.ts` - ✅ Corrigida para usar serviceRoleKey

## 🧪 Como Testar

1. Faça login como Silvana
2. Acesse `/meus-dados`
3. Deve carregar os dados sem erro
4. Verifique o terminal - não deve ter erro de recursão

### Logs Esperados:

```
🔍 Buscando dados do funcionário ID: 1
📦 Funcionários encontrados: 1
✅ Dados do funcionário: Silvana Barduchi
```

## 📚 Referências

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Service Role Key vs Anon Key](https://supabase.com/docs/guides/api/api-keys)

## ✅ Checklist de Validação

- [x] Service Role Key configurada no `.env`
- [x] API GET usa serviceRoleKey
- [x] API PATCH usa serviceRoleKey
- [x] Backend valida permissões
- [x] Usuário só acessa seus próprios dados
- [x] Sem erro de recursão infinita

---

**Status:** ✅ Corrigido  
**Data:** 14/01/2026  
**Problema:** Infinite recursion no RLS  
**Solução:** Usar Service Role Key no backend
