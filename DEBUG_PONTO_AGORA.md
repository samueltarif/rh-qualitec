# 🔍 DEBUG - Erro de Ponto

## PASSO 1: Verificar Dados no Supabase

Execute no **Supabase SQL Editor**:
```
nuxt-app/database/VERIFICAR_DADOS_USUARIO.sql
```

**O que procurar:**
- ❌ Usuários com `colaborador_id` NULL
- ❌ Colaboradores com `empresa_id` NULL
- ✅ Todos devem ter vínculos corretos

## PASSO 2: Reiniciar Servidor com Logs

```bash
# Parar servidor (Ctrl+C)
# Iniciar novamente
cd nuxt-app
npm run dev
```

## PASSO 3: Testar e Ver Logs

### Teste 1: Registrar Ponto (Funcionário)
1. Login como funcionário
2. Ir para área do funcionário
3. Clicar no card Ponto
4. Tentar registrar ponto

**No terminal do servidor, você verá:**
```
🔍 [PONTO] Iniciando registro de ponto
🔍 [PONTO] User ID: xxx
🔍 [PONTO] User email: xxx
🔍 [PONTO] App User Data: { ... }
```

**Se der erro, vai mostrar exatamente onde:**
- ❌ Erro ao buscar app_user
- ❌ Usuário sem colaborador_id
- ❌ Erro ao buscar colaborador
- ❌ Colaborador sem empresa_id

### Teste 2: Ver Registros (Admin)
1. Login como admin
2. Ir para painel admin
3. Clicar no card Ponto

**No terminal do servidor, você verá:**
```
🔍 [PONTO GET] Iniciando busca de registros
🔍 [PONTO GET] User ID: xxx
🔍 [PONTO GET] Query params: { mes: 12, ano: 2025 }
```

## PASSO 4: Copiar Logs e Enviar

Copie TODA a saída do terminal que começa com 🔍 ou ❌ e envie aqui.

## CORREÇÕES COMUNS

### Se o erro for: "Usuário não vinculado a um colaborador"

Execute no Supabase:
```sql
-- 1. Ver usuários sem vínculo
SELECT id, auth_uid, role FROM app_users WHERE colaborador_id IS NULL;

-- 2. Ver colaboradores disponíveis
SELECT id, nome, cpf, email FROM colaboradores;

-- 3. Vincular (substitua os UUIDs)
UPDATE app_users 
SET colaborador_id = 'UUID_DO_COLABORADOR'
WHERE auth_uid = 'UUID_DO_AUTH_UID';
```

### Se o erro for: "Colaborador não vinculado a uma empresa"

Execute no Supabase:
```sql
-- 1. Ver colaboradores sem empresa
SELECT id, nome FROM colaboradores WHERE empresa_id IS NULL;

-- 2. Ver empresas disponíveis
SELECT id, nome_fantasia FROM empresas;

-- 3. Vincular (substitua os UUIDs)
UPDATE colaboradores 
SET empresa_id = 'UUID_DA_EMPRESA'
WHERE id = 'UUID_DO_COLABORADOR';
```

### Se o erro for: "Erro ao buscar app_user" ou "Usuário não encontrado"

Isso significa que o usuário não existe na tabela `app_users`. Execute:

```sql
-- Ver usuários do auth
SELECT id, email FROM auth.users;

-- Ver usuários do app
SELECT auth_uid, role, colaborador_id FROM app_users;

-- Criar usuário no app (se não existir)
INSERT INTO app_users (auth_uid, role)
VALUES ('UUID_DO_AUTH_USER', 'funcionario')
RETURNING *;
```

## CHECKLIST

- [ ] PASSO 1 executado - Dados verificados
- [ ] PASSO 2 executado - Servidor reiniciado
- [ ] PASSO 3 executado - Testes feitos
- [ ] Logs copiados
- [ ] Correção aplicada (se necessário)
- [ ] Teste novamente

## 📋 Envie os Logs

Copie e cole aqui:
1. Resultado do PASSO 1 (SQL)
2. Logs do terminal (PASSO 3)
3. Erro completo do navegador (F12 → Console)
