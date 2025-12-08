# ✅ Gmail Configurado - Qualitec

## 📧 Credenciais Configuradas

```
Email: qualitecinstrumentosdemedicao@gmail.com
Senha App: byeqpdyllakkwxkk
```

## 🔧 Configuração Realizada

### 1. Arquivo `.env` Atualizado
- ✅ `GMAIL_EMAIL` configurado
- ✅ `GMAIL_APP_PASSWORD` configurado
- ✅ `EMAIL_JOBS_TOKEN` configurado

### 2. Arquivo `nuxt.config.ts` Atualizado
- ✅ Variáveis de Gmail adicionadas ao `runtimeConfig`
- ✅ Acessíveis apenas no servidor (seguro)

### 3. Serviço de E-mail Atualizado
- ✅ Usa credenciais do `.env` automaticamente
- ✅ Fallback para banco de dados se configurado
- ✅ Pronto para enviar e-mails

## 🧪 Testar a Configuração

### Opção 1: Via API (Recomendado)

```bash
curl -X POST http://localhost:3000/api/email/test-gmail
```

Resposta esperada:
```json
{
  "success": true,
  "message": "✅ E-mail de teste enviado com sucesso!",
  "details": "Verifique sua caixa de entrada em qualitecinstrumentosdemedicao@gmail.com",
  "timestamp": "2024-12-04T10:30:00.000Z"
}
```

### Opção 2: Via Interface Web

1. Acesse: `/configuracoes/email`
2. Aba: **"Configurações SMTP"**
3. Clique em **"Testar Conexão"**
4. Aguarde a resposta ✅

## 📋 Próximos Passos

### 1. Verificar Recebimento
- Abra o Gmail: qualitecinstrumentosdemedicao@gmail.com
- Procure pelo e-mail de teste
- Se recebeu, está funcionando! ✅

### 2. Configurar Notificações
1. Acesse: `/configuracoes/email`
2. Aba: **"Notificações"**
3. Marque os eventos desejados:
   - ✅ Admissão de colaborador
   - ✅ Aniversário
   - ✅ Férias aprovadas
   - ✅ Férias vencendo
   - ✅ Documentos vencendo
4. Clique em **"Salvar"**

### 3. Configurar Jobs Automáticos
Para enviar e-mails automaticamente, configure um cron job:

**Opção A: EasyCron (Gratuito)**
1. Acesse: https://www.easycron.com/
2. Crie conta
3. Adicione novo cron:
   - **URL:** `https://seu-dominio.com/api/email/jobs-trigger`
   - **Method:** POST
   - **Headers:** `Authorization: sk_live_qualitec_email_jobs_2024`
   - **Cron:** `0 8 * * *` (8h da manhã)

**Opção B: GitHub Actions**
1. Crie `.github/workflows/email-jobs.yml`:

```yaml
name: Email Jobs
on:
  schedule:
    - cron: '0 8 * * *'
jobs:
  send:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X POST https://seu-dominio.com/api/email/jobs-trigger \
            -H "Authorization: sk_live_qualitec_email_jobs_2024"
```

2. Faça commit e push

## 🎯 Funcionalidades Ativas

### ✅ Envio de E-mails
- Boas-vindas na admissão
- Parabéns no aniversário
- Notificação de férias aprovadas
- Alerta de férias vencendo
- Alerta de documentos vencendo
- Holerite disponível

### ✅ Rastreamento
- Abertura de e-mails
- Cliques em links
- Histórico completo

### ✅ Personalização
- Templates customizáveis
- Variáveis dinâmicas
- HTML e texto puro

## 📊 Monitoramento

### Ver Histórico de Envios
1. Acesse: `/configuracoes/email`
2. Aba: **"Histórico"**
3. Veja todos os e-mails enviados

### Estatísticas
- Total enviados
- Taxa de abertura
- E-mails com falha
- Pendentes na fila

## 🔒 Segurança

### ✅ Implementado
- Credenciais no `.env` (não no código)
- Token de segurança para jobs
- Variáveis privadas (server-side only)
- Logs de auditoria

### ⚠️ Importante
- **NÃO** commitar `.env` no repositório
- **NÃO** compartilhar a senha de app
- **NÃO** expor o token de jobs
- Mude o token a cada 3-6 meses

## 🆘 Troubleshooting

### Problema: "Conexão recusada"
**Solução:**
1. Verifique se o Gmail está ativo
2. Confirme a senha de app
3. Verifique se TLS está ativado (porta 587)

### Problema: "Autenticação falhou"
**Solução:**
1. Use a senha de app, não a senha normal
2. Verifique se 2FA está ativado no Gmail
3. Regenere a senha de app

### Problema: "E-mail não recebido"
**Solução:**
1. Verifique a caixa de spam
2. Verifique se o e-mail está correto
3. Verifique os logs do servidor

### Problema: "Token inválido"
**Solução:**
1. Verifique se o token no `.env` está correto
2. Verifique se está sendo enviado no header `Authorization`

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do servidor
2. Teste a conexão SMTP
3. Verifique as credenciais
4. Verifique se a empresa está criada
5. Verifique se o SMTP está ativo

## ✅ Checklist Final

- [x] Gmail configurado no `.env`
- [x] Nuxt config atualizado
- [x] Serviço de e-mail atualizado
- [x] Endpoint de teste criado
- [ ] E-mail de teste recebido
- [ ] Notificações configuradas
- [ ] Jobs automáticos configurados
- [ ] Primeiro e-mail automático enviado

---

**Status:** ✅ Pronto para usar!

Você pode começar a enviar e-mails automáticos agora! 🚀
