# 🔍 Troubleshooting: Log de Atividades Não Aparece

## Problema
Fiz alterações no perfil do funcionário mas as atividades não aparecem no widget do dashboard admin.

## ✅ Checklist de Diagnóstico

### 1. Verificar se a Migration 26 foi executada

Execute no Supabase SQL Editor:
```sql
-- Copie e cole o conteúdo de:
-- database/DIAGNOSTICO_LOG_ATIVIDADES.sql
```

**O que verificar:**
- ✅ `tabela_existe = true`
- ✅ `view_existe = true`
- ✅ `funcao_existe = true`

**Se algum for `false`:**
Execute a migration 26:
```sql
-- Copie e cole o conteúdo de:
-- database/fixes/fix_log_atividades_CORRETO.sql
```

### 2. Verificar se há registros na tabela

```sql
SELECT COUNT(*) FROM log_atividades;
```

**Se retornar 0:**
- A tabela existe mas não há registros
- Faça uma alteração no perfil do funcionário
- Execute novamente a query

### 3. Verificar se a view retorna dados

```sql
SELECT * FROM vw_atividades_recentes LIMIT 5;
```

**Se retornar erro ou vazio:**
- Pode haver problema com a view
- Execute o fix: `fix_log_atividades_CORRETO.sql`

### 4. Testar a função manualmente

```sql
SELECT fn_registrar_atividade(
  'create',
  'configuracoes',
  'Teste manual',
  '{"teste": true}'::jsonb
);
```

**Se retornar erro:**
- A função não está funcionando
- Execute o fix: `fix_log_atividades_CORRETO.sql`

**Se retornar UUID:**
- ✅ A função está OK
- Verifique se o registro apareceu:
```sql
SELECT * FROM vw_atividades_recentes 
WHERE descricao LIKE '%Teste manual%';
```

### 5. Verificar RLS (Row Level Security)

```sql
-- Ver políticas da tabela
SELECT * FROM pg_policies 
WHERE tablename = 'log_atividades';
```

**Deve ter 3 políticas:**
1. Admins podem ver todas atividades
2. Usuários podem ver suas atividades
3. Usuários podem inserir suas atividades

**Se não tiver:**
Execute o fix: `fix_log_atividades_CORRETO.sql`

### 6. Verificar se o usuário está autenticado corretamente

```sql
-- Ver seu user_id
SELECT id, nome, email FROM users WHERE auth_uid = auth.uid();
```

**Se retornar vazio:**
- Você não está autenticado corretamente
- Faça logout e login novamente

### 7. Verificar console do navegador

Abra o DevTools (F12) e vá em Console.

**Procure por erros:**
- `Erro ao buscar atividades`
- `Erro ao registrar atividade`
- Erros de RPC

**Se houver erros:**
- Anote a mensagem
- Pode ser problema de permissão RLS

### 8. Verificar Network do navegador

Abra o DevTools (F12) e vá em Network.

**Procure pela requisição:**
- `vw_atividades_recentes`

**Clique nela e veja:**
- Status: deve ser 200
- Response: deve ter dados

**Se Status for 401/403:**
- Problema de autenticação/permissão
- Verifique RLS

**Se Response estiver vazio:**
- Não há dados na tabela
- Faça uma alteração no perfil

### 9. Forçar recarregamento do widget

No dashboard admin:
1. Clique no botão de recarregar (🔄) no widget
2. Ou aguarde 30 segundos (auto-refresh)
3. Ou recarregue a página (F5)

### 10. Verificar se o endpoint está registrando

Faça uma alteração no perfil e veja o console do servidor:

**Procure por:**
- `Erro ao registrar atividade` (se houver erro)
- Nenhuma mensagem (se estiver OK)

**Se houver erro:**
- Anote a mensagem
- Pode ser problema com a função RPC

## 🔧 Soluções Rápidas

### Solução 1: Reexecutar Migration
```sql
-- Execute no Supabase SQL Editor:
-- database/fixes/fix_log_atividades_CORRETO.sql
```

### Solução 2: Inserir registro de teste
```sql
-- Inserir manualmente para testar
INSERT INTO log_atividades (user_id, tipo_acao, modulo, descricao)
SELECT id, 'create', 'configuracoes', 'Teste manual de atividade'
FROM users WHERE auth_uid = auth.uid();
```

Depois veja se aparece no widget.

### Solução 3: Verificar se está usando o usuário correto

No dashboard admin, você deve estar logado como:
- Admin ou Gestor (para ver todas as atividades)
- Funcionário (para ver apenas suas atividades)

### Solução 4: Limpar cache do navegador

1. Ctrl + Shift + Delete
2. Limpar cache
3. Recarregar página

## 📊 Teste Completo

Execute este teste completo:

```sql
-- 1. Inserir atividade de teste
SELECT fn_registrar_atividade(
  'create',
  'configuracoes',
  'TESTE COMPLETO - Se você vê isso, está funcionando!',
  '{"timestamp": NOW()}'::jsonb
);

-- 2. Ver se apareceu
SELECT * FROM vw_atividades_recentes 
WHERE descricao LIKE '%TESTE COMPLETO%'
LIMIT 1;
```

**Se aparecer:**
✅ O sistema está funcionando!
- Problema pode ser no frontend
- Recarregue o dashboard

**Se não aparecer:**
❌ Problema no banco de dados
- Execute o fix: `fix_log_atividades_CORRETO.sql`

## 🆘 Ainda não funciona?

Se após todos os passos ainda não funcionar:

1. **Verifique se executou a migration 26**
2. **Reinicie o servidor Nuxt**
3. **Faça logout e login novamente**
4. **Limpe o cache do navegador**
5. **Tente em uma aba anônima**

Se mesmo assim não funcionar, o problema pode ser:
- RLS muito restritivo
- Usuário não vinculado corretamente
- Função RPC com erro

Execute o diagnóstico completo e anote os resultados.
