# 🔧 CORREÇÃO DEFINITIVA - Erro de Ponto

## ❌ Erros Identificados

1. **Erro ao registrar ponto (funcionário):**
   - `POST /api/funcionario/ponto/registrar` retorna 400
   
2. **Erro ao visualizar ponto (admin):**
   - `GET /api/ponto?mes=12&ano=2025` retorna 400

## 🎯 Causa Provável

Políticas RLS (Row Level Security) mal configuradas na tabela `registros_ponto` do Supabase.

## 📝 PASSO A PASSO PARA CORRIGIR

### 1️⃣ Executar Script de Diagnóstico e Fix

1. Abra o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Copie TODO o conteúdo do arquivo:
   ```
   nuxt-app/database/fixes/DIAGNOSTICO_E_FIX_PONTO_COMPLETO.sql
   ```
4. Cole no SQL Editor
5. Clique em **RUN** (ou pressione Ctrl+Enter)

### 2️⃣ Analisar Resultados

O script vai mostrar:

✅ **Diagnóstico:**
- Se a tabela existe
- Estrutura da tabela
- Status do RLS
- Políticas existentes
- Dados de usuários de teste
- Registros de ponto existentes

✅ **Fix Aplicado:**
- Remove políticas antigas
- Cria políticas corretas
- Ativa RLS
- Mostra verificação final

### 3️⃣ Verificar Dados do Usuário

Se o erro persistir, execute este SQL para verificar o usuário:

```sql
-- Substitua 'email@exemplo.com' pelo email do usuário com problema
SELECT 
  u.id,
  u.email,
  u.role,
  u.colaborador_id,
  c.nome as colaborador_nome,
  c.empresa_id,
  e.nome_fantasia as empresa_nome
FROM app_users u
LEFT JOIN colaboradores c ON c.id = u.colaborador_id
LEFT JOIN empresas e ON e.id = c.empresa_id
WHERE u.email = 'email@exemplo.com';
```

**Problemas comuns:**
- ❌ `colaborador_id` está NULL → Usuário não vinculado
- ❌ `empresa_id` está NULL → Colaborador sem empresa

### 4️⃣ Vincular Usuário ao Colaborador (se necessário)

Se o usuário não tiver `colaborador_id`:

```sql
-- 1. Encontrar o colaborador
SELECT id, nome, cpf, email FROM colaboradores 
WHERE email = 'email@exemplo.com' OR cpf = '12345678900';

-- 2. Vincular ao usuário
UPDATE app_users 
SET colaborador_id = 'UUID_DO_COLABORADOR_AQUI'
WHERE email = 'email@exemplo.com';
```

### 5️⃣ Criar Colaborador (se não existir)

Se o colaborador não existir:

```sql
-- Buscar empresa_id
SELECT id, nome_fantasia FROM empresas LIMIT 1;

-- Criar colaborador
INSERT INTO colaboradores (
  empresa_id,
  nome,
  cpf,
  email,
  data_admissao,
  status,
  cargo_id,
  departamento_id
) VALUES (
  'UUID_DA_EMPRESA',
  'Nome do Funcionário',
  '12345678900',
  'email@exemplo.com',
  CURRENT_DATE,
  'Ativo',
  (SELECT id FROM cargos LIMIT 1),
  (SELECT id FROM departamentos LIMIT 1)
) RETURNING id;

-- Depois vincular ao usuário (use o ID retornado acima)
UPDATE app_users 
SET colaborador_id = 'UUID_DO_COLABORADOR_CRIADO'
WHERE email = 'email@exemplo.com';
```

### 6️⃣ Reiniciar Servidor

Após executar os scripts:

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
cd nuxt-app
npm run dev
```

### 7️⃣ Testar

1. **Como Funcionário:**
   - Login com usuário funcionário
   - Ir para área do funcionário
   - Clicar no card de Ponto
   - Tentar registrar ponto

2. **Como Admin:**
   - Login com usuário admin
   - Ir para painel admin
   - Clicar no card de Ponto
   - Verificar se carrega os registros

## 🔍 Logs para Debugar

Se ainda houver erro, verifique os logs do servidor:

```bash
# No terminal onde o servidor está rodando
# Procure por mensagens como:
# - "Erro ao buscar app_user"
# - "Usuário não vinculado a um colaborador"
# - "Erro ao buscar colaborador"
# - "Erro ao buscar registros de ponto"
```

## 📊 Políticas RLS Criadas

Após o fix, estas políticas estarão ativas:

1. **service_role_ponto** - Service role tem acesso total
2. **admins_rh_gestores_all_ponto** - Admins/RH/Gestores podem tudo
3. **funcionarios_view_own_ponto** - Funcionários veem seus registros
4. **funcionarios_insert_own_ponto** - Funcionários criam seus registros
5. **funcionarios_update_own_ponto** - Funcionários atualizam registros de hoje

## ✅ Checklist Final

- [ ] Script de diagnóstico executado
- [ ] Políticas RLS criadas
- [ ] Usuário tem `colaborador_id` preenchido
- [ ] Colaborador tem `empresa_id` preenchido
- [ ] Servidor reiniciado
- [ ] Teste como funcionário funcionando
- [ ] Teste como admin funcionando

## 🆘 Se Nada Funcionar

Execute este SQL para ver o erro exato:

```sql
-- Testar como se fosse o usuário
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "UUID_DO_AUTH_UID_DO_USUARIO"}';

-- Tentar inserir
INSERT INTO registros_ponto (
  empresa_id,
  colaborador_id,
  data,
  entrada_1,
  status
) VALUES (
  'UUID_DA_EMPRESA',
  'UUID_DO_COLABORADOR',
  CURRENT_DATE,
  '08:00',
  'Normal'
);

-- Resetar
RESET role;
```

O erro retornado vai indicar exatamente qual política está bloqueando.
