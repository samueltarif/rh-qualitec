# ✅ Correção: Criar Usuários

## O que foi feito

Criei um **endpoint de API no servidor** (`/server/api/users/create.post.ts`) que usa a service role key de forma segura, sem expô-la no frontend.

## Como configurar

### 1. Adicione a Service Role Key no arquivo `.env`

Abra o arquivo `.env` e adicione (se ainda não tiver):

```env
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

### 2. Onde encontrar a Service Role Key

1. Acesse o **Supabase Dashboard**
2. Vá em **Settings** > **API**
3. Na seção **Project API keys**, copie a chave **service_role**
4. Cole no arquivo `.env`

### 3. Reinicie o servidor

Após adicionar a chave, reinicie o servidor Nuxt:

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

## Como funciona agora

1. Frontend chama `/api/users/create` (endpoint seguro)
2. Servidor usa a service role key (não exposta)
3. Cria usuário no Supabase Auth
4. Cria registro em `app_users`
5. Retorna sucesso ou erro

## Teste

1. Vá em **Usuários** no sistema
2. Clique em **Novo Usuário**
3. Preencha os dados:
   - Nome
   - Email
   - Senha (mínimo 6 caracteres)
   - Tipo de Acesso (Admin ou Funcionário)
   - Vincular a Colaborador (opcional)
4. Clique em **Criar Usuário**

✅ Deve funcionar agora!
