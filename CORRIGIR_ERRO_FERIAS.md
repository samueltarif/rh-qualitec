# 🔧 Corrigir Erro na Página de Férias

## ❌ Erros Encontrados

1. **useFerias is not defined** - Composable não está sendo reconhecido
2. **Cannot access 'resetForm' before initialization** - Ordem de declaração no componente

## ✅ Correções Aplicadas

### 1. FeriasSolicitacaoModal.vue
Corrigi a ordem das declarações - a função `resetForm` agora é declarada ANTES do `watch` que a utiliza.

### 2. Composable useFerias.ts
O arquivo está correto e na pasta correta (`app/composables/useFerias.ts`)

## 🚀 Como Resolver

### Opção 1: Reiniciar o Servidor (RECOMENDADO)

O Nuxt 3 precisa ser reiniciado para reconhecer novos composables:

```bash
# Pare o servidor (Ctrl+C)
# Depois inicie novamente:
npm run dev
```

### Opção 2: Limpar Cache do Nuxt

```bash
# Pare o servidor
# Limpe o cache
rm -rf .nuxt
rm -rf node_modules/.cache

# Inicie novamente
npm run dev
```

### Opção 3: Verificar nuxt.config.ts

Certifique-se de que o auto-import está habilitado:

```typescript
export default defineNuxtConfig({
  imports: {
    dirs: ['composables/**']
  }
})
```

## 🔍 Verificar se Funcionou

Após reiniciar, acesse:
```
http://localhost:3000/ferias
```

Você deve ver:
- ✅ Página carrega sem erros
- ✅ Dashboard com estatísticas
- ✅ Botão "Nova Solicitação" funciona
- ✅ Abas (Solicitações, Calendário, Configurações)

## 📝 Arquivos Corrigidos

1. `app/components/FeriasSolicitacaoModal.vue` - Ordem de declarações corrigida
2. `app/composables/useFerias.ts` - Já estava correto
3. `app/pages/ferias.vue` - Já estava correto

## ⚠️ Se o Erro Persistir

### Verificar se o arquivo existe:
```bash
ls app/composables/useFerias.ts
```

### Verificar se não há erros de sintaxe:
```bash
npm run typecheck
```

### Verificar logs do servidor:
Procure por erros no terminal onde o `npm run dev` está rodando.

## 🆘 Solução Alternativa

Se mesmo após reiniciar o erro persistir, adicione um import explícito na página:

```typescript
// No início do <script setup> em ferias.vue
import { useFerias } from '~/composables/useFerias'
```

Mas isso NÃO deveria ser necessário no Nuxt 3.

---

**Causa Raiz:** O Nuxt 3 faz auto-import de composables, mas precisa ser reiniciado quando novos arquivos são criados na pasta `composables/`.

**Solução:** Reinicie o servidor de desenvolvimento.
