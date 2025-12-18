# ✅ CORREÇÃO: Cargo não aparece no Modal de Rescisão

## 🐛 Problema Identificado

No modal de simulação de rescisão (`ModalSimuladorRescisao.vue`), o cargo do colaborador não estava sendo exibido corretamente, mesmo sendo registrado no formulário de cadastro (`ColaboradorFormProfissional.vue`).

## 🔍 Causa Raiz

As APIs de colaboradores estavam retornando os relacionamentos com nomes diferentes:
- API individual (`/api/colaboradores/[id]`): retornava `cargo_rel` 
- API de listagem (`/api/colaboradores`): retornava `cargo` mas sem todos os campos

O modal esperava o formato `colaborador.cargo.nome`, mas a API individual não estava retornando nesse formato.

## ✅ Solução Aplicada

### 1. API Individual (`server/api/colaboradores/[id].get.ts`)

```typescript
// ✅ DEPOIS (CORRETO)
let { data, error } = await supabase
  .from('colaboradores')
  .select(`
    *,
    cargo:cargos(id, nome, nivel),
    departamento:departamentos(id, nome),
    jornada:jornadas_trabalho(id, nome, tipo)
  `)
  .eq('id', id)
  .single()
```

### 2. API de Listagem (`server/api/colaboradores/index.get.ts`)

```typescript
// ✅ DEPOIS (CORRETO)
const { data, error} = await client
  .from('colaboradores')
  .select(`
    id, 
    nome, 
    cpf, 
    salario, 
    salario_base, 
    data_admissao, 
    status, 
    email_corporativo, 
    matricula,
    tipo_contrato,
    qtd_dependentes,
    cargo:cargos(id, nome, nivel),
    departamento:departamentos(id, nome),
    jornada:jornadas_trabalho(id, nome, tipo)
  `)
  .eq('status', statusFilter)
  .order('nome')
```

## 📋 Arquivos Corrigidos

- ✅ `nuxt-app/server/api/colaboradores/[id].get.ts`
- ✅ `nuxt-app/server/api/colaboradores/index.get.ts`

## 🎯 Dados Agora Disponíveis

Agora o modal de rescisão tem acesso a:

### Dados do Colaborador
- ✅ `colaborador.nome`
- ✅ `colaborador.salario_base`
- ✅ `colaborador.data_admissao`
- ✅ `colaborador.tipo_contrato`
- ✅ `colaborador.qtd_dependentes`

### Dados do Cargo
- ✅ `colaborador.cargo.id`
- ✅ `colaborador.cargo.nome`
- ✅ `colaborador.cargo.nivel`

### Dados do Departamento
- ✅ `colaborador.departamento.id`
- ✅ `colaborador.departamento.nome`

### Dados da Jornada
- ✅ `colaborador.jornada.id`
- ✅ `colaborador.jornada.nome`
- ✅ `colaborador.jornada.tipo`

## 🧪 Como Testar

1. Acesse a página de Folha de Pagamento
2. Clique em "Simular Rescisão" nas Ações Rápidas
3. Selecione um colaborador no dropdown
4. ✅ Verifique que o cargo aparece corretamente: "Cargo: [Nome do Cargo]"
5. ✅ Verifique que o salário base aparece: "Salário Base: R$ X.XXX,XX"
6. ✅ Verifique que a data de admissão aparece: "Admissão: DD/MM/AAAA"
7. ✅ Verifique que o tipo de contrato aparece: "Tipo Contrato: CLT/PJ/etc"

## 📊 Resultado Esperado

No preview do colaborador (Etapa 1 do modal):

```
Dados do Colaborador
┌─────────────────────────────────────────┐
│ Cargo: Desenvolvedor Full Stack         │
│ Salário Base: R$ 5.000,00               │
│ Admissão: 15/01/2023                    │
│ Tipo Contrato: CLT                      │
└─────────────────────────────────────────┘
```

## 🎯 Status

**CORRIGIDO** ✅

Todos os dados do colaborador (cargo, departamento, jornada) agora são retornados corretamente pelas APIs e exibidos no modal de rescisão.
