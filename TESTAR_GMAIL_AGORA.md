# 🧪 Testar Gmail Agora

## ⚡ Teste Rápido (2 minutos)

### Passo 1: Abra o Terminal
```bash
cd nuxt-app
```

### Passo 2: Teste a Conexão
```bash
curl -X POST http://localhost:3000/api/email/test-gmail
```

### Passo 3: Verifique o E-mail
Abra: https://mail.google.com/
- Email: qualitecinstrumentosdemedicao@gmail.com
- Procure por um e-mail com assunto: "✅ Teste de Configuração - RH Qualitec"

---

## ✅ Se Recebeu o E-mail

Parabéns! 🎉 Tudo está funcionando!

### Próximos Passos:
1. Acesse: `/configuracoes/email`
2. Aba: **"Notificações"**
3. Marque os eventos desejados
4. Clique em **"Salvar"**

---

## ❌ Se NÃO Recebeu o E-mail

### Verificar Logs
1. Abra o console do servidor
2. Procure por mensagens de erro
3. Verifique se há mensagens como:
   - `✅ Conexão SMTP verificada com sucesso`
   - `✅ E-mail enviado`

### Troubleshooting

#### Erro: "EAUTH: Invalid credentials"
**Solução:**
1. Verifique se a senha de app está correta
2. Regenere a senha de app no Gmail
3. Atualize o `.env`

#### Erro: "ECONNREFUSED"
**Solução:**
1. Verifique se o servidor está rodando
2. Verifique se a porta 587 está aberta
3. Verifique se o firewall não está bloqueando

#### Erro: "Timeout"
**Solução:**
1. Verifique a conexão de internet
2. Tente novamente em alguns segundos
3. Verifique se o Gmail não está bloqueando

---

## 🔍 Verificações Manuais

### 1. Verificar Credenciais no .env
```bash
cat .env | grep GMAIL
```

Deve mostrar:
```
GMAIL_EMAIL=qualitecinstrumentosdemedicao@gmail.com
GMAIL_APP_PASSWORD=byeqpdyllakkwxkk
```

### 2. Verificar Configuração do Nuxt
```bash
cat nuxt.config.ts | grep gmail
```

Deve mostrar as variáveis de Gmail no runtimeConfig

### 3. Testar Manualmente com Node
```bash
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'qualitecinstrumentosdemedicao@gmail.com',
    pass: 'byeqpdyllakkwxkk'
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Erro:', error);
  } else {
    console.log('✅ Conexão OK');
  }
});
"
```

---

## 📧 Testar Envio de E-mail Real

### Via API
```bash
curl -X POST http://localhost:3000/api/email/test-gmail \
  -H "Content-Type: application/json"
```

### Via Interface Web
1. Acesse: `/configuracoes/email`
2. Aba: **"Configurações SMTP"**
3. Clique em **"Testar Conexão"**

---

## 🎯 Checklist de Teste

- [ ] Servidor rodando em http://localhost:3000
- [ ] Arquivo `.env` com credenciais
- [ ] Comando curl executado com sucesso
- [ ] E-mail de teste recebido
- [ ] Assunto: "✅ Teste de Configuração - RH Qualitec"
- [ ] Remetente: qualitecinstrumentosdemedicao@gmail.com

---

## 🚀 Próximas Ações

Se tudo passou no teste:

1. **Configure as notificações:**
   - Acesse `/configuracoes/email`
   - Aba "Notificações"
   - Marque os eventos

2. **Configure os jobs automáticos:**
   - Use EasyCron ou GitHub Actions
   - Chame `/api/email/jobs-trigger` diariamente

3. **Personalize os templates:**
   - Acesse `/configuracoes/email`
   - Aba "Templates"
   - Edite conforme necessário

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do servidor
2. Teste as credenciais manualmente
3. Verifique se o Gmail está ativo
4. Verifique se 2FA está ativado
5. Regenere a senha de app se necessário

---

**Boa sorte! 🍀**
