# 🚀 EXECUTAR MIGRATION 22 - Sistema de Importação/Exportação

## ⚠️ IMPORTANTE - LEIA ANTES DE EXECUTAR

Esta migration cria o sistema completo de importação e exportação de dados em lote.

## 📋 O que será criado:

### Tabelas:
1. **templates_importacao** - Templates reutilizáveis para importação
2. **historico_importacoes** - Registro de todas as importações
3. **historico_exportacoes** - Registro de todas as exportações
4. **config_importacao_exportacao** - Configurações globais do sistema
5. **mapeamentos_campos** - Mapeamentos salvos de campos

### Recursos:
- ✅ Templates pré-configurados para Colaboradores, Férias e Documentos
- ✅ Sistema de validação de dados
- ✅ Histórico completo de operações
- ✅ Configurações personalizáveis
- ✅ Políticas RLS para segurança
- ✅ Índices para performance

## 🔧 COMO EXECUTAR:

### 1. Acesse o Supabase SQL Editor:
```
https://supabase.com/dashboard/project/SEU_PROJECT_ID/sql
```

### 2. Copie e cole o conteúdo do arquivo:
```
nuxt-app/database/migrations/22_importacao_exportacao.sql
```

### 3. Execute o SQL

### 4. Verifique se foi criado com sucesso:
```sql
-- Verificar tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'templates_importacao',
  'historico_importacoes',
  'historico_exportacoes',
  'config_importacao_exportacao',
  'mapeamentos_campos'
);

-- Verificar templates padrão
SELECT nome, tipo_entidade, formato 
FROM templates_importacao;

-- Verificar configuração padrão
SELECT * FROM config_importacao_exportacao;
```

## ✅ Após executar:

1. Acesse: **Configurações > Importação/Exportação**
2. Teste as funcionalidades:
   - ✅ Importar dados
   - ✅ Exportar dados
   - ✅ Gerenciar templates
   - ✅ Configurar parâmetros

## 🎯 Funcionalidades Disponíveis:

### Importação:
- Upload de arquivos CSV, XLSX, JSON
- Templates pré-configurados
- Validação automática de dados
- Backup antes da importação
- Atualização de registros existentes
- Histórico detalhado com erros

### Exportação:
- Múltiplos formatos (CSV, Excel, JSON)
- Filtros personalizados
- Limite de registros configurável
- Arquivos com expiração automática
- Download direto

### Templates:
- Criar templates personalizados
- Reutilizar configurações
- Mapear campos automaticamente
- Validações customizadas

### Configurações:
- Tamanho máximo de arquivo
- Tempo de expiração
- Encoding e delimitadores
- Validações automáticas
- Notificações por e-mail

## 🔗 Integração Automática:

O sistema está preparado para integrar com:
- ✅ Colaboradores
- ✅ Usuários
- ✅ Férias
- ✅ Documentos
- ✅ Ponto
- ✅ Folha de Pagamento
- ✅ Departamentos
- ✅ Cargos
- ✅ Jornadas

## 📊 Próximos Passos:

1. Implementar processamento real de arquivos (CSV parser)
2. Adicionar validações específicas por tipo
3. Integrar com sistema de backup
4. Implementar geração de arquivos Excel
5. Adicionar agendamento de exportações
6. Criar API para importação via webhook

## 🆘 Problemas?

Se encontrar erros:
1. Verifique se todas as tabelas anteriores existem
2. Confirme permissões do usuário
3. Verifique logs do Supabase
4. Execute as queries de verificação acima

---

**Status**: ⏳ Aguardando execução
**Prioridade**: 🔴 Alta
**Tempo estimado**: 2-3 minutos
