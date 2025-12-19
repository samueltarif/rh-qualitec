# 🔐 Configurar Variáveis de Ambiente no Vercel

## ⚠️ **AÇÃO URGENTE NECESSÁRIA**

O deploy está falhando porque falta a variável `NUXT_SECRET_KEY`. Siga os passos abaixo:

## 📋 **Passo a Passo:**

### 1. **Acesse o Painel do Vercel**
- Vá para: https://vercel.com/dashboard
- Clique no seu projeto RH Qualitec

### 2. **Vá para Settings → Environment Variables**
- Clique na aba "Settings"
- Clique em "Environment Variables"

### 3. **Adicione a Variável Faltante**
Adicione esta variável **OBRIGATÓRIA**:

```
Name: NUXT_SECRET_KEY
Value: qualitec-rh-system-2025-super-secret-key-production-ready
Environment: Production, Preview, Development
```

### 4. **Verifique Todas as Variáveis**
Certifique-se de que estas variáveis estão configuradas:

#### **Supabase (Obrigatórias)**
```
NUXT_PUBLIC_SUPABASE_URL = https://utuxefswedolrninwgvs.supabase.co
NUXT_PUBLIC_SUPABASE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dXhlZnN3ZWRvbHJuaW53Z3ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNDU0NTUsImV4cCI6MjA3OTcyMTQ1NX0.xw6H-wfmp5sTK3sc3bh5ur3G7BCQu9DQoZ8JXrfmdIc
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dXhlZnN3ZWRvbHJuaW53Z3ZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE0NTQ1NSwiZXhwIjoyMDc5NzIxNDU1fQ.ueegTMvgk9IRULnZl0W_EJMnnjMk-YCicok7sRAnZyA
```

#### **Gmail (Opcionais)**
```
GMAIL_EMAIL = qualitecinstrumentosdemedicao@gmail.com
GMAIL_APP_PASSWORD = byeqpdyllakkwxkk
EMAIL_JOBS_TOKEN = sk_live_qualitec_email_jobs_2024
```

### 5. **Redeploy**
Após adicionar as variáveis:
- Vá para a aba "Deployments"
- Clique nos 3 pontinhos do último deploy
- Clique em "Redeploy"

## 🎯 **Resultado Esperado**
Após configurar a `NUXT_SECRET_KEY`, o erro deve ser resolvido e o deploy deve funcionar.

## 🚨 **Se Ainda Houver Problemas**
1. Verifique se todas as variáveis estão com os nomes EXATOS
2. Certifique-se de que estão marcadas para "Production"
3. Aguarde alguns minutos após salvar antes de fazer redeploy

---

**⚡ AÇÃO IMEDIATA:** Configure a `NUXT_SECRET_KEY` no Vercel agora!