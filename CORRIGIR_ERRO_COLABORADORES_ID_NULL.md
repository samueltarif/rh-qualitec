# CORREÇÃO: Erro "null value in column id of relation colaboradores"

## Problema
O sistema está tentando inserir um valor `null` na coluna `id` da tabela `colaboradores`, que tem constraint NOT NULL.

## Causa
A tabela `colaboradores` pode estar com problema na configuração do campo `id` que deveria gerar automaticamente um UUID.

## Solução

### 1. Execute o script de diagnóstico e correção
```sql
-- No Supabase SQL Editor, execute:
```
Copie e execute o conteúdo do arquivo: `nuxt-app/database/FIX_COLABORADORES_ID_NULL.sql`

### 2. Verifique se o endpoint POST foi criado
O arquivo `nuxt-app/server/api/colaboradores/index.post.ts` foi criado para corrigir o problema de inserção.

### 3. Teste a criação de colaborador
Após executar o SQL de correção, teste criar um novo colaborador através da interface.

## Verificações importantes

### A. Estrutura da tabela deve estar assim:
```sql
-- Campo ID deve ter:
- Tipo: UUID
- Default: gen_random_uuid()
- NOT NULL: true
- PRIMARY KEY: true
```

### B. Extensões necessárias:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### C. Teste manual:
```sql
-- Este comando deve funcionar sem erro:
INSERT INTO colaboradores (empresa_id, nome, cpf) 
VALUES (
  (SELECT id FROM empresas LIMIT 1),
  'Teste Usuario',
  '12345678901'
);
```

## Arquivos modificados/criados:
1. ✅ `nuxt-app/server/api/colaboradores/index.post.ts` - Endpoint POST criado
2. ✅ `nuxt-app/database/FIX_COLABORADORES_ID_NULL.sql` - Script de correção
3. ✅ Este arquivo de instruções

## Próximos passos:
1. Execute o SQL de correção no Supabase
2. Reinicie o servidor Nuxt se necessário
3. Teste criar um novo colaborador
4. Se ainda houver erro, verifique os logs do console para mais detalhes

## Logs para monitorar:
- Console do navegador (F12)
- Terminal do servidor Nuxt
- Logs do Supabase (se disponível)