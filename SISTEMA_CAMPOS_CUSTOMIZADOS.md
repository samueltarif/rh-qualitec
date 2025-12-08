# 🎨 Sistema de Campos Customizados - RH Qualitec

## 📋 Visão Geral

O Sistema de Campos Customizados permite adicionar campos extras e personalizados para diferentes entidades do sistema (colaboradores, empresa, documentos, etc) sem precisar alterar o código ou banco de dados.

## ✨ Funcionalidades

### 1. Gerenciamento de Campos
- ✅ Criar campos customizados para diferentes entidades
- ✅ Definir tipo de campo (texto, número, data, select, etc)
- ✅ Configurar validações e máscaras
- ✅ Organizar campos por grupos
- ✅ Controlar visibilidade e permissões
- ✅ Ativar/desativar campos sem perder dados

### 2. Tipos de Campos Suportados
- **texto**: Campo de texto simples
- **textarea**: Texto longo (múltiplas linhas)
- **numero**: Números inteiros ou decimais
- **data**: Seletor de data
- **email**: E-mail com validação
- **telefone**: Telefone com máscara
- **cpf**: CPF com validação
- **cnpj**: CNPJ com validação
- **select**: Lista suspensa com opções
- **checkbox**: Sim/Não

### 3. Campos Pré-configurados

#### Dados Pessoais Adicionais
- Nome Social
- Gênero
- Estado Civil Detalhado
- Nacionalidade
- Naturalidade

#### Documentação Extra
- RG (órgão emissor, data de emissão)
- CNH (número, categoria, validade)
- Título de Eleitor
- Certificado de Reservista

#### Dados Bancários
- PIX (tipo de chave e chave)

#### Formação e Qualificação
- Escolaridade
- Curso de Formação
- Instituição de Ensino
- Ano de Conclusão

#### Saúde e Segurança
- Tipo Sanguíneo
- Alergias
- Medicamentos em Uso
- Plano de Saúde (número da carteirinha)

#### Dependentes
- Possui Dependentes
- Número de Dependentes

#### Benefícios
- Vale Transporte (linhas utilizadas)
- Vale Refeição
- Vale Alimentação

#### Informações Adicionais
- Observações
- Tamanho do Uniforme
- Tamanho do Calçado

## 🗄️ Estrutura do Banco de Dados

### Tabela: `campos_customizados`
Define os campos customizados disponíveis.

```sql
CREATE TABLE campos_customizados (
  id UUID PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,           -- Identificador único
  label VARCHAR(255) NOT NULL,          -- Rótulo exibido
  descricao TEXT,                       -- Descrição do campo
  entidade VARCHAR(50) NOT NULL,        -- 'colaborador', 'empresa', etc
  tipo_campo VARCHAR(50) NOT NULL,      -- Tipo do campo
  opcoes JSONB,                         -- Opções para select
  obrigatorio BOOLEAN DEFAULT false,
  valor_padrao TEXT,
  mascara VARCHAR(100),
  validacao_regex VARCHAR(255),
  mensagem_erro VARCHAR(255),
  ordem INTEGER DEFAULT 0,
  grupo VARCHAR(100),                   -- Agrupamento
  visivel BOOLEAN DEFAULT true,
  editavel BOOLEAN DEFAULT true,
  visivel_para JSONB,                   -- Roles que podem ver
  editavel_por JSONB,                   -- Roles que podem editar
  sincronizar_com VARCHAR(100),         -- Campo do sistema
  formula TEXT,                         -- Campos calculados
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  created_by UUID
);
```

### Tabela: `valores_campos_customizados`
Armazena os valores dos campos para cada registro.

```sql
CREATE TABLE valores_campos_customizados (
  id UUID PRIMARY KEY,
  campo_id UUID REFERENCES campos_customizados(id),
  entidade_tipo VARCHAR(50) NOT NULL,
  entidade_id UUID NOT NULL,
  valor TEXT,
  valor_numerico DECIMAL(15,2),
  valor_data DATE,
  valor_boolean BOOLEAN,
  valor_json JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  updated_by UUID
);
```

