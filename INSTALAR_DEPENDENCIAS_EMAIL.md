# 📦 Instalar Dependências de E-mail

## ⚠️ IMPORTANTE: Execute este comando antes de rodar o servidor

O sistema de e-mail precisa do pacote `nodemailer` instalado.

## 🔧 Comando para Instalar

```bash
cd nuxt-app
npm install
```

Ou se preferir yarn:

```bash
cd nuxt-app
yarn install
```

## 📋 O que será instalado

- `nodemailer@^6.9.7` - Biblioteca para envio de e-mails
- `@types/nodemailer@^6.4.14` - Types do TypeScript

## ✅ Verificar Instalação

Após instalar, verifique se o nodemailer está listado:

```bash
npm list nodemailer
```

Deve mostrar:
```
nodemailer@6.9.7
```

## 🚀 Depois de Instalar

1. Reinicie o servidor:
   ```bash
   npm run dev
   ```

2. Teste a configuração:
   ```bash
   curl -X POST http://localhost:3000/api/email/test-gmail
   ```

## 🔍 Troubleshooting

### Erro: "Cannot find module 'nodemailer'"
**Solução:** Execute `npm install` novamente

### Erro: "ENOENT: no such file or directory"
**Solução:** Verifique se está na pasta `nuxt-app` antes de executar

### Erro: "npm ERR! code ERESOLVE"
**Solução:** Use `npm install --legacy-peer-deps`

---

**Após instalar, o sistema de e-mail estará pronto para uso!** ✅
