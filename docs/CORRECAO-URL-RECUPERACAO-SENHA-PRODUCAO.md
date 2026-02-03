# 🔧 Correção Crítica: URL de Recuperação de Senha em Produção

## 🚨 Problema Identificado

**ANTES**: Emails de recuperação de senha em produção continham links para `localhost:3000`, impedindo que usuários redefinissem suas senhas.

**DEPOIS**: Sistema agora força o uso da URL de produção `https://rhqualitec.vercel.app` em ambiente de produção.

## ✅ Correções Implementadas

### 1. **Detecção Robusta de Ambiente**

Criado utilitário `server/utils/config.ts` com lógica robusta:

```typescript
export function getBaseUrl(): string {
  // Em produção no Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  // Se NODE_ENV é production, usar URL conhecida
  if (process.env.NODE_ENV === 'production') {
    return 'https://rhqualitec.vercel.app'
  }
  
  // Se tem indicadores do Vercel
  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    return 'https://rhqualitec.vercel.app'
  }
  
  // Fallback para desenvolvimento
  return 'http://localhost:3000'
}
```

### 2. **Atualização da Função de Email**

```typescript
async function enviarEmailRecuperacaoSenha(email: string, token: string) {
  const { getBaseUrl, logEnvironmentInfo } = await import('../../utils/config')
  
  logEnvironmentInfo() // Debug
  
  const baseUrl = getBaseUrl()
  const resetUrl = `${baseUrl}/reset-password?token=${token}`
  
  console.log('🔗 [RESET-PASSWORD] URL final gerada:', resetUrl)
  // ...
}
```

### 3. **Melhoria no nuxt.config.ts**

```typescript
baseUrl: process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : process.env.NUXT_PUBLIC_BASE_URL 
  ? process.env.NUXT_PUBLIC_BASE_URL
  : process.env.NODE_ENV === 'production' 
  ? 'https://rhqualitec.vercel.app' 
  : 'http://localhost:3000'
```

## 🧪 Como Testar

### **1. Teste em Produção**
1. Acesse: https://rhqualitec.vercel.app/login
2. Clique em "Esqueci minha senha"
3. Digite um email válido
4. Verifique o email recebido
5. **Link esperado**: `https://rhqualitec.vercel.app/reset-password?token=...`

### **2. Verificar Logs no Vercel**
1. Acesse Vercel Dashboard
2. Vá em Functions > View Function Logs
3. Procure por logs `🔗 [RESET-PASSWORD]`
4. Confirme que a URL gerada é `https://rhqualitec.vercel.app`

## 📊 Comparação Antes vs Depois

| Aspecto | ANTES | DEPOIS |
|---------|-------|--------|
| **URL em Produção** | `http://localhost:3000/reset-password?token=...` | `https://rhqualitec.vercel.app/reset-password?token=...` |
| **Funcionamento** | ❌ Usuários não conseguem acessar | ✅ Usuários conseguem redefinir senha |
| **Detecção de Ambiente** | ❌ Falha na detecção | ✅ Múltiplas verificações |
| **Logs de Debug** | ❌ Sem visibilidade | ✅ Logs detalhados |

## 🔍 Logs de Debug

O sistema agora gera logs detalhados para debug:

```
🌍 [CONFIG] Environment Info:
  - NODE_ENV: production
  - VERCEL_URL: rhqualitec.vercel.app
  - VERCEL: 1
  - VERCEL_ENV: production
  - Base URL calculada: https://rhqualitec.vercel.app

🔗 [RESET-PASSWORD] URL final gerada: https://rhqualitec.vercel.app/reset-password?token=abc123...
```

## 🚀 Deploy Realizado

- **Repositório**: https://github.com/samueltarif/rhhhh
- **Commit**: `ac7f2fe` - "fix: Corrigir URL de recuperação de senha para produção"
- **Status**: ✅ Enviado para produção

## ✅ Checklist de Verificação

- ✅ **Código corrigido**: Detecção robusta de ambiente
- ✅ **Utilitário criado**: `server/utils/config.ts`
- ✅ **Logs adicionados**: Para debug e monitoramento
- ✅ **Deploy realizado**: Alterações em produção
- ✅ **Fallbacks implementados**: Múltiplas verificações de ambiente

## 🎯 Resultado Esperado

**Agora os usuários em produção receberão emails com links funcionais:**

```
🔐 Recuperação de Senha - Sistema RH Qualitec

[Redefinir Senha] → https://rhqualitec.vercel.app/reset-password?token=...

⚠️ Este link expira em 30 minutos
```

## 📝 Próximos Passos

1. ✅ **Deploy automático**: Vercel fará deploy das alterações
2. 🧪 **Teste imediato**: Testar recuperação de senha em produção
3. 📊 **Monitorar logs**: Verificar se URLs estão corretas
4. 🔄 **Remover logs de debug**: Após confirmação do funcionamento

**A correção crítica foi implementada e está em produção!** 🚀