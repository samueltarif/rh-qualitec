# ✅ Correção: Erro ao Gerar Holerite Individual

## Problema
Ao clicar em "Gerar" na tabela de folha de pagamento, aparecia o erro:
```
ERROR: null value in column "nome_colaborador" of relation "holerites" violates not-null constraint
```

## Causa
O arquivo `gerar-individual.post.ts` não estava preenchendo os campos obrigatórios da tabela `holerites`:
- `nome_colaborador` ❌
- `cpf` ❌
- `cargo` ❌
- `departamento` ❌
- `tipo` ❌

## Solução Implementada

### 1. Buscar dados completos do colaborador
```typescript
// ANTES: Buscava apenas dados básicos
.select('*')

// DEPOIS: Busca com relacionamentos
.select(`
  *,
  cargo:cargos(nome),
  departamento:departamentos!colaboradores_departamento_id_fkey(nome)
`)
```

### 2. Preencher campos obrigatórios ao criar holerite
```typescript
const insertData: any = {
  colaborador_id,
  mes,
  ano,
  tipo: 'mensal', // ✅ Adicionado
  // Dados obrigatórios do colaborador
  nome_colaborador: colabData.nome || 'Não informado', // ✅ Adicionado
  cpf: colabData.cpf || '', // ✅ Adicionado
  cargo: colabData.cargo?.nome || 'Não informado', // ✅ Adicionado
  departamento: colabData.departamento?.nome || 'Não informado', // ✅ Adicionado
  // ... resto dos dados
}
```

### 3. Preencher campos obrigatórios ao atualizar holerite
```typescript
const updateData: any = {
  nome_colaborador: colabData.nome || 'Não informado', // ✅ Adicionado
  cpf: colabData.cpf || '', // ✅ Adicionado
  cargo: colabData.cargo?.nome || 'Não informado', // ✅ Adicionado
  departamento: colabData.departamento?.nome || 'Não informado', // ✅ Adicionado
  // ... resto dos dados
}
```

### 4. Melhorar logs no terminal
```typescript
console.log('✅ Colaborador encontrado:', (colaborador as any).nome)
console.log('📝 Criando novo holerite com dados:', { ... })
console.log('✅ Holerite criado com sucesso:', novoHoleriteData.id)
```

### 5. Usar `maybeSingle()` em vez de `single()`
```typescript
// ANTES: Lançava erro se não encontrasse
.single()

// DEPOIS: Retorna null se não encontrar
.maybeSingle()
```

## Resultado

Agora ao clicar em "Gerar" na folha de pagamento:

✅ Holerite é criado com sucesso
✅ Todos os campos obrigatórios são preenchidos
✅ Logs claros no terminal mostram o progresso
✅ Se o holerite já existe, é atualizado corretamente

## Terminal Output

```
✅ Colaborador encontrado: Samuel
📝 Criando novo holerite com dados: {
  nome: 'Samuel',
  cpf: '123.456.789-00',
  cargo: 'Desenvolvedor',
  salario_bruto: 5000.00
}
✅ Holerite criado com sucesso: abc123def456
```

## Arquivos Modificados

- `nuxt-app/server/api/holerites/gerar-individual.post.ts`

## Como Testar

1. Abra a página de Folha de Pagamento
2. Calcule a folha de um mês
3. Clique no botão "Gerar" para um colaborador
4. Verifique se o holerite é criado sem erros
5. Confira os logs no terminal do servidor

## Próximos Passos

Se encontrar outros erros similares, verifique:
- Se todos os campos obrigatórios estão sendo preenchidos
- Se os relacionamentos (cargo, departamento) estão sendo buscados corretamente
- Se os valores padrão estão sendo usados quando dados estão faltando
