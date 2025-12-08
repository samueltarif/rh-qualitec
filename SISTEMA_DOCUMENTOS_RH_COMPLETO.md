# 📄 Sistema de Documentos RH - Completo

## 🎯 Visão Geral

Sistema completo de gerenciamento de tipos e categorias de documentos RH, com integração automática em todas as áreas do sistema.

## 📊 Estrutura

### Categorias (10 padrão)
1. **Admissão** - Documentos de contratação
2. **Pessoais** - Documentos pessoais
3. **Médicos** - Atestados e exames
4. **Trabalhistas** - Contratos e rescisões
5. **Férias** - Solicitações de férias
6. **Ponto** - Justificativas e declarações
7. **Disciplinares** - Advertências
8. **Benefícios** - Vale transporte, plano de saúde
9. **Treinamentos** - Certificados
10. **Outros** - Documentos diversos

### Tipos de Documentos (40+ padrão)
Cada categoria possui tipos específicos pré-configurados. Exemplos:

**Admissão:**
- RG, CPF, Título de Eleitor
- Carteira de Trabalho
- Comprovante de Residência
- Certidão de Nascimento/Casamento
- Foto 3x4

**Médicos:**
- Atestado Médico
- ASO (Admissional, Periódico, Demissional)
- Laudos Médicos

**Ponto:**
- Declaração de Comparecimento
- Justificativa de Falta
- Declaração de Horas Extras

## ⚙️ Funcionalidades

### 1. Configurações por Tipo
Cada tipo de documento pode ter:

- ✅ **Requer Período**: Data início/fim obrigatória
- ✅ **Requer Horas**: Campo de horas obrigatório
- ✅ **Requer Aprovação**: Necessita aprovação do gestor
- ✅ **Requer Arquivo**: Upload obrigatório
- ✅ **Tem Validade**: Documento expira após X dias
- ✅ **Notificar Vencimento**: Avisa X dias antes de vencer
- ✅ **Campos Extras**: Campos customizados (JSON)

### 2. Validade e Notificações

Documentos com validade:
- CNH (365 dias)
- ASO Periódico (365 dias)
- Comprovante de Residência (90 dias)
- Certificados NR (730 dias)

Sistema notifica automaticamente antes do vencimento.

### 3. Aprovação de Documentos

Tipos que requerem aprovação:
- Atestado Médico
- Solicitação de Férias
- Justificativa de Falta
- Declaração de Horas Extras
- Acordo de Compensação

Fluxo: Colaborador envia → Gestor aprova/rejeita

## 🔗 Integração Automática

### Com Colaboradores
Ao cadastrar colaborador, sistema pode:
- Solicitar documentos de admissão automaticamente
- Verificar documentos obrigatórios
- Alertar sobre documentos faltantes
- Notificar vencimentos

### Com Férias
- Solicitação de férias gera documento automaticamente
- Recibo de férias vinculado ao período
- Abono pecuniário registrado

### Com Ponto
- Justificativas de falta vinculadas ao dia
- Declarações de comparecimento com horas
- Atestados médicos com período de afastamento

### Com Folha de Pagamento
- Documentos de benefícios (VT, VA, plano de saúde)
- Acordos de compensação (banco de horas)
- Documentos trabalhistas

## 📁 Estrutura do Banco

### Tabela: categorias_documentos
```sql
- id (UUID)
- nome (VARCHAR)
- descricao (TEXT)
- cor (VARCHAR) - Para UI
- icone (VARCHAR) - Ícone heroicons
- ativo (BOOLEAN)
- ordem (INTEGER)
```

### Tabela: tipos_documentos
```sql
- id (UUID)
- categoria_id (UUID FK)
- nome (VARCHAR)
- descricao (TEXT)
- requer_periodo (BOOLEAN)
- requer_horas (BOOLEAN)
- requer_aprovacao (BOOLEAN)
- requer_arquivo (BOOLEAN)
- tem_validade (BOOLEAN)
- dias_validade (INTEGER)
- notificar_vencimento (BOOLEAN)
- dias_aviso_vencimento (INTEGER)
- campos_extras (JSONB)
- ativo (BOOLEAN)
- ordem (INTEGER)
```

