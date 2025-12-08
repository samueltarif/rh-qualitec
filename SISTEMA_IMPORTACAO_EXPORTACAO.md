# 📦 Sistema de Importação/Exportação - RH Qualitec

## 🎯 Visão Geral

Sistema completo para importar e exportar dados em lote, facilitando a migração de dados, geração de relatórios e integração com sistemas externos.

## ✨ Funcionalidades Principais

### 1. Importação de Dados

#### Tipos Suportados:
- **Colaboradores** - Dados completos ou básicos
- **Usuários** - Contas de acesso
- **Férias** - Períodos e agendamentos
- **Documentos** - Metadados de documentos
- **Ponto** - Registros de ponto
- **Folha** - Dados de folha de pagamento

#### Formatos Aceitos:
- **CSV** - Valores separados por vírgula
- **XLSX** - Planilhas Excel
- **JSON** - Formato estruturado

#### Recursos:
- ✅ Upload de arquivos (até 10MB configurável)
- ✅ Templates pré-configurados
- ✅ Validação automática de dados
- ✅ Backup antes da importação
- ✅ Atualização de registros existentes
- ✅ Relatório detalhado de erros
- ✅ Histórico completo

### 2. Exportação de Dados

#### Tipos Disponíveis:
- Colaboradores
- Usuários
- Férias
- Documentos
- Registros de Ponto
- Folha de Pagamento
- Departamentos
- Cargos
- Jornadas de Trabalho

#### Formatos de Saída:
- **CSV** - Para análise em planilhas
- **Excel (XLSX)** - Formatado e profissional
- **JSON** - Para integrações

#### Recursos:
- ✅ Filtros personalizados
- ✅ Seleção de período
- ✅ Filtro por status
- ✅ Limite de registros
- ✅ Download direto
- ✅ Expiração automática (24h padrão)
- ✅ Histórico de exportações

### 3. Templates de Importação

#### Templates Padrão:
1. **Importação Completa de Colaboradores**
   - Todos os campos disponíveis
   - Validações de CPF e e-mail
   - Campos obrigatórios marcados

2. **Importação Básica de Colaboradores**
   - Apenas campos essenciais
   - Rápida e simples

3. **Importação de Férias**
   - Períodos e datas
   - Validação de períodos aquisitivos

4. **Importação de Documentos**
   - Metadados de documentos
   - Vinculação com colaboradores

#### Gerenciamento:
- ✅ Criar templates personalizados
- ✅ Editar templates existentes
- ✅ Ativar/desativar templates
- ✅ Baixar template exemplo
- ✅ Mapear campos customizados

### 4. Configurações

#### Parâmetros Gerais:
- **Tamanho Máximo de Arquivo**: 1MB a 100MB
- **Tempo de Expiração**: 1h a 168h (7 dias)
- **Limite de Registros**: 100 a 100.000
- **Encoding Padrão**: UTF-8, ISO-8859-1, Windows-1252
- **Delimitador CSV**: vírgula, ponto e vírgula, tab

#### Opções:
- ✅ Validação automática antes de importar
- ✅ Backup automático antes de importações
- ✅ Notificar por e-mail ao concluir
- ✅ Permitir importações simultâneas

## 🗂️ Estrutura do Banco de Dados

### Tabelas Criadas:

#### 1. templates_importacao
```sql
- id (UUID)
- nome (VARCHAR)
- descricao (TEXT)
- tipo_entidade (VARCHAR)
- formato (VARCHAR)
- campos_mapeamento (JSONB)
- validacoes (JSONB)
- transformacoes (JSONB)
- ativo (BOOLEAN)
- created_at, updated_at
```

#### 2. historico_importacoes
```sql
- id (UUID)
- template_id (UUID)
- tipo_entidade (VARCHAR)
- arquivo_nome (VARCHAR)
- arquivo_tamanho (INTEGER)
- formato (VARCHAR)
- total_registros (INTEGER)
- registros_sucesso (INTEGER)
- registros_erro (INTEGER)
- status (VARCHAR)
- erros_detalhes (JSONB)
- dados_importados (JSONB)
- usuario_id (UUID)
- tempo_processamento (INTEGER)
- created_at, completed_at
```

#### 3. historico_exportacoes
```sql
- id (UUID)
- tipo_entidade (VARCHAR)
- formato (VARCHAR)
- filtros (JSONB)
- campos_exportados (JSONB)
- total_registros (INTEGER)
- arquivo_nome (VARCHAR)
- arquivo_url (TEXT)
- arquivo_tamanho (INTEGER)
- status (VARCHAR)
- erro_mensagem (TEXT)
- usuario_id (UUID)
- tempo_processamento (INTEGER)
- expira_em (TIMESTAMP)
- created_at, completed_at
```

