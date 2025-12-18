# 🚨 EXECUTAR AGORA - Fix Assinatura Digital

## ❌ Problema Crítico
Colaboradores não conseguem assinar ponto digitalmente devido a erro 404:
- API não encontra colaborador
- Vínculos entre `app_users` e `colaboradores` estão quebrados

## ✅ Solução Imediata

### 1. Abra o Supabase Dashboard
- Vá para: https://supabase.com/dashboard
- Acesse o projeto Qualitec
- Vá em SQL Editor

### 2. Execute este SQL (COPIE E COLE):

```sql
-- Corrigir vínculos para assinatura digital
UPDATE colaboradores 
SET auth_uid = app_users.auth_uid
FROM app_users 
WHERE colaboradores.email_corporativo = app_users.email 
  AND colaboradores.auth_uid IS NULL
  AND app_users.auth_uid IS NOT NULL;

-- Vincular por nome se email não bateu
UPDATE colaboradores 
SET auth_uid = app_users.auth_uid
FROM app_users 
WHERE UPPER(colaboradores.nome) = UPPER(app_users.nome)
  AND colaboradores.auth_uid IS NULL
  AND app_users.auth_uid IS NOT NULL;

-- Verificar resultado
SELECT 
  c.nome,
  c.email_corporativo,
  CASE 
    WHEN c.auth_uid IS NOT NULL THEN '✅ VINCULADO'
    ELSE '❌ SEM VÍNCULO'
  END as status
FROM colaboradores c
WHERE c.status = 'Ativo'
ORDER BY c.nome;
```

### 3. Resultado Esperado
Todos os colaboradores ativos devem aparecer como "✅ VINCULADO"

## 🧪 Teste Imediato
1. Faça login como funcionário (ex: CORINTHIANS)
2. Vá para a aba "Ponto"
3. Clique em "Assinar Digitalmente"
4. ✅ Deve funcionar sem erro 404

## 📋 Status
- ✅ API corrigida (busca mais robusta)
- ⏳ Aguardando execução do SQL
- ⏳ Teste pendente

**EXECUTE O SQL AGORA PARA RESOLVER O PROBLEMA!**