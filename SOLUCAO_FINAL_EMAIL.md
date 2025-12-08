# 🔧 Solução Final - Erro de E-mail

## 🚨 Problema

A tabela `templates_email` foi criada sem a coluna `categoria` porque a primeira execução falhou no meio.

## ✅ Solução em 2 Passos

### PASSO 1: Deletar Tabelas Antigas

1. Acesse o Supabase SQL Editor
2. Copie o conteúdo de: `database/fixes/fix_drop_email_tables.sql`
3. Cole no SQL Editor
4. Clique em **"Run"**
5. Você verá: **"✅ Todas as tabelas foram deletadas com sucesso!"**

### PASSO 2: Criar Tabelas Corretas

1. No mesmo SQL Editor
2. Copie o conteúdo de: `database/migrations/20_email_comunicacao.sql`
3. Cole no SQL Editor
4. Clique em **"Run"**
5. Aguarde a execução completa

### PASSO 3: Verificar

Execute esta query:

```sql
SELECT 
    table_name,
    column_name
FROM information_schema.columns
WHERE table_name = 'templates_email'
AND column_name = 'categoria';
```

**Resultado esperado:** 1 linha mostrando que a coluna `categoria` existe

### PASSO 4: Verificar Templates

```sql
SELECT codigo, nome, categoria FROM templates_email;
```

**Resultado esperado:** 5 templates listados

---

## 📋 Resumo dos Arquivos

### 1. Deletar (Execute PRIMEIRO)
```
database/fixes/fix_drop_email_tables.sql
```

### 2. Criar (Execute DEPOIS)
```
database/migrations/20_email_comunicacao.sql
```

---

## ✅ Depois de Executar

1. Recarregue a página `/configuracoes/email`
2. Preencha os dados do SMTP:
   - Servidor: `smtp.gmail.com`
   - Porta: `587`
   - Usuário: `qualitecinstrumentosdemedicao@gmail.com`
   - Senha: `byeqpdyllakkwxkk`
   - Remetente: `qualitecinstrumentosdemedicao@gmail.com`
   - Nome: `RH Qualitec`
3. Desmarque SSL, Marque TLS
4. Clique em "Salvar Configurações"
5. Deve funcionar! ✅

---

## 🆘 Se Ainda Houver Erro

Execute este comando para ver o que está errado:

```sql
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN (
    'configuracoes_smtp',
    'templates_email',
    'historico_emails',
    'fila_emails',
    'configuracoes_comunicacao'
)
ORDER BY table_name, ordinal_position;
```

Isso mostrará todas as colunas de todas as tabelas.

---

## 🎯 Checklist

- [ ] Executei `fix_drop_email_tables.sql`
- [ ] Vi a mensagem de sucesso
- [ ] Executei `20_email_comunicacao.sql`
- [ ] Verifiquei que a coluna `categoria` existe
- [ ] Verifiquei que os 5 templates foram criados
- [ ] Recarreguei a página de configuração
- [ ] Salvei as configurações SMTP
- [ ] Testei a conexão

---

**Agora vai funcionar!** 🎉