#### 4. config_importacao_exportacao
```sql
- id (UUID)
- tamanho_maximo_arquivo (INTEGER)
- formatos_permitidos (JSONB)
- validacao_automatica (BOOLEAN)
- backup_antes_importacao (BOOLEAN)
- notificar_conclusao (BOOLEAN)
- tempo_expiracao_exportacao (INTEGER)
- limite_registros_exportacao (INTEGER)
- permitir_importacao_paralela (BOOLEAN)
- encoding_padrao (VARCHAR)
- delimitador_csv (VARCHAR)
- created_at, updated_at
```

#### 5. mapeamentos_campos
```sql
- id (UUID)
- nome (VARCHAR)
- tipo_entidade (VARCHAR)
- mapeamento (JSONB)
- usado_count (INTEGER)
- ultima_utilizacao (TIMESTAMP)
- usuario_id (UUID)
- created_at
```

## 🔐 Segurança

### Row Level Security (RLS):
- ✅ Usuários veem apenas suas operações
- ✅ Admins têm acesso total
- ✅ Templates públicos para todos
- ✅ Configurações protegidas

### Validações:
- ✅ Tamanho de arquivo
- ✅ Formato de arquivo
- ✅ Campos obrigatórios
- ✅ Tipos de dados
- ✅ Unicidade (CPF, e-mail)
- ✅ Formatos específicos (CPF, e-mail, datas)

## 📊 Casos de Uso

### 1. Migração Inicial
```
1. Preparar planilha com dados dos colaboradores
2. Selecionar template "Importação Completa"
3. Fazer upload do arquivo
4. Validar dados
5. Confirmar importação
6. Verificar relatório de erros
```

### 2. Atualização em Lote
```
1. Exportar dados atuais
2. Editar planilha
3. Importar com opção "Atualizar existentes"
4. Verificar alterações
```

### 3. Geração de Relatórios
```
1. Selecionar tipo de dados
2. Aplicar filtros (período, status)
3. Escolher formato (Excel)
4. Gerar exportação
5. Baixar arquivo
```

### 4. Backup de Dados
```
1. Exportar todos os tipos de dados
2. Salvar arquivos localmente
3. Agendar exportações periódicas
```

## 🔄 Integração Automática

### Campos Customizados:
O sistema detecta automaticamente campos customizados criados em:
- Colaboradores
- Documentos
- Outras entidades

### Validações Dinâmicas:
- Valida contra dados existentes
- Verifica relacionamentos
- Aplica regras de negócio

### Notificações:
- E-mail ao concluir importação
- Alerta em caso de erros
- Resumo de operações

## 🚀 Próximas Melhorias

### Fase 2:
- [ ] Parser CSV avançado
- [ ] Gerador de Excel com formatação
- [ ] Validações específicas por tipo
- [ ] Preview antes de importar
- [ ] Desfazer importação

### Fase 3:
- [ ] Agendamento de exportações
- [ ] Exportação incremental
- [ ] Compressão de arquivos
- [ ] Importação via API/Webhook
- [ ] Transformações de dados

### Fase 4:
- [ ] Importação de imagens/documentos
- [ ] OCR para documentos
- [ ] Integração com Google Sheets
- [ ] Sincronização bidirecional

## 📱 Interface

### Abas Disponíveis:
1. **Importar** - Upload e processamento
2. **Exportar** - Geração de arquivos
3. **Templates** - Gerenciamento de templates
4. **Configurações** - Parâmetros do sistema

### Componentes:
- `ConfigCard.vue` - Card na página de configurações
- `ModalDetalhesErros.vue` - Exibição de erros
- `ModalTemplateImportacao.vue` - Criar/editar templates

## 🎨 Exemplo de Uso

### Importar Colaboradores (CSV):
```csv
nome_completo,cpf,data_nascimento,email,cargo,departamento,data_admissao,salario,tipo_contrato
João Silva,123.456.789-00,1990-05-15,joao@email.com,Analista,TI,2024-01-10,5000.00,CLT
Maria Santos,987.654.321-00,1985-08-20,maria@email.com,Gerente,RH,2024-01-15,8000.00,CLT
```

### Exportar Colaboradores (Filtrado):
```javascript
{
  tipoEntidade: 'colaboradores',
  formato: 'xlsx',
  filtros: {
    dataInicio: '2024-01-01',
    dataFim: '2024-12-31',
    status: 'ativo'
  }
}
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique o histórico de operações
2. Consulte os detalhes de erros
3. Revise as configurações
4. Entre em contato com o suporte técnico

---

**Desenvolvido para**: RH Qualitec  
**Versão**: 1.0  
**Data**: Dezembro 2024  
**Status**: ✅ Implementado e Pronto para Uso
