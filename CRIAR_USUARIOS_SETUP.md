# Setup para Criar Usuários

## Problema
A criação de usuários usa `supabase.auth.admin.createUser()` que requer permissões de administrador.

## Solução

### 1. Configurar Service Role Key no .env

No arquivo `.env`, você precisa adicionar a **Service Role Key** (não a anon key):

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_KEY=sua-service-role-key-aqui
```

### 2. Onde encontrar a Service Role Key

1. Acesse o Supabase Dashboard
2. Vá em **Settings** > **API**
3. Copie a **service_role** key (não a anon key!)
4. ⚠️ **IMPORTANTE**: Nunca exponha essa chave no frontend!

### 3. Usar a Service Role Key no servidor

Como estamos usando no cliente (não ideal), você tem duas opções:

#### Opção A: Criar um endpoint de API (RECOMENDADO)

Criar um endpoint `/api/users/create.post.ts`:

```typescript
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  
  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey // Service role key do servidor
  )
  
  // Criar usuário com permissões admin
  const { data, error } = await supabase.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
  })
  
  // ... resto do código
})
```

#### Opção B: Usar a service key diretamente (NÃO RECOMENDADO para produção)

Apenas para desenvolvimento/testes, você pode usar a service key no cliente, mas isso é um risco de segurança.

## Alternativa Simples

Se não quiser usar service role key, você pode:

1. Criar usuários manualmente no Supabase Dashboard
2. Ou usar a função de "Convidar usuário" que envia um email de convite

## Status Atual

✅ Modal de criação implementado
✅ Composable com função createUser
⚠️ Requer configuração da service role key ou endpoint de API
