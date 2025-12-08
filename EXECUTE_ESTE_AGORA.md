# 🚨 EXECUTE ESTE SCRIPT AGORA

## Passo 1: Deletar Tabela Incompleta

Copie e execute este SQL no Supabase:

```sql
-- Deletar tabela incompleta
DROP TABLE IF EXISTS templates_email CASCADE;
DROP TABLE IF EXISTS configuracoes_smtp CASCADE;
DROP TABLE IF EXISTS historico_emails CASCADE;
DROP TABLE IF EXISTS fila_emails CASCADE;
DROP TABLE IF EXISTS configuracoes_comunicacao CASCADE;
```

## Passo 2: Criar Tabelas Corretas

Depois, copie e execute TODO o conteúdo do arquivo:
```
database/migrations/20_email_comunicacao.sql
```

## ✅ Pronto!

Depois volte para `/configuracoes/email` e salve as configurações SMTP.
