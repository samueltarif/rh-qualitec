# Correção de Campos no Formulário de Colaborador

## Problemas Corrigidos

### 1. Estado Civil não aparecia corretamente
**Problema**: Os valores salvos no banco eram em lowercase com underscore (ex: `solteiro`, `casado`, `uniao_estavel`), mas o formulário tinha valores com maiúsculas (ex: `Solteiro`, `Casado`, `Uniao_Estavel`).

**Solução**: Ajustei os valores das opções no `ColaboradorFormDadosPessoais.vue` para corresponder aos valores do banco:
- `solteiro` (antes: `Solteiro`)
- `casado` (antes: `Casado`)
- `divorciado` (antes: `Divorciado`)
- `viuvo` (antes: `Viúvo`)
- `uniao_estavel` (antes: `Uniao_Estavel`)

### 2. Tipo de Conta não aparecia corretamente
**Problema**: Os valores salvos no banco eram em lowercase (ex: `corrente`, `poupanca`), mas o formulário tinha valores com maiúsculas (ex: `Corrente`, `Poupanca`).

**Solução**: Ajustei os valores das opções no `ColaboradorFormBancario.vue` para corresponder aos valores do banco:
- `corrente` (antes: `Corrente`)
- `poupanca` (antes: `Poupanca`)
- `salario` (adicionado)

### 3. Contatos de Emergência Adicionais não apareciam
**Problema**: O sistema suporta 3 contatos de emergência no banco de dados (`contato_emergencia_*`, `contato_emergencia_2_*`, `contato_emergencia_3_*`), mas o formulário só mostrava 1 contato.

**Solução**: Expandido o `ColaboradorFormEmergencia.vue` para incluir:
- Contato de Emergência Principal (campos existentes)
- Contato de Emergência 2 (novos campos)
- Contato de Emergência 3 (novos campos)

Cada contato tem:
- Nome
- Parentesco
- Telefone

### 4. Campos faltando no formulário padrão
**Problema**: O `defaultForm` na página `colaboradores.vue` não incluía os campos dos contatos adicionais.

**Solução**: Adicionados os campos:
- `contato_emergencia_parentesco`
- `contato_emergencia_2_nome`
- `contato_emergencia_2_parentesco`
- `contato_emergencia_2_telefone`
- `contato_emergencia_3_nome`
- `contato_emergencia_3_parentesco`
- `contato_emergencia_3_telefone`

## Arquivos Modificados

### Painel Admin

1. `nuxt-app/app/components/ColaboradorFormDadosPessoais.vue`
   - Corrigidos valores do campo Estado Civil

2. `nuxt-app/app/components/ColaboradorFormBancario.vue`
   - Corrigidos valores do campo Tipo de Conta
   - Adicionada opção "Salário"

3. `nuxt-app/app/components/ColaboradorFormEmergencia.vue`
   - Expandido para mostrar 3 contatos de emergência
   - Melhorada a organização visual com títulos e ícones

4. `nuxt-app/app/pages/colaboradores.vue`
   - Adicionados campos dos contatos adicionais no `defaultForm`

### Portal do Funcionário

5. `nuxt-app/app/components/EmployeeEditDadosPessoaisModal.vue`
   - Corrigidos valores do campo Estado Civil para corresponder ao banco

6. `nuxt-app/app/components/EmployeePerfilTab.vue`
   - Adicionada função `formatEstadoCivil()` para exibir corretamente os valores
   - Agora mostra os 3 contatos de emergência quando cadastrados

## Como Testar

### No Painel Admin (`/colaboradores`)

1. Acesse o painel admin em `/colaboradores`
2. Clique para editar um colaborador que tenha:
   - Estado civil preenchido
   - Tipo de conta bancária preenchido
   - Contatos de emergência preenchidos
3. Verifique que:
   - O estado civil aparece selecionado corretamente
   - O tipo de conta aparece selecionado corretamente
   - Todos os 3 contatos de emergência aparecem nos campos corretos

### No Portal do Funcionário (`/employee`)

1. Faça login como funcionário
2. Acesse a aba "Perfil"
3. Verifique que:
   - O estado civil é exibido corretamente (ex: "Casado(a)" em vez de "casado")
   - Todos os contatos de emergência cadastrados aparecem
4. Clique em "Editar" nos Dados Pessoais
5. Verifique que:
   - O estado civil atual aparece selecionado corretamente
   - É possível alterar o estado civil
   - Ao salvar, o valor é atualizado corretamente

## Notas Técnicas

- Os valores dos enums no banco de dados são em lowercase com underscore
- O formulário agora está sincronizado com o schema do banco
- Os 3 contatos de emergência são salvos diretamente (não requerem aprovação)
- Dados bancários ainda requerem aprovação do RH quando alterados pelo funcionário
