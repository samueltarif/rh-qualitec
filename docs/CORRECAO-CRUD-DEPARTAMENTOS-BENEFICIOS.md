# 🔧 Correção: CRUD de Departamentos e Benefícios

## ❌ Problema

Páginas `/admin/departamentos` e `/admin/beneficios` mostravam `alert()` fake em vez de salvar no banco.

### Erro Encontrado:
```
Invalid lazy handler result. It should be a function
```

**Causa:** Conflito de rotas quando GET e POST usam o mesmo arquivo `index`.

## ✅ Solução Aplicada

### 1. Departamentos

#### Problema:
- Arquivo: `server/api/departamentos/index.post.ts`
- Conflito com: `server/api/departamentos/index.get.ts`
- Nuxt não conseguia diferenciar as rotas

#### Solução:
```bash
# Renomear arquivo POST para evitar conflito
server/api/departamentos/index.post.ts → server/api/departamentos/criar.post.ts
```

#### Arquivos Criados:
- ✅ `server/api/departamentos/criar.post.ts` - API para criar/atualizar
- ✅ `server/api/departamentos/index.get.ts` - API para listar (já existia)

#### Frontend Atualizado:
```typescript
// ANTES
await $fetch('/api/departamentos', { method: 'POST' })

// DEPOIS
await $fetch('/api/departamentos/criar', { method: 'POST' })
```

### 2. Benefícios (Mesma Correção)

#### Estrutura de Rotas:
```
server/api/beneficios/
  ├── index.get.ts    → GET /api/beneficios (listar)
  └── criar.post.ts   → POST /api/beneficios/criar (criar/atualizar)
```

## 📋 Padrão de Nomenclatura

### ❌ Evitar (Causa Conflito):
```
server/api/recurso/
  ├── index.get.ts
  └── index.post.ts   ← CONFLITO!
```

### ✅ Usar (Sem Conflito):
```
server/api/recurso/
  ├── index.get.ts      → GET /api/recurso
  ├── criar.post.ts     → POST /api/recurso/criar
  ├── [id].get.ts       → GET /api/recurso/:id
  ├── [id].patch.ts     → PATCH /api/recurso/:id
  └── [id].delete.ts    → DELETE /api/recurso/:id
```

## 🎯 Implementação Completa

### Departamentos

**API Backend:**
```typescript
// server/api/departamentos/criar.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  if (body.id) {
    // Atualizar existente
    await fetch(`${supabaseUrl}/rest/v1/departamentos?id=eq.${body.id}`, {
      method: 'PATCH',
      body: JSON.stringify(body)
    })
  } else {
    // Criar novo
    await fetch(`${supabaseUrl}/rest/v1/departamentos`, {
      method: 'POST',
      body: JSON.stringify(body)
    })
  }
})
```

**Frontend:**
```typescript
// app/pages/admin/departamentos.vue
const salvar = async () => {
  const response = await $fetch('/api/departamentos/criar', {
    method: 'POST',
    body: form.value
  })
  
  if (response.success) {
    mostrarNotificacao('Sucesso!', response.message)
    await carregarDepartamentos()
  }
}
```

### Benefícios (Mesmo Padrão)

**API Backend:**
```typescript
// server/api/beneficios/criar.post.ts
export default defineEventHandler(async (event) => {
  // Mesma lógica de departamentos
})
```

**Frontend:**
```typescript
// app/pages/admin/beneficios.vue
const salvar = async () => {
  const response = await $fetch('/api/beneficios/criar', {
    method: 'POST',
    body: form.value
  })
}
```

## 🧪 Como Testar

### Departamentos
1. Acesse `/admin/departamentos`
2. Clique em "➕ Novo Departamento"
3. Preencha os dados
4. Clique em "Salvar"
5. Deve aparecer notificação de sucesso
6. Departamento aparece na lista
7. Recarregue (F5) - deve continuar lá ✅

### Benefícios
1. Acesse `/admin/beneficios`
2. Clique em "➕ Novo Benefício"
3. Preencha os dados
4. Clique em "Salvar"
5. Deve aparecer notificação de sucesso
6. Benefício aparece na lista
7. Recarregue (F5) - deve continuar lá ✅

## 📝 Checklist de Implementação

### Departamentos
- [x] API GET criada
- [x] API POST criada (criar.post.ts)
- [x] Frontend carrega do banco
- [x] Frontend salva no banco
- [x] Notificações funcionando
- [x] Loading states
- [x] Empty state

### Benefícios
- [ ] API GET criada
- [ ] API POST criada (criar.post.ts)
- [ ] Frontend carrega do banco
- [ ] Frontend salva no banco
- [ ] Notificações funcionando
- [ ] Loading states
- [ ] Empty state

## 🔍 Verificar Estrutura do Banco

Antes de implementar, verificar campos da tabela:

```javascript
// verificar-schema-beneficios.js
const { data } = await supabase
  .from('beneficios')
  .select('*')
  .limit(1)

console.log('Campos:', Object.keys(data[0]))
```

## ⚠️ Lições Aprendidas

1. **Não usar `index` para múltiplos métodos HTTP**
   - Causa conflito no Nuxt
   - Usar nomes descritivos: `criar.post.ts`, `atualizar.patch.ts`

2. **Sempre testar após criar API**
   - Verificar se rota está acessível
   - Testar com dados reais

3. **Reiniciar servidor após criar novas rotas**
   - Nuxt precisa recarregar estrutura de rotas
   - `Ctrl+C` e `npm run dev`

4. **Usar Service Role Key para operações de escrita**
   - Bypassa RLS
   - Mais seguro que expor no frontend

## 📚 Arquivos Relacionados

### Departamentos
- `server/api/departamentos/index.get.ts`
- `server/api/departamentos/criar.post.ts`
- `app/pages/admin/departamentos.vue`

### Benefícios
- `server/api/beneficios/index.get.ts` (a criar)
- `server/api/beneficios/criar.post.ts` (a criar)
- `app/pages/admin/beneficios.vue`

---

**Status Departamentos:** ✅ Implementado e Funcionando  
**Status Benefícios:** 🔄 Em Implementação  
**Data:** 14/01/2026
