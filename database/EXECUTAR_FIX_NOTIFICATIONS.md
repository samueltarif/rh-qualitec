# CORRIGIR ERRO DE NOTIFICATIONS

## Problema
Ao aprovar alteração de dados, aparece erro: `column "dados_extras" of relation "notifications" does not exist`

## Solução

### 1. Execute o script de diagnóstico

Abra o **SQL Editor** no Supabase e execute:
```
database/fixes/fix_notifications_trigger.sql
```

Este script vai:
- Verificar se a tabela `notifications` existe
- Adicionar a coluna `dados_extras` se necessário
- Listar triggers que podem estar causando o problema

### 2. Após executar, verifique o resultado

Se o script mostrar que adicionou a coluna, teste novamente a aprovação.

### 3. Se ainda houver erro

Execute este comando para desabilitar temporariamente triggers de notificação:

```sql
-- Desabilitar triggers de notificação em solicitacoes_alteracao_dados
DO $$
DECLARE
  trigger_rec RECORD;
BEGIN
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'solicitacoes_alteracao_dados'::regclass
    AND tgname LIKE '%notif%'
  LOOP
    EXECUTE format('ALTER TABLE solicitacoes_alteracao_dados DISABLE TRIGGER %I', trigger_rec.tgname);
    RAISE NOTICE 'Trigger % desabilitado', trigger_rec.tgname;
  END LOOP;
END $$;
```

### 4. Teste novamente

Após executar os scripts, tente aprovar a alteração de dados novamente.
