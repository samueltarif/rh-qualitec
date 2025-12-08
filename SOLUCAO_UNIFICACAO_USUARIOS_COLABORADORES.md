# 🔗 Solução: Unificação Usuários e Colaboradores

## 📋 Problema Identificado

Antes, o sistema tinha duas formas separadas de criar usuários:
1. **Colaboradores** (tabela `colaboradores`) - dados de RH
2. **Usuários** (tabela `app_users`) - acesso ao sistema

Isso causava:
- ❌ Duplicação de dados (mesmo usuário com 2 IDs diferentes)
- ❌ Risco de inconsistência ao escalar
- ❌ Fluxo confuso (criar colaborador, depois criar usuário separado)

## ✅ Solução Implementada

### Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    TABELA: colaboradores                     │
│  (Dados de RH: cargo, salário, benefícios, documentos)      │
│                                                              │
│  id (PK) | nome | cpf | cargo_id | salario | ...           │
└──────────────────────────────────────────────────────────────┘
                              ▲
                              │
                              │ colaborador_id (FK)
                              │
┌─────────────────────────────────────────────────────────────┐
│                     TABELA: app_users                        │
│        (Autenticação: email, senha, role, permissões)       │
│                                                              │
│  id (PK) | auth_uid | email | role | colaborador_id (FK)   │
└─────────────────────────────────────────────────────────────┘
```

**Relacionamento**: 1 colaborador pode ter 0 ou 1 usuário (opcional)

### Fluxos Implementados

#### 1️⃣ Criar Colaborador COM Acesso (Novo)

**Onde**: Formulário de Colaboradores → Aba "🔑 Acesso ao Sistema"

```
1. Preencher dados do colaborador (nome, CPF, cargo, etc)
2. Ir na aba "Acesso ao Sistema"
3. Marcar "Criar usuário de acesso ao sistema"
4. Preencher:
   - Email de login
   - Senha inicial
   - Nível de acesso (Funcionário/Admin)
5. Salvar

Resultado:
✅ Colaborador criado na tabela colaboradores
✅ Usuário criado na tabela app_users (vinculado)
✅ Pronto para fazer login
```

#### 2️⃣ Criar Colaborador SEM Acesso

```
1. Preencher dados do colaborador
2. NÃO marcar "Criar usuário"
3. Salvar

Resultado:
✅ Colaborador criado
❌ Sem acesso ao sistema (ainda)
💡 Pode criar acesso depois na página de Usuários
```

#### 3️⃣ Criar Acesso para Colaborador Existente

**Onde**: Página de Usuários → Card "Colaboradores sem Acesso"

```
1. Sistema mostra colaboradores ativos sem usuário
2. Clicar em "Criar Acesso" no colaborador desejado
3. Preencher email e senha
4. Salvar

Resultado:
✅ Usuário criado e vinculado ao colaborador
✅ Colaborador pode fazer login
```

## 🎯 Componentes Criados

### 1. `ColaboradorFormAcesso.vue`
Nova aba no formulário de colaboradores para criar acesso ao sistema junto com o cadastro.

**Features**:
- ✅ Toggle para ativar/desativar criação de usuário
- ✅ Auto-preenche email com email corporativo
- ✅ Validação de email admin (apenas silvana@qualitec.ind.br)
- ✅ Campos: email, senha, role, status

### 2. `ColaboradoresSemAcessoCard.vue`
Card na página de usuários mostrando colaboradores sem acesso ao sistema.

**Features**:
- ✅ Lista colaboradores ativos sem usuário
- ✅ Botão "Criar Acesso" para cada um
- ✅ Expansível/colapsável
- ✅ Mostra cargo e email

### 3. `UserCreateFromColaboradorModal.vue`
Modal para criar acesso rápido a partir de um colaborador existente.

**Features**:
- ✅ Mostra dados do colaborador
- ✅ Formulário simplificado (email, senha, role)
- ✅ Auto-preenche com email corporativo
- ✅ Validações

## 🔄 Fluxo Atualizado

### Composable `useColaboradores.ts`

```typescript
createColaborador({
  // Dados do colaborador
  nome: 'João Silva',
  cpf: '123.456.789-00',
  cargo_id: 'xxx',
  
  // Dados de acesso (opcional)
  criar_usuario: true,
  usuario_email: 'joao@qualitec.ind.br',
  usuario_senha: 'senha123',
  usuario_role: 'funcionario',
  usuario_ativo: true
})
```

**Lógica**:
1. Cria colaborador na tabela `colaboradores`
2. Se `criar_usuario = true`, chama API `/api/users/create`
3. Vincula usuário ao colaborador via `colaborador_id`
4. Retorna sucesso (mesmo se usuário falhar, colaborador é criado)

## 📊 Vantagens da Solução

### ✅ Mantém Separação de Responsabilidades
- `colaboradores`: dados de RH (cargo, salário, benefícios)
- `app_users`: autenticação e permissões

### ✅ Flexibilidade
- Colaborador pode existir sem usuário (ex: terceirizados, estagiários)
- Usuário admin pode não ter colaborador (ex: TI, suporte)

### ✅ Escalabilidade
- Relacionamento 1:1 via FK `colaborador_id`
- Fácil de consultar: `JOIN app_users ON colaboradores.id = app_users.colaborador_id`
- Sem duplicação de dados

### ✅ UX Melhorada
- Fluxo único: cadastra colaborador e cria acesso de uma vez
- Visibilidade: mostra quem não tem acesso ainda
- Ação rápida: botão "Criar Acesso" direto

## 🔍 Queries Úteis

### Ver colaboradores com/sem usuário

```sql
-- Colaboradores COM usuário
SELECT 
  c.nome,
  c.cpf,
  u.email,
  u.role
