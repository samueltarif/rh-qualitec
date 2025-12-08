# Correção: Erro ao Registrar Ponto (Funcionário)

## Erro Identificado
```
[POST] "/api/funcionario/ponto/registrar": 400 Server Error
column app_users.empresa_id does not exist
```

## Problemas Encontrados

### 1. ✅ Código tentava buscar coluna inexistente
**Problema:** O código tentava buscar `empresa_id` da tabela `app_users`, mas essa coluna não existe.

**Solução:** Código já foi corrigido para buscar `empresa_id` apenas da tabela `colaboradores`.

### 2. ⚠️ Faltam Políticas RLS
**Problema:** A tabela `registros_ponto` tem RLS habilitado, mas não tem políticas para funcionários.

**Solução:** Execute o script SQL de correção.

## Como Corrigir

### Passo 1: Executar Script SQL
Execute o arquivo: `database/fixes/fix_rls_registros_ponto.sql`

**Via Supabase Dashboard:**
1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Copie e cole o conteúdo do arquivo
4. Clique em **Run**

### Passo 2: Reiniciar o Servidor (se necessário)
O código já foi corrigido automaticamente. Se o servidor não recarregou:
```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

### Passo 3: Testar
1. Faça login como funcionário
2. Acesse a área de ponto
3. Clique em "Registrar Ponto"
4. Deve funcionar sem erros

## Verificação Rápida

### Verificar se as políticas foram criadas
Execute no SQL Editor do Supabase:
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'registros_ponto';
```

Deve retornar 5 políticas:
- `service_role_ponto`
- `funcionarios_view_own_ponto`
- `funcionarios_insert_own_ponto`
- `funcionarios_update_own_ponto`
- `admins_all_ponto`

## Resumo das Alterações

### Arquivo Modificado
- `server/api/funcionario/ponto/registrar.post.ts` - Removida busca de `empresa_id` de `app_users`

### Arquivos Criados
- `database/fixes/fix_rls_registros_ponto.sql` - Script de correção RLS
- `database/EXECUTAR_FIX_RLS_PONTO.md` - Instruções detalhadas

## Status
- ✅ Código corrigido
- ⚠️ Aguardando execução do script SQL no banco de dados
