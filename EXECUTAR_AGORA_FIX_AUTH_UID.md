# 🚀 EXECUTAR AGORA - Fix Auth UID Colaboradores

## Problema Identificado
A coluna `auth_uid` não existe na tabela `colaboradores`, por isso os cursos não aparecem.

## Solução Rápida (2 minutos)

### 1. Execute este SQL no Supabase:

```sql
-- Adicionar coluna auth_uid
ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS auth_uid UUID;

-- Sincronizar com app_users
UPDATE colaboradores 
SET auth_uid = au.auth_uid
FROM app_users au
WHERE au.colaborador_id = colaboradores.id
AND au.auth_uid IS NOT NULL;

-- Verificar se funcionou
SELECT 
  c.nome,
  c.auth_uid,
  au.email
FROM colaboradores c
JOIN app_users au ON au.colaborador_id = c.id
WHERE au.email = 'conta3secunndaria@gmail.com';
```

### 2. Reinicie o servidor:
```bash
cd nuxt-app
npm run dev
```

### 3. Teste o funcionário:
- Login: `conta3secunndaria@gmail.com`
- Vá para aba "Cursos"
- Deve aparecer: "carta de correção"

## Verificação

Se funcionou, você deve ver:
- ✅ Colaborador com `auth_uid` preenchido
- ✅ Curso "carta de correção" no painel
- ✅ Status: "Não Iniciado", Progresso: 0%

## Para Automatizar Futuros Colaboradores

Depois execute o arquivo completo:
`nuxt-app/database/SINCRONIZACAO_AUTH_UID_AUTOMATICA.sql`

Isso criará triggers para sincronização automática.

## Resultado Final
- Problema atual: RESOLVIDO
- Futuros colaboradores: AUTOMATIZADO
- Sistema unificado: FUNCIONANDO