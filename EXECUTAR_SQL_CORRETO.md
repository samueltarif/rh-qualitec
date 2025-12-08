# ✅ Execute Este SQL Correto no Supabase

## 🎯 Arquivo Correto

Use este arquivo: **`20_email_comunicacao_COPIAR_ESTE.sql`**

Este arquivo está **100% correto** e **sem erros**!

## 📋 Passo a Passo

### 1. Abra o Arquivo Correto
```
nuxt-app/database/migrations/20_email_comunicacao_COPIAR_ESTE.sql
```

### 2. Copie TODO o Conteúdo
- Selecione TUDO (Ctrl+A)
- Copie (Ctrl+C)

### 3. Acesse o Supabase
1. Vá para: https://supabase.com/dashboard
2. Selecione seu projeto
3. Clique em **"SQL Editor"**

### 4. Cole e Execute
1. Clique em **"New Query"**
2. Cole o SQL (Ctrl+V)
3. Clique em **"Run"** ou pressione **Ctrl+Enter**

### 5. Aguarde
Você verá:
```
Success. No rows returned
```

Isso é **NORMAL**! ✅

### 6. Verifique
Execute esta query:

```sql
SELECT COUNT(*) as total_tabelas
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'configuracoes_smtp',
  'templates_email',
  'historico_emails',
  'fila_emails',
  'configuracoes_comunicacao'
);
```

**Resultado esperado:** `total_tabelas: 5`

### 7. Verifique os Templates
```sql
SELECT codigo, nome FROM templates_email;
```

**Resultado esperado:** 5 templates listados

## ✅ Pronto!

Agora volte para `/configuracoes/email` e:
1. Preencha os dados do SMTP
2. Clique em "Salvar Configurações"
3. Deve funcionar perfeitamente! 🎉

---

## 🔍 Diferença do Arquivo Correto

O arquivo correto usa:
```sql
DO $$
DECLARE
    v_empresa_id UUID;
BEGIN
    SELECT id INTO v_empresa_id FROM empresa LIMIT 1;
    ...
END $$;
```

Isso evita o erro "column categoria does not exist"!

---

## 🆘 Se Ainda Houver Erro

1. **Certifique-se** de copiar o arquivo `20_email_comunicacao_COPIAR_ESTE.sql`
2. **NÃO** use o arquivo `20_email_comunicacao.sql` antigo
3. Copie **TODO** o conteúdo, do início ao fim
4. Execute no Supabase SQL Editor

---

**Arquivo correto:** `20_email_comunicacao_COPIAR_ESTE.sql` ✅
