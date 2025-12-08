# ✅ Correção do Cálculo no Modal de 13º Salário

## 🎯 Problema

O modal de geração do 13º salário estava mostrando valores incorretos porque:
- Calculava apenas com base no salário integral (R$ 2.650,00 / 2 = R$ 1.325,00)
- Não considerava os meses trabalhados (proporcionalidade)
- Para Samuel (5 meses), mostrava R$ 1.325,00 quando deveria ser R$ 552,08

## ✅ Solução Implementada

### 1. Função de Cálculo Corrigida

**Antes:**
```typescript
const calcularValor13 = (salarioBase: number) => {
  if (filtros.value.parcela === '1') {
    return salarioBase / 2 // ❌ Não considera meses trabalhados
  } else if (filtros.value.parcela === '2') {
    return salarioBase / 2 // ❌ Não considera meses trabalhados
  } else {
    return salarioBase // ❌ Não considera meses trabalhados
  }
}
```

**Depois:**
```typescript
const calcularValor13 = (salarioBase: number, mesesTrabalhados?: number) => {
  // Calcular 13º proporcional
  const meses = mesesTrabalhados || 12
  const valor13Proporcional = (salarioBase / 12) * meses
  
  if (filtros.value.parcela === '1') {
    return valor13Proporcional / 2 // ✅ 50% do proporcional
  } else if (filtros.value.parcela === '2') {
    return valor13Proporcional / 2 // ✅ 50% do proporcional
  } else {
    return valor13Proporcional // ✅ Proporcional completo
  }
}
```

### 2. Cálculo de Meses Trabalhados

Adicionada função para calcular meses trabalhados:

```typescript
const calcularMesesTrabalhados = (dataAdmissao: string, ano: number): number => {
  const admissao = new Date(dataAdmissao)
  const anoAdmissao = admissao.getFullYear()
  const mesAdmissao = admissao.getMonth() + 1

  if (anoAdmissao > ano) return 0
  if (anoAdmissao < ano) return 12
  
  return 12 - mesAdmissao + 1
}
```

### 3. Carregamento de Colaboradores

Agora calcula os meses trabalhados ao carregar:

```typescript
colaboradores.value = response.map(colab => ({
  ...colab,
  meses_trabalhados: colab.data_admissao 
    ? calcularMesesTrabalhados(colab.data_admissao, parseInt(filtros.value.ano))
    : 12
}))
```

### 4. Coluna de Meses na Tabela

Adicionada coluna mostrando os meses trabalhados:

```html
<td class="px-4 py-3 text-center">
  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
    {{ colab.meses_trabalhados || 12 }}/12
  </span>
</td>
```

## 📊 Exemplo: Samuel

### Dados
- Salário Base: R$ 2.650,00
- Admissão: 01/08/2025
- Meses Trabalhados: 5

### Cálculos Corretos

#### 13º Proporcional
```
13º = (R$ 2.650,00 / 12) × 5
13º = R$ 220,83 × 5
13º = R$ 1.104,17
```

#### 1ª Parcela
```
1ª Parcela = R$ 1.104,17 / 2
1ª Parcela = R$ 552,09
```

#### 2ª Parcela
```
2ª Parcela = R$ 1.104,17 / 2
2ª Parcela = R$ 552,08
```

### Antes e Depois

| Item | Antes ❌ | Depois ✅ |
|------|----------|-----------|
| **Valor Mostrado** | R$ 1.325,00 | R$ 552,08 |
| **Cálculo** | R$ 2.650,00 / 2 | (R$ 2.650,00 / 12) × 5 / 2 |
| **Meses Considerados** | Não | Sim (5/12) |

## 🎨 Melhorias Visuais

1. **Coluna de Meses**: Badge azul mostrando "5/12"
2. **Valor Correto**: R$ 552,08 ao invés de R$ 1.325,00
3. **Total Correto**: Soma considera proporcionalidade
4. **Atualização Dinâmica**: Recalcula ao mudar o ano

## ✨ Funcionalidades

- ✅ Cálculo proporcional automático
- ✅ Considera data de admissão
- ✅ Atualiza ao mudar o ano
- ✅ Mostra meses trabalhados visualmente
- ✅ Total correto no resumo
- ✅ Valores corretos na tabela

## 🔄 Comportamento

### Mudança de Ano
Quando o usuário muda o ano de referência:
1. Sistema recalcula meses trabalhados
2. Atualiza valores na tabela
3. Recalcula total selecionados

### Seleção de Colaboradores
- Valores corretos são somados
- Total considera proporcionalidade
- Resumo mostra valor real a pagar

## 📝 Validação

Para verificar se está correto:

1. **Abrir modal de 13º salário**
2. **Selecionar 2ª Parcela**
3. **Verificar coluna "Meses"**
4. **Verificar "Valor 13º"**

### Exemplo de Validação

Para Samuel (5 meses, R$ 2.650,00):
- Meses: 5/12 ✅
- Valor 13º: R$ 552,08 ✅
- Cálculo: (2650 / 12) × 5 / 2 = 552,08 ✅

## 🎯 Resultado Final

Agora o modal mostra:
- ✅ Valores corretos considerando proporcionalidade
- ✅ Meses trabalhados visíveis
- ✅ Total correto no resumo
- ✅ Cálculos de acordo com a legislação

---

**Status**: ✅ Corrigido  
**Data**: 06/12/2025  
**Arquivo**: `app/components/Modal13Salario.vue`
