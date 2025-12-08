# Como Testar o Portal do Funcionário

## Usuários Existentes no Sistema

Você tem 3 usuários cadastrados:
1. **MARCELO RIBEIRO** - Status: Desligado
2. **Silvana Administradora** - Status: Ativo (Admin)
3. **SAMUEL BARRETOS TARIF** - Status: Ativo (Funcionário)

## ⚠️ IMPORTANTE: Senhas são Criptografadas

As senhas no Supabase são criptografadas e **NÃO podem ser visualizadas**.

---

## 🔑 Como Definir Senha para o Funcionário

### Método 1: Resetar Senha pelo Dashboard (MAIS FÁCIL)

1. Acesse o **Supabase Dashboard**
2. Vá em **Authentication** > **Users**
3. Encontre o usuário **vendas2@qualitec.ind.br** (Samuel)
4. Clique nos **3 pontinhos** (⋮) ao lado do usuário
5. Selecione **"Reset Password"**
6. Digite uma nova senha: `teste123`
7. Clique em **Update User**

### Método 2: Enviar Email de Reset

1. No mesmo menu dos 3 pontinhos
2. Selecione **"Send password reset email"**
3. O usuário receberá um email para criar nova senha

---

## 🧪 Credenciais de Teste Sugeridas

Após resetar a senha:

**Funcionário:**
- Email: `vendas2@qualitec.ind.br`
- Senha: `teste123`
- Acesso: `/employee`

**Admin:**
- Email: `silvana@qualitec.ind.br`
- Senha: `qualitec25`
- Acesso: `/admin`

---

## 📝 Vincular Usuário ao Colaborador

Se o usuário ainda não estiver vinculado ao colaborador, execute no SQL Editor:

```sql
-- Ver colaboradores disponíveis
SELECT id, nome, email_corporativo FROM colaboradores WHERE status = 'Ativo';

-- Vincular usuário ao colaborador
UPDATE app_users 
SET colaborador_id = '616f-4709-9069-54cfd46d6a38' -- ID do Samuel
WHERE email = 'vendas2@qualitec.ind.br';
```

---

## ✅ Testar o Sistema

1. **Logout** se estiver logado
2. Acesse `http://localhost:3000/login`
3. Entre com as credenciais do funcionário
4. Você será redirecionado para `/employee`
5. Teste as funcionalidades:
   - Bater ponto
   - Criar solicitação
   - Ver documentos
   - Ler comunicados

---

## 🆘 Problemas Comuns

### "Usuário não vinculado a um colaborador"
Execute o SQL de vinculação acima.

### "Email ou senha incorretos"
Resete a senha pelo Dashboard.

### "Acesso negado"
Verifique se o usuário tem `role = 'funcionario'` em `app_users`.

---

## 🎯 Resumo Rápido

1. Vá no Supabase Dashboard > Authentication > Users
2. Encontre **vendas2@qualitec.ind.br**
3. Reset Password > `teste123`
4. Faça login no sistema
5. Pronto! ✅
