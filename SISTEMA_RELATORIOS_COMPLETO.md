# 📊 Sistema de Relatórios Personalizados - RH Qualitec

## 📋 Visão Geral

O Sistema de Relatórios Personalizados permite criar, agendar e gerar relatórios customizados para todas as áreas do RH, com suporte a múltiplos formatos e agendamento automático.

## ✨ Funcionalidades Implementadas

### 1. Templates de Relatórios
- ✅ Criar relatórios personalizados
- ✅ Definir campos a serem incluídos
- ✅ Configurar formato (PDF, Excel, CSV, JSON)
- ✅ Organizar por categorias
- ✅ Marcar como favorito
- ✅ Compartilhar com usuários
- ✅ 10 templates pré-configurados

### 2. Configurações Avançadas
- ✅ Escolher entidade principal (tabela)
- ✅ Selecionar campos específicos
- ✅ Definir filtros padrão
- ✅ Configurar ordenação
- ✅ Adicionar totalizadores
- ✅ SQL customizado para relatórios complexos
- ✅ Controle de permissões

### 3. Formatos de Saída
- **PDF**: Relatório formatado para impressão
- **Excel**: Planilha editável (.xlsx)
- **CSV**: Dados tabulares simples
- **JSON**: Dados estruturados para APIs

### 4. Agendamento Automático (Em desenvolvimento)
- Frequências: diária, semanal, mensal, etc
- Envio automático por e-mail
- Filtros dinâmicos (ex: mês atual)
- Suporte a cron expressions

### 5. Histórico de Execuções (Em desenvolvimento)
- Registro de todas as execuções
- Armazenamento de arquivos gerados
- Métricas de performance
- Controle de erros

## 🗄️ Estrutura do Banco de Dados

### Tabela: `relatorios_templates`
Define os templates de relatórios.

```sql
CREATE TABLE relatorios_templates (
  id UUID PRIMARY KEY,
  nome VARCHAR(255) NOT NULL UNIQUE,
  descricao TEXT,
  categoria VARCHAR(100),              -- Categoria do relatório
  entidade_principal VARCHAR(100),     -- Tabela principal
  campos_selecionados JSONB,           -- Campos a incluir
  joins JSONB,                         -- Joins com outras tabelas
  filtros JSONB,                       -- Filtros padrão
  ordenacao JSONB,                     -- Ordenação
  agrupamento JSONB,                   -- GROUP BY
  sql_customizado TEXT,                -- SQL avançado
  formato_padrao VARCHAR(50),          -- pdf, excel, csv, json
  orientacao VARCHAR(20),              -- portrait, landscape
  incluir_logo BOOLEAN,
  incluir_cabecalho BOOLEAN,
  incluir_rodape BOOLEAN,
  colunas_config JSONB,                -- Config de colunas
  totalizadores JSONB,                 -- Campos para totalizar
  visivel_para JSONB,                  -- Roles com acesso
  executavel_por JSONB,                -- Roles que podem executar
  publico BOOLEAN,
  compartilhado_com JSONB,             -- IDs de usuários
  ativo BOOLEAN,
  favorito BOOLEAN,
  tags JSONB,
  created_by UUID,
  ultima_execucao TIMESTAMPTZ,
  total_execucoes INTEGER
);
```

### Tabela: `relatorios_agendamentos`
Agendamentos automáticos de relatórios.

```sql
CREATE TABLE relatorios_agendamentos (
  id UUID PRIMARY KEY,
  template_id UUID REFERENCES relatorios_templates(id),
  nome VARCHAR(255),
  descricao TEXT,
  ativo BOOLEAN,
  frequencia VARCHAR(50),              -- diario, semanal, mensal, etc
  dia_semana INTEGER,                  -- 0-6 para semanal
  dia_mes INTEGER,                     -- 1-31 para mensal
  hora TIME,
  cron_expression VARCHAR(100),        -- Cron customizado
  filtros_dinamicos JSONB,             -- Filtros que mudam
  enviar_email BOOLEAN,
  emails_destinatarios JSONB,
  usuarios_destinatarios JSONB,
  formato VARCHAR(50),
  assunto_email VARCHAR(255),
  mensagem_email TEXT,
  proxima_execucao TIMESTAMPTZ,
  ultima_execucao TIMESTAMPTZ,
  total_execucoes INTEGER
);
```

### Tabela: `relatorios_execucoes`
Histórico de execuções.

```sql
CREATE TABLE relatorios_execucoes (
  id UUID PRIMARY KEY,
  template_id UUID REFERENCES relatorios_templates(id),
  agendamento_id UUID REFERENCES relatorios_agendamentos(id),
  tipo_execucao VARCHAR(50),           -- manual, agendada
  status VARCHAR(50),                  -- processando, concluido, erro
  filtros_aplicados JSONB,
  parametros JSONB,
  formato_gerado VARCHAR(50),
  arquivo_url TEXT,                    -- URL no storage
  arquivo_nome VARCHAR(255),
  arquivo_tamanho BIGINT,
  total_registros INTEGER,
  iniciado_em TIMESTAMPTZ,
  concluido_em TIMESTAMPTZ,
  duracao_segundos INTEGER,
  erro_mensagem TEXT,
  email_enviado BOOLEAN,
  executado_por UUID,
  expira_em TIMESTAMPTZ                -- Para limpeza automática
);
```

