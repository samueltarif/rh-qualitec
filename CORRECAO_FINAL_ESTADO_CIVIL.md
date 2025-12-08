# Correção Final - Estado Civil e Tipo de Conta

## Problema Identificado

No painel admin, ao editar um colaborador:
- Na aba **"Resumo"**: Estado civil e tipo de conta apareciam corretamente
- Na aba **"Dados Pessoais"**: Estado civil aparecia vazio
- Na aba **"Dados Bancários"**: Tipo de conta aparecia vazio

## Causa Raiz

Os componentes `ColaboradorFormDadosPessoais.vue` e `ColaboradorFormBancario.vue` estavam usando labels HTML duplicados em vez de usar o prop `label` do componente `UISelect`. Isso causava problemas de renderização e binding dos valores.

## Solução Aplicada

### 1. ColaboradorFormDadosPessoais.vue
Removidos os labels HTML duplicados e usado o prop `label` do UISelect:

**Antes:**
```vue
<div>
  <label class="block text-sm font-medium text-gray-700 mb-1">Estado Civil</label>
  <UISelect :model-value="modelValue.estado_civil" @update:model-value="update('estado_civil', $event)">
    ...
  </UISelect>
</div>
```

**Depois:**
```vue
<div>
  <UISelect :model-value="modelValue.estado_civil" @update:model-value="update('estado_civil', $event)" label="Estado Civil">
    <option value="">Selecione</option>
    <option value="solteiro">Solteiro(a)</option>
    <option value="casado">Casado(a)</option>
    <option value="divorciado">Divorciado(a)</option>
    <option value="viuvo">Viúvo(a)</option>
    <option value="uniao_estavel">União Estável</option>
  </UISelect>
</div>
```

### 2. ColaboradorFormBancario.vue
Mesma correção aplicada para "Tipo de Conta" e "Tipo da Chave PIX":

```vue
<UISelect :model-value="modelValue.tipo_conta" @update:model-value="update('tipo_conta', $event)" label="Tipo de Conta">
  <option value="">Selecione</option>
  <option value="corrente">Corrente</option>
  <option value="poupanca">Poupança</option>
  <option value="salario">Salário</option>
</UISelect>
```

## Sincronização Automática

**Importante:** Quando o funcionário altera seus dados no portal (`/employee`), as mudanças são salvas **diretamente** na tabela `colaboradores`. Isso significa que:

✅ Alterações no perfil do funcionário aparecem **automaticamente** no painel admin
✅ Não há necessidade de aprovação para: telefone, sexo, estado civil, contatos de emergência
⚠️ Dados bancários **requerem aprovação** do RH (via tabela `solicitacoes_alteracao_dados`)

### Campos que atualizam diretamente:
- Telefone
- Sexo
- Estado Civil
- Contatos de Emergência (todos os 3)
- Endereço
- Documentos (CNH, etc)

### Campos que requerem aprovação:
- Dados Bancários (banco, agência, conta, tipo de conta, PIX)

## Arquivos Modificados

1. `nuxt-app/app/components/ColaboradorFormDadosPessoais.vue`
   - Corrigido uso do UISelect para Sexo, Estado Civil e Escolaridade
   - Valores do estado civil ajustados para corresponder ao banco

2. `nuxt-app/app/components/ColaboradorFormBancario.vue`
   - Corrigido uso do UISelect para Tipo de Conta e Tipo da Chave PIX
   - Valores do tipo de conta ajustados para corresponder ao banco

3. `nuxt-app/app/components/EmployeeEditDadosPessoaisModal.vue`
   - Valores do estado civil ajustados no modal do funcionário

4. `nuxt-app/app/components/EmployeePerfilTab.vue`
   - Função `formatEstadoCivil()` para exibir valores legíveis

5. `nuxt-app/app/components/ColaboradorFormEmergencia.vue`
   - Expandido para mostrar 3 contatos de emergência

## Como Testar

### Teste 1: Visualização no Painel Admin
1. Acesse `/colaboradores`
2. Clique para editar um colaborador
3. Vá para a aba "Dados Pessoais"
4. Verifique que o estado civil aparece selecionado corretamente
5. Vá para a aba "Dados Bancários"
6. Verifique que o tipo de conta aparece selecionado corretamente

### Teste 2: Sincronização Funcionário → Admin
1. Faça login como funcionário em `/employee`
2. Vá para a aba "Perfil"
3. Clique em "Editar" nos Dados Pessoais
4. Altere o estado civil (ex: de "Solteiro(a)" para "Casado(a)")
5. Salve
6. Faça logout e login como admin
7. Acesse `/colaboradores` e edite o mesmo colaborador
8. Verifique que o estado civil foi atualizado automaticamente

### Teste 3: Contatos de Emergência
1. No portal do funcionário, edite os contatos de emergência
2. Adicione até 3 contatos diferentes
3. Salve
4. No painel admin, edite o colaborador
5. Vá para a aba "Contato Emergência"
6. Verifique que todos os 3 contatos aparecem corretamente

## Valores Corretos no Banco de Dados

### Estado Civil (enum)
- `solteiro`
- `casado`
- `divorciado`
- `viuvo`
- `uniao_estavel`

### Tipo de Conta (enum)
- `corrente`
- `poupanca`
- `salario`

### Sexo
- `M` (Masculino)
- `F` (Feminino)
- `Outro`

## Conclusão

Todos os campos agora estão sincronizados corretamente entre o portal do funcionário e o painel admin. As alterações feitas pelo funcionário aparecem automaticamente no painel admin sem necessidade de aprovação (exceto dados bancários).
