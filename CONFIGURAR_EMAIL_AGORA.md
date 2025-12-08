# ⚡ Configurar Email AGORA

## 🎯 Problema

```
⚠️ Configuração de email não encontrada
```

A tabela `config_email_smtp` está vazia. Você precisa inserir uma configuração.

## 🚀 Solução Rápida

### Opção 1: Pelo Sistema (Recomendado)

1. Acesse: **Configurações → Email**
2. Preencha os dados do SMTP
3. Clique em "Salvar"
4. Teste a configuração

### Opção 2: Por SQL (Mais Rápido)

Execute no Supabase (AJUSTE OS VALORES!):

```sql
INSERT INTO config_email_smtp (
  servidor_smtp,
  porta,
  usuario_smtp,
  senha_smtp,
  email_remetente,
  nome_remetente,
  usa_ssl,
  usa_tls,
  ativo
) VALUES (
  'smtp.gmail.com',
  587,
  'seu-email@gmail.com',      -- ⚠️ ALTERE
  'sua-senha-de-app',          -- ⚠️ ALTERE
  'seu-email@gmail.com',       -- ⚠️ ALTERE
  'RH Qualitec',
  false,
  true,
  true
);
```

## 📧 Configurações por Provedor

### Gmail
```
Servidor: smtp.gmail.com
Porta: 587
Usuário: seu-email@gmail.com
Senha: SENHA DE APP (não a senha normal!)
SSL: Não
TLS: Sim
```

**Como criar Senha de App no Gmail:**
1. https://myaccount.google.com/security
2. Ative "Verificação em duas etapas"
3. Vá em "Senhas de app"
4. Crie uma senha para "Email"
5. Use essa senha

### Outlook/Hotmail
```
Servidor: smtp-mail.outlook.com
Porta: 587
Usuário: seu-email@outlook.com
Senha: sua-senha-normal
SSL: Não
TLS: Sim
```

## ✅ Verificar

Após configurar, execute:

```sql
SELECT 
  servidor_smtp,
  porta,
  email_remetente,
  ativo
FROM config_email_smtp;
```

## 🧪 Testar

1. Gere o 13º salário novamente
2. Verifique os logs:

```
✅ Email enviado para samuel.tarif@gmail.com
```

---

**Status**: ⚠️ Aguardando configuração de email