## 🔌 APIs Disponíveis

### GET `/api/relatorios/templates`
Lista todos os templates de relatórios.

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nome": "Lista de Colaboradores Ativos",
      "descricao": "Relatório completo de colaboradores",
      "categoria": "colaboradores",
      "formato_padrao": "pdf",
      "total_execucoes": 15,
      "favorito": true
    }
  ]
}
```

### POST `/api/relatorios/templates`
Cria um novo template de relatório.

**Body:**
```json
{
  "nome": "Meu Relatório",
  "descricao": "Descrição do relatório",
  "categoria": "colaboradores",
  "entidade_principal": "colaboradores",
  "campos_selecionados": ["nome", "cpf", "cargo", "salario"],
  "formato_padrao": "pdf",
  "orientacao": "portrait",
  "incluir_logo": true,
  "ativo": true
}
```

### PUT `/api/relatorios/templates/:id`
Atualiza um template de relatório.

### DELETE `/api/relatorios/templates/:id`
Exclui um template de relatório.

### POST `/api/relatorios/gerar`
Gera um relatório a partir de um template.

**Body:**
```json
{
  "template_id": "uuid",
  "filtros": {
    "ativo": true,
    "departamento": "TI"
  },
  "formato": "pdf"
}
```

## 🎯 Como Usar

### 1. Acessar a Página
```
Painel Admin → Configurações → Relatórios Personalizados
```

### 2. Criar um Novo Relatório

1. Clique em **"Novo Relatório"**
2. Preencha os dados:
   - **Nome**: Nome do relatório
   - **Descrição**: Descrição detalhada
   - **Categoria**: Tipo de relatório
   - **Entidade Principal**: Tabela principal
   - **Campos**: Campos a incluir (separados por vírgula)
   - **Formato**: PDF, Excel, CSV ou JSON
3. Configure opções:
   - Incluir logo
   - Incluir cabeçalho/rodapé
   - Orientação (retrato/paisagem)
4. Clique em **"Salvar"**

### 3. Gerar um Relatório

1. Na lista de templates, clique em **"Gerar"**
2. O relatório será processado
3. O arquivo será disponibilizado para download

### 4. Marcar como Favorito

Clique no ícone de estrela para marcar/desmarcar como favorito.

## 📊 Templates Pré-configurados

### 1. Lista de Colaboradores Ativos
**Categoria**: Colaboradores  
**Campos**: nome, cpf, cargo, departamento, data_admissao, salario, email, telefone  
**Uso**: Relatório geral de todos os colaboradores ativos

### 2. Aniversariantes do Mês
**Categoria**: Colaboradores  
**Campos**: nome, data_nascimento, cargo, departamento, email, telefone  
**Filtro**: Mês atual  
**Uso**: Enviar parabenizações

### 3. Folha de Pagamento Mensal
**Categoria**: Folha  
**Campos**: colaborador_nome, cargo, salario_base, proventos, descontos, liquido  
**Totalizadores**: Sim  
**Uso**: Resumo mensal da folha

### 4. Controle de Ponto Mensal
**Categoria**: Ponto  
**Campos**: colaborador_nome, data, entrada, saida, total_horas  
**Uso**: Acompanhamento de ponto

### 5. Férias Programadas
**Categoria**: Férias  
**Campos**: colaborador_nome, periodo_aquisitivo, data_inicio, data_fim, dias, status  
**Uso**: Planejamento de férias

### 6. Documentos Pendentes
**Categoria**: Documentos  
**Campos**: colaborador_nome, tipo_documento, status, data_solicitacao, prazo  
**Filtro**: Status pendente  
**Uso**: Cobrar documentos

### 7. Admissões do Período
**Categoria**: Colaboradores  
**Campos**: nome, cpf, cargo, departamento, data_admissao, salario, tipo_contrato  
**Uso**: Relatório de admissões

### 8. Desligamentos do Período
**Categoria**: Colaboradores  
**Campos**: nome, cpf, cargo, data_admissao, data_demissao, motivo  
**Filtro**: Inativos  
**Uso**: Relatório de desligamentos

### 9. Headcount por Departamento
**Categoria**: Colaboradores  
**Campos**: departamento, COUNT(*)  
**Agrupamento**: departamento  
**Uso**: Análise de distribuição

### 10. Custos com Pessoal
**Categoria**: Folha  
**Campos**: departamento, cargo, total_colaboradores, total_salarios  
**Totalizadores**: Sim  
**Uso**: Análise de custos

## 🎨 Exemplos de Uso

### Exemplo 1: Relatório Simples

```javascript
// Criar template
await $fetch('/api/relatorios/templates', {
  method: 'POST',
  body: {
    nome: 'Colaboradores por Cargo',
    categoria: 'colaboradores',
    entidade_principal: 'colaboradores',
    campos_selecionados: ['cargo', 'COUNT(*) as total'],
    agrupamento: ['cargo'],
    formato_padrao: 'excel'
  }
})

