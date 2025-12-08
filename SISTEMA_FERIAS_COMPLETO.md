# 🏖️ Sistema de Gestão de Férias - Completo

## ✅ O que foi implementado

### 1. Migration de Banco de Dados
**Arquivo:** `database/migrations/23_ferias.sql`

A migration **atualiza** a tabela `ferias` existente (não cria uma nova) e adiciona:
- Novos campos: `tipo`, `vender_dias`, `adiantamento_13`
- Tabela `config_ferias` - Configurações do sistema
- Tabela `programacao_ferias` - Calendário anual
- Tabela `historico_ferias` - Auditoria
- View `vw_ferias_completo` - Dados consolidados
- Função `calcular_saldo_ferias()` - Cálculo de saldo

### 2. APIs Backend
| Arquivo | Método | Descrição |
|---------|--------|-----------|
| `server/api/ferias/index.get.ts` | GET | Listar férias com filtros |
| `server/api/ferias/index.post.ts` | POST | Criar nova solicitação |
| `server/api/ferias/[id].put.ts` | PUT | Atualizar solicitação |
| `server/api/ferias/[id].delete.ts` | DELETE | Cancelar solicitação |
| `server/api/ferias/aprovar.post.ts` | POST | Aprovar/Rejeitar |
| `server/api/ferias/stats.get.ts` | GET | Estatísticas |
| `server/api/ferias/config.get.ts` | GET | Buscar configurações |
| `server/api/ferias/config.put.ts` | PUT | Salvar configurações |

### 3. Composable
**Arquivo:** `app/composables/useFerias.ts`

Funções disponíveis:
- `fetchFerias()` - Buscar férias
- `fetchStats()` - Buscar estatísticas
- `fetchConfig()` - Buscar configurações
- `criarSolicitacao()` - Criar nova solicitação
- `aprovarFerias()` - Aprovar férias
- `rejeitarFerias()` - Rejeitar férias
- `cancelarFerias()` - Cancelar férias
- `salvarConfig()` - Salvar configurações
- Helpers: `getStatusColor()`, `getStatusLabel()`, `getTipoLabel()`, `formatDate()`

### 4. Componentes UI Base (Novos)
| Componente | Descrição |
|------------|-----------|
| `UICard.vue` | Card com título, ícone e ações |
| `UITextarea.vue` | Campo de texto multilinha |
| `UIBadge.vue` | Badge/tag colorido |
| `UIModal.vue` | Modal reutilizável |
| `UIDateInput.vue` | Input de data |
| `UICheckbox.vue` | Checkbox com label |
| `UIEmptyState.vue` | Estado vazio |
| `UISearchInput.vue` | Campo de busca |
| `UITabs.vue` | Abas de navegação |
| `UIStatsCard.vue` | Card de estatística |
| `UITable.vue` | Tabela de dados |

### 5. Componentes de Férias
| Componente | Descrição |
|------------|-----------|
| `FeriasSolicitacaoModal.vue` | Modal para nova solicitação |
| `FeriasSolicitacaoCard.vue` | Card de solicitação |
| `FeriasAprovacaoModal.vue` | Modal de aprovação/rejeição |
| `FeriasCalendario.vue` | Calendário visual mensal |
| `FeriasPeriodoCard.vue` | Card de período aquisitivo |

### 6. Página Principal
**Arquivo:** `app/pages/ferias.vue`

Funcionalidades:
- Dashboard com estatísticas
- Lista de solicitações com filtros
- Busca por colaborador
- Filtro por status e ano
- Calendário visual de férias
- Configurações do sistema
- Aprovação/Rejeição de solicitações
- Cancelamento de solicitações pendentes

## 🚀 Como usar

### 1. Executar a Migration
```bash
# Acesse o Supabase SQL Editor e execute:
nuxt-app/database/migrations/23_ferias.sql
```

### 2. Acessar a Página
```
http://localhost:3000/ferias
```

### 3. Funcionalidades Disponíveis

