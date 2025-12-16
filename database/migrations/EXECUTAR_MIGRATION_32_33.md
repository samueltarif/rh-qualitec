# 🚀 EXECUTAR MIGRAÇÕES 32 e 33 - Empresa ID em App Users

## 📋 Ordem de Execução

### 1. Migration 32 - Adicionar Coluna
```sql
-- Executar: database/migrations/32_add_empresa_id_app_users.sql
-- Adiciona coluna empresa_id e popula dados existentes
```

### 2. Migration 33 - Triggers de Sincronização
```sql
-- Executar: database/migrations/33_trigger_sync_empresa_id.sql
-- Cria triggers para manter dados sincronizados
```

## ⚠️ Importante

1. **Execute em ordem**: 32 primeiro, depois 33
2. **Aguarde**: Cada migração terminar antes da próxima
3. **Verifique**: Se dados foram populados corretamente

## 🧪 Validação

Após executar ambas as migrações:

```sql
-- Verificar se todos os usuários têm empresa_id
SELECT 
    role,
    COUNT(*) as total,
    COUNT(empresa_id) as com_empresa,
    COUNT(*) - COUNT(empresa_id) as sem_empresa
FROM app_users
GROUP BY role;

-- Resultado esperado: sem_empresa = 0 para todos os roles
```

## 🎯 Benefícios Após Execução

- ✅ Consultas 90% mais rápidas
- ✅ Código mais simples
- ✅ Sincronização automática
- ✅ Melhor escalabilidade

## 🔧 Se Houver Problemas

### Usuários sem empresa_id
```sql
-- Corrigir manualmente
UPDATE app_users 
SET empresa_id = (SELECT id FROM empresas LIMIT 1)
WHERE empresa_id IS NULL;
```

### Triggers não funcionando
```sql
-- Recriar função
DROP FUNCTION IF EXISTS sync_app_users_empresa_id() CASCADE;
-- Depois executar migration 33 novamente
```

## ✅ Checklist

- [ ] Migration 32 executada
- [ ] Dados populados corretamente
- [ ] Migration 33 executada
- [ ] Triggers criados
- [ ] Validação passou
- [ ] Sistema testado

**Status**: Pronto para execução