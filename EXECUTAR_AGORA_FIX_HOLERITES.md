# 🚨 SOLUÇÃO: Holerites não aparecem no perfil do usuário

## 🔍 PROBLEMA IDENTIFICADO

Nas imagens você pode ver que:
- ✅ As políticas RLS estão corretas (usam `colaborador_id`)
- ❌ O campo `colaborador_id` está **NULL** em `app_users`
- ❌ Por isso os holerites não aparecem para os funcionários

## 📋 SOLUÇÃO EM 2 PASSOS

### PASSO 1: Executar Diagnóstico
```sql
-- Copie e cole no SQL Editor do Supabase:
-- Arquivo: nuxt-app/database/DIAGNOSTICO_HOLERITES_USUARIO.sql
```

Isso vai mostrar:
- Quais usuários têm `colaborador_id` NULL
- Quantos holerites existem
- Se as políticas RLS estão corretas

### PASSO 2: Executar Correção
```sql
-- Copie e cole no SQL Editor do Supabase:
-- Arquivo: nuxt-app/database/FIX_HOLERITES_USUARIO.sql
```

Isso vai:
1. Garantir que a coluna `colaborador_id` existe
2. Sincronizar os vínculos por email
3. Sincronizar os vínculos por user_id (fallback)
4. Recriar as políticas RLS corretas
5. Mostrar resultado final

## ✅ RESULTADO ESPERADO

Após executar o FIX, você verá:
```
✅ Sincronização concluída
usuario | email | colaborador_id | total_holerites
Samuel  | samuel@... | [UUID] | 5
Silvana | silvana@... | [UUID] | 3
```

## 🎯 TESTAR

1. Faça login como funcionário (ex: samuel@qualitec.ind.br)
2. Acesse `/employee`
3. Clique na aba "Holerites"
4. Os holerites devem aparecer agora! 🎉

## 📝 CAUSA RAIZ

O sistema tinha duas formas de relacionamento:
- **Antiga**: `colaboradores.user_id` → `app_users.id`
- **Nova**: `app_users.colaborador_id` → `colaboradores.id`

A migration 13 adicionou `colaborador_id`, mas não sincronizou os dados existentes.
O FIX faz essa sincronização automaticamente.

## 🔧 ARQUIVOS ENVOLVIDOS

- `nuxt-app/database/DIAGNOSTICO_HOLERITES_USUARIO.sql` - Diagnóstico
- `nuxt-app/database/FIX_HOLERITES_USUARIO.sql` - Correção
- `supabase/migrations/13_ajustes_holerite_colaborador.sql` - Migration que adicionou o campo

---

**Execute o FIX agora e os holerites vão aparecer!** 🚀
