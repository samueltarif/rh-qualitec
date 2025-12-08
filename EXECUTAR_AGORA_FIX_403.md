# ⚡ EXECUTAR AGORA: Fix Erro 403 Holerites

## 🎯 Solução Rápida (2 minutos)

### 1️⃣ Abra o Supabase SQL Editor

1. Vá para: https://supabase.com/dashboard
2. Selecione seu projeto
3. Clique em **SQL Editor** no menu lateral
4. Clique em **New query**

### 2️⃣ Cole e Execute Este Script

```sql
-- Criar/atualizar seu usuário como admin
INSERT INTO app_users (auth_uid, email, role, nome, ativo)
VALUES (
  auth.uid(),
  COALESCE(auth.email(), 'admin@qualitec.com'),
  'admin',
  'Administrador',
  true
)
ON CONFLICT (auth_uid) 
DO UPDATE SET 
  role = 'admin',
  ativo = true,
  updated_at = NOW();

-- Confirmar
SELECT 
  '✅ SUCESSO!' as status,
  email,
  role,
  ativo
FROM app_users 
WHERE auth_uid = auth.uid();
```

### 3️⃣ Verifique o Resultado

Você deve ver algo como:

| status | email | role | ativo |
|--------|-------|------|-------|
| ✅ SUCESSO! | seu@email.com | admin | true |

### 4️⃣ Faça Logout e Login

1. No sistema, clique no seu perfil
2. Clique em **Sair**
3. Faça login novamente

### 5️⃣ Teste Gerar Holerites

1. Vá em **Folha de Pagamento**
2. Clique em **Gerar Holerites**
3. Selecione mês/ano
4. Clique em **Gerar**
5. ✅ Deve funcionar!

## 🔍 Se Ainda Não Funcionar

### Verifique os Logs do Servidor

No terminal onde o Nuxt está rodando, você verá:

```
🔍 Verificando usuário: [seu-auth-uid]
👤 Dados do usuário: { id: '...', role: 'admin', email: '...' }
✅ Usuário autorizado: seu@email.com
```

Se aparecer:
- ❌ `Dados do usuário: null` → Execute o script SQL novamente
- ❌ `Seu perfil é: funcionario` → Execute o script SQL novamente
- ❌ `Usuário não encontrado` → Execute o script SQL novamente

### Script Alternativo (Se o Primeiro Não Funcionar)

```sql
-- Ver todos os usuários
SELECT * FROM app_users;

-- Atualizar TODOS para admin (temporário para teste)
UPDATE app_users SET role = 'admin', ativo = true;

-- Confirmar
SELECT email, role, ativo FROM app_users;
```

## 📞 Ainda com Problema?

Execute este diagnóstico completo:

```sql
-- 1. Seu auth.uid()
SELECT auth.uid();

-- 2. Seu usuário
SELECT * FROM app_users WHERE auth_uid = auth.uid();

-- 3. Políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'holerites';

-- 4. RLS habilitado?
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'holerites';
```

Copie os resultados e me envie para análise.

## ✅ Checklist Final

- [ ] Script SQL executado com sucesso
- [ ] Resultado mostra `role: admin` e `ativo: true`
- [ ] Logout e login realizados
- [ ] Logs do servidor mostram "✅ Usuário autorizado"
- [ ] Holerites gerados com sucesso!

---

**Tempo estimado:** 2-3 minutos
**Dificuldade:** Fácil
**Requer:** Acesso ao Supabase Dashboard
