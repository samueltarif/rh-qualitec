# 🔧 CORREÇÃO - Problema de Autenticação no Ponto

## ❌ Erro Identificado

```
invalid input syntax for type uuid: "undefined"
```

**Causa:** O `user.id` está vindo como string `"undefined"` ao invés de um UUID válido. Isso significa que a **sessão do Supabase não está funcionando corretamente**.

## 🎯 Solução em 4 Passos

### PASSO 1: Verificar Usuários no Supabase

Execute no **Supabase SQL Editor**:
```
nuxt-app/database/VERIFICAR_AUTENTICACAO.sql
```

**O que verificar:**
1. ✅ Usuário existe em `auth.users`
2. ✅ Usuário existe em `app_users` com `auth_uid` correto
3. ✅ `app_users.colaborador_id` está preenchido
4. ✅ Colaborador tem `empresa_id`

### PASSO 2: Criar Vínculo se Necessário

Se o usuário existe em `auth.users` mas NÃO em `app_users`:

```sql
-- 1. Ver usuários sem vínculo
SELECT 
  au.id as auth_uid,
  au.email
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM app_users WHERE auth_uid = au.id
);

-- 2. Criar registro em app_users
INSERT INTO app_users (auth_uid, role, colaborador_id)
VALUES (
  'UUID_DO_AUTH_USER',  -- ID do auth.users
  'funcionario',         -- ou 'admin'
  'UUID_DO_COLABORADOR' -- ID do colaborador (se houver)
)
RETURNING *;
```

### PASSO 3: Limpar Cache e Fazer Logout/Login

1. **No navegador:**
   - Abra DevTools (F12)
   - Vá em Application → Storage → Clear site data
   - Ou simplesmente: Ctrl+Shift+Delete → Limpar tudo

2. **Fazer logout e login novamente:**
   - Logout do sistema
   - Login novamente
   - Isso vai criar uma nova sessão válida

### PASSO 4: Reiniciar Servidor e Testar

```bash
# Parar servidor (Ctrl+C)
# Iniciar novamente
cd nuxt-app
npm run dev
```

Agora teste:
1. Login no sistema
2. Tentar registrar ponto
3. Ver logs no terminal

## 🔍 Logs Esperados

**✅ Sucesso (user.id válido):**
```
🔍 [PONTO] User object: { id: 'abc-123-def-456', email: 'user@example.com' }
🔍 [PONTO] User ID type: string
🔍 [PONTO] User ID value: abc-123-def-456
🔍 [PONTO] Iniciando registro de ponto
```

**❌ Erro (user.id undefined):**
```
🔍 [PONTO] User object: { id: undefined }
🔍 [PONTO] User ID type: undefined
❌ [PONTO] Usuário não autenticado ou sem ID
```

## 🛠️ Correções Adicionais

### Se o problema persistir: Verificar .env

Verifique se as variáveis estão corretas:

```env
NUXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

### Verificar se o Supabase está configurado corretamente

Execute no terminal:
```bash
cd nuxt-app
npm list @nuxtjs/supabase
```

Deve mostrar a versão instalada. Se não estiver instalado:
```bash
npm install @nuxtjs/supabase
```

### Testar autenticação manualmente

Crie um arquivo de teste: `nuxt-app/server/api/test-auth.get.ts`

```typescript
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  
  return {
    authenticated: !!user,
    user: user ? {
      id: user.id,
      email: user.email,
      id_type: typeof user.id
    } : null
  }
})
```

Depois acesse: `http://localhost:3000/api/test-auth`

Deve retornar:
```json
{
  "authenticated": true,
  "user": {
    "id": "uuid-valido-aqui",
    "email": "user@example.com",
    "id_type": "string"
  }
}
```

## ✅ Checklist

- [ ] PASSO 1: Usuários verificados no Supabase
- [ ] PASSO 2: Vínculos criados (se necessário)
- [ ] PASSO 3: Cache limpo + Logout/Login
- [ ] PASSO 4: Servidor reiniciado
- [ ] Teste de autenticação OK
- [ ] Registro de ponto funcionando

## 🆘 Se Nada Funcionar

Envie:
1. Resultado do SQL do PASSO 1
2. Conteúdo do arquivo `.env` (SEM as chaves secretas, apenas confirme que existem)
3. Logs completos do terminal após reiniciar
4. Resultado do endpoint `/api/test-auth`
