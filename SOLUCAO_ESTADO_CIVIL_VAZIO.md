# Solução: Estado Civil Aparecendo Vazio

## Problema

O campo "Estado Civil" aparece vazio no formulário de edição do colaborador (aba "Dados Pessoais"), mesmo que o valor esteja salvo no banco de dados.

## Causa Provável

O valor salvo no banco de dados está em um formato diferente do esperado pelo formulário. Por exemplo:
- Banco: `"Casado(a)"` ou `"Casado"` (com maiúscula)
- Formulário espera: `"casado"` (lowercase)

## Solução

### Passo 1: Verificar o Valor Atual

Execute este SQL no Supabase SQL Editor:

```sql
SELECT 
  id,
  nome,
  cpf,
  estado_civil,
  sexo
FROM colaboradores
WHERE cpf = '43396431812' OR nome ILIKE '%SAMUEL%';
```

### Passo 2: Corrigir os Valores

Execute o script `database/CORRIGIR_ESTADO_CIVIL_SAMUEL.sql` no Supabase SQL Editor.

Este script vai:
1. Converter todos os valores de estado civil para o formato correto (lowercase)
2. Padronizar os valores para: `solteiro`, `casado`, `divorciado`, `viuvo`, `uniao_estavel`

### Passo 3: Verificar no Navegador

1. Feche o modal de edição do colaborador
2. Recarregue a página (F5)
3. Abra novamente o modal de edição
4. Vá para a aba "Dados Pessoais"
5. O estado civil deve aparecer selecionado corretamente

## Valores Corretos

O banco de dados deve ter estes valores exatos (lowercase com underscore):

| Valor no Banco | Exibição no Formulário |
|----------------|------------------------|
| `solteiro` | Solteiro(a) |
| `casado` | Casado(a) |
| `divorciado` | Divorciado(a) |
| `viuvo` | Viúvo(a) |
| `uniao_estavel` | União Estável |

## Se o Problema Persistir

### Opção 1: Limpar o Cache do Navegador
1. Pressione `Ctrl + Shift + Delete`
2. Limpe o cache
3. Recarregue a página

### Opção 2: Verificar o Console do Navegador
1. Pressione `F12` para abrir o DevTools
2. Vá para a aba "Console"
3. Procure por erros relacionados ao formulário
4. Compartilhe os erros encontrados

### Opção 3: Verificar o Valor no Form
Adicione este código temporariamente no componente para debug:

```vue
<script setup lang="ts">
const props = defineProps<{ modelValue: Record<string, any> }>()
const emit = defineEmits<{ 'update:modelValue': [value: Record<string, any>] }>()
const update = (key: string, value: any) => emit('update:modelValue', { ...props.modelValue, [key]: value })

// DEBUG: Ver o valor do estado_civil
watch(() => props.modelValue.estado_civil, (newVal) => {
  console.log('Estado Civil:', newVal, 'Tipo:', typeof newVal)
}, { immediate: true })
</script>
```

## Correção Permanente

Para evitar que isso aconteça novamente, o script SQL já corrige TODOS os colaboradores que tenham valores no formato antigo.

Após executar o script, todos os valores estarão padronizados e o problema não deve mais ocorrer.
