# 🎯 Executar Migration 18 - Campos Customizados

## 📋 O que esta migration faz?

Esta migration cria o **Sistema de Campos Customizados** que permite adicionar campos extras para diferentes entidades do sistema (colaboradores, empresa, documentos, etc).

### Funcionalidades:

1. **Tabela `campos_customizados`**
   - Define campos personalizados para cada entidade
   - Suporta vários tipos: texto, número, data, select, checkbox, etc
   - Validação, máscaras e valores padrão
   - Organização por grupos
   - Controle de permissões

2. **Tabela `valores_campos_customizados`**
   - Armazena os valores dos campos para cada registro
   - Suporta diferentes tipos de dados
   - Histórico de alterações

3. **Campos Pré-configurados**
   - 30+ campos úteis para RH já criados
   - Dados pessoais adicionais (nome social, gênero, etc)
   - Documentação extra (CNH, título de eleitor, etc)
   - Formação e qualificação
   - Saúde e benefícios
   - E muito mais!

4. **Funções Auxiliares**
   - `get_campos_customizados()` - Buscar campos de uma entidade
   - `get_valores_campos_customizados()` - Buscar valores de um registro
   - View `vw_colaboradores_completo` - Colaboradores com campos customizados

## 🚀 Como executar

### 1. Conectar ao Supabase

Acesse: https://supabase.com/dashboard/project/YOUR_PROJECT/editor

### 2. Executar o SQL

Copie todo o conteúdo do arquivo:
```
nuxt-app/database/migrations/18_personalizacao_campos_customizados.sql
```

Cole no SQL Editor do Supabase e execute.

### 3. Verificar

Execute para confirmar:

```sql
-- Ver campos customizados criados
SELECT entidade, grupo, COUNT(*) as total
FROM campos_customizados
GROUP BY entidade, grupo
ORDER BY entidade, grupo;

-- Ver campos de colaborador
SELECT nome, label, tipo_campo, grupo, obrigatorio
FROM campos_customizados
WHERE entidade = 'colaborador'
ORDER BY ordem, label;
```

## ✅ Resultado Esperado

Você deve ver:
```
✅ Sistema de Campos Customizados criado!
📋 Tabelas: campos_customizados, valores_campos_customizados
📝 30 campos customizados iniciais criados para colaboradores
💡 Use a página de Campos Customizados para gerenciar
```

## 📱 Como usar no sistema

### 1. Acessar Configurações
- Vá em **Configurações** → **Campos Customizados**

### 2. Gerenciar Campos
- Ver todos os campos criados
- Criar novos campos
- Editar campos existentes
- Ativar/desativar campos
- Organizar por grupos

### 3. Usar nos Formulários
Os campos customizados aparecerão automaticamente nos formulários de:
- Cadastro de colaboradores
- Edição de colaboradores
- Outros formulários conforme configurado

## 🎨 Tipos de Campos Disponíveis

- **texto**: Campo de texto simples
- **textarea**: Texto longo (múltiplas linhas)
- **numero**: Números inteiros ou decimais
- **data**: Seletor de data
- **email**: E-mail com validação
- **telefone**: Telefone com máscara
- **cpf**: CPF com validação
- **cnpj**: CNPJ com validação
- **select**: Lista suspensa (dropdown)
- **checkbox**: Sim/Não

## 📝 Exemplos de Campos Criados

### Dados Pessoais
- Nome Social
- Gênero
- Estado Civil Detalhado
- Nacionalidade
- Naturalidade

### Documentação
- CNH (número, categoria, validade)
- Título de Eleitor
- Certificado de Reservista
- RG (órgão emissor, data)

### Formação
- Escolaridade
- Curso de Formação
- Instituição de Ensino
- Ano de Conclusão

### Saúde
- Tipo Sanguíneo
- Alergias
- Medicamentos em Uso
- Plano de Saúde

### Benefícios
- Vale Transporte
- Vale Refeição
- Vale Alimentação

## 🔧 Criar Novos Campos

Exemplo de como criar um campo customizado:

```sql
INSERT INTO campos_customizados (
  nome, label, descricao, entidade, tipo_campo, grupo, ordem
) VALUES (
  'numero_cracha',
  'Número do Crachá',
  'Número de identificação do crachá',
  'colaborador',
  'texto',
  'Identificação',
  100
);
```

## 🔗 Integração Automática

Os campos customizados serão automaticamente:
- Exibidos nos formulários
- Validados conforme configuração
- Salvos no banco de dados
- Incluídos em relatórios
- Disponíveis para filtros e buscas

## ⚠️ Importante

- Campos customizados não podem ter o nome alterado após criação
- Ao excluir um campo, todos os valores associados serão excluídos
- Campos inativos não aparecem nos formulários mas mantêm os dados
- Use grupos para organizar campos relacionados

## 🆘 Problemas?

Se houver erro na execução:

1. Verifique se a migration 11 (empresa) foi executada
2. Verifique se a função `update_updated_at()` existe
3. Verifique se a tabela `app_users` existe
4. Verifique se a tabela `colaboradores` existe

## 📚 Próximos Passos

Após executar esta migration:
1. Acesse a página de Campos Customizados
2. Revise os campos pré-configurados
3. Adicione campos específicos da sua empresa
4. Configure permissões conforme necessário
5. Teste nos formulários de colaboradores
