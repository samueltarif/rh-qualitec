# Configuração de Email - Gmail Qualitec

## ✅ Credenciais Configuradas

O sistema está configurado para usar o Gmail da Qualitec para envio de emails.

### Credenciais no .env

```env
# Email da Qualitec para envio automático
GMAIL_EMAIL=qualitecinstrumentosdemedicao@gmail.com
GMAIL_APP_PASSWORD=byeqpdyllakkwxkk
```

## 🎯 Como Funciona

### Sistema de Fallback

O sistema usa uma estratégia de fallback inteligente:

1. **Primeira opção:** Configuração SMTP do banco de dados
   - Se houver configuração salva em `config_email_smtp`
   - Usa as credenciais configuradas pelo admin

2. **Fallback automático:** Gmail da Qualitec
   - Se não houver configuração no banco
   - Usa automaticamente as credenciais do .env
   - **Host:** smtp.gmail.com
   - **Porta:** 587
   - **Secure:** false (usa STARTTLS)

## 📧 Emails que Usam Esta Configuração

### 1. Holerites Individuais
- Envio de holerite por email para colaboradores
- Remetente: "Sistema RH Qualitec"
- Email: qualitecinstrumentosdemedicao@gmail.com

### 2. Comunicados (futuro)
- Avisos gerais
- Notificações importantes
- Alertas do sistema

### 3. Notificações (futuro)
- Aprovações pendentes
- Solicitações de férias
- Alterações de dados

## 🔧 Configuração do Gmail

### Senha de Aplicativo

A senha `byeqpdyllakkwxkk` é uma **senha de aplicativo** do Gmail, não a senha normal da conta.

**Como foi gerada:**

1. Acesse: https://myaccount.google.com/security
2. Ative a verificação em duas etapas
3. Vá em "Senhas de app"
4. Gere uma senha para "Aplicativo personalizado"
5. Use a senha gerada (16 caracteres)

### Configurações SMTP do Gmail

```
Host: smtp.gmail.com
Porta: 587 (recomendado) ou 465 (SSL)
Segurança: STARTTLS (porta 587) ou SSL/TLS (porta 465)
Autenticação: Obrigatória
```

## 📝 Código de Implementação

### API de Envio de Holerite

```typescript
// server/api/holerites/enviar-email.post.ts

// Buscar configuração do banco
const { data: configEmail } = await client
  .from('config_email_smtp')
  .select('*')
  .single()

// Usar configuração do banco ou fallback para Gmail
if (configData && configData.smtp_host) {
  // Usar configuração do banco
  transportConfig = {
    host: configData.smtp_host,
    port: configData.smtp_port,
    secure: configData.smtp_secure,
    auth: {
      user: configData.smtp_user,
      pass: configData.smtp_password,
    },
  }
} else {
  // Usar Gmail da Qualitec (FALLBACK)
  transportConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  }
}
```

## 🧪 Como Testar

### 1. Testar Envio de Holerite

```bash
# 1. Acesse a folha de pagamento
http://localhost:3000/folha-pagamento

# 2. Calcule a folha
# 3. Clique em "Gerar" para um colaborador
# 4. Clique em "Email" para enviar
# 5. Verifique a caixa de entrada do colaborador
```

### 2. Verificar Logs

O sistema loga informações sobre o envio:

```javascript
console.log('Enviando email...')
console.log('Remetente:', remetenteEmail)
console.log('Destinatário:', emailDestino)
console.log('Assunto:', subject)
```

### 3. Testar Manualmente

Você pode testar o envio de email usando a API diretamente:

```bash
curl -X POST http://localhost:3000/api/holerites/enviar-email \
  -H "Content-Type: application/json" \
  -d '{
    "colaborador_id": 1,
    "mes": 12,
    "ano": 2025
  }'
```

## ⚠️ Limitações do Gmail

### Limites de Envio

O Gmail tem limites de envio:

- **Conta gratuita:** 500 emails/dia
- **Google Workspace:** 2.000 emails/dia

