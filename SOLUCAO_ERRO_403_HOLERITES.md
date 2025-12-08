# 🔧 Solução: Erro 403 ao Gerar Holerites

## 🐛 Problema
```
POST http://localhost:3000/api/holerites/gerar 403 (Server Error)
Erro ao gerar holerites: Acesso negado
```

## 🔍 Diagnóstico

O erro 403 indica que o usuário não tem permissão. Possíveis causas:

1. ❌ Usuário não existe na tabela `app_users`
2. ❌ Usuário existe mas não tem role `admin`
3. ❌ Usuário está inativo
4. ❌ Auth UID não está vinculado corretamente

## ✅ Solução Passo a Passo

### Passo 1: Verificar Dados do Usuário

Execute no **Supabase SQL Editor**:

```sql
-- Ver todos os usuários
SELECT 
  id,
  auth_uid,
  email,
  role,
  nome,
  ativo
FROM app_users
ORDER BY created_at DESC;
```

### Passo 2: Verificar Logs do Servidor

Após tentar gerar holerites, verifique o console do servidor Nuxt. Você verá:

```
🔍 Verificando usuário: [auth_uid]
👤 Dados do usuário: { id: '...', role: '...', email: '...' }
```

### Passo 3: Corrigir o Problema

#### Caso A: Usuário não existe na app_users

Execute no Supabase:

```sql
-- Primeiro, pegue seu auth.uid() atual
SELECT auth.uid();

-- Depois crie o usuário admin
INSERT INTO app_users (auth_uid, email, role, nome, ativo)
VALUES (
  'SEU_AUTH_UID_AQUI',  -- Cole o auth.uid() aqui
  'admin@qualitec.com',
  'admin',
  'Administrador',
  true
)
ON CONFLICT (auth_uid) 
DO UPDATE SET 
  role = 'admin',
  ativo = true;
```

#### Caso B: Usuário existe mas não é admin

Execute no Supabase:

```sql
-- Atualizar role para admin
UPDATE app_users
SET 
  role = 'admin',
  ativo = true
WHERE email = 'SEU_EMAIL@AQUI.COM';
```

#### Caso C: Usuário está inativo

Execute no Supabase:

```sql
-- Ativar usuário
UPDATE app_users
SET ativo = true
WHERE email = 'SEU_EMAIL@AQUI.COM';
```

### Passo 4: Verificar Políticas RLS

Execute no Supabase:

```sql
-- Ver políticas da tabela holerites
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'holerites';
```

Deve ter a política `admin_all_holerites` que permite admin fazer tudo.

### Passo 5: Testar Novamente

1. Faça logout e login novamente
2. Vá em **Folha de Pagamento**
3. Clique em **Gerar Holerites**
4. Verifique os logs no console do servidor
5. Deve funcionar! ✅

## 🧪 Script de Teste Rápido

Execute este script completo no Supabase:

```sql
-- 1. Ver seu auth.uid()
SELECT auth.uid() as meu_auth_uid;

-- 2. Ver seu usuário na app_users
SELECT * FROM app_users WHERE auth_uid = auth.uid();

-- 3. Se não existir ou não for admin, criar/atualizar
INSERT INTO app_users (auth_uid, email, role, nome, ativo)
VALUES (
  auth.uid(),
  auth.email(),
  'admin',
  'Administrador',
  true
)
ON CONFLICT (auth_uid) 
DO UPDATE SET 
  role = 'admin',
  ativo = true;

-- 4. Confirmar
SELECT 
  id,
  auth_uid,
  email,
  role,
  ativo
FROM app_users 
WHERE auth_uid = auth.uid();
```

## 📝 Observações

- O `auth_uid` na tabela `app_users` deve corresponder ao `auth.uid()` do Supabase Auth
- O campo `role` deve ser exatamente `'admin'` (minúsculo)
- O campo `ativo` deve ser `true`
- Após qualquer alteração no banco, faça logout/login no sistema

## 🔍 Debug Adicional

Se ainda não funcionar, execute:

```bash
# No terminal do servidor Nuxt, você verá os logs:
🔍 Verificando usuário: [seu-auth-uid]
👤 Dados do usuário: [dados ou null]
❌ Erro ao buscar usuário: [erro ou null]
```

Copie esses logs e verifique:
- Se o auth_uid está correto
- Se os dados do usuário foram encontrados
- Se há algum erro na query
