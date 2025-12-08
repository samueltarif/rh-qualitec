# Sistema de Log de Atividades

Sistema completo para registrar e exibir todas as atividades dos usuários no sistema.

## ✅ Implementado

### 1. Banco de Dados
- ✅ Tabela `log_atividades` para armazenar logs
- ✅ View `vw_atividades_recentes` com informações dos usuários
- ✅ Função `fn_registrar_atividade()` para facilitar registro
- ✅ Trigger automático para registrar logins
- ✅ Políticas RLS apropriadas

### 2. Frontend
- ✅ Composable `useAtividades` para gerenciar atividades
- ✅ Widget `WidgetUltimasAtividades` atualizado e funcional
- ✅ Auto-refresh a cada 30 segundos
- ✅ Ícones e badges por tipo de ação
- ✅ Cores por role (admin, gestor, funcionário)

### 3. Backend
- ✅ Utilitário `logAtividade()` para registrar do servidor

## 📋 Como Usar

### No Frontend (Composable)

```typescript
const { registrarAtividade } = useAtividades()

// Registrar uma atividade
await registrarAtividade(
  'create',           // tipo_acao
  'colaboradores',    // modulo
  'Criou novo colaborador: João Silva',  // descricao
  { colaborador_id: '123', nome: 'João Silva' }  // detalhes (opcional)
)
```

### No Backend (API Routes)

```typescript
import { logAtividade } from '~/server/utils/log-atividade'

export default defineEventHandler(async (event) => {
  // ... sua lógica ...
  
  // Registrar atividade
  await logAtividade(
    event,
    'update',
    'colaboradores',
    `Atualizou dados do colaborador: ${colaborador.nome}`,
    { colaborador_id: colaborador.id }
  )
  
  return { success: true }
})
```

## 🎯 Tipos de Ação

- `login` - Login no sistema
- `logout` - Logout do sistema
- `create` - Criação de registro
- `update` - Atualização de registro
- `delete` - Exclusão de registro
- `download` - Download de arquivo
- `upload` - Upload de arquivo
- `approve` - Aprovação de solicitação
- `reject` - Rejeição de solicitação

## 📦 Módulos

- `autenticacao` - Login/Logout
- `colaboradores` - Gestão de colaboradores
- `ferias` - Gestão de férias
- `documentos` - Documentos RH
- `ponto` - Registro de ponto
- `folha` - Folha de pagamento
- `solicitacoes` - Solicitações diversas
- `comunicados` - Comunicados internos
- `configuracoes` - Configurações do sistema
- `relatorios` - Relatórios
- `importacao` - Importação de dados
- `exportacao` - Exportação de dados

## 🔧 Exemplos de Integração

### 1. Colaboradores

```typescript
// Criar colaborador
await logAtividade(event, 'create', 'colaboradores', 
  `Criou colaborador: ${body.nome}`, { colaborador_id: novoColaborador.id })

// Atualizar colaborador
await logAtividade(event, 'update', 'colaboradores',
  `Atualizou dados do colaborador: ${colaborador.nome}`, { colaborador_id: id })

// Excluir colaborador
await logAtividade(event, 'delete', 'colaboradores',
  `Excluiu colaborador: ${colaborador.nome}`, { colaborador_id: id })
```

### 2. Férias

```typescript
// Solicitar férias
await logAtividade(event, 'create', 'ferias',
  `Solicitou férias de ${body.data_inicio} a ${body.data_fim}`)

// Aprovar férias
await logAtividade(event, 'approve', 'ferias',
  `Aprovou férias do colaborador: ${ferias.colaborador.nome}`, { ferias_id: id })

// Rejeitar férias
await logAtividade(event, 'reject', 'ferias',
  `Rejeitou férias do colaborador: ${ferias.colaborador.nome}`, { ferias_id: id })
```

### 3. Documentos

```typescript
// Upload de documento
await logAtividade(event, 'upload', 'documentos',
  `Fez upload do documento: ${body.nome}`, { documento_id: novoDoc.id })

// Download de documento
await logAtividade(event, 'download', 'documentos',
  `Baixou o documento: ${documento.nome}`, { documento_id: id })
```

### 4. Ponto

```typescript
// Registrar ponto
await logAtividade(event, 'create', 'ponto',
  `Registrou ponto: ${body.tipo}`, { tipo: body.tipo })
```

### 5. Solicitações

```typescript
// Criar solicitação
await logAtividade(event, 'create', 'solicitacoes',
  `Criou solicitação: ${body.tipo}`, { solicitacao_id: novaSolicitacao.id })

// Aprovar solicitação
await logAtividade(event, 'approve', 'solicitacoes',
  `Aprovou solicitação de ${solicitacao.tipo}`, { solicitacao_id: id })
```

### 6. Configurações

```typescript
// Atualizar configurações
await logAtividade(event, 'update', 'configuracoes',
  `Atualizou configurações de ${modulo}`, { modulo })
```

### 7. Relatórios

```typescript
// Gerar relatório
await logAtividade(event, 'create', 'relatorios',
  `Gerou relatório: ${body.tipo}`, { tipo: body.tipo })

// Download de relatório
await logAtividade(event, 'download', 'relatorios',
  `Baixou relatório: ${relatorio.nome}`, { relatorio_id: id })
```

### 8. Importação/Exportação

```typescript
// Importar dados
await logAtividade(event, 'create', 'importacao',
  `Importou ${resultado.sucesso} registros de ${body.tipo}`, 
  { tipo: body.tipo, total: resultado.total })

// Exportar dados
await logAtividade(event, 'create', 'exportacao',
  `Exportou dados de ${body.tipo}`, { tipo: body.tipo })
```

## 🚀 Próximos Passos

1. Execute a migration 26: `database/migrations/26_log_atividades.sql`
2. Integre `logAtividade()` nos endpoints existentes
3. O widget já está funcionando e se atualizará automaticamente

## 📊 Widget de Atividades

O widget exibe:
- ✅ Avatar com iniciais do usuário
- ✅ Badge de role (admin 👑, gestor ⭐, funcionário 👤)
- ✅ Badge colorido por tipo de ação
- ✅ Ícone do módulo
- ✅ Descrição da atividade
- ✅ Tempo relativo (há X minutos/horas/dias)
- ✅ Data e hora exata
- ✅ Auto-refresh a cada 30 segundos
- ✅ Botão de recarregar manual

## 🔒 Segurança

- ✅ RLS habilitado
- ✅ Admins e gestores veem todas as atividades
- ✅ Funcionários veem apenas suas próprias atividades
- ✅ Todos podem inserir suas próprias atividades
