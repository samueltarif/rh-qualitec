# ⚠️ IMPORTANTE: Execute a Migration 20 Primeiro!

## 🚨 Erro: 404 Not Found - configuracoes_smtp

Esse erro acontece porque a tabela `configuracoes_smtp` ainda não existe no banco de dados.

## ✅ Solução: Executar Migration 20

### Passo 1: Acesse o Supabase

1. Abra: https://supabase.com/dashboard
2. Selecione seu projeto: **utuxefswedolrninwgvs**
3. Clique em **"SQL Editor"** no menu lateral

### Passo 2: Execute a Migration

1. Clique em **"New Query"**
2. Abra o arquivo: `database/migrations/20_email_comunicacao.sql`
3. **Copie TODO o conteúdo** do arquivo
4. **Cole** no SQL Editor do Supabase
5. Clique em **"Run"** ou pressione **Ctrl+Enter**

### Passo 3: Aguarde a Execução

Você verá mensagens como:
```
Success. No rows returned
```

Isso é normal! A migration cria as tabelas mas não retorna dados.

### Passo 4: Verifique se Funcionou

Execute esta query no SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'configuracoes_smtp',
  'templates_email',
  'historico_emails',
  'fila_emails',
  'configuracoes_comunicacao'
)
ORDER BY table_name;
```

**Resultado esperado:** 5 tabelas listadas

### Passo 5: Volte para a Interface

1. Recarregue a página de configuração de e-mail
2. Preencha os dados do SMTP
3. Clique em "Salvar Configurações"
4. Agora deve funcionar! ✅

---

## 📋 Checklist

- [ ] Acessei o Supabase Dashboard
- [ ] Abri o SQL Editor
- [ ] Copiei o conteúdo de `20_email_comunicacao.sql`
- [ ] Colei no SQL Editor
- [ ] Cliquei em "Run"
- [ ] Verifiquei que as 5 tabelas foram criadas
- [ ] Voltei para a interface
- [ ] Salvei as configurações SMTP com sucesso

---

## 🆘 Se Houver Erro na Migration

### Erro: "relation already exists"
**Solução:** A tabela já foi criada. Ignore o erro.

### Erro: "permission denied"
**Solução:** Verifique se você tem permissões de admin no Supabase.

### Erro: "syntax error"
**Solução:** Certifique-se de copiar TODO o conteúdo do arquivo, do início ao fim.

---

## ✅ Depois de Executar

Volte para `/configuracoes/email` e:

1. Preencha os dados do SMTP
2. Clique em "Salvar Configurações"
3. Clique em "Testar Conexão"
4. Configure as notificações

**Tudo vai funcionar perfeitamente!** 🎉