### Recomendações

Para uso em produção com muitos colaboradores:

1. **Opção 1:** Usar Google Workspace
   - Limite maior de envios
   - Domínio personalizado
   - Mais profissional

2. **Opção 2:** Usar serviço dedicado
   - SendGrid
   - Mailgun
   - Amazon SES
   - Sem limites restritivos

3. **Opção 3:** Configurar SMTP próprio
   - Servidor de email próprio
   - Controle total
   - Sem limites externos

## 🔒 Segurança

### Boas Práticas

1. **Nunca commitar o .env**
   - Arquivo já está no .gitignore
   - Credenciais sensíveis

2. **Usar variáveis de ambiente**
   - Produção: configurar no servidor
   - Desenvolvimento: usar .env local

3. **Rotacionar senhas**
   - Trocar senha de aplicativo periodicamente
   - Gerar nova se comprometida

### Arquivo .gitignore

Certifique-se que o .env está ignorado:

```gitignore
# Environment variables
.env
.env.local
.env.*.local
```

## 📊 Monitoramento

### Verificar Envios

Para monitorar os envios de email:

1. **Gmail:** Acesse "Enviados"
2. **Logs do sistema:** Console do servidor
3. **Tabela de histórico:** (implementar futuramente)

### Erros Comuns

**Erro: "Invalid login"**
- Senha de aplicativo incorreta
- Verificação em duas etapas não ativada

**Erro: "Connection timeout"**
- Firewall bloqueando porta 587
- Problema de rede

**Erro: "Daily limit exceeded"**
- Limite de 500 emails/dia atingido
- Aguardar 24h ou usar outro serviço

## 🚀 Próximos Passos

### Melhorias Futuras

1. **Histórico de Envios**
   ```sql
   CREATE TABLE email_historico (
     id SERIAL PRIMARY KEY,
     destinatario TEXT,
     assunto TEXT,
     enviado_em TIMESTAMP,
     status TEXT,
     erro TEXT
   );
   ```

2. **Fila de Envios**
   - Enviar emails em background
   - Retry automático em caso de falha
   - Priorização de emails

3. **Templates Personalizados**
   - Editor de templates
   - Variáveis dinâmicas
   - Preview antes de enviar

4. **Estatísticas**
   - Taxa de entrega
   - Emails abertos
   - Links clicados

## 📝 Checklist de Configuração

- [x] Credenciais no .env
- [x] Fallback implementado
- [x] API de envio criada
- [x] Template HTML profissional
- [x] Tratamento de erros
- [ ] Histórico de envios
- [ ] Fila de processamento
- [ ] Monitoramento avançado

## 💡 Dicas

### Para Desenvolvimento

```env
# Use o Gmail da Qualitec
GMAIL_EMAIL=qualitecinstrumentosdemedicao@gmail.com
GMAIL_APP_PASSWORD=byeqpdyllakkwxkk
```

### Para Produção

```env
# Configure SMTP próprio ou serviço dedicado
# Ou use o Gmail com Google Workspace
GMAIL_EMAIL=rh@qualitec.com.br
GMAIL_APP_PASSWORD=sua_senha_de_aplicativo
```

### Para Testes

```env
# Use Mailtrap ou similar para testes
GMAIL_EMAIL=seu_email_teste@mailtrap.io
GMAIL_APP_PASSWORD=sua_senha_mailtrap
```

## ✅ Status Atual

- ✅ Gmail configurado
- ✅ Fallback implementado
- ✅ Envio de holerites funcionando
- ✅ Template HTML profissional
- ✅ Tratamento de erros
- ✅ Documentação completa

**Sistema pronto para enviar emails!**

## 📞 Suporte

Se houver problemas com o envio de emails:

1. Verifique as credenciais no .env
2. Teste a conexão SMTP
3. Verifique os logs do servidor
4. Consulte a documentação do Gmail
5. Entre em contato com o suporte

---

**Última atualização:** Dezembro 2025  
**Responsável:** Sistema RH Qualitec
