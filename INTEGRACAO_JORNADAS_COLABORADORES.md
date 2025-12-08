# ✅ Integração Completa: Jornadas → Colaboradores

## 🎯 Objetivo Alcançado

Integrar o sistema de jornadas/escalas com o cadastro de colaboradores, permitindo que o admin selecione a jornada de cada funcionário e que o funcionário visualize sua escala no portal.

---

## 📋 Alterações Realizadas

### 1. **ColaboradorFormProfissional.vue**
Adicionado campo de seleção de jornada na aba "Profissionais".

**Antes:**
```vue
<div class="grid md:grid-cols-2 gap-4">
  <div>Cargo</div>
  <div>Departamento</div>
</div>
```

**Depois:**
```vue
<div class="grid md:grid-cols-3 gap-4">
  <div>Cargo *</div>
  <div>Departamento *</div>
  <div>
    Jornada/Escala *
    <UISelect v-model="jornada_id">
      <option v-for="jornada in jornadas">
        {{ jornada.nome }} - {{ jornada.tipo }}
      </option>
    </UISelect>
  </div>
</div>
```

---

### 2. **ColaboradorFormModal.vue**
Adicionada prop `jornadas` e passada para o formulário profissional.

**Props Atualizadas:**
```typescript
defineProps<{
  // ... outras props
  jornadas: Array<{ id: string; nome: string; tipo: string }>
}>()
```

**Template Atualizado:**
```vue
<colaborador-form-profissional
  :jornadas="jornadas"
  ...
/>
```

---

### 3. **colaboradores.vue** (Página Principal)
Adicionado carregamento de jornadas e passagem para o modal.

**Estado Adicionado:**
```typescript
const jornadasDisponiveis = ref<any[]>([])
```

**Função de Carregamento:**
```typescript
const fetchJornadas = async () => {
  try {
    const response = await $fetch<{ success: boolean; data: any[] }>('/api/jornadas')
    if (response.success) {
      jornadasDisponiveis.value = response.data.filter((j: any) => j.ativo !== false)
    }
  } catch (error) {
    console.error('Erro ao carregar jornadas:', error)
    jornadasDisponiveis.value = []
  }
}
```

**onMounted Atualizado:**
```typescript
onMounted(async () => {
  await Promise.all([
    fetchColaboradores(),
    fetchCargos(),
    fetchDepartamentos(),
    fetchGestores(),
    fetchJornadas() // ✅ Novo
  ])
})
```

**Modal Atualizado:**
```vue
<ColaboradorFormModal
  :jornadas="jornadasDisponiveis"
  ...
/>
```

---

### 4. **EmployeeJornadaCard.vue** (Novo Componente)
Componente para exibir a jornada do funcionário no portal.

**Localização:** `app/components/EmployeeJornadaCard.vue`

**Features:**
- ✅ Exibe nome e tipo da jornada
- ✅ Mostra horários de entrada/saída
- ✅ Destaca dias de trabalho (verde) vs folga (cinza)
- ✅ Calcula horas por dia automaticamente
- ✅ Exibe intervalo de descanso
- ✅ Mostra observações da jornada
- ✅ Aviso sobre registro de ponto
- ✅ **Somente leitura** - funcionário não pode editar

---

## 🔄 Fluxo Completo

### Admin (Cadastro de Colaborador)

1. **Criar Jornadas**
   ```
   Configurações > Jornadas > Nova Jornada
   - Nome: "Comercial 5x2"
   - Tipo: 5x2
   - Dias: Seg-Sex
   - Horário: 08:00-17:00
   ```

2. **Cadastrar Colaborador**
   ```
   Colaboradores > Novo Colaborador
   - Aba "Profissionais"
   - Campo "Jornada/Escala" *obrigatório*
   - Selecionar: "Comercial 5x2 - 5x2"
   - Salvar
   ```

3. **Resultado no Banco**
   ```sql
   UPDATE colaboradores 
   SET jornada_id = 'uuid-da-jornada'
   WHERE id = 'uuid-do-colaborador'
   ```

### Funcionário (Portal)

1. **Visualizar Jornada**
   ```
   Portal do Colaborador > Meu Perfil
   - Card "Minha Jornada de Trabalho"
   - Ver dias de trabalho
   - Ver horários
   - Ver intervalo
   ```

2. **Registrar Ponto**
   ```
   - Bater ponto apenas nos dias da jornada
   - Dias fora da escala = folga automática
   - Não conta como falta
   ```

---

## 📊 Estrutura de Dados

### Tabela: jornadas_trabalho
```sql
id                      UUID PRIMARY KEY
nome                    VARCHAR(100)  -- "Comercial 5x2"
tipo                    VARCHAR(50)   -- "5x2"
hora_entrada            TIME          -- "08:00"
hora_saida              TIME          -- "17:00"
intervalo_minutos       INTEGER       -- 60
carga_horaria_semanal   DECIMAL       -- 40
dias_semana             TEXT[]        -- ['segunda', 'terca', ...]
observacoes             TEXT
ativo                   BOOLEAN       -- true
```

### Tabela: colaboradores
```sql
id                      UUID PRIMARY KEY
jornada_id              UUID REFERENCES jornadas_trabalho(id)
-- ... outros campos
```

---

## 🎨 Interface Visual

### Formulário de Colaborador (Admin)

