# 🚀 Executar Migration 19 - Relatórios Personalizados

## 📋 O que esta migration faz?

Esta migration cria o **Sistema de Relatórios Personalizados** que permite criar, agendar e gerar relatórios customizados para o RH.

### Funcionalidades:

1. **Tabela `relatorios_templates`**
   - Templates de relatórios personalizados
   - Configuração de campos, filtros e formato
   - SQL customizado para relatórios avançados
   - Controle de permissões e compartilhamento

2. **Tabela `relatorios_agendamentos`**
   - Agendamento automático de relatórios
   - Frequências: diária, semanal, mensal, etc
   - Envio por e-mail automático
   - Suporte a cron expressions

3. **Tabela `relatorios_execucoes`**
   - Histórico completo de execuções
   - Armazenamento de arquivos gerados
   - Métricas de performance
   - Controle de erros

4. **10 Templates Pré-configurados**
   - Lista de Colaboradores Ativos
   - Aniversariantes do Mês
   - Folha de Pagamento Mensal
   - Controle de Ponto
   - Férias Programadas
   - Documentos Pendentes
   - Admissões e Desligamentos
   - Headcount por Departamento
   - Custos com Pessoal

5. **Funções Auxiliares**
   - `calcular_proxima_execucao()` - Calcular próxima execução
   - Trigger para atualizar estatísticas

## 🚀 Como executar

### 1. Conectar ao Supabase

Acesse: https://supabase.com/dashboard/project/YOUR_PROJECT/editor

### 2. Executar o SQL

Copie todo o conteúdo do arquivo:
```
nuxt-app/database/migrations/19_relatorios_personalizados.sql
```

Cole no SQL Editor do Supabase e execute.

### 3. Verificar

Execute para confirmar:

```sql
-- Ver templates criados
SELECT nome, categoria, total_execucoes
FROM relatorios_templates
ORDER BY categoria, nome;

-- Contar templates por categoria
SELECT categoria, COUNT(*) as total
FROM relatorios_templates
GROUP BY categoria
ORDER BY categoria;
```

## ✅ Resultado Esperado

Você deve ver:
```
✅ Sistema de Relatórios Personalizados criado!
📋 Tabelas: relatorios_templates, relatorios_agendamentos, relatorios_execucoes
📊 10 templates pré-configurados criados
💡 Acesse Configurações → Relatórios Personalizados
```

## 📱 Como usar no sistema

### 1. Acessar Configurações
- Vá em **Configurações** → **Relatórios Personalizados**

### 2. Gerenciar Templates
- Ver templates pré-configurados
- Criar novos relatórios
- Editar templates existentes
- Marcar como favorito
- Gerar relatórios manualmente

### 3. Agendar Relatórios (Em desenvolvimento)
- Configurar envio automático
- Definir frequência
- Adicionar destinatários
- Personalizar mensagem

### 4. Ver Histórico (Em desenvolvimento)
- Acompanhar execuções
- Baixar relatórios gerados
- Ver métricas de performance

## 📊 Templates Pré-configurados

### 1. Lista de Colaboradores Ativos
Relatório completo de todos os colaboradores ativos com dados principais.

### 2. Aniversariantes do Mês
Lista de colaboradores que fazem aniversário no mês atual.

### 3. Folha de Pagamento Mensal
Resumo da folha de pagamento com totalizadores.

### 4. Controle de Ponto Mensal
Relatório de registros de ponto dos colaboradores.

### 5. Férias Programadas
Férias programadas e períodos aquisitivos.

### 6. Documentos Pendentes
Lista de documentos pendentes de colaboradores.

### 7. Admissões do Período
Colaboradores admitidos em um período específico.

### 8. Desligamentos do Período
Colaboradores desligados em um período específico.

### 9. Headcount por Departamento
Quantidade de colaboradores por departamento.

### 10. Custos com Pessoal
Relatório de custos totais com pessoal por departamento.

## 🎨 Formatos Disponíveis

- **PDF**: Relatório formatado para impressão
- **Excel**: Planilha editável
- **CSV**: Dados tabulares simples
- **JSON**: Dados estruturados para integração

## 📅 Frequências de Agendamento

- **Diário**: Todo dia no horário especificado
- **Semanal**: Dia da semana específico
- **Quinzenal**: A cada 15 dias
- **Mensal**: Dia do mês específico
- **Trimestral**: A cada 3 meses
- **Anual**: Uma vez por ano
- **Customizado**: Expressão cron personalizada

## 🔧 Criar Novo Relatório

Exemplo de como criar um relatório customizado:

```sql
INSERT INTO relatorios_templates (
  nome, descricao, categoria, entidade_principal,
  campos_selecionados, formato_padrao
) VALUES (
  'Meu Relatório Customizado',
  'Descrição do relatório',
  'colaboradores',
  'colaboradores',
  '["campo1", "campo2", "campo3"]'::jsonb,
  'pdf'
);
```

## 🔗 Integração com Outras Áreas

Os relatórios podem incluir dados de:
- ✅ Colaboradores (com campos customizados)
- ✅ Folha de Pagamento
- ✅ Ponto Eletrônico
- ✅ Férias
- ✅ Documentos
- ✅ Jornadas de Trabalho
- ✅ Qualquer tabela do sistema

## ⚠️ Importante

- Templates podem ser compartilhados com usuários específicos
- Execuções são mantidas por 90 dias (configurável)
- Arquivos gerados são armazenados no Supabase Storage
- Agendamentos inativos não são executados
- Apenas Admin pode excluir templates

## 🆘 Problemas?

Se houver erro na execução:

1. Verifique se as migrations anteriores foram executadas
2. Verifique se a função `update_updated_at()` existe
3. Verifique se a tabela `app_users` existe
4. Verifique se a tabela `colaboradores` existe

## 📚 Próximos Passos

Após executar esta migration:
1. Acesse a página de Relatórios Personalizados
2. Revise os templates pré-configurados
3. Teste a geração de relatórios
4. Crie relatórios específicos da sua empresa
5. Configure agendamentos (quando implementado)

## 🚧 Em Desenvolvimento

- [ ] Geração real de PDF/Excel/CSV
- [ ] Sistema de agendamento automático
- [ ] Envio de e-mails com relatórios
- [ ] Interface para criar filtros dinâmicos
- [ ] Editor visual de relatórios
- [ ] Gráficos e visualizações
- [ ] Exportação em lote
