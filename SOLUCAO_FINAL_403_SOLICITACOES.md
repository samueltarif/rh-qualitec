# 🚨 SOLUÇÃO FINAL: Erro 403 em Alterações de Dados

## Problema
```
PUT http://localhost:3000/api/admin/alteracoes-dados/[id] 403 (Server Error)
```

Silvana (admin) não consegue aprovar/rejeitar alterações mesmo após executar os scripts de RLS.

## 🎯 Soluções (em ordem de preferência)

### Solução 1: Fix Cirúrgico (RECOMENDADO) ✅

Execute o arquivo: `nuxt-app/database/FIX_CIRURGICO_RLS_SOLICITACOES.sql`

Este script:
- Remove todas as políticas antigas
- Cria 1 política simples para admins (todas operações)
- Cria 2 políticas para funcionários (SELECT e INSERT)
- Testa se Silvana está autenticada corretamente

**Depois de executar:**
1. Faça logout
2. Faça login novamente
3. Teste aprovar uma alteração

---

### Solução 2: Desabilitar RLS (SE SOLUÇÃO 1 NÃO FUNCIONAR) ⚡

Execute o arquivo: `nuxt-app/database/FIX_DEFINITIVO_403_SOLICITACOES.sql`

Este script desabilita completamente o RLS na tabela `solicitacoes_alteracao_dados`.

**Atenção:** Isso remove a segurança de linha, mas resolve o problema imediatamente.

---

## 🔍 Diagnóstico

Se nenhuma solução funcionar, o problema pode ser:

### 1. Silvana não está como admin
Execute no Supabase:
```sql
SELECT id, nome, email, role, auth_uid 
FROM app_users 
WHERE email ILIKE '%silvana%';
```

Se `role` não for `'admin'`, execute:
```sql
UPDATE app_users 
SET role = 'admin', ativo = true
WHERE email = 'silvana@qualitec.com.br';
```

### 2. auth_uid não está correto
O `auth_uid` deve corresponder ao ID do usuário no Supabase Auth.

Execute:
```sql
-- Ver auth_uid atual
SELECT auth.uid();

-- Ver auth_uid de Silvana
SELECT auth_uid FROM app_users WHERE email ILIKE '%silvana%';
```

Se forem diferentes, atualize:
```sql
UPDATE app_users 
SET auth_uid = auth.uid()
WHERE email = 'silvana@qualitec.com.br';
```

### 3. Sessão desatualizada
- Faça logout completo
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Faça login novamente

---

## 📝 Checklist

- [ ] Executei `FIX_CIRURGICO_RLS_SOLICITACOES.sql`
- [ ] Verifiquei que Silvana é admin
- [ ] Fiz logout e login novamente
- [ ] Limpei o cache do navegador
- [ ] Testei aprovar uma alteração

Se ainda não funcionar:
- [ ] Executei `FIX_DEFINITIVO_403_SOLICITACOES.sql` (desabilita RLS)
- [ ] Reiniciei o servidor Nuxt (Ctrl+C e npm run dev)

---

## 🎬 Teste Rápido

Após executar os scripts, teste com este comando no console do navegador:

```javascript
// Verificar se está autenticado
const { data: { user } } = await $fetch('/api/auth/user')
console.log('Usuário:', user)

// Tentar aprovar
await $fetch('/api/admin/alteracoes-dados/SEU_ID_AQUI', {
  method: 'PUT',
  body: { acao: 'aprovar' }
})
```

Se der erro, copie a mensagem completa e me envie.
