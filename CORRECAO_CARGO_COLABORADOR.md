# ✅ Correção: Cargo do Colaborador no Modal

## 🐛 Problema

O campo "Cargo" não aparecia no modal de edição da folha porque:
- A tabela `colaboradores` tem `cargo_id` (UUID)
- O nome do cargo está na tabela `cargos`
- Era necessário fazer um JOIN

## ✅ Solução

### API `/api/colaboradores/[id].get.ts`

Adicionei JOIN com a tabela `cargos`:

```typescript
const { data, error } = await supabase
  .from('colaboradores')
  .select(`
    *,
    cargo:cargos(nome),
    departamento:departamentos(nome)
  `)
  .eq('id', id)
  .single()

// Formatar resposta
return {
  ...data,
  cargo_nome: data.cargo?.nome || '-',
  departamento_nome: data.departamento?.nome || '-',
}
```

### Frontend

Atualizado para usar `cargo_nome`:

```typescript
modalEdicao.value.dados = {
  ...item,
  cargo: response.cargo_nome || '-',  // ← Corrigido
  salario_base: item.salario_bruto || 0,
  dependentes: response.dependentes || 0,
  horas_contratadas: response.horas_contratadas || 220,
}
```

## 📊 Dados Retornados pela API

### ANTES:
```json
{
  "id": "uuid",
  "nome": "Samuel Barretos Tarif",
  "cargo_id": "uuid-do-cargo",  ← Só o ID
  ...
}
```

### DEPOIS:
```json
{
  "id": "uuid",
  "nome": "Samuel Barretos Tarif",
  "cargo_id": "uuid-do-cargo",
  "cargo": { "nome": "Analista de RH" },  ← Objeto com nome
  "cargo_nome": "Analista de RH",  ← Campo formatado
  "departamento_nome": "Recursos Humanos",
  ...
}
```

## 🎯 Resultado

Agora o modal mostra:

```
┌─────────────────────────────────────┐
│ Dados do Colaborador                │
├─────────────────────────────────────┤
│ Nome: Samuel Barretos Tarif         │
│ CPF: 123.456.789-00                 │
│ Cargo: Analista de RH  ← FUNCIONA! │
│ Salário Base: R$ 2.500,00           │
│ Dependentes: 0                      │
│ Horas Contratadas: 220h/mês         │
└─────────────────────────────────────┘
```

## ✅ Benefícios Adicionais

A API agora também retorna:
- ✅ Nome do cargo
- ✅ Nome do departamento
- ✅ Todos os campos de benefícios
- ✅ Dados completos do colaborador

## 🧪 Como Testar

1. Recarregue a página da folha
2. Calcule a folha
3. Clique em "Editar" em qualquer colaborador
4. Verifique que o cargo aparece corretamente

---

**Status**: ✅ Corrigido
**Arquivos modificados**: 
- `nuxt-app/server/api/colaboradores/[id].get.ts`
- `nuxt-app/app/pages/folha-pagamento.vue`
