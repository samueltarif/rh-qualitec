# ⏰ Configurar Jobs Automáticos de E-mail

## 📋 O que são Jobs?

Jobs são tarefas que executam automaticamente em horários específicos. No nosso caso:
- **Job de Aniversários:** Executa diariamente para enviar e-mails de parabéns
- **Job de Férias:** Executa diariamente para alertar sobre férias vencendo
- **Job de Documentos:** Executa diariamente para alertar sobre documentos vencendo

## 🔧 Configuração

### Passo 1: Configurar Token de Segurança

1. Abra o arquivo `.env` na raiz do projeto
2. Adicione uma linha com um token secreto:

```env
EMAIL_JOBS_TOKEN=seu-token-aleatorio-seguro-aqui
```

Use um token forte e aleatório!

### Passo 2: Escolher um Serviço de Cron

Você precisa de um serviço que chame a API em horários específicos. Opções:

#### Opção A: EasyCron (Gratuito)
1. Acesse: https://www.easycron.com/
2. Crie uma conta gratuita
3. Clique em "Cron Jobs" → "Add"
4. Preencha:
   - **Cron Expression:** `0 8 * * *` (diariamente às 8h)
   - **URL:** `https://seu-dominio.com/api/email/jobs-trigger`
   - **HTTP Method:** POST
   - **HTTP Headers:** 
     ```
     Authorization: seu-token-aleatorio-seguro-aqui
     ```
5. Clique em "Create"

#### Opção B: GitHub Actions (Gratuito)
1. Crie um arquivo `.github/workflows/email-jobs.yml`:

```yaml
name: Email Jobs

on:
  schedule:
    - cron: '0 8 * * *'  # Diariamente às 8h UTC

jobs:
  send-emails:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Email Jobs
        run: |
          curl -X POST https://seu-dominio.com/api/email/jobs-trigger \
            -H "Authorization: ${{ secrets.EMAIL_JOBS_TOKEN }}" \
            -H "Content-Type: application/json"
```

2. Configure o secret no GitHub:
   - Vá em Settings → Secrets → New repository secret
   - Nome: `EMAIL_JOBS_TOKEN`
   - Valor: seu token

## 🧪 Testar Manualmente

```bash
curl -X POST http://localhost:3000/api/email/jobs-trigger \
  -H "Authorization: seu-token-aleatorio-seguro-aqui" \
  -H "Content-Type: application/json"
```

Resposta esperada:
```json
{
  "success": true,
  "message": "Jobs executados com sucesso"
}
```

## 📊 Monitoramento

### Verificar Histórico de Envios

1. Acesse `/configuracoes/email`
2. Clique na aba **"Histórico"**
3. Veja todos os e-mails enviados

## 🔒 Segurança

### Boas Práticas

1. **Use um token forte:**
   ```
   ❌ EMAIL_JOBS_TOKEN=123456
   ✅ EMAIL_JOBS_TOKEN=seu-token-aleatorio-muito-seguro-aqui
   ```

2. **Use HTTPS:**
   - Sempre use URLs com HTTPS
   - Nunca exponha o token em URLs públicas

3. **Rotação de Token:**
   - Mude o token a cada 3-6 meses
   - Se suspeitar de vazamento, mude imediatamente

## 🚨 Troubleshooting

### Problema: "Token inválido"
**Solução:** Verifique se o token no `.env` é igual ao enviado na requisição

### Problema: "Conexão SMTP recusada"
**Solução:** 
1. Verifique se o SMTP está configurado
2. Teste a conexão em `/configuracoes/email`
3. Verifique se a senha de aplicativo do Gmail está correta

### Problema: "Nenhuma empresa encontrada"
**Solução:** Crie uma empresa em `/configuracoes/empresa`

---

**Configuração concluída!** 🎉

Seus e-mails automáticos agora serão enviados diariamente nos horários configurados.
