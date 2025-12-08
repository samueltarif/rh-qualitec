# Resetar Senha do Samuel

## Método 1: Pelo Dashboard (RECOMENDADO)

1. Vá em **Authentication** > **Users**
2. **Clique na linha** do usuário `vendas2@qualitec.ind.br`
3. No painel lateral que abrir, procure por **"Reset Password"**
4. Digite: `teste123`
5. Salve

## Método 2: Usando a API do Supabase (AVANÇADO)

Execute este comando no terminal (substitua os valores):

```bash
curl -X PUT 'https://SEU_PROJETO.supabase.co/auth/v1/admin/users/ID_DO_USUARIO' \
  -H "apikey: SUA_SERVICE_KEY" \
  -H "Authorization: Bearer SUA_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "teste123"
  }'
```

## Método 3: Deletar e Recriar (ÚLTIMA OPÇÃO)

Se nada funcionar, delete o usuário e crie novamente:

### Passo 1: Deletar usuário Samuel do auth.users
1. No Dashboard: Authentication > Users
2. Encontre `vendas2@qualitec.ind.br`
3. Clique nos 3 pontinhos (ou na linha)
4. Delete User

### Passo 2: Deletar de app_users
Execute no SQL Editor:
```sql
DELETE FROM app_users WHERE email = 'vendas2@qualitec.ind.br';
```

### Passo 3: Criar novo usuário
1. Authentication > Users > **Add user**
2. Email: `vendas2@qualitec.ind.br`
3. Password: `teste123`
4. Auto Confirm: ✅ SIM
5. Create user

### Passo 4: Copiar o ID do novo usuário e executar:
```sql
INSERT INTO app_users (
  auth_uid,
  email,
  nome,
  role,
  colaborador_id,
  ativo
) VALUES (
  'COLE_O_ID_AQUI',
  'vendas2@qualitec.ind.br',
  'SAMUEL BARRETOS TARIF',
  'funcionario',
  '616f-4709-9069-54cfd46d6a38',
  true
);
```

## Credenciais Finais

- **Email:** `vendas2@qualitec.ind.br`
- **Senha:** `teste123`
- **Acesso:** `/employee`

---

## ⚠️ IMPORTANTE

O Supabase **NÃO permite** ver senhas por segurança. Você só pode:
1. Resetar a senha
2. Enviar email de recuperação
3. Deletar e recriar o usuário

Escolha o método que preferir acima.
