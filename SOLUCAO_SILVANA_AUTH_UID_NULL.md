# 🎯 SOLUÇÃO: Silvana com auth_uid NULL

## Problema Identificado ✅
Silvana tem `auth_uid = NULL` na tabela `app_users`.

Por isso as políticas RLS não conseguem identificá-la como admin!

## Solução em 2 Passos

### Passo 1: Descobrir o auth_uid correto de Silvana

1. **Abra o Supabase Dashboard**
2. **Vá em:** Authentication → Users
3. **Procure por:** silvana@qualitec.ind.br
4. **Copie o UUID** (ID do usuário) - algo como: `a932bb8a-ee89-4d48-b2af-fae6c0545886`

### Passo 2: Atualizar o auth_uid

Execute no SQL Editor do Supabase:

```sql
UPDATE app_users
SET auth_uid = 'COLE_O_UUID_AQUI'
WHERE id = 'bb055400-5486-4464-9198-66ea33e166b7';
```

**Substitua** `'COLE_O_UUID_AQUI'` pelo UUID que você copiou no Passo 1.

### Passo 3: Verificar

Execute para confirmar:

```sql
SELECT id, nome, email, auth_uid, role
FROM app_users
WHERE id = 'bb055400-5486-4464-9198-66ea33e166b7';
```

O `auth_uid` deve estar preenchido agora!

### Passo 4: Testar

1. Faça logout de Silvana
2. Faça login novamente
3. Tente aprovar uma alteração de dados
4. Deve funcionar! ✅

---

## Alternativa Rápida (se estiver logado como Silvana)

Se você está logado como Silvana AGORA, execute:

```sql
UPDATE app_users
SET auth_uid = auth.uid()
WHERE id = 'bb055400-5486-4464-9198-66ea33e166b7';
```

Isso pega automaticamente o auth_uid da sessão atual.

---

## Por que isso aconteceu?

Provavelmente Silvana foi criada manualmente no banco sem vincular ao usuário do Supabase Auth. O campo `auth_uid` ficou NULL, impedindo que as políticas RLS a reconhecessem.

Agora, com o `auth_uid` preenchido, as políticas RLS vão funcionar corretamente!
