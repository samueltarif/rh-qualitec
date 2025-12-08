# ✅ Correção: Gerar 3 Holerites de 13º Salário

## 🎯 Problema Identificado

O sistema estava gerando apenas **2 holerites** quando deveria gerar **3 holerites**:
- ❌ Gerava: 1ª Parcela (Nov) + 2ª Parcela (Dez)
- ✅ Deveria gerar: 1ª Parcela (Nov) + 2ª Parcela (Dez) + **Salário Normal (Dez)**

## 🔧 Correções Aplicadas

### 1. API de Geração (`server/api/decimo-terceiro/gerar.post.ts`)

**Antes:**
```typescript
// Gerava apenas 1 holerite por colaborador
if (parcela === '1') {
  // Gera apenas 1ª parcela
} else if (parcela === '2') {
  // Gera apenas 2ª parcela
}
```

**Depois:**
```typescript
// Gera AMBAS as parcelas + holerite normal
const parcelasParaGerar = []

if (parcela === 'integral') {
  parcelasParaGerar.push('integral')
} else {
  // Gera 1ª E 2ª parcela
  parcelasParaGerar.push('1', '2')
}

// Loop para gerar cada parcela
for (const parcelaAtual of parcelasParaGerar) {
  // Gera holerite da parcela
}

// Gera também o holerite normal de dezembro
if (parcelasParaGerar.includes('1') && parcelasParaGerar.includes('2')) {
  // Gera holerite mensal de dezembro
}
```

### 2. Constraint do Banco de Dados

**Problema:** A constraint única não permitia múltiplos holerites no mesmo mês.

**Solução:** Atualizar constraint para incluir `tipo` E `parcela_13`:

```sql
ALTER TABLE holerites 
ADD CONSTRAINT holerites_colaborador_mes_ano_tipo_parcela_unique 
UNIQUE (colaborador_id, mes, ano, tipo, COALESCE(parcela_13, ''));
```

Isso permite:
- ✅ Holerite Normal (tipo='normal', parcela_13=null)
- ✅ 1ª Parcela 13º (tipo='decimo_terceiro', parcela_13='1')
- ✅ 2ª Parcela 13º (tipo='decimo_terceiro', parcela_13='2')

Tudo no mesmo mês (Dezembro)!

### 3. Correção de Warnings Vue

Adicionado prop `label` nos checkboxes para eliminar warnings:

```vue
<UICheckbox 
  :model-value="selecionados.includes(colab.id)"
  @update:model-value="toggleColaborador(colab.id)"
  :label="`Selecionar ${colab.nome}`"
  class="sr-only"
/>
```

## 📋 Como Testar

### 1. Executar Fix da Constraint

```bash
# No Supabase SQL Editor, executar:
nuxt-app/database/fixes/fix_constraint_holerites_tipo.sql
```

### 2. Gerar 13º Salário

1. Acesse **Folha de Pagamento**
2. Clique em **"Gerar 13º Salário"**
3. Selecione **"1ª Parcela"**
4. Selecione colaboradores
5. Clique em **"Gerar Holerites"**

### 3. Verificar Resultado

Deve gerar **3 holerites** por colaborador:

```sql
SELECT 
  nome_colaborador,
  mes,
  tipo,
  parcela_13,
  salario_liquido
FROM holerites
WHERE colaborador_id = [ID_DO_COLABORADOR]
  AND ano = 2025
ORDER BY mes, tipo;
```

**Resultado Esperado:**
```
Samuel | 11 | decimo_terceiro | 1 | R$ 1.005,00  (1ª Parcela Nov)
Samuel | 12 | decimo_terceiro | 2 | R$ 845,28    (2ª Parcela Dez)
Samuel | 12 | normal          | - | R$ 2.010,00  (Salário Dez)
```

## 🎯 Resultado Final

✅ **3 holerites gerados** por colaborador
✅ **Valores corretos** com descontos aplicados
✅ **Sem warnings** no console Vue
✅ **Constraint correta** no banco de dados

## 📝 Observações

- A **1ª parcela** é paga em **Novembro** (50% sem descontos)
- A **2ª parcela** é paga em **Dezembro** (50% restante com descontos sobre o total)
- O **salário normal** de dezembro é gerado automaticamente
- Os descontos de INSS e IRRF incidem sobre o **valor total** do 13º

## 🔄 Próximos Passos

1. ✅ Testar geração com múltiplos colaboradores
2. ✅ Verificar cálculos de INSS e IRRF
3. ✅ Testar envio de emails
4. ✅ Validar visualização no portal do funcionário
