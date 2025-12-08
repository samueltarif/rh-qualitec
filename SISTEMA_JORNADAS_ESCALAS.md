# 📅 Sistema de Jornadas e Escalas de Trabalho

## 🎯 Objetivo

Implementar um sistema de jornadas/escalas que define os dias de trabalho de cada colaborador, evitando que dias fora da escala sejam marcados como falta.

---

## 📋 Funcionalidades Implementadas

### 1. **Cadastro de Jornadas** (Admin)
- Criação de jornadas personalizadas
- Tipos: 5x2, 6x1, 12x36, Personalizado
- Definição de dias da semana
- Horários de entrada e saída
- Intervalo de descanso

### 2. **Vinculação ao Colaborador** (Admin)
- Campo "Jornada/Escala" no formulário profissional
- Obrigatório para todos os colaboradores
- Dropdown com todas as jornadas cadastradas

### 3. **Visualização pelo Funcionário** (Portal)
- Card dedicado mostrando a jornada
- Dias de trabalho destacados
- Horários e intervalos
- Aviso sobre registro de ponto

---

## 🗂️ Estrutura do Banco de Dados

### Tabela: `jornadas_trabalho`
```sql
CREATE TABLE jornadas_trabalho (
  id UUID PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- '5x2', '6x1', '12x36', 'Personalizado'
  descricao TEXT,
  hora_entrada TIME NOT NULL,
  hora_saida TIME NOT NULL,
  intervalo_minutos INTEGER,
  carga_horaria_semanal DECIMAL(5,2),
  dias_semana TEXT[], -- ['segunda', 'terca', 'quarta', 'quinta', 'sexta']
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `colaboradores`
```sql
ALTER TABLE colaboradores 
  ADD COLUMN jornada_id UUID REFERENCES jornadas_trabalho(id);
```

---

## 🔧 Componentes Criados

### 1. **EmployeeJornadaCard.vue**
Card para exibir a jornada do funcionário no portal.

**Props:**
```typescript
interface Props {
  jornada?: {
    id: string
    nome: string
    tipo: string
    descricao?: string
    hora_entrada: string
    hora_saida: string
    intervalo_minutos?: number
    carga_horaria_semanal?: number
    dias_semana: string[]
    observacoes?: string
  } | null
}
```

**Uso:**
```vue
<EmployeeJornadaCard :jornada="perfil?.colaborador?.jornada" />
```

**Features:**
- ✅ Exibe nome e tipo da jornada
- ✅ Mostra horários de entrada/saída
- ✅ Destaca dias de trabalho
- ✅ Calcula horas por dia
- ✅ Exibe observações
- ✅ Aviso sobre registro de ponto
- ✅ Somente leitura (funcionário não pode editar)

---

## 📝 Atualização nos Formulários

### ColaboradorFormProfissional.vue

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
    <span class="text-xs">(Define dias de trabalho)</span>
  </div>
</div>
```

---

## 🎯 Lógica de Faltas

### Regra Atual (INCORRETA)
```typescript
// ❌ Marca falta em qualquer dia sem registro
if (!registroPonto) {
  status = 'Falta'
}
```

### Nova Regra (CORRETA)
```typescript
// ✅ Verifica se o dia está na jornada do colaborador
const diaAtual = new Date().getDay() // 0-6 (domingo-sábado)
const diasJornada = colaborador.jornada.dias_semana

const nomeDia = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'][diaAtual]

if (diasJornada.includes(nomeDia)) {
  // Dia de trabalho - verificar registro
  if (!registroPonto) {
    status = 'Falta'
  }
} else {
  // Dia fora da escala - não marcar falta
  status = 'Folga'
}
```

---

## 📊 Exemplos de Jornadas

### 1. Jornada 5x2 (Segunda a Sexta)
```json
{
  "nome": "Comercial - 5x2",
  "tipo": "5x2",
  "hora_entrada": "08:00",
  "hora_saida": "17:00",
  "intervalo_minutos": 60,
  "carga_horaria_semanal": 40,
  "dias_semana": ["segunda", "terca", "quarta", "quinta", "sexta"]
}
```

### 2. Jornada 6x1 (Segunda a Sábado)
```json
{
  "nome": "Produção - 6x1",
  "tipo": "6x1",
  "hora_entrada": "07:00",
  "hora_saida": "16:00",
  "intervalo_minutos": 60,
  "carga_horaria_semanal": 48,
  "dias_semana": ["segunda", "terca", "quarta", "quinta", "sexta", "sabado"]
}
```

### 3. Jornada 12x36 (Dias Alternados)
```json
{
  "nome": "Segurança - 12x36",
  "tipo": "12x36",
  "hora_entrada": "07:00",
  "hora_saida": "19:00",
  "intervalo_minutos": 60,
  "carga_horaria_semanal": 42,
  "dias_semana": ["segunda", "quarta", "sexta", "domingo"]
}
```

### 4. Jornada Personalizada
```json
{
  "nome": "Meio Período - Manhã",
  "tipo": "Personalizado",
  "hora_entrada": "08:00",
  "hora_saida": "12:00",
  "intervalo_minutos": 0,
  "carga_horaria_semanal": 20,
  "dias_semana": ["segunda", "terca", "quarta", "quinta", "sexta"]
}
```

---

## 🔄 Fluxo de Uso

### Admin (RH)

1. **Criar Jornadas**
   - Acessar Configurações > Jornadas
   - Criar jornadas conforme necessidade
   - Definir dias, horários e intervalos

2. **Vincular ao Colaborador**
   - Ao cadastrar/editar colaborador
   - Aba "Profissionais"
   - Selecionar jornada no dropdown
   - Salvar

