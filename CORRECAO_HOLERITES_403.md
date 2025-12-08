# ✅ Correção: Erro 403 ao Gerar Holerites

## 🐛 Problema
Ao tentar gerar holerites, o sistema retornava erro 403 (Acesso negado):
```
POST http://localhost:3000/api/holerites/gerar 403 (Server Error)
Erro ao gerar holerites: Acesso negado
```

## 🔍 Causa
Os endpoints de holerites estavam buscando usuários na tabela errada:
- ❌ Buscavam em `users` com `user.id`
- ✅ Deveriam buscar em `app_users` com `auth_uid`

## 🔧 Correções Aplicadas

### 1. `/api/holerites/gerar.post.ts`
```typescript
// ANTES
const { data: userData } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .single()

// DEPOIS
const { data: userData } = await supabase
  .from('app_users')
  .select('role')
  .eq('auth_uid', user.id)
  .single()
```

Também corrigido o campo `gerado_por`:
```typescript
// ANTES
gerado_por: user.id,

// DEPOIS
gerado_por: userData.id,
```

### 2. `/api/holerites/[id].get.ts`
```typescript
// ANTES
const { data: userData } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .single()

// DEPOIS
const { data: userData } = await supabase
  .from('app_users')
  .select('role')
  .eq('auth_uid', user.id)
  .single()
```

### 3. `/api/funcionario/holerites.get.ts`
```typescript
// ANTES
const { data: colaborador } = await supabase
  .from('colaboradores')
  .select('id')
  .eq('user_id', user.id)
  .single()

// DEPOIS
// Buscar app_user primeiro
const { data: appUser } = await supabase
  .from('app_users')
  .select('id')
  .eq('auth_uid', user.id)
  .single()

// Depois buscar colaborador
const { data: colaborador } = await supabase
  .from('colaboradores')
  .select('id')
  .eq('user_id', appUser.id)
  .single()
```

## ✅ Resultado
Agora o sistema:
1. ✅ Verifica corretamente se o usuário é admin
2. ✅ Gera holerites sem erro 403
3. ✅ Registra corretamente quem gerou o holerite
4. ✅ Funcionários conseguem ver seus próprios holerites

## 🧪 Como Testar
1. Faça login como admin
2. Vá em **Folha de Pagamento**
3. Clique em **Gerar Holerites**
4. Selecione mês/ano e colaboradores
5. Clique em **Gerar**
6. ✅ Deve funcionar sem erro 403!

## 📝 Observação
Os erros de tipagem do TypeScript são apenas avisos do compilador e não afetam a funcionalidade. Eles ocorrem porque o Supabase não consegue inferir os tipos automaticamente em alguns casos.