// Gerar relatório
await $fetch('/api/relatorios/gerar', {
  method: 'POST',
  body: {
    template_id: 'uuid-do-template',
    formato: 'excel'
  }
})
```

### Exemplo 2: Relatório com Filtros

```javascript
await $fetch('/api/relatorios/templates', {
  method: 'POST',
  body: {
    nome: 'Colaboradores do Departamento',
    entidade_principal: 'colaboradores',
    campos_selecionados: ['nome', 'cargo', 'salario'],
    filtros: {
      departamento: { operador: 'igual', valor: 'TI' },
      ativo: true
    },
    ordenacao: { campo: 'nome', direcao: 'asc' }
  }
})
```

### Exemplo 3: Relatório com SQL Customizado

```javascript
await $fetch('/api/relatorios/templates', {
  method: 'POST',
  body: {
    nome: 'Análise Salarial Avançada',
    sql_customizado: `
      SELECT 
        departamento,
        AVG(salario) as media_salarial,
        MIN(salario) as menor_salario,
        MAX(salario) as maior_salario,
        COUNT(*) as total_colaboradores
      FROM colaboradores
      WHERE ativo = true
      GROUP BY departamento
      ORDER BY media_salarial DESC
    `
  }
})
```

## 🔄 Integração com Outras Áreas

### Colaboradores
- Dados pessoais e profissionais
- Campos customizados incluídos automaticamente
- Histórico de admissões e desligamentos

### Folha de Pagamento
- Salários e benefícios
- Proventos e descontos
- Totalizadores automáticos

### Ponto Eletrônico
- Registros de entrada/saída
- Horas trabalhadas
- Faltas e atrasos

### Férias
- Períodos aquisitivos
- Férias programadas e realizadas
- Saldo de férias

### Documentos
- Status de documentos
- Documentos pendentes
- Validades e vencimentos

## 📅 Agendamento (Em Desenvolvimento)

### Configurar Agendamento

```javascript
await $fetch('/api/relatorios/agendamentos', {
  method: 'POST',
  body: {
    template_id: 'uuid',
    nome: 'Relatório Mensal Automático',
    frequencia: 'mensal',
    dia_mes: 1,
    hora: '08:00:00',
    enviar_email: true,
    emails_destinatarios: ['rh@empresa.com'],
    assunto_email: 'Relatório Mensal - {mes}/{ano}',
    mensagem_email: 'Segue relatório mensal em anexo.'
  }
})
```

### Frequências Disponíveis

- **diario**: Todo dia no horário especificado
- **semanal**: Dia da semana específico (0-6)
- **quinzenal**: A cada 15 dias
- **mensal**: Dia do mês específico (1-31)
- **trimestral**: A cada 3 meses
- **anual**: Uma vez por ano
- **customizado**: Expressão cron

## 🔐 Permissões

### Visibilidade
Configure quais roles podem ver cada relatório:
```json
{
  "visivel_para": ["admin", "rh", "gerente"]
}
```

### Execução
Configure quais roles podem executar cada relatório:
```json
{
  "executavel_por": ["admin", "rh"]
}
```

### Compartilhamento
Compartilhe relatórios com usuários específicos:
```json
{
  "compartilhado_com": ["uuid-usuario-1", "uuid-usuario-2"]
}
```

## ⚠️ Boas Práticas

1. **Nomes Descritivos**
   - Use nomes claros e objetivos
   - Inclua a categoria no nome se necessário

2. **Campos Relevantes**
   - Inclua apenas campos necessários
   - Evite relatórios muito grandes

3. **Filtros Padrão**
   - Configure filtros sensatos
   - Use filtros dinâmicos para datas

4. **Performance**
   - Evite SQL muito complexo
   - Use índices nas tabelas
   - Limite o número de registros

5. **Organização**
   - Use categorias consistentes
   - Marque favoritos os mais usados
   - Use tags para organização

## 🚀 Próximas Melhorias

- [ ] Geração real de PDF com formatação
- [ ] Exportação para Excel com fórmulas
- [ ] Sistema de agendamento funcional
- [ ] Envio automático de e-mails
- [ ] Editor visual de relatórios
- [ ] Gráficos e visualizações
- [ ] Filtros dinâmicos na interface
- [ ] Relatórios com múltiplas tabelas (joins)
- [ ] Suporte a sub-relatórios
- [ ] Assinatura digital de relatórios
- [ ] Versionamento de templates
- [ ] Auditoria de acessos

## 📚 Documentação Relacionada

- [EXECUTAR_MIGRATION_19.md](database/migrations/EXECUTAR_MIGRATION_19.md) - Como executar a migration
- [19_relatorios_personalizados.sql](database/migrations/19_relatorios_personalizados.sql) - Script SQL completo
