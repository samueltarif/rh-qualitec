# ⚡ SOLUÇÃO SIMPLES - Erro de Ponto

## ❌ Problema

Você **não está logado** no sistema. Por isso os endpoints retornam erro 400.

## ✅ Solução em 3 Passos

### 1️⃣ Ver Usuários Disponíveis

Execute no **Supabase SQL Editor**:
```
nuxt-app/database/VER_USUARIOS_SISTEMA.sql
```

Isso vai mostrar todos os usuários e suas senhas (se houver).

### 2️⃣ Fazer Login

Abra no navegador:
```
http://localhost:3000/login
```

Use um dos emails que apareceu no passo 1.

**Se não souber a senha:**
- Vá no Supabase Dashboard
- Authentication → Users
- Clique no usuário → Reset Password
- Defina nova senha

### 3️⃣ Testar

Após login, tente:
- Registrar ponto (funcionário)
- Ver registros (admin)

## 🔑 Criar Usuário Admin Rápido

Se não tiver nenhum usuário, crie um admin:

**No Supabase Dashboard:**
1. Authentication → Users → Add user
2. Email: `admin@teste.com`
3. Password: `Admin@123`
4. Auto Confirm User: ✅ SIM
5. Clique em "Create user"

**No SQL Editor:**
```sql
INSERT INTO app_users (auth_uid, role, ativo)
SELECT id, 'admin', true
FROM auth.users
WHERE email = 'admin@teste.com'
RETURNING *;
```

Pronto! Agora faça login com:
- Email: `admin@teste.com`
- Senha: `Admin@123`

## 📋 Checklist

- [ ] Executei VER_USUARIOS_SISTEMA.sql
- [ ] Criei/resetei usuário (se necessário)
- [ ] Fiz login em /login
- [ ] Testei ponto
- [ ] Funcionou! 🎉

## 🎯 Resumo

O erro não era de RLS ou configuração. Era simplesmente que **você não estava logado**. Depois de fazer login, tudo vai funcionar!
