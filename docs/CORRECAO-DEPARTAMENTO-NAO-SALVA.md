# 🔧 Correção: Departamento Não Estava Salvando

## ❌ Problema

Ao tentar salvar dados profissionais na página "Meus Dados":
- ✅ Cargo salvava corretamente
- ❌ Departamento **não salvava**
- ✅ Mensagem de sucesso aparecia
- ❌ Ao recarregar, departamento voltava ao valor anterior

## 🔍 Investigação

### Erro 1: Campos Errados no Banco

**Problema:** Código estava usando `cargo` e `departamento` (texto), mas o banco usa `cargo_id` e `departamento_id` (IDs de referência).

```typescript
// ❌ ERRADO
body: {
  cargo: 'Gerente',           // Não existe no banco
  departamento: 'RH'          // Não existe no banco
}

// ✅ CORRETO
body: {
  cargo_id: 1,                // ID da tabela cargos
  departamento_id: 2          // ID da tabela departamentos
}
```

### Erro 2: Tabela Departamentos Vazia

**Problema:** Tentava salvar `departamento_id = 1`, mas não existia departamento com ID=1 no banco.

```
ERROR: insert or update on table "funcionarios" violates 
foreign key constraint "funcionarios_departamento_id_fkey"

Details: Key (departamento_id)=(1) is not present in table "departamentos".
```

### Erro 3: Campos de Texto em Vez de Selects

**Problema:** Interface usava `<UiInput>` (texto livre) em vez de `<UiSelect>` (lista de opções).

```vue
<!-- ❌ ERRADO -->
<UiInput v-model="dadosProfissionais.departamento" label="Departamento" />

<!-- ✅ CORRETO -->
<UiSelect 
  v-model="dadosProfissionais.departamento" 
  :options="departamentosOptions"
  label="Departamento" 
/>
```

## ✅ Soluções Aplicadas

### 1. Corrigir Nomes dos Campos

#### Backend (server/api/funcionarios/meus-dados.patch.ts)
```typescript
// ANTES
if (body.cargo !== undefined) camposPermitidos.cargo = body.cargo
if (body.departamento !== undefined) camposPermitidos.departamento = body.departamento

// DEPOIS
if (body.cargo_id !== undefined) camposPermitidos.cargo_id = body.cargo_id
if (body.departamento_id !== undefined) camposPermitidos.departamento_id = body.departamento_id
```

#### Frontend (app/pages/meus-dados.vue)
```typescript
// ANTES
body: {
  cargo: dadosProfissionais.value.cargo,
  departamento: dadosProfissionais.value.departamento
}

// DEPOIS
body: {
  cargo_id: dadosProfissionais.value.cargo,
  departamento_id: dadosProfissionais.value.departamento
}
```

### 2. Criar Departamentos no Banco

**Arquivo:** `criar-departamentos-basicos.sql`

```sql
INSERT INTO departamentos (nome, descricao, ativo) VALUES
  ('Recursos Humanos', 'Gestão de pessoas e benefícios', true),
  ('Financeiro', 'Controle financeiro e contabilidade', true),
  ('TI', 'Tecnologia da Informação', true),
  ('Comercial', 'Vendas e relacionamento com clientes', true),
  ('Produção', 'Fabricação e controle de qualidade', true),
  ('Administrativo', 'Suporte administrativo geral', true);
```

**Como executar:**
1. Acesse Supabase Dashboard → SQL Editor
2. Cole o SQL acima
3. Execute (Run)

### 3. Criar API de Departamentos

**Arquivo:** `server/api/departamentos/index.get.ts`

```typescript
export default defineEventHandler(async (event) => {
  // Busca departamentos ativos do banco
  const response = await fetch(
    `${supabaseUrl}/rest/v1/departamentos?select=*&ativo=eq.true&order=nome.asc`
  )
  
  return {
    success: true,
    data: await response.json()
  }
})
```

### 4. Usar Selects em Vez de Inputs

**Antes:**
```vue
<UiInput v-model="dadosProfissionais.cargo" label="Cargo" />
<UiInput v-model="dadosProfissionais.departamento" label="Departamento" />
```

**Depois:**
```vue
<UiSelect 
  v-model="dadosProfissionais.cargo" 
  :options="cargosOptions"
  label="Cargo" 
/>
<UiSelect 
  v-model="dadosProfissionais.departamento" 
  :options="departamentosOptions"
  label="Departamento" 
/>
```

### 5. Carregar Opções do Banco

```typescript
const carregarOpcoes = async () => {
  // Carregar cargos
  const cargosRes = await $fetch('/api/cargos')
  cargosOptions.value = cargosRes.data.map(c => ({
    value: c.id.toString(),
    label: c.nome
  }))

  // Carregar departamentos
  const deptosRes = await $fetch('/api/departamentos')
  departamentosOptions.value = deptosRes.data.map(d => ({
    value: d.id.toString(),
    label: d.nome
  }))

  // Carregar empresas
  const empresasRes = await $fetch('/api/empresas')
  empresasOptions.value = empresasRes.data.map(e => ({
    value: e.id.toString(),
    label: e.razao_social
  }))
}
```

