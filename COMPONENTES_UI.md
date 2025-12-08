# 🎨 Componentes UI Reutilizáveis - Sistema RH Qualitec

## 📦 Componentes Criados

### 1. UIInput ✅
**Arquivo:** `app/components/UI/Input.vue`

### 2. UIButton ✅
**Arquivo:** `app/components/UI/Button.vue`

---

## 📝 UIInput - Componente de Input

### Funcionalidades
- ✅ Label customizável
- ✅ Ícone à esquerda
- ✅ Ícone à direita
- ✅ Toggle de senha automático
- ✅ Mensagens de erro
- ✅ Texto de ajuda
- ✅ Estados: disabled, required, focus
- ✅ Validação visual
- ✅ Autocomplete
- ✅ Eventos: input, blur, focus, enter

### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| modelValue | string \| number | - | Valor do input (v-model) |
| type | string | 'text' | Tipo: text, email, password, number, tel, url |
| label | string | - | Label do campo |
| placeholder | string | - | Placeholder |
| iconLeft | string | - | Ícone à esquerda (Heroicons) |
| iconRight | string | - | Ícone à direita (Heroicons) |
| iconSize | string \| number | '20' | Tamanho do ícone |
| disabled | boolean | false | Desabilitar input |
| required | boolean | false | Campo obrigatório |
| error | string | - | Mensagem de erro |
| helperText | string | - | Texto de ajuda |
| autocomplete | string | - | Atributo autocomplete |
| id | string | auto | ID do input |

### Eventos

| Evento | Payload | Descrição |
|--------|---------|-----------|
| update:modelValue | string \| number | Valor atualizado |
| blur | FocusEvent | Input perdeu foco |
| focus | FocusEvent | Input ganhou foco |
| enter | KeyboardEvent | Enter pressionado |

### Exemplos de Uso

#### Básico
```vue
<UIInput
  v-model="email"
  type="email"
  label="Email"
  placeholder="seu@email.com"
/>
```

#### Com Ícone
```vue
<UIInput
  v-model="email"
  type="email"
  label="Email"
  placeholder="seu@email.com"
  icon-left="heroicons:envelope"
/>
```

#### Senha (com toggle automático)
```vue
<UIInput
  v-model="password"
  type="password"
  label="Senha"
  placeholder="••••••••"
  icon-left="heroicons:lock-closed"
/>
```

#### Com Erro
```vue
<UIInput
  v-model="email"
  type="email"
  label="Email"
  :error="emailError"
  icon-left="heroicons:envelope"
/>
```

#### Com Helper Text
```vue
<UIInput
  v-model="cpf"
  type="text"
  label="CPF"
  helper-text="Digite apenas números"
  icon-left="heroicons:identification"
/>
```

#### Completo
```vue
<UIInput
  v-model="email"
  type="email"
  label="Email"
  placeholder="seu@email.com"
  icon-left="heroicons:envelope"
  autocomplete="email"
  required
  :disabled="loading"
  :error="errors.email"
  helper-text="Usaremos este email para contato"
  @enter="handleSubmit"
/>
```

---

## 🔘 UIButton - Componente de Botão

### Funcionalidades
- ✅ Múltiplos temas (admin, employee, default)
- ✅ Múltiplas variantes (primary, secondary, outline, ghost, danger, success)
- ✅ Múltiplos tamanhos (sm, md, lg)
- ✅ Ícone à esquerda
- ✅ Ícone à direita
- ✅ Loading state com spinner
- ✅ Estados: disabled, loading
- ✅ Largura total (fullWidth)
- ✅ Tipos: button, submit, reset

### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| type | string | 'button' | Tipo: button, submit, reset |
| variant | string | 'primary' | Variante: primary, secondary, outline, ghost, danger, success |
| theme | string | 'default' | Tema: admin, employee, default |
| size | string | 'md' | Tamanho: sm, md, lg |
| label | string | - | Texto do botão (alternativa ao slot) |
| iconLeft | string | - | Ícone à esquerda (Heroicons) |
| iconRight | string | - | Ícone à direita (Heroicons) |
| iconSize | string \| number | '20' | Tamanho do ícone |
| loading | boolean | false | Estado de loading |
| disabled | boolean | false | Desabilitar botão |
| fullWidth | boolean | false | Largura total |

### Eventos

| Evento | Payload | Descrição |
|--------|---------|-----------|
| click | MouseEvent | Botão clicado |

### Temas e Variantes

#### Admin (Vermelho)
```vue
<!-- Primary -->
<UIButton theme="admin" variant="primary">
  Botão Primário
</UIButton>

<!-- Secondary -->
<UIButton theme="admin" variant="secondary">
  Botão Secundário
</UIButton>

<!-- Outline -->
<UIButton theme="admin" variant="outline">
  Botão Outline
</UIButton>

<!-- Ghost -->
<UIButton theme="admin" variant="ghost">
  Botão Ghost
</UIButton>

<!-- Danger -->
<UIButton theme="admin" variant="danger">
  Botão Danger
</UIButton>

<!-- Success -->
<UIButton theme="admin" variant="success">
  Botão Success
</UIButton>
```

#### Employee (Azul)
```vue
<!-- Primary -->
<UIButton theme="employee" variant="primary">
  Botão Primário
</UIButton>

<!-- Secondary -->
<UIButton theme="employee" variant="secondary">
  Botão Secundário
</UIButton>

<!-- Outline -->
<UIButton theme="employee" variant="outline">
  Botão Outline
</UIButton>

<!-- Ghost -->
<UIButton theme="employee" variant="ghost">
  Botão Ghost
</UIButton>
```

#### Default (Azul Padrão)
```vue
<UIButton variant="primary">
  Botão Padrão
</UIButton>
```

### Exemplos de Uso

#### Básico
```vue
<UIButton @click="handleClick">
  Clique Aqui
</UIButton>
```

#### Com Ícone
```vue
<UIButton
  icon-left="heroicons:user-plus"
  @click="addUser"
>
  Novo Usuário
</UIButton>
```

#### Loading
```vue
<UIButton
  :loading="isLoading"
  @click="handleSubmit"
>
  {{ isLoading ? 'Salvando...' : 'Salvar' }}
</UIButton>
```

#### Submit Form
```vue
<UIButton
  type="submit"
  theme="employee"
  variant="primary"
  full-width
>
  Entrar
</UIButton>
```

#### Tamanhos
```vue
<!-- Pequeno -->
<UIButton size="sm">Pequeno</UIButton>

<!-- Médio (padrão) -->
<UIButton size="md">Médio</UIButton>

<!-- Grande -->
<UIButton size="lg">Grande</UIButton>
```

#### Completo
```vue
<UIButton
  type="submit"
  theme="admin"
  variant="primary"
  size="lg"
  icon-left="heroicons:check"
  :loading="isSaving"
  :disabled="!isValid"
  full-width
  @click="handleSave"
>
  {{ isSaving ? 'Salvando...' : 'Salvar Alterações' }}
</UIButton>
```

---

## 🎨 Uso nos Componentes

### Página de Login
```vue
<!-- Email Input -->
<UIInput
  v-model="credentials.email"
  type="email"
  label="Email"
  placeholder="seu@email.com"
  icon-left="heroicons:envelope"
  autocomplete="email"
  required
  :disabled="isLoading"
  @enter="handleLogin"
/>

<!-- Senha Input -->
<UIInput
  v-model="credentials.password"
  type="password"
  label="Senha"
  placeholder="••••••••"
  icon-left="heroicons:lock-closed"
  autocomplete="current-password"
  required
  :disabled="isLoading"
  :error="error"
  @enter="handleLogin"
/>

<!-- Botão Login -->
<UIButton
  type="submit"
  theme="employee"
  variant="primary"
  size="lg"
  :loading="isLoading"
  :disabled="!credentials.email || !credentials.password"
  icon-left="heroicons:arrow-right-on-rectangle"
  full-width
>
  {{ isLoading ? 'Entrando...' : 'Entrar' }}
</UIButton>
```

