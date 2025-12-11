# Funcionalidade de Gerenciamento de Assinaturas de Ponto

## Visão Geral

A funcionalidade de assinaturas de ponto permite que administradores gerenciem quando e como os colaboradores podem baixar seus registros de ponto.

## Como Funciona

### Para Colaboradores
- Colaboradores podem baixar registros de ponto dos **últimos 30 dias**
- Após baixar/assinar, o histórico fica **bloqueado** até o próximo período
- Normalmente devem assinar todo **dia 5 do mês**

### Para Administradores
- Visualizar todas as assinaturas existentes
- **Zerar assinaturas** quando necessário
- **Excluir assinaturas** permanentemente

## Casos de Uso

### Problema Comum
Um colaborador deveria assinar todo dia 5 do mês, mas assinou no dia 20. Agora ele não consegue baixar o ponto novamente até o próximo mês.

### Solução
1. Acesse **Ponto Eletrônico** → **Assinaturas**
2. Encontre o colaborador na lista
3. Clique em **"Zerar"** na assinatura
4. O colaborador poderá baixar novamente os últimos 30 dias

## Funcionalidades Disponíveis

### 1. Visualizar Assinaturas
- Lista todas as assinaturas de ponto
- Mostra informações detalhadas:
  - Nome do colaborador
  - Data da assinatura
  - Período coberto
  - Tipo (Digital ou Download)
  - Status (Ativo/Inativo)
  - Hash da assinatura

### 2. Zerar Assinatura
- **Função**: Permite que o colaborador baixe o ponto novamente
- **Quando usar**: Colaborador assinou antes do prazo
- **Efeito**: Marca assinatura como inativa e libera novo download

### 3. Excluir Assinatura
- **Função**: Remove permanentemente a assinatura
- **Quando usar**: Assinatura inválida ou erro no sistema
- **Efeito**: Exclui completamente o registro

## Interface

### Botão de Acesso
Na página de Ponto Eletrônico, clique no botão **"Assinaturas"** no cabeçalho.

### Modal de Gerenciamento
- **Informações**: Explicação de como funciona
- **Lista**: Todas as assinaturas com detalhes
- **Ações**: Botões para zerar ou excluir cada assinatura

## Segurança

- Apenas administradores podem acessar
- Todas as ações são registradas no log de atividades
- Confirmação obrigatória antes de zerar/excluir

## APIs Criadas

1. `GET /api/admin/assinaturas-ponto` - Listar assinaturas
2. `POST /api/admin/assinaturas-ponto/[id]/zerar` - Zerar assinatura
3. `DELETE /api/admin/assinaturas-ponto/[id]` - Excluir assinatura

## Logs de Atividade

Todas as ações são registradas:
- `zerar_assinatura_ponto` - Quando uma assinatura é zerada
- `excluir_assinatura_ponto` - Quando uma assinatura é excluída

## Benefícios

1. **Flexibilidade**: Permite correções quando colaboradores assinam fora do prazo
2. **Controle**: Administradores têm visibilidade total das assinaturas
3. **Auditoria**: Todas as ações são registradas
4. **Usabilidade**: Interface simples e intuitiva

## Exemplo de Uso

**Cenário**: João deveria assinar todo dia 5, mas assinou dia 20 de dezembro. Agora precisa do ponto de dezembro novamente.

**Solução**:
1. Admin acessa Ponto → Assinaturas
2. Encontra a assinatura de João de dezembro
3. Clica em "Zerar"
4. João pode baixar o ponto de dezembro novamente

A funcionalidade está totalmente integrada à página de ponto existente e pronta para uso.