## 🔌 APIs Disponíveis

### GET `/api/campos-customizados`
Lista todos os campos customizados.

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nome": "nome_social",
      "label": "Nome Social",
      "descricao": "Nome pelo qual prefere ser chamado",
      "entidade": "colaborador",
      "tipo_campo": "texto",
      "grupo": "Dados Pessoais",
      "obrigatorio": false,
      "ativo": true
    }
  ]
}
```

### POST `/api/campos-customizados`
Cria um novo campo customizado.

**Body:**
```json
{
  "nome": "numero_cracha",
  "label": "Número do Crachá",
  "descricao": "Número de identificação do crachá",
  "entidade": "colaborador",
  "tipo_campo": "texto",
  "grupo": "Identificação",
  "obrigatorio": false,
  "ordem": 100
}
```

### PUT `/api/campos-customizados/:id`
Atualiza um campo customizado.

### DELETE `/api/campos-customizados/:id`
Exclui um campo customizado (e todos os valores associados).

## 🎯 Como Usar

### 1. Acessar a Página
```
Configurações → Campos Customizados
```

### 2. Criar um Novo Campo

1. Clique em **"Novo Campo"**
2. Preencha os dados:
   - **Entidade**: Onde o campo será usado (colaborador, empresa, etc)
   - **Nome do Campo**: Identificador único (ex: `numero_cracha`)
   - **Rótulo**: Nome exibido (ex: "Número do Crachá")
   - **Tipo**: Tipo do campo (texto, número, data, etc)
   - **Grupo**: Para organizar (ex: "Identificação")
3. Configure opções adicionais:
   - Obrigatório
   - Valor padrão
   - Máscara de formatação
   - Ordem de exibição
4. Clique em **"Salvar"**

### 3. Usar nos Formulários

Os campos customizados aparecerão automaticamente nos formulários da entidade configurada.

**Exemplo no formulário de colaborador:**
```vue
<template>
  <div>
    <!-- Campos padrão -->
    <UIInput v-model="form.nome" label="Nome Completo" />
    
    <!-- Campos customizados serão inseridos aqui -->
    <div v-for="campo in camposCustomizados" :key="campo.id">
      <component 
        :is="getComponente(campo.tipo_campo)"
        v-model="valoresCampos[campo.nome]"
        :label="campo.label"
        :required="campo.obrigatorio"
      />
    </div>
  </div>
