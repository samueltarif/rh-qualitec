# ⚡ Guia Rápido: Configurar Gmail em 5 Minutos

## 1️⃣ Gerar Senha de Aplicativo Gmail

1. Acesse: https://myaccount.google.com/
2. Clique em **"Segurança"**
3. Ative **"Autenticação de dois fatores"** (se não tiver)
4. Procure por **"Senhas de aplicativo"**
5. Selecione: Mail + Windows/Mac/Linux
6. Clique em **"Gerar"**
7. **Copie a senha** (16 caracteres)

## 2️⃣ Configurar no Sistema

1. Acesse: `/configuracoes/email`
2. Aba: **"Configurações SMTP"**
3. Preencha:

| Campo | Valor |
|-------|-------|
| Servidor SMTP | `smtp.gmail.com` |
| Porta | `587` |
| Usar SSL | ❌ |
| Usar TLS | ✅ |
| Usuário | `seu-email@gmail.com` |
| Senha | `[senha gerada]` |
| E-mail Remetente | `seu-email@gmail.com` |
| Nome Remetente | `RH Empresa` |

4. Clique em **"Testar Conexão"** ✅
5. Clique em **"Salvar"**

## 3️⃣ Ativar Notificações

1. Aba: **"Notificações"**
2. Marque os eventos:
   - ✅ Admissão
   - ✅ Aniversário
   - ✅ Férias aprovadas
   - ✅ Férias vencendo
   - ✅ Documentos vencendo
3. Clique em **"Salvar"**

## 4️⃣ Configurar Jobs Automáticos

### Opção A: EasyCron (Mais Fácil)

1. Acesse: https://www.easycron.com/
2. Crie conta gratuita
3. Clique em **"Add"**
4. Preencha:
   - **Cron:** `0 8 * * *` (8h da manhã)
   - **URL:** `https://seu-dominio.com/api/email/jobs-trigger`
   - **Method:** POST
   - **Headers:** `Authorization: seu-token-secreto`
5. Clique em **"Create"**

### Opção B: GitHub Actions (Gratuito)

1. Crie arquivo: `.github/workflows/email-jobs.yml`
2. Cole:

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
            -H "Authorization: seu-token-secreto"
```

3. Faça commit e push

## 5️⃣ Testar

```bash
curl -X POST http://localhost:3000/api/email/jobs-trigger \
  -H "Authorization: seu-token-secreto"
```

## ✅ Pronto!

Seus e-mails automáticos estão configurados! 🎉

---

## 🆘 Problemas Comuns

| Problema | Solução |
|----------|---------|
| "Conexão recusada" | Verifique servidor/porta/credenciais |
| "Autenticação falhou" | Use senha de aplicativo, não senha normal |
| "Nenhuma empresa" | Crie empresa em `/configuracoes/empresa` |
| "Token inválido" | Verifique token no `.env` |

---

**Documentação completa:** `CONFIGURAR_GMAIL_AUTOMATICO.md`
