# SOLUÇÃO RÁPIDA: Usuário não encontrado no painel funcionário

## 🔍 Problema identificado
- Colaborador foi criado na tabela `colaboradores` ✅
- Usuário foi criado no Supabase Auth ✅  
- **Usuário NÃO foi criado na tabela `app_users`** ❌

## 🚀 Solução imediata

### 1. Execute o diagnóstico no Supabase SQL Editor:
```sql
-- Copie e execute o conteúdo do arquivo:
-- nuxt-app/database/FIX_CRIAR_APP_USER_PARA_COLABORADOR.sql
```

### 2. Identifique os dados necessários:
- **auth_uid**: ID do usuário no Supabase Auth (ex: `a14fd827-f595-4b98-a1e3-ec69acce439f`)
- **colaborador_id**: ID do colaborador na tabela colaboradores
- **email**: Email do usuário
- **nome**: Nome do colaborador

### 3. Execute o INSERT com os dados corretos:
```sql
INSERT INTO app_users (
  auth_uid,
  email,
  nome,
  role,
  colaborador_id,
  ativo
) VALUES (
  'COLE_AQUI_O_AUTH_UID',     -- Do Supabase Auth
  'email@exemplo.com',         -- Email do usuário
  'Nome do Colaborador',       -- Nome
  'funcionario',              -- Role
  'COLE_AQUI_O_COLABORADOR_ID', -- ID do colaborador
  true                        -- Ativo
);
```

### 4. Teste o login:
- Após executar o SQL, o usuário deve conseguir fazer login
- Será redirecionado para `/employee` (painel funcionário)

## 🔧 Correção aplicada no código

Melhorei o endpoint de colaboradores para:
- ✅ Melhor logging da criação de usuários
- ✅ Tratamento de erros mais detalhado
- ✅ Não falhar se a criação de usuário der erro

## 📋 Próximos passos

1. **Execute o SQL de correção** para o usuário atual
2. **Teste o login** do funcionário
3. **Para novos colaboradores**: certifique-se de marcar "Criar usuário" no formulário

## ⚠️ Importante

Este problema acontece quando:
- O colaborador é criado sem marcar "Criar usuário"
- Ou quando há falha na criação do usuário em `app_users`

A correção no código evita que isso aconteça novamente!