# FIX: Políticas RLS para Registros de Ponto

## Problema
Os funcionários não conseguem registrar ponto porque faltam políticas RLS (Row Level Security) na tabela `registros_ponto`.

## Solução
Execute o script SQL que adiciona as políticas necessárias.

## Como Executar

### Opção 1: Via Supabase Dashboard
1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Copie e cole o conteúdo do arquivo: `database/fixes/fix_rls_registros_ponto.sql`
4. Clique em **Run**

### Opção 2: Via psql
```bash
psql -h <seu-host> -U postgres -d postgres -f database/fixes/fix_rls_registros_ponto.sql
```

## O que o script faz
- Remove políticas antigas (se existirem)
- Cria política para funcionários visualizarem seus próprios registros
- Cria política para funcionários inserirem seus próprios registros
- Cria política para funcionários atualizarem seus próprios registros
- Cria política para admins/RH gerenciarem todos os registros

## Verificação
Após executar, teste:
1. Faça login como funcionário
2. Tente registrar ponto
3. Deve funcionar sem erros 400

## Políticas Criadas
- `funcionarios_view_own_ponto` - Funcionários veem seus registros
- `funcionarios_insert_own_ponto` - Funcionários criam seus registros
- `funcionarios_update_own_ponto` - Funcionários atualizam seus registros
- `admins_all_ponto` - Admins/RH gerenciam todos os registros
