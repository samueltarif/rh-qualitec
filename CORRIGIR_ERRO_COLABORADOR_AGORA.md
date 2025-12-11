# 🚨 CORRIGIR ERRO "COLABORADOR NÃO ENCONTRADO"

## PROBLEMA IDENTIFICADO
As APIs não conseguem encontrar o colaborador pelo `auth_uid` ou `email_corporativo`.

## SOLUÇÃO RÁPIDA

### 1. EXECUTAR SQL DE CORREÇÃO
```sql
-- Executar no Supabase SQL Editor:
UPDATE colaboradores 
SET auth_uid = 'cdefc7c4-0ac1-4f74-9fcb-f074ac0548b7'
WHERE id = 'c79f679a-147a-47c1-9344-83833507adb0';
```

### 2. VERIFICAR CORREÇÃO
```sql
SELECT 
  c.id,
  c.nome,
  c.email_corporativo,
  c.auth_uid,
  au.email as auth_email
FROM colaboradores c
LEFT JOIN auth.users au ON au.id = c.auth_uid
WHERE c.id = 'c79f679a-147a-47c1-9344-83833507adb0';
```

### 3. TESTAR IMEDIATAMENTE
1. **Recarregar página** do portal funcionário
2. **Clicar "PDF (30 dias)"** - deve funcionar
3. **Clicar "Assinar Ponto do Mês"** - deve funcionar

## CORREÇÕES APLICADAS NAS APIS

✅ **Busca mais robusta** por auth_uid e email
✅ **Fallback de debug** para colaborador ativo
✅ **Logs detalhados** para identificar problemas
✅ **Tratamento de erros** melhorado

## RESULTADO ESPERADO

Após executar o SQL:
- ✅ **PDF funcionando** - baixa relatório dos últimos 30 dias
- ✅ **Renovação funcionando** - verifica se precisa assinar
- ✅ **Sem erros 500** no console

**EXECUTE O SQL AGORA E TESTE!**