</template>
```

## 🔧 Funções Auxiliares

### `get_campos_customizados(entidade, role)`
Retorna campos customizados de uma entidade para uma role específica.

```sql
SELECT * FROM get_campos_customizados('colaborador', 'admin');
```

### `get_valores_campos_customizados(entidade_tipo, entidade_id)`
Retorna valores dos campos customizados de um registro.

```sql
SELECT * FROM get_valores_campos_customizados('colaborador', 'uuid-do-colaborador');
```

### View: `vw_colaboradores_completo`
View que inclui colaboradores com seus campos customizados em JSON.

```sql
SELECT * FROM vw_colaboradores_completo WHERE id = 'uuid';
```

**Resultado:**
```json
{
  "id": "uuid",
  "nome": "João Silva",
  "cpf": "123.456.789-00",
  "campos_customizados": {
    "nome_social": "João",
    "tipo_sanguineo": "O+",
    "escolaridade": "Superior Completo",
    "vale_transporte": true
  }
}
```

## 🎨 Exemplos de Uso

### Exemplo 1: Campo de Seleção (Select)

```javascript
// Criar campo
await $fetch('/api/campos-customizados', {
  method: 'POST',
  body: {
    nome: 'turno_trabalho',
    label: 'Turno de Trabalho',
    entidade: 'colaborador',
    tipo_campo: 'select',
    opcoes: ['Manhã', 'Tarde', 'Noite', 'Madrugada'],
    grupo: 'Jornada',
    obrigatorio: true
  }
})
```

### Exemplo 2: Campo Calculado

```javascript
// Campo que calcula idade baseado na data de nascimento
await $fetch('/api/campos-customizados', {
  method: 'POST',
  body: {
    nome: 'idade',
    label: 'Idade',
    entidade: 'colaborador',
    tipo_campo: 'numero',
    formula: 'EXTRACT(YEAR FROM AGE(data_nascimento))',
    editavel: false,
    grupo: 'Dados Pessoais'
  }
})
```

### Exemplo 3: Campo com Validação

```javascript
// Campo de matrícula com formato específico
await $fetch('/api/campos-customizados', {
  method: 'POST',
  body: {
    nome: 'matricula',
    label: 'Matrícula',
    entidade: 'colaborador',
    tipo_campo: 'texto',
    mascara: '0000-0000',
    validacao_regex: '^\\d{4}-\\d{4}$',
    mensagem_erro: 'Formato inválido. Use: 0000-0000',
    obrigatorio: true,
    grupo: 'Identificação'
  }
})
```

## 🔐 Permissões

### Visibilidade por Role
Configure quais roles podem ver cada campo:

```json
{
  "visivel_para": ["admin", "rh", "employee"]
}
```

### Edição por Role
Configure quais roles podem editar cada campo:

```json
{
  "editavel_por": ["admin", "rh"]
}
```

## 🔄 Integração com Outras Áreas

### Colaboradores
Os campos customizados de colaboradores serão automaticamente:
- Exibidos no formulário de cadastro
- Incluídos na ficha do colaborador
- Disponíveis para filtros e buscas
- Exportados em relatórios

### Documentos
Campos customizados para documentos permitem:
- Metadados adicionais
- Classificação personalizada
- Campos específicos por tipo de documento

### Empresa
Campos customizados para empresa permitem:
- Informações específicas do negócio
- Dados regulatórios adicionais
- Configurações personalizadas

## 📊 Relatórios

Os campos customizados podem ser incluídos em relatórios:

```sql
-- Relatório de colaboradores com campos customizados
SELECT 
  c.nome,
  c.cpf,
  c.cargo,
  cc.campos_customizados->>'nome_social' as nome_social,
  cc.campos_customizados->>'escolaridade' as escolaridade,
  cc.campos_customizados->>'tipo_sanguineo' as tipo_sanguineo
FROM vw_colaboradores_completo cc
JOIN colaboradores c ON c.id = cc.id
WHERE c.ativo = true;
```

## ⚠️ Boas Práticas

1. **Nomes de Campos**
   - Use snake_case (ex: `nome_social`)
   - Sem espaços ou caracteres especiais
   - Descritivos e únicos

2. **Organização**
   - Use grupos para organizar campos relacionados
   - Defina ordem lógica de exibição
   - Agrupe por contexto (Pessoal, Profissional, etc)

3. **Validação**
   - Configure validações apropriadas
   - Use máscaras para formatação
   - Defina mensagens de erro claras

4. **Performance**
   - Não crie campos desnecessários
   - Use campos calculados com cuidado
   - Desative campos não utilizados

5. **Manutenção**
   - Documente o propósito de cada campo
   - Revise periodicamente campos ativos
   - Mantenha consistência nos nomes

## 🚀 Próximas Melhorias

- [ ] Campos com dependências (mostrar campo B se campo A = X)
- [ ] Validações customizadas mais complexas
- [ ] Importação/exportação de definições de campos
- [ ] Histórico de alterações de valores
- [ ] Campos com upload de arquivos
- [ ] Campos de múltipla seleção
- [ ] Campos de autocompletar
- [ ] Templates de conjuntos de campos

## 📚 Documentação Relacionada

- [EXECUTAR_MIGRATION_18.md](database/migrations/EXECUTAR_MIGRATION_18.md) - Como executar a migration
- [18_personalizacao_campos_customizados.sql](database/migrations/18_personalizacao_campos_customizados.sql) - Script SQL completo
