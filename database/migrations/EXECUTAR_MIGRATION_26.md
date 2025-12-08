# Executar Migration 26 - Sistema de Log de Atividades

Execute este SQL no Supabase SQL Editor:

```sql
-- Copie e cole o conteúdo do arquivo: 26_log_atividades.sql
```

Esta migration cria:
- ✅ Tabela `log_atividades` para registrar todas as ações
- ✅ View `vw_atividades_recentes` com informações dos usuários
- ✅ Função `fn_registrar_atividade()` para facilitar o registro
- ✅ Trigger automático para registrar logins
- ✅ Políticas RLS apropriadas

Após executar, o sistema começará a registrar automaticamente todas as atividades dos usuários.