FROM colaboradores c
INNER JOIN app_users u ON c.id = u.colaborador_id
WHERE c.status = 'Ativo';

-- Colaboradores SEM usuário
SELECT 
  c.nome,
  c.cpf,
  c.email_corporativo
FROM colaboradores c
LEFT JOIN app_users u ON c.id = u.colaborador_id
WHERE c.status = 'Ativo' 
  AND u.id IS NULL;
```

### Ver usuários com dados do colaborador

```sql
SELECT 
  u.email,
  u.role,
  c.nome,
  c.cargo_id,
  c.departamento_id
FROM app_users u
LEFT JOIN colaboradores c ON u.colaborador_id = c.id
WHERE u.ativo = true;
```

## 🎨 Interface

### Página de Colaboradores
```
┌─────────────────────────────────────────────────────────┐
│  Novo Colaborador                                       │
├─────────────────────────────────────────────────────────┤
│  [Resumo] [Pessoais] [Documentos] ... [🔑 Acesso]      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ☐ Criar usuário de acesso ao sistema                  │
│                                                         │
│  [Campos aparecem quando marcado]                       │
│  Email: ___________________                             │
│  Senha: ___________________                             │
│  Role:  [Funcionário ▼]                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Página de Usuários
```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ Colaboradores sem Acesso (3)                [▼]     │
├─────────────────────────────────────────────────────────┤
│  👤 João Silva                    [Criar Acesso]        │
│     joao@qualitec.ind.br • Analista                     │
│                                                         │
│  👤 Maria Santos                  [Criar Acesso]        │
│     maria@qualitec.ind.br • Gerente                     │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Como Usar

### Para criar novo colaborador COM acesso:

1. Ir em **Colaboradores** → **Novo Colaborador**
2. Preencher dados básicos (nome, CPF)
3. Ir na aba **"🔑 Acesso ao Sistema"**
4. Marcar **"Criar usuário de acesso ao sistema"**
5. Preencher email e senha
6. Salvar

### Para dar acesso a colaborador existente:

1. Ir em **Usuários**
2. Ver card **"Colaboradores sem Acesso"**
3. Clicar em **"Criar Acesso"** no colaborador
4. Preencher email e senha
5. Salvar

## 📝 Notas Importantes

- ✅ Colaborador pode existir sem usuário
- ✅ Usuário deve estar vinculado a colaborador (exceto admins)
- ✅ Email de login pode ser diferente do email corporativo
- ✅ Apenas silvana@qualitec.ind.br pode ser admin
- ✅ Senha mínima: 6 caracteres
- ✅ Colaborador inativo não aparece na lista "sem acesso"

## 🎯 Resultado Final

**Antes**:
```
Colaborador (ID: 1) ❌ Usuário (ID: 5)
└─ Sem vínculo, dados duplicados
```

**Depois**:
```
Colaborador (ID: 1) ✅ Usuário (ID: 5, colaborador_id: 1)
└─ Vinculados, dados únicos, escalável
```

---

**Status**: ✅ Implementado e funcionando
**Data**: 06/12/2025
**Versão**: 1.0