### Tabela: documentos_rh (atualizada)
```sql
- id (UUID)
- colaborador_id (UUID FK)
- tipo_documento_id (UUID FK) ← NOVO
- categoria_id (UUID FK) ← NOVO
- tipo (VARCHAR) - Mantido para compatibilidade
- data_inicio (DATE)
- data_fim (DATE)
- data_validade (DATE) ← NOVO
- horas (DECIMAL)
- arquivo_url (TEXT)
- status (VARCHAR) - Pendente/Aprovado/Rejeitado
- observacoes (TEXT)
- campos_extras_valores (JSONB) ← NOVO
```

## 🎨 Interface

### Página: /configuracoes/documentos

**Aba Categorias:**
- Grid de cards com categorias
- Criar/Editar/Excluir categorias
- Visualizar quantidade de tipos por categoria
- Ativar/Desativar categorias

**Aba Tipos:**
- Tabela com todos os tipos
- Filtrar por categoria
- Filtrar apenas ativos
- Criar/Editar/Excluir tipos
- Badges mostrando configurações (Período, Horas, Aprovação, etc)

## 🚀 Como Usar

### 1. Executar Migration
```bash
# No Supabase SQL Editor
database/migrations/14_tipos_documentos_rh.sql
```

### 2. Acessar Configurações
```
Admin → Configurações → Tipos de Documentos
```

### 3. Personalizar
- Editar tipos existentes
- Criar novos tipos específicos da empresa
- Configurar validades
- Ativar/Desativar tipos não utilizados

### 4. Usar no Sistema
Ao cadastrar documentos de colaboradores:
- Selecionar categoria
- Selecionar tipo
- Campos aparecem automaticamente conforme configuração
- Validações aplicadas automaticamente

## 📋 Exemplos de Uso

### Exemplo 1: Atestado Médico
```
Categoria: Médicos
Tipo: Atestado Médico
Configuração:
  ✅ Requer Período (data início/fim do afastamento)
  ❌ Requer Horas
  ✅ Requer Aprovação (gestor precisa aprovar)
  ✅ Requer Arquivo (upload do atestado)
  ❌ Tem Validade
```

### Exemplo 2: CNH
```
Categoria: Pessoais
Tipo: CNH
Configuração:
  ❌ Requer Período
  ❌ Requer Horas
  ❌ Requer Aprovação
  ✅ Requer Arquivo (foto da CNH)
  ✅ Tem Validade (365 dias)
  ✅ Notificar Vencimento (30 dias antes)
```

### Exemplo 3: Declaração de Horas Extras
```
Categoria: Ponto
Tipo: Declaração de Horas Extras
Configuração:
  ✅ Requer Período (período das HE)
  ✅ Requer Horas (quantidade de HE)
  ✅ Requer Aprovação (gestor aprova)
  ✅ Requer Arquivo (comprovante)
  ❌ Tem Validade
```

## 🔔 Notificações Automáticas

Sistema envia notificações para:

1. **Documentos Vencendo**
   - CNH vencendo em 30 dias
   - ASO vencendo em 30 dias
   - Comprovante de residência vencendo em 15 dias

2. **Documentos Pendentes de Aprovação**
   - Atestados médicos aguardando aprovação
   - Solicitações de férias pendentes
   - Justificativas de falta para análise

3. **Documentos Obrigatórios Faltantes**
   - Colaborador sem ASO admissional
   - Documentos de admissão incompletos

## 🎯 Benefícios

1. **Padronização**: Todos usam os mesmos tipos
2. **Automação**: Validações e notificações automáticas
3. **Compliance**: Garante documentação completa
4. **Rastreabilidade**: Histórico de todos os documentos
5. **Flexibilidade**: Fácil adicionar novos tipos
6. **Integração**: Conectado com todas as áreas do RH

## 📝 Próximas Melhorias

- [ ] Dashboard de documentos vencidos/vencendo
- [ ] Relatório de documentos por colaborador
- [ ] Assinatura digital de documentos
- [ ] Templates de documentos para geração automática
- [ ] Workflow de aprovação multi-nível
- [ ] Integração com e-mail para notificações
- [ ] App mobile para upload de documentos
- [ ] OCR para extração automática de dados

## ✅ Status

- ✅ Migration criada
- ✅ APIs implementadas (GET, POST, PUT, DELETE)
- ✅ Página de configuração completa
- ✅ Modais de edição
- ✅ 10 categorias padrão
- ✅ 40+ tipos padrão
- ✅ Integração com documentos_rh
- ✅ Sistema de validade e notificações
- ✅ Sistema de aprovação

**Sistema 100% funcional e pronto para uso!**

