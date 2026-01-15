# 🔑 Como Corrigir as Chaves do Supabase

## ❌ Problema Atual

```
"Invalid API key" - As chaves no .env estão incorretas
```

---

## ✅ Solução Passo a Passo

### 1️⃣ Acesse o Supabase Dashboard

1. Abra: **https://supabase.com/dashboard**
2. Faça login
3. Selecione o projeto: **rh-qualitec** (ou o nome do seu projeto)

---

### 2️⃣ Navegue até as Configurações de API

1. No menu lateral esquerdo, clique em **⚙️ Settings**
2. Clique em **API**

Você verá uma tela assim:

```
┌─────────────────────────────────────────────────┐
│  Project Settings > API                         │
├─────────────────────────────────────────────────┤
│                                                 │
│  Configuration                                  │
│  ─────────────                                  │
│                                                 │
│  Project URL                                    │
│  https://rqryspxfvfzfghrfqtbm.supabase.co     │
│  [Copy]                                         │
│                                                 │
│  Project API keys                               │
│  ─────────────────                              │
│                                                 │
│  anon public                                    │
│  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...       │
│  [Copy] [Reveal]                                │
│                                                 │
│  service_role                                   │
│  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...       │
│  [Copy] [Reveal]                                │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### 3️⃣ Copie as Chaves

Copie **EXATAMENTE** estas 3 informações:

#### A) Project URL
```
Exemplo: https://rqryspxfvfzfghrfqtbm.supabase.co
```

#### B) anon public key
```
Exemplo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxcnlzcHhmdmZ6ZmdocmZxdGJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMTY3NTksImV4cCI6MjA4MzU5Mjc1OX0.bptJ9j_zu151GLQO35kdvXOJzWaRL_7d0haRHKS3jDo
```

#### C) service_role key (⚠️ IMPORTANTE!)
```
Exemplo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxcnlzcHhmdmZ6ZmdocmZxdGJtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAxNjc1OSwiZXhwIjoyMDgzNTkyNzU5fQ._AQ67F_-Z9Cvfqv5_ZISgMDbYGRCk2P5wqK1JdFBYA4
```

---

### 4️⃣ Atualize o arquivo `.env`

Abra o arquivo `.env` na raiz do projeto e substitua:

```env
# Supabase Configuration
NUXT_PUBLIC_SUPABASE_URL=COLE_AQUI_O_PROJECT_URL
NUXT_PUBLIC_SUPABASE_KEY=COLE_AQUI_O_ANON_PUBLIC
SUPABASE_SERVICE_ROLE_KEY=COLE_AQUI_O_SERVICE_ROLE
SUPABASE_ANON_KEY=COLE_AQUI_O_ANON_PUBLIC_NOVAMENTE
SUPABASE_URL=COLE_AQUI_O_PROJECT_URL_NOVAMENTE
```

**Exemplo preenchido:**

```env
# Supabase Configuration
NUXT_PUBLIC_SUPABASE_URL=https://rqryspxfvfzfghrfqtbm.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxcnlzcHhmdmZ6ZmdocmZxdGJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMTY3NTksImV4cCI6MjA4MzU5Mjc1OX0.bptJ9j_zu151GLQO35kdvXOJzWaRL_7d0haRHKS3jDo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxcnlzcHhmdmZ6ZmdocmZxdGJtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAxNjc1OSwiZXhwIjoyMDgzNTkyNzU5fQ._AQ67F_-Z9Cvfqv5_ZISgMDbYGRCk2P5wqK1JdFBYA4
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxcnlzcHhmdmZ6ZmdocmZxdGJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMTY3NTksImV4cCI6MjA4MzU5Mjc1OX0.bptJ9j_zu151GLQO35kdvXOJzWaRL_7d0haRHKS3jDo
SUPABASE_URL=https://rqryspxfvfzfghrfqtbm.supabase.co
```

---

### 5️⃣ Reinicie o Servidor

Após atualizar o `.env`:

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

---

### 6️⃣ Teste Novamente

Acesse: **http://localhost:3001/api/test-supabase**

Agora deve mostrar:
```json
{
  "config": {
    "supabaseUrl": "✅ Configurado",
    "supabaseKey": "✅ Configurado",
    "serviceRoleKey": "✅ Configurado"
  },
  "tests": [
    {
      "test": "Conexão com Supabase",
      "status": "✅ OK",
      "statusCode": 200
    },
    ...
  ]
}
```

---

## ⚠️ Dicas Importantes

1. **Não compartilhe** a `service_role` key - ela tem acesso total ao banco!
2. **Copie as chaves completas** - elas são longas (começam com `eyJ...`)
3. **Não adicione espaços** antes ou depois das chaves
4. **Não adicione aspas** ao redor das chaves no `.env`

---

## 🆘 Se ainda não funcionar

Verifique:

1. ✅ As chaves foram copiadas **completas** (sem cortar no meio)
2. ✅ Não há **espaços** antes ou depois das chaves
3. ✅ O **Project URL** está correto (deve terminar com `.supabase.co`)
4. ✅ Você **reiniciou o servidor** após alterar o `.env`
5. ✅ Você está no **projeto correto** no Supabase Dashboard

---

## 📞 Precisa de Ajuda?

Me mostre:
1. O resultado de `http://localhost:3001/api/test-supabase` após corrigir
2. Se ainda der erro, tire um print da tela de API do Supabase (sem mostrar as chaves completas)
