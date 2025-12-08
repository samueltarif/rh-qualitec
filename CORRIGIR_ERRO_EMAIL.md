# 🔧 Corrigir Erro de E-mail - SOLUÇÃO

## ❌ Erro Encontrado

```
Error: Could not load C:/Users/Vendas2/Desktop/rh2/nuxt-app/app//server/utils/email-service
ENOENT: no such file or directory
```

## ✅ Correções Aplicadas

### 1. Imports Corrigidos
- ✅ `test-gmail.post.ts` - Import corrigido para caminho relativo
- ✅ `email-jobs.ts` - Import corrigido
- ✅ `jobs-trigger.post.ts` - Import corrigido

### 2. Dependência Adicionada
- ✅ `nodemailer@^6.9.7` adicionado ao package.json
- ✅ `@types/nodemailer@^6.4.14` adicionado

## 🚀 Como Resolver

### Passo 1: Instalar Dependências

```bash
cd nuxt-app
npm install
```

Isso vai instalar o `nodemailer` que está faltando.

### Passo 2: Reiniciar o Servidor

```bash
npm run dev
```

### Passo 3: Testar

```bash
curl -X POST http://localhost:3000/api/email/test-gmail
```

## ✅ Resultado Esperado

Após executar os passos acima, você deve ver:

```
✓ Nitro built in XXX ms
✓ Vite client built in XXX ms
✓ Vite server built in XXX ms

  ➜ Local:   http://localhost:3000/
```

Sem erros! ✅

## 🔍 Verificar se Funcionou

1. Servidor rodando sem erros
2. Acesse: http://localhost:3000/configuracoes/email
3. Teste a conexão SMTP
4. Envie um e-mail de teste

## 📋 Checklist

- [ ] Executei `npm install`
- [ ] Reiniciei o servidor com `npm run dev`
- [ ] Servidor rodando sem erros
- [ ] Testei o endpoint de e-mail
- [ ] Recebi o e-mail de teste

## 🆘 Se Ainda Houver Erro

### Erro: "Cannot find module 'nodemailer'"
```bash
npm install nodemailer @types/nodemailer --save
```

### Erro: "ENOENT: no such file or directory"
Verifique se os arquivos existem:
- `server/utils/email-service.ts` ✅
- `server/utils/email-jobs.ts` ✅
- `server/api/email/test-gmail.post.ts` ✅

### Erro: "npm ERR! code ERESOLVE"
```bash
npm install --legacy-peer-deps
```

### Limpar Cache
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

## ✅ Tudo Pronto!

Após seguir estes passos, o sistema de e-mail estará funcionando perfeitamente! 🎉

---

**Próximo passo:** Teste o Gmail com `curl -X POST http://localhost:3000/api/email/test-gmail`
