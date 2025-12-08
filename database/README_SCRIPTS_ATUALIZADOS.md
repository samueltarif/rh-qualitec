# 📚 Guia de Scripts SQL - Pós-Migração UUID

## 🎯 Scripts Principais (USE ESTES!)

### Sincronização de Nomes
✅ **`SINCRONIZAR_NOMES_DEFINITIVO.sql`**
- Sincroniza nomes entre colaboradores e app_users
- Usa vínculo direto por ID (UUID)
- **Este é o script correto pós-migração**

✅ **`TRIGGER_SINCRONIZACAO_ATUALIZADO.sql`**
- Cria trigger automático de sincronização
- Versão simplificada que usa UUID
- Remove triggers antigos baseados em email

### Verificação e Diagnóstico
✅ **`VERIFICAR_MIGRACAO_UUID.sql`**
- Verifica integridade da migração
- Confirma que IDs estão unificados
- Mostra estatísticas do sistema

✅ **`MARCAR_SCRIPTS_OBSOLETOS.sql`**
- Identifica objetos obsoletos no banco
- Lista triggers e funções antigas
- Recomenda limpezas

### Migração (JÁ EXECUTADO)
✅ **`MIGRACAO_UNIFICAR_IDS_FINAL.sql`**
- Script principal de migração UUID
- **Já foi executado com sucesso**
- Não executar novamente!

✅ **`RECRIAR_RLS_VIEWS_POS_MIGRACAO.sql`**
- Recria RLS policies e views
- Executar após migração
- Necessário para segurança

---

## ⚠️ Scripts Obsoletos (NÃO USE!)

### ❌ Sincronização por Email (OBSOLETO)
- `SINCRONIZAR_NOMES_POR_EMAIL.sql` - Usa JOIN por email
- `CORRIGIR_VINCULOS_POR_EMAIL.sql` - Tenta vincular por email
- `SINCRONIZAR_TODOS_NOMES_AGORA.sql` - Lógica antiga
- `fixes/fix_sincronizar_nomes_colaboradores_usuarios.sql` - Trigger antigo

**Por que obsoletos?**
Agora `colaboradores.id = app_users.id` (mesmo UUID), não precisamos mais vincular por email!

---

## 📋 Quando Usar Cada Script

### Situação 1: Nomes Desincronizados
```sql
-- Execute:
\i SINCRONIZAR_NOMES_DEFINITIVO.sql
```

### Situação 2: Criar Sincronização Automática
```sql
-- Execute:
\i TRIGGER_SINCRONIZACAO_ATUALIZADO.sql
```

### Situação 3: Verificar Integridade
```sql
-- Execute:
\i VERIFICAR_MIGRACAO_UUID.sql
```

### Situação 4: Limpar Objetos Antigos
```sql
-- Execute:
\i MARCAR_SCRIPTS_OBSOLETOS.sql
-- Depois remova manualmente os objetos listados
```

---

## 🔧 Manutenção Periódica

### Semanal
- Executar `VERIFICAR_MIGRACAO_UUID.sql`
- Verificar se nomes estão sincronizados

### Mensal
- Executar `MARCAR_SCRIPTS_OBSOLETOS.sql`
- Limpar objetos desnecessários

### Após Mudanças
- Se alterar estrutura de colaboradores
- Executar verificação de integridade

---

## 🚨 Troubleshooting

### Problema: Nomes diferentes entre tabelas
**Solução:**
```sql
\i SINCRONIZAR_NOMES_DEFINITIVO.sql
```

### Problema: Trigger não funciona
**Solução:**
```sql
\i TRIGGER_SINCRONIZACAO_ATUALIZADO.sql
```

### Problema: Erro de foreign key
**Solução:**
```sql
\i RECRIAR_RLS_VIEWS_POS_MIGRACAO.sql
```

---

## 📊 Estrutura Atual

```
colaboradores
├── id (UUID) ← PRIMARY KEY
├── nome
└── email_pessoal

app_users
├── id (UUID) ← PRIMARY KEY (mesmo de colaboradores!)
├── nome (sincronizado automaticamente)
└── email

Vínculo: colaboradores.id = app_users.id ✅
```

---

## ✅ Checklist de Validação

Após executar scripts, verifique:

- [ ] `colaboradores.id` é UUID
- [ ] `app_users.id` é UUID
- [ ] IDs são iguais entre as tabelas
- [ ] Nomes estão sincronizados
- [ ] Trigger de sincronização existe
- [ ] Foreign keys estão corretas
- [ ] RLS policies estão ativas

---

## 📞 Suporte

Se encontrar problemas:

1. Execute `VERIFICAR_MIGRACAO_UUID.sql`
2. Verifique o resultado
3. Execute o script de correção apropriado
4. Se persistir, verifique logs do Supabase

---

**Última atualização:** Dezembro 2024
**Versão do banco:** Pós-Migração UUID
