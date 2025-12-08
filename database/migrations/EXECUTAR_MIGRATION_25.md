# Migration 25 - Alteração de Dados pelo Funcionário

## O que foi implementado

Sistema que permite ao funcionário editar seus próprios dados no portal:

### Edição Direta (sem aprovação):
- **Dados Pessoais**: Telefone, Sexo, Estado Civil
- **Endereço**: CEP, Logradouro, Número, Complemento, Bairro, Cidade, Estado
- **Documentos**: CNH, Categoria CNH, Validade CNH
- **Contatos de Emergência**: Até 3 contatos com Nome, Parentesco e Telefone

### Edição com Aprovação:
- **Dados Bancários**: Banco, Agência, Conta, Tipo de Conta, PIX
  - Funcionário solicita alteração
  - Admin/Gestor aprova ou rejeita no painel admin
  - Só após aprovação os dados são atualizados

## Como executar

1. Acesse o **Supabase SQL Editor**
2. Cole e execute o conteúdo do arquivo `25_alteracao_dados_funcionario.sql`

## Novos arquivos criados

### Componentes (Frontend):
- `EmployeeEditDadosPessoaisModal.vue` - Modal para editar dados pessoais
- `EmployeeEditDocumentosModal.vue` - Modal para editar documentos
- `EmployeeEditEnderecoModal.vue` - Modal para editar endereço
- `EmployeeEditDadosBancariosModal.vue` - Modal para solicitar alteração bancária
- `EmployeeEditContatoEmergenciaModal.vue` - Modal para editar contatos de emergência

### APIs (Backend):
- `PUT /api/funcionario/perfil/dados-pessoais` - Atualiza dados pessoais
- `PUT /api/funcionario/perfil/documentos` - Atualiza documentos
- `PUT /api/funcionario/perfil/endereco` - Atualiza endereço
- `PUT /api/funcionario/perfil/contato-emergencia` - Atualiza contatos de emergência
- `PUT /api/funcionario/perfil/dados-bancarios` - Cria solicitação de alteração bancária

### Painel Admin:
- `GET /api/admin/alteracoes-dados` - Lista solicitações de alteração
- `PUT /api/admin/alteracoes-dados/[id]` - Aprova ou rejeita solicitação
- `/admin/alteracoes-dados` - Página para gerenciar solicitações

## Fluxo de Aprovação de Dados Bancários

1. Funcionário clica em "Editar" nos Dados Bancários
2. Preenche os novos dados e clica em "Solicitar Alteração"
3. Sistema cria uma solicitação com status "pendente"
4. Admin acessa `/admin/alteracoes-dados`
5. Visualiza comparação entre dados atuais e novos
6. Aprova (dados são atualizados) ou Rejeita (com motivo)
