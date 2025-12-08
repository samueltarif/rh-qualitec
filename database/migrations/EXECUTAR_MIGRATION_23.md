# 🏖️ Executar Migration 23 - Sistema de Férias

## ⚠️ IMPORTANTE

Esta migration **ATUALIZA** a tabela `ferias` existente e adiciona novas tabelas complementares.

**NÃO** cria uma nova tabela de férias - usa a existente!

## 📋 O que será feito:

### 1. Novos campos na tabela `ferias`:
- `tipo` - Tipo de férias (normal, fracionada, abono_pecuniario, coletiva)
- `vender_dias` - Se está vendendo dias
- `adiantamento_13` - Se solicitou adiantamento do 13º
- `aprovador_colaborador_id` - Referência ao colaborador aprovador

### 2. Novas tabelas:
- `config_ferias` - Configurações do sistema de férias
- `programacao_ferias` - Calendário anual de férias
- `historico_ferias` - Auditoria de alterações

### 3. View e função:
- `vw_ferias_completo` - View com dados consolidados
- `calcular_saldo_ferias()` - Função para calcular saldo

## 🚀 Como Executar

### 1. Acesse o Supabase SQL Editor:
```
https://supabase.com/dashboard/project/SEU_PROJECT_ID/sql
```

### 2. Copie e cole o conteúdo do arquivo:
```
nuxt-app/database/migrations/23_ferias.sql
```

### 3. Execute o SQL

### 4. Verifique se foi criado com sucesso:
```sql
-- Verificar novos campos na tabela ferias
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ferias' 
AND column_name IN ('tipo', 'vender_dias', 'adiantamento_13');

-- Verificar novas tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('config_ferias', 'programacao_ferias', 'historico_ferias');

-- Verificar configuração padrão
SELECT * FROM config_ferias;
```

## 📊 Estrutura Final

### Tabela `ferias` (atualizada):
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único |
| colaborador_id | UUID | FK colaboradores |
| periodo_aquisitivo_inicio | DATE | Início do período |
| periodo_aquisitivo_fim | DATE | Fim do período |
| data_inicio | DATE | Início das férias |
| data_fim | DATE | Fim das férias |
| dias_gozo | INTEGER | Dias de gozo |
| dias_abono | INTEGER | Dias vendidos |
| **tipo** | VARCHAR | normal/fracionada/abono_pecuniario/coletiva |
| **vender_dias** | BOOLEAN | Se está vendendo dias |
| **adiantamento_13** | BOOLEAN | Se solicitou adiantamento |
| valor_ferias | DECIMAL | Valor das férias |
| valor_terco | DECIMAL | Valor do 1/3 |
| valor_abono | DECIMAL | Valor do abono |
| valor_total | DECIMAL | Valor total |
| status | ENUM | Pendente/Aprovada/Rejeitada/etc |
| solicitado_em | TIMESTAMP | Data da solicitação |
| aprovado_por | UUID | FK users |
| aprovado_em | TIMESTAMP | Data da aprovação |
| motivo_rejeicao | TEXT | Motivo se rejeitada |
| observacoes | TEXT | Observações |

### Tabela `config_ferias`:
| Campo | Tipo | Padrão |
|-------|------|--------|
| dias_minimos_fracionamento | INTEGER | 5 |
| dias_maximos_venda | INTEGER | 10 |
| antecedencia_minima_dias | INTEGER | 30 |
| permite_fracionamento | BOOLEAN | TRUE |
| max_fracoes | INTEGER | 3 |
| permite_abono_pecuniario | BOOLEAN | TRUE |
| notificar_vencimento_dias | INTEGER | 60 |
| notificar_aprovador | BOOLEAN | TRUE |
| notificar_rh | BOOLEAN | TRUE |
| bloquear_ferias_coletivas | BOOLEAN | FALSE |
| periodos_bloqueados | JSONB | [] |

## 🔗 Funcionalidades da Página

Após executar a migration, acesse `/ferias` no painel admin:

### ✅ Solicitações
- Listar todas as solicitações
- Filtrar por status e ano
- Buscar por colaborador
- Aprovar/Rejeitar solicitações
- Cancelar solicitações pendentes

### ✅ Calendário
- Visualização mensal
- Férias aprovadas e em gozo
- Navegação entre meses

### ✅ Configurações
- Regras de fracionamento
- Limites de venda de dias
- Notificações automáticas
- Períodos bloqueados

## 🎨 Componentes Criados

- `FeriasSolicitacaoModal.vue` - Modal para nova solicitação
- `FeriasSolicitacaoCard.vue` - Card de solicitação
- `FeriasAprovacaoModal.vue` - Modal de aprovação/rejeição
- `FeriasCalendario.vue` - Calendário visual
- `FeriasPeriodoCard.vue` - Card de período aquisitivo

## 📡 APIs Criadas

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/ferias` | GET | Listar férias |
| `/api/ferias` | POST | Criar solicitação |
| `/api/ferias/:id` | PUT | Atualizar férias |
| `/api/ferias/:id` | DELETE | Cancelar férias |
| `/api/ferias/aprovar` | POST | Aprovar/Rejeitar |
| `/api/ferias/stats` | GET | Estatísticas |
| `/api/ferias/config` | GET | Buscar config |
| `/api/ferias/config` | PUT | Salvar config |

## ⚠️ Possíveis Erros

### Erro: "column already exists"
Os campos já foram adicionados. Ignore e continue.

### Erro: "function update_updated_at does not exist"
Execute primeiro as migrations anteriores que criam essa função.

### Erro: "relation ferias does not exist"
A tabela `ferias` não existe. Execute as migrations do schema principal primeiro.

## ✅ Checklist

- [ ] Migration executada sem erros
- [ ] Novos campos na tabela `ferias`
- [ ] Tabela `config_ferias` criada
- [ ] Configuração padrão inserida
- [ ] View `vw_ferias_completo` criada
- [ ] Página `/ferias` funcionando
- [ ] Solicitações listando corretamente
- [ ] Aprovação/Rejeição funcionando
- [ ] Configurações salvando

---

**Migration criada em:** 04/12/2025
**Versão:** 23
**Status:** ✅ Pronta para execução