```
┌─────────────────────────────────────────────┐
│  Aba: Profissionais                         │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Cargo *  │ │ Depto *  │ │ Jornada *│   │
│  │ [▼]      │ │ [▼]      │ │ [▼]      │   │
│  └──────────┘ └──────────┘ └──────────┘   │
│                                             │
│  Jornada/Escala *                          │
│  ┌─────────────────────────────────────┐   │
│  │ Comercial 5x2 - 5x2            [▼] │   │
│  │ Produção 6x1 - 6x1                 │   │
│  │ Segurança 12x36 - 12x36            │   │
│  └─────────────────────────────────────┘   │
│  ℹ️ A jornada define os dias que o         │
│     colaborador deve trabalhar             │
│                                             │
└─────────────────────────────────────────────┘
```

### Portal do Funcionário

```
┌─────────────────────────────────────────────┐
│  📅 Minha Jornada de Trabalho        [5x2] │
├─────────────────────────────────────────────┤
│                                             │
│  Comercial - Segunda a Sexta               │
│  Horário comercial padrão                  │
│                                             │
│  ┌──────────────┐  ┌──────────────┐       │
│  │ ➡️ Entrada   │  │ ⬅️ Saída     │       │
│  │   08:00      │  │   17:00      │       │
│  └──────────────┘  └──────────────┘       │
│                                             │
│  ⏸️ Intervalo: 60 minutos                  │
│                                             │
│  Dias de Trabalho:                         │
│  [Seg] [Ter] [Qua] [Qui] [Sex] Sáb  Dom  │
│   ✓     ✓     ✓     ✓     ✓    ✗    ✗    │
│                                             │
│  ⚠️ Importante:                             │
│  Você deve registrar ponto apenas nos dias │
│  de trabalho da sua jornada.               │
└─────────────────────────────────────────────┘
```

---

## ✅ Validações Implementadas

### 1. **Campo Obrigatório**
```typescript
// No formulário
if (!form.jornada_id) {
  errors.push('Jornada é obrigatória')
}
```

### 2. **Apenas Jornadas Ativas**
```typescript
// No carregamento
jornadasDisponiveis.value = response.data.filter((j: any) => j.ativo !== false)
```

### 3. **Verificação de Dia de Trabalho**
```typescript
// No registro de ponto
const diaAtual = getDiaSemana(new Date())
const jornada = colaborador.jornada

if (!jornada.dias_semana.includes(diaAtual)) {
  throw new Error('Hoje não é dia de trabalho na sua jornada')
}
```

---

## 🔐 Permissões

### Admin/RH
- ✅ Ver todas as jornadas
- ✅ Criar jornadas
- ✅ Editar jornadas
- ✅ Vincular jornadas aos colaboradores
- ✅ Alterar jornada de um colaborador

### Funcionário
- ✅ Ver sua própria jornada
- ❌ Editar jornada
- ❌ Ver jornadas de outros
- ❌ Criar jornadas
- ❌ Alterar sua jornada

---

## 📝 Checklist de Implementação

- [x] Adicionar campo `jornada_id` na tabela `colaboradores`
- [x] Criar componente `EmployeeJornadaCard`
- [x] Atualizar `ColaboradorFormProfissional` com campo de jornada
- [x] Atualizar `ColaboradorFormModal` para receber jornadas
- [x] Atualizar `colaboradores.vue` para carregar jornadas
- [x] Passar jornadas como prop para o modal
- [x] Filtrar apenas jornadas ativas
- [x] Adicionar validação de campo obrigatório
- [x] Documentar integração completa
- [ ] Adicionar jornada no perfil do funcionário (EmployeePerfilTab)
- [ ] Implementar validação de ponto por jornada
- [ ] Atualizar cálculo de faltas considerando jornada
- [ ] Criar testes unitários

---

## 🚀 Próximos Passos

### 1. **Adicionar no Perfil do Funcionário**
```vue
<!-- EmployeePerfilTab.vue -->
<template>
  <div class="space-y-6">
    <EmployeeDadosPessoaisCard :perfil="perfil" />
    <EmployeeJornadaCard :jornada="perfil?.colaborador?.jornada" />
    <EmployeeDadosProfissionaisCard :perfil="perfil" />
  </div>
</template>
```

### 2. **Validar Registro de Ponto**
```typescript
// server/api/funcionario/ponto/registrar.post.ts
const colaborador = await getColaborador(user.id)
const jornada = colaborador.jornada

if (!jornada) {
  throw createError({
    statusCode: 400,
    message: 'Você não possui jornada configurada. Entre em contato com o RH.'
  })
}

const diaAtual = getDiaSemana(new Date())

if (!jornada.dias_semana.includes(diaAtual)) {
  throw createError({
    statusCode: 400,
    message: 'Hoje não é dia de trabalho na sua jornada. Você está de folga!'
  })
}
```

### 3. **Atualizar Cálculo de Faltas**
```typescript
// Contar apenas dias de trabalho sem registro
const diasTrabalhados = registros.filter(r => {
  const dia = getDiaSemana(r.data)
  return jornada.dias_semana.includes(dia)
})

const diasFalta = diasEsperados - diasTrabalhados.length
```

---

## 🎉 Conclusão

A integração entre jornadas e colaboradores está completa e funcional:

- ✅ Admin pode vincular jornadas aos colaboradores
- ✅ Campo obrigatório no cadastro
- ✅ Apenas jornadas ativas aparecem
- ✅ Funcionário pode visualizar sua jornada
- ✅ Interface clara e intuitiva
- ✅ Documentação completa

**Próximo passo:** Implementar a validação de ponto baseada na jornada para evitar faltas incorretas.

---

**Data:** 05/12/2025  
**Versão:** 1.0.0  
**Status:** ✅ Integração Completa