#### Solicitações
- Criar nova solicitação de férias
- Selecionar colaborador
- Definir período (data início/fim)
- Escolher tipo (normal, fracionada, etc)
- Opção de vender dias (abono pecuniário)
- Opção de adiantamento do 13º
- Aprovar/Rejeitar solicitações
- Cancelar solicitações pendentes

#### Calendário
- Visualização mensal
- Navegação entre meses
- Férias aprovadas destacadas
- Férias em gozo destacadas

#### Configurações
- Dias mínimos por fração
- Máximo de dias para venda
- Antecedência mínima
- Permitir fracionamento
- Permitir abono pecuniário
- Notificações automáticas

## 📊 Estatísticas Exibidas

- Pendentes - Solicitações aguardando aprovação
- Aprovadas - Solicitações aprovadas
- Em Gozo - Colaboradores em férias
- Concluídas - Férias finalizadas
- Rejeitadas - Solicitações rejeitadas
- Vencendo - Períodos próximos do vencimento
- Dias no Ano - Total de dias de férias no ano

## 🔧 Configurações Disponíveis

| Configuração | Padrão | Descrição |
|--------------|--------|-----------|
| Dias mínimos fracionamento | 5 | Mínimo de dias por período |
| Dias máximos venda | 10 | Máximo de dias para abono |
| Antecedência mínima | 30 | Dias de antecedência |
| Permite fracionamento | Sim | Dividir em até 3 períodos |
| Máximo frações | 3 | Número máximo de períodos |
| Permite abono pecuniário | Sim | Vender dias de férias |
| Notificar vencimento | 60 | Dias antes para alertar |
| Notificar aprovador | Sim | E-mail ao gestor |
| Notificar RH | Sim | Cópia para RH |

## 📁 Estrutura de Arquivos

```
nuxt-app/
├── app/
│   ├── pages/
│   │   └── ferias.vue                    # Página principal
│   ├── components/
│   │   ├── FeriasSolicitacaoModal.vue    # Modal nova solicitação
│   │   ├── FeriasSolicitacaoCard.vue     # Card de solicitação
│   │   ├── FeriasAprovacaoModal.vue      # Modal aprovação
│   │   ├── FeriasCalendario.vue          # Calendário
│   │   ├── FeriasPeriodoCard.vue         # Card período
│   │   ├── UICard.vue                    # Card base
│   │   ├── UITextarea.vue                # Textarea
│   │   ├── UIBadge.vue                   # Badge
│   │   ├── UIModal.vue                   # Modal base
│   │   ├── UIDateInput.vue               # Input data
│   │   ├── UICheckbox.vue                # Checkbox
│   │   ├── UIEmptyState.vue              # Estado vazio
│   │   ├── UISearchInput.vue             # Busca
│   │   ├── UITabs.vue                    # Abas
│   │   ├── UIStatsCard.vue               # Card stats
│   │   └── UITable.vue                   # Tabela
│   └── composables/
│       └── useFerias.ts                  # Composable
├── server/api/ferias/
│   ├── index.get.ts                      # Listar
│   ├── index.post.ts                     # Criar
│   ├── [id].put.ts                       # Atualizar
│   ├── [id].delete.ts                    # Cancelar
│   ├── aprovar.post.ts                   # Aprovar/Rejeitar
│   ├── stats.get.ts                      # Estatísticas
│   ├── config.get.ts                     # Buscar config
│   └── config.put.ts                     # Salvar config
└── database/migrations/
    ├── 23_ferias.sql                     # Migration
    └── EXECUTAR_MIGRATION_23.md          # Instruções
```

## ⚠️ Importante

1. **Execute a migration 23** antes de usar a página
2. A tabela `ferias` já existe - a migration apenas adiciona campos
3. Os dados existentes serão preservados
4. Novos campos terão valores padrão

## 🎨 Integração com Sistema de E-mail

O sistema está preparado para integrar com notificações:
- Notificar colaborador quando férias aprovadas
- Notificar gestor quando nova solicitação
- Alertar sobre férias vencendo
- Lembrete de período concessivo

---

**Implementado em:** 04/12/2025
**Status:** ✅ Completo e funcional
