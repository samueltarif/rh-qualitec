# 🔐 Como Fazer Login no Sistema

## ❌ Problema Atual

Você está tentando acessar endpoints protegidos **sem estar logado**. O teste retornou:
```json
{
  "authenticated": false
}
```

## ✅ Solução: Fazer Login

### PASSO 1: Acessar a Página de Login

Abra no navegador:
```
http://localhost:3000/login
```

### PASSO 2: Fazer Login

Use as credenciais de um usuário existente.

**Se você não sabe as credenciais, veja abaixo como criar/resetar.**

### PASSO 3: Testar Autenticação

Após login, acesse:
```
http://localhost:3000/api/test-auth
```

Deve retornar:
```json
{
  "authenticated": true,
  "user": {
    "id": "uuid-valido",
    "email": "seu@email.com",
    "is_valid_uuid": true
  }
}
```

### PASSO 4: Testar Ponto

Agora sim, tente registrar ponto!

## 🔑 Criar/Resetar Usuário

### Opção A: Verificar Usuários Existentes

Execute no **Supabase SQL Editor**:
```sql
-- Ver todos os usuários
SELECT 
  au.email,
  u.role,
  u.ativo
FROM auth.users au
LEFT JOIN app_users u ON u.auth_uid = au.id
ORDER BY au.created_at DESC;
```

### Opção B: Resetar Senha de um Usuário

Execute no **Supabase Dashboard**:

1. Vá em **Authentication** → **Users**
2. Encontre o usuário
3. Clique nos 3 pontinhos → **Reset Password**
4. Copie o link de reset
5. Abra o link e defina nova senha

### Opção C: Criar Novo Usuário Admin

Execute no **Supabase SQL Editor**:

```sql
-- 1. Criar usuário no auth (substitua email e senha)
-- ATENÇÃO: Execute este comando no Supabase Dashboard → Authentication → Users
-- Clique em "Add user" → "Create new user"
-- Email: admin@qualitec.com
-- Password: Admin@123 (ou outra senha forte)
-- Marque "Auto Confirm User"

-- 2. Depois de criar no Dashboard, vincule em app_users:
INSERT INTO app_users (auth_uid, role, ativo)
SELECT 
  id,
  'admin',
  true
FROM auth.users
WHERE email = 'admin@qualitec.com'
AND NOT EXISTS (
  SELECT 1 FROM app_users WHERE auth_uid = auth.users.id
)
RETURNING *;
```

### Opção D: Criar Usuário Funcionário Completo

```sql
-- 1. Criar no Supabase Dashboard → Authentication → Users
-- Email: funcionario@qualitec.com
-- Password: Func@123
-- Auto Confirm: SIM

-- 2. Buscar IDs necessários
SELECT id, nome_fantasia FROM empresas LIMIT 1;
SELECT id, nome FROM cargos LIMIT 1;
SELECT id, nome FROM departamentos LIMIT 1;

-- 3. Criar colaborador
INSERT INTO colaboradores (
  empresa_id,
  nome,
  cpf,
  email,
  data_admissao,
  status,
  cargo_id,
  departamento_id
) VALUES (
  'UUID_DA_EMPRESA',
  'Funcionário Teste',
  '12345678900',
  'funcionario@qualitec.com',
  CURRENT_DATE,
  'Ativo',
  'UUID_DO_CARGO',
  'UUID_DO_DEPARTAMENTO'
) RETURNING id;

-- 4. Vincular em app_users (use o ID do colaborador retornado acima)
INSERT INTO app_users (auth_uid, role, colaborador_id, ativo)
SELECT 
  au.id,
  'funcionario',
  'UUID_DO_COLABORADOR',
  true
FROM auth.users au
WHERE au.email = 'funcionario@qualitec.com'
AND NOT EXISTS (
  SELECT 1 FROM app_users WHERE auth_uid = au.id
)
RETURNING *;
```

## 📋 Checklist

- [ ] Acessei /login
- [ ] Fiz login com sucesso
- [ ] Testei /api/test-auth (retornou authenticated: true)
- [ ] Testei registrar ponto
- [ ] Funcionou! 🎉

## 🆘 Problemas Comuns

### "Usuário não cadastrado no sistema"
- O usuário existe no auth.users mas não em app_users
- Execute a Opção B ou C acima

### "Usuário inativo"
- Execute: `UPDATE app_users SET ativo = true WHERE email = 'seu@email.com';`

### "Invalid login credentials"
- Senha incorreta
- Use a Opção B para resetar senha

### Esqueci qual email usei
- Execute: `SELECT email FROM auth.users;`
