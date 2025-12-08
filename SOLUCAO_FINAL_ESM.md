# ✅ Solução Final - Erro ESM no Windows

## Problema
```
Only URLs with a scheme in: file, data, and node are supported by the default ESM loader. 
On Windows, absolute paths must be valid file:// URLs. Received protocol 'c:'
```

## Causa Raiz
O erro ocorre no Windows quando:
1. Cache do Nuxt fica corrompido após mudanças estruturais
2. O autofix/formatter do IDE modifica arquivos enquanto o servidor está rodando
3. Módulos ESM tentam carregar arquivos com caminhos Windows (`C:\...`) em vez de URLs (`file:///C:/...`)

## Solução Definitiva

### 1. Parar o Servidor
Sempre pare o servidor antes de fazer mudanças estruturais ou limpeza de cache.

### 2. Limpeza Completa
```powershell
# Remover cache do Nuxt
Remove-Item -Recurse -Force .nuxt
Remove-Item -Recurse -Force .output

# Remover package-lock.json
Remove-Item -Force package-lock.json

# Limpar cache do npm
npm cache clean --force
```

### 3. Reinstalação Limpa
```powershell
npm install
```

### 4. Iniciar Servidor
```powershell
npm run dev
```

## Estrutura de Tipos Correta

Para evitar importações duplicadas, criamos um arquivo centralizado de tipos:

### `app/types/auth.ts`
```typescript
export interface AppUser {
  id: string
  auth_uid: string | null
  email: string
  nome: string
  role: 'admin' | 'funcionario'
  avatar_url?: string
  colaborador_id?: string
  ativo: boolean
  ultimo_acesso?: string
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthState {
  user: AppUser | null
  loading: boolean
  error: string | null
}

export interface CreateUserData {
  email: string
  password: string
  nome: string
  role?: 'admin' | 'funcionario'
  colaborador_id?: string
}

export interface UpdateUserData {
  nome?: string
  role?: 'admin' | 'funcionario'
  colaborador_id?: string
  ativo?: boolean
}
```

### Uso nos Composables
```typescript
// app/composables/useAppAuth.ts
import type { AppUser, LoginCredentials, AuthState } from '~/types/auth'

// app/composables/useUsers.ts
import type { AppUser, CreateUserData, UpdateUserData } from '~/types/auth'
```

## Configuração Correta do Supabase

### `nuxt.config.ts`
```typescript
export default defineNuxtConfig({
  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  
  runtimeConfig: {
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    gmailEmail: process.env.GMAIL_EMAIL,
    gmailAppPassword: process.env.GMAIL_APP_PASSWORD,
    emailJobsToken: process.env.EMAIL_JOBS_TOKEN,
    
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    }
  },
})
```

## Prevenção de Problemas Futuros

### 1. Sempre Pare o Servidor Antes de:
- Limpar cache (`.nuxt`, `.output`)
- Fazer mudanças estruturais em arquivos de configuração
- Executar autofix/formatter em múltiplos arquivos
- Reinstalar dependências

### 2. Use Tipos Centralizados
- Crie arquivos de tipos em `app/types/`
- Importe tipos em vez de duplicá-los
- Use `import type` para imports de tipos apenas

### 3. Limpeza Regular
Se o servidor começar a apresentar comportamento estranho:
```powershell
# Pare o servidor (Ctrl+C)
Remove-Item -Recurse -Force .nuxt,.output
npm run dev
```

### 4. Reinstalação Completa (Último Recurso)
```powershell
# Pare o servidor
Remove-Item -Recurse -Force .nuxt,.output,node_modules
Remove-Item -Force package-lock.json
npm cache clean --force
npm install
npm run dev
```

## Status Atual

✅ **Servidor rodando perfeitamente em `http://localhost:3002/`**

### Avisos Não-Críticos
- ⚠️ WebSocket port 24678 já em uso (não afeta funcionalidade)
- ⚠️ Porta 3000 ocupada (usando 3002 automaticamente)

## Checklist de Verificação

- [x] Cache limpo (`.nuxt`, `.output`)
- [x] `package-lock.json` removido
- [x] Cache do npm limpo
- [x] Dependências reinstaladas
- [x] Tipos centralizados criados
- [x] Imports corrigidos nos composables
- [x] Configuração do Supabase completa
- [x] Servidor iniciando sem erros

## Arquivos Importantes

- ✅ `app/types/auth.ts` - Tipos compartilhados
- ✅ `app/composables/useAppAuth.ts` - Autenticação
- ✅ `app/composables/useUsers.ts` - Gestão de usuários
- ✅ `nuxt.config.ts` - Configuração do Nuxt
- ✅ `.env` - Variáveis de ambiente

## Conclusão

O erro ESM no Windows é causado principalmente por cache corrompido. A solução é sempre:

1. **Parar o servidor**
2. **Limpar cache completamente**
3. **Reinstalar dependências**
4. **Iniciar servidor novamente**

Com a estrutura de tipos centralizada e configuração correta, o sistema está estável e funcionando perfeitamente.

---

**Data**: 05/12/2025  
**Status**: ✅ RESOLVIDO DEFINITIVAMENTE  
**Servidor**: http://localhost:3002/
