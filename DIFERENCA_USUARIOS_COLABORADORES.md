# Diferença entre Usuários e Colaboradores

## 📋 Resumo Rápido

- **Colaboradores** = Funcionários da empresa (cadastro de RH)
- **Usuários** = Contas de acesso ao sistema

## 🔍 Explicação Detalhada

### Colaboradores (Tabela: `colaboradores`)
**O que é:** Cadastro completo de TODOS os funcionários da empresa

**Contém:**
- Dados pessoais (nome, CPF, RG, etc)
- Dados profissionais (cargo, salário, departamento)
- Documentos
- Endereço
- Dados bancários
- Benefícios
- **Gestor Direto** (hierarquia - quem responde a quem)

**Exemplo:**
```
Colaborador: João Silva
Cargo: Analista
Gestor Direto: Silvana (configurado aqui!)
Salário: R$ 5.000
Status: Ativo
```

### Usuários (Tabela: `app_users`)
**O que é:** Contas de LOGIN no sistema

**Contém:**
- Email
- Senha
- Role (admin/employee)
- Vinculação a um colaborador (opcional)

**Exemplo:**
```
Usuário: joao@empresa.com
Senha: ******
Role: employee
Vinculado ao colaborador: João Silva
```

## 🎯 Casos de Uso

### Caso 1: Colaborador SEM usuário
```
Colaborador: Maria (operadora de produção)
- Cadastrada no RH
- NÃO tem acesso ao sistema
- NÃO tem usuário
```

### Caso 2: Colaborador COM usuário
```
Colaborador: Silvana (gerente)
- Cadastrada no RH
- TEM acesso ao sistema
- TEM usuário: silvana@empresa.com
```

### Caso 3: Usuário SEM colaborador
```
Usuário: admin@empresa.com
- Admin do sistema
- NÃO é funcionário da empresa
- Pode ser TI terceirizada
```

## 🔗 Vinculação

### No cadastro de USUÁRIO:
**Campo:** "Este usuário É qual colaborador?"
**Significa:** Criar login para um funcionário já cadastrado
**Exemplo:** 
- Silvana já está cadastrada como colaboradora
- Criar usuário silvana@empresa.com
- Vincular ao colaborador "Silvana"

### No cadastro de COLABORADOR:
**Campo:** "Gestor Direto"
**Significa:** Hierarquia - quem responde a quem
**Exemplo:**
- João responde à Silvana
- No cadastro de João, selecionar "Silvana" como Gestor Direto

## ✅ Fluxo Correto

### Para dar acesso ao sistema para um funcionário:

1. **Primeiro:** Cadastrar como Colaborador (se ainda não estiver)
   - Ir em Colaboradores > Novo Colaborador
   - Preencher dados de RH
   - Definir Gestor Direto (hierarquia)

2. **Depois:** Criar Usuário para ele
   - Ir em Usuários > Novo Usuário
   - Selecionar o colaborador no dropdown
   - Clicar em "Autopreencher"
   - Definir senha
   - Criar usuário

3. **Pronto!** Agora o funcionário pode fazer login no sistema

## 📊 Resumo Visual

```
COLABORADORES (RH)
├── João Silva
│   ├── Cargo: Analista
│   ├── Gestor: Silvana ← (hierarquia)
│   └── Salário: R$ 5.000
│
└── Silvana
    ├── Cargo: Gerente
    ├── Gestor: Diretor
    └── Salário: R$ 10.000

USUÁRIOS (Sistema)
├── joao@empresa.com
│   ├── Senha: ******
│   ├── Role: employee
│   └── Vinculado a: João Silva ← (é o João)
│
└── silvana@empresa.com
    ├── Senha: ******
    ├── Role: admin
    └── Vinculado a: Silvana ← (é a Silvana)
```

## 🎓 Conclusão

- **Colaboradores** = Quem trabalha na empresa
- **Usuários** = Quem tem acesso ao sistema
- **Gestor Direto** (em Colaboradores) = Hierarquia
- **Vincular Colaborador** (em Usuários) = Identificar quem é o usuário
