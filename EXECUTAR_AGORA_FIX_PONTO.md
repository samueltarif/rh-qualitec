# ⚡ EXECUTAR AGORA - Fix de Ponto

## 🎯 Siga estes passos EXATAMENTE

### 1️⃣ Abrir Supabase
1. Vá para: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**

### 2️⃣ Copiar o Script
1. Abra o arquivo: `nuxt-app/database/fixes/FIX_PONTO_SIMPLES.sql`
2. Selecione TODO o conteúdo (Ctrl+A)
3. Copie (Ctrl+C)

### 3️⃣ Executar no Supabase
1. No SQL Editor, cole o script (Ctrl+V)
2. Clique no botão **RUN** (ou pressione Ctrl+Enter)
3. Aguarde a execução (deve levar 1-2 segundos)

### 4️⃣ Verificar Resultado
Você deve ver 3 tabelas de resultado:

**Tabela 1: Políticas criadas**
```
policyname                          | comando
------------------------------------|--------
admins_rh_gestores_all_ponto       | ALL
funcionarios_insert_own_ponto      | INSERT
funcionarios_update_own_ponto      | UPDATE
funcionarios_view_own_ponto        | SELECT
service_role_ponto                 | ALL
```

**Tabela 2: Usuários e vínculos**
- Verifique se os usuários têm `colaborador_id` preenchido
- Verifique se os colaboradores têm `empresa_id` preenchido

**Tabela 3: Registros de ponto**
- Mostra os últimos registros (se houver)

### 5️⃣ Reiniciar Servidor
No terminal onde o servidor está rodando:
```bash
# Parar (Ctrl+C)
# Iniciar novamente
npm run dev
```

### 6️⃣ Testar
1. **Como Funcionário:**
   - Login → Área do Funcionário → Card Ponto → Registrar

2. **Como Admin:**
   - Login → Painel Admin → Card Ponto → Ver registros

## ❌ Se ainda der erro

### Problema: Usuário sem colaborador_id

Execute no SQL Editor:
```sql
-- Ver usuários sem vínculo
SELECT id, role, colaborador_id 
FROM app_users 
WHERE role = 'funcionario' AND colaborador_id IS NULL;

-- Encontrar colaborador
SELECT id, nome, cpf FROM colaboradores 
WHERE cpf = 'CPF_DO_USUARIO';

-- Vincular
UPDATE app_users 
SET colaborador_id = 'UUID_DO_COLABORADOR'
WHERE id = 'UUID_DO_APP_USER';
```

### Problema: Colaborador sem empresa_id

Execute no SQL Editor:
```sql
-- Ver colaboradores sem empresa
SELECT id, nome FROM colaboradores 
WHERE empresa_id IS NULL;

-- Buscar empresa
SELECT id, nome_fantasia FROM empresas LIMIT 1;

-- Vincular
UPDATE colaboradores 
SET empresa_id = 'UUID_DA_EMPRESA'
WHERE id = 'UUID_DO_COLABORADOR';
```

## ✅ Checklist

- [ ] Script executado no Supabase
- [ ] 5 políticas criadas
- [ ] Usuários têm colaborador_id
- [ ] Colaboradores têm empresa_id
- [ ] Servidor reiniciado
- [ ] Teste funcionário OK
- [ ] Teste admin OK

## 🆘 Ainda com erro?

Envie:
1. Screenshot das 3 tabelas de resultado do PASSO 4
2. Erro completo do console do navegador (F12)
3. Logs do servidor (terminal)