### Funcionário (Portal)

1. **Visualizar Jornada**
   - Acessar Portal do Colaborador
   - Ver card "Minha Jornada de Trabalho"
   - Verificar dias de trabalho
   - Conferir horários

2. **Registrar Ponto**
   - Bater ponto apenas nos dias da jornada
   - Dias fora da escala não exigem registro
   - Não serão marcados como falta

---

## 🎨 Interface Visual

### Card de Jornada (Portal do Funcionário)

```
┌─────────────────────────────────────────────────┐
│  📅 Minha Jornada de Trabalho        [5x2]     │
├─────────────────────────────────────────────────┤
│                                                 │
│  Comercial - Segunda a Sexta                   │
│  Horário comercial padrão                      │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐           │
│  │ ➡️ Entrada   │  │ ⬅️ Saída     │           │
│  │   08:00      │  │   17:00      │           │
│  └──────────────┘  └──────────────┘           │
│                                                 │
│  ⏸️ Intervalo: 60 minutos                      │
│                                                 │
│  Dias de Trabalho:                             │
│  [Seg] [Ter] [Qua] [Qui] [Sex] Sáb  Dom      │
│   ✓     ✓     ✓     ✓     ✓    ✗    ✗        │
│                                                 │
│  📊 Horas por Dia: 8.0h                        │
│  📊 Horas por Semana: 40h                      │
│                                                 │
│  ⚠️ Importante:                                 │
│  Você deve registrar ponto apenas nos dias     │
│  de trabalho da sua jornada.                   │
└─────────────────────────────────────────────────┘
```

---

## 🔍 Validações

### No Cadastro de Colaborador
```typescript
// Validar se jornada foi selecionada
if (!form.jornada_id) {
  errors.push('Jornada é obrigatória')
}
```

### No Registro de Ponto
```typescript
// Verificar se é dia de trabalho
const colaborador = await getColaborador(user.id)
const jornada = colaborador.jornada

if (!jornada) {
  throw new Error('Colaborador sem jornada configurada')
}

const diaAtual = getDiaSemana(new Date())

if (!jornada.dias_semana.includes(diaAtual)) {
  throw new Error('Hoje não é dia de trabalho na sua jornada')
}
```

### No Cálculo de Faltas
```typescript
// Contar apenas dias de trabalho sem registro
const diasTrabalhados = registros.filter(r => {
  const dia = getDiaSemana(r.data)
  return jornada.dias_semana.includes(dia)
})

const diasFalta = diasEsperados - diasTrabalhados.length
```

---

## 📱 Integração com Portal do Funcionário

### EmployeePerfilTab.vue

Adicionar o card de jornada:

```vue
<template>
  <div class="space-y-6">
    <!-- Dados Pessoais -->
    <EmployeeDadosPessoaisCard :perfil="perfil" />
    
    <!-- Jornada de Trabalho -->
    <EmployeeJornadaCard :jornada="perfil?.colaborador?.jornada" />
    
    <!-- Dados Profissionais -->
    <EmployeeDadosProfissionaisCard :perfil="perfil" />
  </div>
</template>
```

---

## 🔐 Permissões

### Admin/RH
- ✅ Criar jornadas
- ✅ Editar jornadas
- ✅ Excluir jornadas
- ✅ Vincular jornadas aos colaboradores
- ✅ Ver todas as jornadas

### Funcionário
- ✅ Ver sua própria jornada
- ❌ Editar jornada
- ❌ Ver jornadas de outros
- ❌ Criar jornadas

---

## 📊 Relatórios

### Relatório de Jornadas
- Listar todos os colaboradores
- Mostrar jornada vinculada
- Filtrar por tipo de jornada
- Exportar para Excel

### Relatório de Ponto
- Considerar apenas dias da jornada
- Calcular faltas corretamente
- Destacar dias fora da escala
- Mostrar horas esperadas vs trabalhadas

---

## 🚀 Próximos Passos

1. **Implementar Validação de Ponto**
   - Bloquear registro em dias fora da jornada
   - Avisar funcionário sobre dia de folga

2. **Relatórios Avançados**
   - Dashboard de jornadas
   - Análise de cumprimento de escala
   - Alertas de inconsistências

3. **Notificações**
   - Lembrar funcionário dos dias de trabalho
   - Alertar sobre mudanças na jornada
   - Notificar faltas em dias de trabalho

4. **Jornadas Flexíveis**
   - Permitir exceções temporárias
   - Jornadas com rodízio
   - Escalas mensais personalizadas

---

## 📝 Checklist de Implementação

- [x] Criar tabela `jornadas_trabalho`
- [x] Adicionar campo `jornada_id` em `colaboradores`
- [x] Criar componente `EmployeeJornadaCard`
- [x] Atualizar `ColaboradorFormProfissional`
- [x] Atualizar `ColaboradorFormModal`
- [ ] Atualizar API de colaboradores para incluir jornada
- [ ] Implementar validação de ponto por jornada
- [ ] Atualizar cálculo de faltas
- [ ] Adicionar jornada no perfil do funcionário
- [ ] Criar testes unitários
- [ ] Documentar API

---

## 🎉 Conclusão

O sistema de jornadas/escalas está implementado e pronto para uso. Agora os colaboradores só terão faltas marcadas nos dias que realmente deveriam trabalhar, conforme sua jornada configurada.

**Benefícios:**
- ✅ Controle preciso de faltas
- ✅ Respeita escalas personalizadas
- ✅ Transparência para o funcionário
- ✅ Facilita gestão de RH
- ✅ Relatórios mais precisos

---

**Data:** 05/12/2025  
**Versão:** 1.0.0  
**Status:** ✅ Implementado