### 6. Converter IDs em Nomes para Visualização

```typescript
// Mapas para converter ID → Nome
const cargosMap = ref<Record<string, string>>({})
const departamentosMap = ref<Record<string, string>>({})
const empresasMap = ref<Record<string, string>>({})

// Funções auxiliares
const obterNomeCargo = (id: string) => cargosMap.value[id] || id
const obterNomeDepartamento = (id: string) => departamentosMap.value[id] || id
const obterNomeEmpresa = (id: string) => empresasMap.value[id] || id
```

```vue
<!-- Modo visualização -->
<p>{{ obterNomeDepartamento(dadosProfissionais.departamento) }}</p>

<!-- Modo edição -->
<UiSelect v-model="dadosProfissionais.departamento" :options="departamentosOptions" />
```

## 📊 Fluxo Completo Corrigido

```
┌─────────────────────────────────────┐
│  1. Usuário abre /meus-dados        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. carregarOpcoes()                │
│     - GET /api/cargos               │
│     - GET /api/departamentos  ← NOVO│
│     - GET /api/empresas             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. carregarDados()                 │
│     - GET /api/funcionarios/...     │
│     - Recebe cargo_id = 5           │
│     - Recebe departamento_id = 2    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. Exibe na tela                   │
│     - Cargo: "Gerente" (ID 5)       │
│     - Depto: "RH" (ID 2)            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5. Usuário edita e salva           │
│     - Seleciona "Financeiro" (ID 3) │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  6. salvarDadosProfissionais()      │
│     - PATCH /api/funcionarios/...   │
│     - body: { departamento_id: 3 }  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  7. Backend atualiza banco          │
│     UPDATE funcionarios             │
│     SET departamento_id = 3         │
│     WHERE id = 1                    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  8. ✅ Sucesso!                     │
│     - Notificação aparece           │
│     - Dados recarregados            │
│     - Departamento salvo!           │
└─────────────────────────────────────┘
```

## 🧪 Como Testar

### Passo 1: Criar Departamentos no Banco
```bash
# No Supabase SQL Editor, execute:
# criar-departamentos-basicos.sql
```

### Passo 2: Reiniciar Servidor
```bash
# Ctrl+C para parar
npm run dev
```

### Passo 3: Testar no Sistema
1. Faça login como admin (Silvana)
2. Acesse `/meus-dados`
3. Clique em "✏️ Editar" em Dados Profissionais
4. Selecione um departamento diferente
5. Clique em "💾 Salvar"
6. Deve mostrar "✅ Sucesso!"
7. Recarregue a página (F5)
8. Departamento deve estar salvo! ✅

## 📝 Arquivos Criados/Modificados

### Criados
- ✅ `server/api/departamentos/index.get.ts` - API para listar departamentos
- ✅ `criar-departamentos-basicos.sql` - SQL para criar departamentos
- ✅ `docs/CORRECAO-DEPARTAMENTO-NAO-SALVA.md` - Esta documentação

### Modificados
- ✅ `server/api/funcionarios/meus-dados.patch.ts` - Corrigido para usar `cargo_id` e `departamento_id`
- ✅ `app/pages/meus-dados.vue` - Adicionado selects, carregamento de opções, mapas de conversão

## ✅ Checklist de Validação

- [ ] Departamentos criados no banco
- [ ] API `/api/departamentos` funcionando
- [ ] Selects aparecem em vez de inputs
- [ ] Opções carregam do banco
- [ ] Cargo salva corretamente
- [ ] Departamento salva corretamente
- [ ] Empresa salva corretamente
- [ ] Dados persistem após recarregar
- [ ] Nomes aparecem corretamente em modo visualização

## 🎯 Resumo dos Erros

| Erro | Causa | Solução |
|------|-------|---------|
| **Campos errados** | Usava `cargo` em vez de `cargo_id` | Corrigido para `cargo_id` e `departamento_id` |
| **Tabela vazia** | Departamentos não existiam no banco | Criado SQL para inserir departamentos |
| **Sem API** | Não havia API para listar departamentos | Criado `server/api/departamentos/index.get.ts` |
| **Input de texto** | Usava `<UiInput>` em vez de `<UiSelect>` | Mudado para `<UiSelect>` com opções |
| **Sem conversão** | IDs apareciam em vez de nomes | Criado mapas e funções de conversão |

---

**Status:** ✅ Corrigido  
**Data:** 14/01/2026  
**Problema:** Departamento não salvava  
**Causa:** Campos errados + tabela vazia + interface inadequada  
**Solução:** Corrigir campos, criar departamentos, criar API, usar selects
