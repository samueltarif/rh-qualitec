# Sistema Portal do Funcionário - Qualitec

## ✅ Implementação Completa

Sistema de portal do funcionário com autenticação diferenciada para gestores (admin) e funcionários.

---

## 🔐 Autenticação

| Role | Acesso | Rota |
|------|--------|------|
| `admin` | Painel Administrativo | `/admin` |
| `funcionario` | Portal do Funcionário | `/employee` |

O sistema redireciona automaticamente baseado no role do usuário.

---

## 📱 Portal do Funcionário (/employee)

### Design Industrial Profissional
- Header com gradiente slate/amber (cores industriais)
- Cards de estatísticas com ícones
- Registro de ponto com botão destacado
- Tabs para navegação entre seções

### Funcionalidades

#### 1. Dashboard
- Banco de horas
- Dias de férias disponíveis
- Solicitações pendentes
- Documentos novos
- Comunicados não lidos

#### 2. Registro de Ponto
- Botão "Bater Ponto" com feedback visual
- Histórico de registros por mês
- Resumo de horas trabalhadas
- Status (Normal, Falta, Atestado, etc)

#### 3. Solicitações
- Criar nova solicitação
- Tipos: Férias, Abono, Atestado, Declaração, Holerite, etc
- Acompanhar status
- Ver resposta do RH

#### 4. Documentos
- Visualizar holerites
- Informe de rendimentos
- Contratos e certificados
- Download de documentos

#### 5. Comunicados
- Lista de comunicados da empresa
- Indicador de não lidos
- Marcar como lido

#### 6. Meu Perfil
- Dados pessoais
- Dados profissionais
- Solicitar alteração de dados

---

## 🏢 Painel Admin - Novas Páginas

### /admin/solicitacoes
- Lista de todas as solicitações
- Filtros por status e tipo
- Aprovar/Rejeitar solicitações
- Estatísticas (pendentes, aprovadas, etc)

### /admin/comunicados
- Criar comunicados
- Editar/Excluir comunicados
- Definir tipo (Informativo, Importante, Urgente)
- Definir destino (todos, departamento, cargo)
- Data de expiração

---

## 🗄️ Banco de Dados

### Novas Tabelas (Migration 24)

```sql
-- Solicitações dos funcionários
solicitacoes_funcionario

-- Documentos (holerites, etc)
documentos_funcionario

-- Registro de ponto
registros_ponto

-- Banco de horas
banco_horas

-- Comunicados
comunicados

-- Leitura de comunicados
comunicados_lidos
```

---

## 📁 Arquivos Criados

### APIs do Funcionário
- `server/api/funcionario/perfil.get.ts`
- `server/api/funcionario/stats.get.ts`
- `server/api/funcionario/solicitacoes/index.get.ts`
- `server/api/funcionario/solicitacoes/index.post.ts`
- `server/api/funcionario/ponto/index.get.ts`
- `server/api/funcionario/ponto/registrar.post.ts`
- `server/api/funcionario/documentos.get.ts`
- `server/api/funcionario/comunicados.get.ts`
- `server/api/funcionario/comunicados/[id]/ler.post.ts`

### APIs do Admin
- `server/api/admin/solicitacoes/index.get.ts`
- `server/api/admin/solicitacoes/[id].put.ts`
- `server/api/admin/solicitacoes/stats.get.ts`
- `server/api/admin/comunicados/index.get.ts`
- `server/api/admin/comunicados/index.post.ts`
- `server/api/admin/comunicados/[id].put.ts`
- `server/api/admin/comunicados/[id].delete.ts`

### Páginas
- `app/pages/employee.vue` (Portal do Funcionário)
- `app/pages/admin/solicitacoes.vue`
- `app/pages/admin/comunicados.vue`

### Componentes
- `app/components/EmployeePontoTab.vue`
- `app/components/EmployeeSolicitacoesTab.vue`
- `app/components/EmployeeDocumentosTab.vue`
- `app/components/EmployeeComunicadosTab.vue`
- `app/components/EmployeePerfilTab.vue`
- `app/components/EmployeeSolicitacaoModal.vue`

### Composables
- `app/composables/useFuncionario.ts`

---

## 🚀 Como Usar

### 1. Execute a Migration
```sql
-- Execute o arquivo 24_portal_funcionario.sql no Supabase
```

### 2. Crie um Usuário Funcionário
Na página /users, crie um usuário com role "funcionario"

### 3. Vincule ao Colaborador
```sql
UPDATE app_users 
SET colaborador_id = 'UUID_DO_COLABORADOR'
WHERE email = 'email@funcionario.com';
```

### 4. Teste o Acesso
- Login com credenciais do funcionário
- Sistema redireciona para /employee

---

## 🎨 Design Industrial

O design foi pensado para empresas do ramo industrial de instrumentos de medição:

- **Cores**: Slate (cinza industrial) + Amber (destaque)
- **Ícones**: Engrenagem, medidores, ferramentas
- **Layout**: Limpo, profissional, fácil navegação
- **Responsivo**: Funciona em desktop e mobile

---

## ✅ Pronto para Uso!

O sistema está completo e funcional. Execute a migration e comece a usar!
