# 🚨 CORREÇÃO URGENTE - Vercel Environment Variables

## ❌ **PROBLEMA IDENTIFICADO:**
O Vercel está procurando por `nuxt_secret_key` mas a variável está definida como `NUXT_SECRET_KEY`.

## ✅ **SOLUÇÃO IMEDIATA:**

### 1. **Acesse o Painel do Vercel AGORA:**
- https://vercel.com/dashboard
- Clique no seu projeto RH Qualitec
- Vá para Settings → Environment Variables

### 2. **Adicione EXATAMENTE esta variável:**
```
Name: NUXT_SECRET_KEY
Value: qualitec-rh-system-2025-super-secret-key-production-ready
Environment: Production, Preview, Development
```

### 3. **Verifique se TODAS estas variáveis estão configuradas:**

#### **OBRIGATÓRIAS (sem elas o deploy falha):**
```
NUXT_SECRET_KEY = qualitec-rh-system-2025-super-secret-key-production-ready
NUXT_PUBLIC_SUPABASE_URL = https://utuxefswedolrninwgvs.supabase.co
NUXT_PUBLIC_SUPABASE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dXhlZnN3ZWRvbHJuaW53Z3ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNDU0NTUsImV4cCI6MjA3OTcyMTQ1NX0.xw6H-wfmp5sTK3sc3bh5ur3G7BCQu9DQoZ8JXrfmdIc
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dXhlZnN3ZWRvbHJuaW53Z3ZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE0NTQ1NSwiZXhwIjoyMDc5NzIxNDU1fQ.ueegTMvgk9IRULnZl0W_EJMnnjMk-YCicok7sRAnZyA
```

#### **OPCIONAIS (para email):**
```
GMAIL_EMAIL = qualitecinstrumentosdemedicao@gmail.com
GMAIL_APP_PASSWORD = byeqpdyllakkwxkk
EMAIL_JOBS_TOKEN = sk_live_qualitec_email_jobs_2024
```

### 4. **Após adicionar as variáveis:**
- Clique em "Save"
- Vá para a aba "Deployments"
- Clique nos 3 pontinhos do último deploy
- Clique em "Redeploy"

## ⚡ **AÇÃO IMEDIATA NECESSÁRIA:**
Configure a `NUXT_SECRET_KEY` no Vercel AGORA para resolver o erro de deploy!

---

**Status**: 🔴 **CRÍTICO** - Deploy falhando  
**Ação**: 🚨 **URGENTE** - Configurar variável no Vercel