# 🔧 Correção: Conflito entre Holerites Mensais e 13º Salário

## ❌ Problema Crítico Identificado

O sistema estava **sobrescrevendo** holerites de 13º salário quando você gerava holerites mensais do mesmo mês (especialmente dezembro).

### Cenário do Erro:

1. ✅ Você gera **1ª parcela do 13º** (novembro)
2. ✅ Você gera **2ª parcela do 13º** (dezembro)
3. ❌ Você gera **holerite mensal de dezembro**
4. 💥 **O sistema exclui a 2ª parcela do 13º e substitui pelo holerite mensal!**

### Causa Raiz:

A API de geração de holerites mensais (`/api/holerites/gerar`) estava verificando se já existe um holerite usando apenas:
- `colaborador_id`
- `mes`
- `ano`

**Mas não estava filtrando por `tipo`!**

Então quando você gerava um holerite mensal de dezembro, ele encontrava o holerite de 13º (que também é de dezembro) e sobrescrevia.

## ✅ Solução Implementada

### 1. Adicionado filtro por tipo na verificação

**Antes:**
```typescript
const { data: holeriteExistente } = await supabase
  .from('holerites')
  .select('id')
  .eq('colaborador_id', colab.id)
  .eq('mes', mes)
  .eq('ano', ano)
  .single()
```

**Depois:**
```typescript
const { data: holeriteExistente } = await supabase
  .from('holerites')
  .select('id')
  .eq('colaborador_id', colab.id)
  .eq('mes', mes)
  .eq('ano', ano)
  .eq('tipo', 'mensal')  // ✅ Filtrar apenas holerites mensais
  .maybeSingle()
```

### 2. Adicionado campo `tipo` no holeriteData

**Antes:**
```typescript
const holeriteData = {
  colaborador_id: colab.id,
  mes,
  ano,
  // tipo não estava sendo definido!
  nome_colaborador: colab.nome,
  // ...
}
```

**Depois:**
```typescript
const holeriteData = {
  colaborador_id: colab.id,
  mes,
  ano,
  tipo: 'mensal',  // ✅ Definir explicitamente como mensal
  nome_colaborador: colab.nome,
  // ...
}
```

## 🎯 Resultado

Agora o sistema diferencia corretamente:

| Tipo | Mês | Descrição |
|------|-----|-----------|
| `mensal` | Qualquer | Holerite de salário normal |
| `decimo_terceiro` | 11 | 1ª parcela do 13º |
| `decimo_terceiro` | 12 | 2ª parcela do 13º |

**Você pode ter:**
- ✅ Holerite mensal de dezembro
- ✅ 1ª parcela do 13º (novembro)
- ✅ 2ª parcela do 13º (dezembro)
- ✅ Todos ao mesmo tempo sem conflito!

## 📋 O que fazer agora

### Se você já perdeu holerites de 13º:

1. **Exclua** os holerites mensais que sobrescreveram os de 13º
2. **Regere** os holerites de 13º usando o botão "Gerar 13º Salário"
3. **Regere** os holerites mensais normalmente

### Para verificar se há conflitos:

Execute no Supabase:

```sql
-- Ver holerites duplicados (mesmo colaborador, mês e ano)
SELECT 
  colaborador_id,
  nome_colaborador,
  mes,
  ano,
  tipo,
  COUNT(*) as quantidade
FROM holerites
WHERE mes = 12 AND ano = 2025
GROUP BY colaborador_id, nome_colaborador, mes, ano, tipo
HAVING COUNT(*) > 1;
```

## ✅ Validação

Para confirmar que está funcionando:

```sql
-- Ver todos os holerites de dezembro de 2025
SELECT 
  nome_colaborador,
  mes,
  ano,
  tipo,
  parcela_13,
  salario_liquido,
  created_at
FROM holerites
WHERE mes = 12 AND ano = 2025
ORDER BY nome_colaborador, tipo;
```

Você deve ver:
- Holerites com `tipo = 'mensal'`
- Holerites com `tipo = 'decimo_terceiro'` e `parcela_13 = '2'`
- **Ambos coexistindo sem conflito!**

## 🚨 Importante

A partir de agora, ao gerar holerites mensais, o sistema **nunca mais** vai sobrescrever holerites de 13º salário.