### Dashboard Admin
```vue
<!-- Ações Rápidas -->
<UIButton
  theme="admin"
  variant="primary"
  icon-left="heroicons:user-plus"
  full-width
  @click="novoUsuario"
>
  Novo Usuário
</UIButton>

<UIButton
  theme="admin"
  variant="secondary"
  icon-left="heroicons:document-text"
  full-width
  @click="verLogs"
>
  Ver Logs
</UIButton>

<UIButton
  theme="admin"
  variant="secondary"
  icon-left="heroicons:cog"
  full-width
  @click="configuracoes"
>
  Configurações
</UIButton>

<!-- Botão Sair -->
<UIButton
  theme="admin"
  variant="outline"
  icon-left="heroicons:arrow-right-on-rectangle"
  @click="handleLogout"
>
  Sair
</UIButton>
```

### Dashboard Employee
```vue
<!-- Ações Rápidas -->
<UIButton
  theme="employee"
  variant="primary"
  icon-left="heroicons:clock"
  full-width
  @click="registrarPonto"
>
  Registrar Ponto
</UIButton>

<UIButton
  theme="employee"
  variant="secondary"
  icon-left="heroicons:calendar"
  full-width
  @click="solicitarFerias"
>
  Solicitar Férias
</UIButton>

<!-- Botão Sair -->
<UIButton
  theme="employee"
  variant="outline"
  icon-left="heroicons:arrow-right-on-rectangle"
  @click="handleLogout"
>
  Sair
</UIButton>
```

---

## 📁 Estrutura de Arquivos

```
nuxt-app/
└── app/
    ├── components/
    │   └── UI/
    │       ├── Input.vue          ✅ Componente de Input
    │       └── Button.vue         ✅ Componente de Botão
    └── pages/
        ├── login.vue              ✅ Usando UIInput e UIButton
        ├── admin/
        │   └── index.vue          ✅ Usando UIButton
        └── employee/
            └── dashboard.vue      ✅ Usando UIButton
```

---

## 🎯 Benefícios

### Consistência
- ✅ Design uniforme em todo o sistema
- ✅ Comportamento padronizado
- ✅ Fácil manutenção

### Reutilização
- ✅ Menos código duplicado
- ✅ Componentes testados
- ✅ Fácil de usar

### Manutenibilidade
- ✅ Mudanças centralizadas
- ✅ Fácil de atualizar
- ✅ Documentação clara

### Acessibilidade
- ✅ Labels associados
- ✅ Estados visuais claros
- ✅ Navegação por teclado
- ✅ Focus visível

---

## 🔧 Customização

### Adicionar Nova Variante
```typescript
// Button.vue
const themeVariantClasses = {
  admin: {
    // ... variantes existentes
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  }
}
```

### Adicionar Novo Tema
```typescript
// Button.vue
const themeVariantClasses = {
  // ... temas existentes
  custom: {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white',
    secondary: 'bg-purple-100 hover:bg-purple-200 text-purple-800',
  }
}
```

---

## ✅ Checklist de Implementação

- [x] Componente UIInput criado
- [x] Componente UIButton criado
- [x] Login usando UIInput
- [x] Login usando UIButton
- [x] Admin usando UIButton
- [x] Employee usando UIButton
- [x] Sem erros de diagnóstico
- [x] Documentação completa

---

## 📊 Status

| Componente | Status | Usado em |
|------------|--------|----------|
| UIInput | ✅ | Login |
| UIButton | ✅ | Login, Admin, Employee |

---

**Conclusão:** ✅ Componentes UI reutilizáveis criados e implementados!

**Data:** 02/12/2025

**Próximo passo:** Criar mais componentes conforme necessário (Card, Modal, Table, etc)
