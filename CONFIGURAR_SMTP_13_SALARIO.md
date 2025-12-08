# 📧 Configurar SMTP para Envio de 13º Salário

## ✅ Código Atualizado!

O sistema agora **envia emails de verdade** usando o serviço SMTP configurado.

## 🔧 Como Configurar

### 1. Acessar Configurações de Email

No sistema, vá para:
```
Configurações → Email
```

### 2. Configurar SMTP

Preencha os dados do servidor SMTP:

#### Para Gmail:
```
Servidor SMTP: smtp.gmail.com
Porta: 587
Usuário: seu-email@gmail.com
Senha: sua-senha-de-app (não a senha normal!)
Email Remetente: seu-email@gmail.com
Nome Remetente: RH Qualitec
Usar SSL: Não
Usar TLS: Sim
```

#### Para Outlook/Hotmail:
```
Servidor SMTP: smtp-mail.outlook.com
Porta: 587
Usuário: seu-email@outlook.com
Senha: sua-senha
Email Remetente: seu-email@outlook.com
Nome Remetente: RH Qualitec
Usar SSL: Não
Usar TLS: Sim
```

### 3. Testar Configuração

Clique em "Testar Configuração" para verificar se está funcionando.

## 📝 Verificar no Banco

Execute no Supabase para ver a configuração:

```sql
SELECT 
  servidor_smtp,
  porta,
  usuario_smtp,
  email_remetente,
  nome_remetente,
  usa_ssl,
  usa_tls
FROM config_email_smtp;
```

## 🚀 Testar Envio

1. Acesse a página de 13º Salário
2. Selecione colaboradores com email cadastrado
3. Clique em "Gerar e Enviar"
4. Verifique os logs no terminal:

```
✅ Email enviado para samuel.tarif@gmail.com
✅ Email enviado para silvana@empresa.com
```

## ⚠️ Problemas Comuns

### Email não está sendo enviado

**Verifique:**
1. Configuração SMTP está correta?
2. Senha de app do Gmail está configurada?
3. Firewall não está bloqueando porta 587?
4. Colaboradores têm email cadastrado?

### Ver logs de erro

No terminal do servidor, procure por:
```
❌ Erro ao enviar email
```

## 🔐 Gmail - Senha de App

Se usar Gmail, você precisa criar uma **Senha de App**:

1. Acesse: https://myaccount.google.com/security
2. Ative "Verificação em duas etapas"
3. Vá em "Senhas de app"
4. Crie uma senha para "Email"
5. Use essa senha na configuração SMTP

## 📊 Verificar Emails dos Colaboradores

```sql
SELECT 
  nome,
  email_corporativo,
  email_pessoal
FROM colaboradores
WHERE email_corporativo IS NOT NULL 
   OR email_pessoal IS NOT NULL;
```

---

**Status**: ✅ Código pronto para enviar emails reais!
