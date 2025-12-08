# ⚠️ ERRO: Migration 22 Não Executada

## 🔴 Problema Detectado

Você está tentando usar o sistema de Importação/Exportação, mas a **Migration 22 ainda não foi executada** no banco de dados.

## ✅ Solução Rápida (2 minutos)

### 1. Acesse o Supabase SQL Editor
```
https://supabase.com/dashboard/project/SEU_PROJECT_ID/sql
```

### 2. Execute a Migration
Copie TODO o conteúdo do arquivo:
```
nuxt-app/database/migrations/22_importacao_exportacao.sql
```

Cole no SQL Editor e clique em **RUN** ▶️

### 3. Verifique se funcionou
Execute esta query:
```sql
SELECT COUNT(*) FROM templates_importacao;
```

Deve retornar: **4** (templates padrão criados)

### 4. Recarregue a página
Após executar a migration, recarregue a página de Importação/Exportação.

## 📋 O que a Migration cria:

- ✅ 5 tabelas novas
- ✅ 4 templates pré-configurados
- ✅ Políticas de segurança (RLS)
- ✅ Índices para performance
- ✅ Configuração padrão

## 🆘 Ainda com erro?

1. Verifique se você tem permissões de admin no Supabase
2. Confirme que está no projeto correto
3. Veja os logs de erro no console do Supabase
4. Execute as queries de verificação em `EXECUTAR_MIGRATION_22.md`

---

**Arquivo da Migration**: `database/migrations/22_importacao_exportacao.sql`  
**Instruções Completas**: `database/migrations/EXECUTAR_MIGRATION_22.md`
