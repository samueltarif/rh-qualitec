# 🚨 FIX URGENTE: Erro 403 - Silvana não consegue aprovar alterações

## ❌ Problema
```
Failed to load resource: the server responded with a status of 403
api/admin/alteracoes-dados/b0a03ed9-dd19-4e7b-90c8-c8ab3a680055
```

Silvana (admin) não consegue acessar a página de alterações de dados.

## ✅ Solução

### Passo 1: Abrir SQL Editor no Supabase
1. Acesse: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Clique em "New Query"

### Passo 2: Copiar e Colar o SQL
Copie TODO o conteúdo do arquivo:
```
nuxt-app/database/FIX_RLS_SOLICITACOES_AGORA.sql
```

### Passo 3: Executar
1. Cole o SQL no editor
2. Clique em "Run" (ou pressione Ctrl+Enter)
3. Aguarde a mensagem de sucesso

### Passo 4: Verificar
Você deve ver no resultado:
- 5 políticas criadas
- Teste de acesso mostrando o total de solicitações

### Passo 5: Testar no Sistema
1. Faça logout de Silvana
2. Faça login novamente
3. Acesse: Admin → Alterações de Dados
4. Deve funcionar! ✅

## 🔍 O que foi corrigido?

Antes: Política única muito restritiva
Agora: Políticas separadas por operação (SELECT, UPDATE, DELETE)

- ✅ Admin pode VER todas as solicitações
- ✅ Admin pode APROVAR/REJEITAR solicitações
- ✅ Admin pode DELETAR solicitações
- ✅ Funcionário pode VER apenas suas solicitações
- ✅ Funcionário pode CRIAR solicitações

## 📝 Nota
Se ainda der erro 403, verifique se Silvana está marcada como `role = 'admin'` na tabela `app_users`.
