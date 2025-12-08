# Corrigir Vínculo de Usuários aos Colaboradores

## Problema
Usuários funcionários não conseguem editar seus dados porque não estão vinculados a um colaborador.

## Solução

Execute o script SQL no Supabase SQL Editor:

```sql
-- Vincular usuários aos colaboradores pelo email
UPDATE app_users au
SET 
  colaborador_id = c.id,
  empresa_id = c.empresa_id
FROM colaboradores c
WHERE 
  au.colaborador_id IS NULL 
  AND au.email = c.email_corporativo
  AND c.email_corporativo IS NOT NULL
  AND c.email_corporativo != '';
```

## Verificar

Após executar, verifique se os usuários foram vinculados:

```sql
SELECT 
  au.id,
  au.nome as usuario_nome,
  au.email,
  au.colaborador_id,
  c.nome as colaborador_nome
FROM app_users au
LEFT JOIN colaboradores c ON c.id = au.colaborador_id
WHERE au.role = 'funcionario';
```

## Alternativa Manual

Se o email não corresponder, vincule manualmente:

```sql
-- Substitua os valores pelos IDs corretos
UPDATE app_users 
SET 
  colaborador_id = 'ID_DO_COLABORADOR',
  empresa_id = 'ID_DA_EMPRESA'
WHERE id = 'ID_DO_APP_USER';
```

## Exemplo para o usuário Samuel

```sql
-- Buscar IDs
SELECT id, nome, email FROM app_users WHERE email = 'samuel@qualitec.com.br';
SELECT id, nome, email_corporativo, empresa_id FROM colaboradores WHERE nome LIKE '%Samuel%';

-- Vincular
UPDATE app_users 
SET 
  colaborador_id = (SELECT id FROM colaboradores WHERE nome LIKE '%Samuel%' LIMIT 1),
  empresa_id = (SELECT empresa_id FROM colaboradores WHERE nome LIKE '%Samuel%' LIMIT 1)
WHERE email = 'samuel@qualitec.com.br';
```
