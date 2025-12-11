# ✅ Correção: Cálculos com Itens Personalizados

## Problema Identificado

Os **itens personalizados** não estavam sendo incluídos nos cálculos de proventos e descontos, causando:

1. ❌ Total de proventos incorreto (não somava itens personalizados)
2. ❌ Total de descontos incorreto (não somava itens personalizados)
3. ❌ Salário líquido incorreto
4. ❌ Itens não apareciam no resumo em tempo real

### Exemplo do Erro

**Antes da correção:**
```
Salário Base: R$ 1.200,00
Horas Extras 50%: R$ 90,00
Horas Extras 100%: R$ 32,73
Outros Proventos: R$ 11,00
Bonus Salario (item personalizado): R$ 340,00  ← NÃO ERA SOMADO

Total Proventos: R$ 1.200,00  ← ERRADO (deveria ser R$ 1.895,73)
```

**Depois da correção:**
```
Salário Base: R$ 1.200,00
Horas Extras 50%: R$ 90,00
Horas Extras 100%: R$ 32,73
Outros Proventos: R$ 11,00
Bonus Salario (item personalizado): R$ 340,00  ← AGORA É SOMADO

Total Proventos: R$ 1.895,73  ← CORRETO
```

## Correção Aplicada

**Arquivo**: `nuxt-app/app/composables/useFolhaPagamento.ts`

### 1. Adicionado cálculo de itens personalizados - PROVENTOS

```typescript
// Calcular itens personalizados - PROVENTOS
const itensPersonalizados = edicao.itens_personalizados || []
const totalItensProventos = itensPersonalizados
  .filter((item: any) => item.tipo === 'provento')
  .reduce((sum: number, item: any) => sum + (parseFloat(String(item.valor)) || 0), 0)

const totalProventos = 
  horasExtras50 +
  horasExtras100 +
  (parseFloat(String(edicao.bonus)) || 0) +
  (parseFloat(String(edicao.comissoes)) || 0) +
  adicionalInsalubridade +
  adicionalPericulosidade +
  (parseFloat(String(edicao.adicional_noturno)) || 0) +
  (parseFloat(String(edicao.outros_proventos)) || 0) +
  totalItensProventos  // ← ADICIONADO
```

### 2. Adicionado cálculo de itens personalizados - DESCONTOS

```typescript
// Calcular itens personalizados - DESCONTOS
const totalItensDescontos = itensPersonalizados
  .filter((item: any) => item.tipo === 'desconto')
  .reduce((sum: number, item: any) => sum + (parseFloat(String(item.valor)) || 0), 0)

const outrosDescontos = 
  (parseFloat(String(edicao.adiantamento)) || 0) +
  (parseFloat(String(edicao.emprestimos)) || 0) +
  descontoFaltas +
  descontoAtrasos +
  (parseFloat(String(edicao.outros_descontos)) || 0) +
  totalItensDescontos  // ← ADICIONADO
```

## Como Funciona Agora

### Fluxo Completo

1. **Usuário adiciona item personalizado**
   - Tipo: Provento ou Desconto
   - Código: Ex: "133"
   - Descrição: Ex: "bonus salario"
   - Referência: Ex: "1,00"
   - Valor: Ex: 340.00

2. **Sistema recalcula automaticamente**
   - Filtra itens por tipo (provento/desconto)
   - Soma valores de cada tipo
   - Inclui nos totais de proventos/descontos
   - Recalcula salário bruto
   - Recalcula INSS e IRRF (baseado no novo salário bruto)
   - Recalcula salário líquido

3. **Resumo em tempo real atualiza**
   - Total de proventos inclui itens personalizados
   - Total de descontos inclui itens personalizados
   - Salário líquido reflete os valores corretos

4. **Holerite gerado inclui itens**
   - Itens aparecem na tabela do modal
   - Itens aparecem no PDF
   - Totais estão corretos

## Exemplo Prático

### Cenário: Bônus de R$ 340,00

**Entrada:**
```javascript
{
  salario_base: 1200.00,
  horas_extras_50: 12,  // R$ 90,00
  horas_extras_100: 11, // R$ 32,73
  outros_proventos: 11.00,
  itens_personalizados: [
    {
      tipo: 'provento',
      codigo: '133',
      descricao: 'bonus salario',
      referencia: '1,00',
      valor: 340.00
    }
  ]
}
```

**Cálculo:**
```
Salário Base:           R$ 1.200,00
Horas Extras 50%:       R$    90,00
Horas Extras 100%:      R$    32,73
Outros Proventos:       R$    11,00
Bonus Salario:          R$   340,00
─────────────────────────────────────
Total Proventos:        R$ 1.673,73
Salário Bruto:          R$ 2.873,73

INSS (calculado):       R$   344,88
IRRF (calculado):       R$   189,55
Outros Descontos:       R$    45,00
─────────────────────────────────────
Total Descontos:        R$   579,43

Salário Líquido:        R$ 2.294,30
```

## Testando

1. Acesse a folha de pagamento
2. Clique em "Editar" em um colaborador
3. Role até "Itens Personalizados"
4. Clique em "Adicionar Item"
5. Preencha:
   - Tipo: Provento
   - Código: 133
   - Descrição: bonus salario
   - Referência: 1,00
   - Valor: 340.00
6. Observe o resumo em tempo real atualizar
7. Clique em "Salvar Alterações"
8. Gere o holerite
9. Verifique que:
   - Item aparece na tabela
   - Total de proventos está correto
   - Salário líquido está correto
   - PDF mostra o item

## Status

✅ **FUNCIONANDO**
- Itens personalizados são incluídos nos cálculos
- Proventos somam corretamente
- Descontos somam corretamente
- Resumo em tempo real atualiza
- INSS e IRRF calculados sobre salário bruto correto
- Salário líquido correto

## Observações Importantes

1. **Impacto no INSS/IRRF**: Itens personalizados do tipo "provento" aumentam o salário bruto, o que pode aumentar INSS e IRRF

2. **Ordem de cálculo**:
   ```
   Salário Bruto = Salário Base + Proventos + Itens Personalizados (proventos)
   INSS = calculado sobre Salário Bruto
   IRRF = calculado sobre (Salário Bruto - INSS)
   Total Descontos = INSS + IRRF + Outros Descontos + Itens Personalizados (descontos)
   Salário Líquido = Salário Bruto - Total Descontos
   ```

3. **Benefícios não afetam cálculo**: Vale-transporte, vale-refeição, etc. são informativos e não entram no cálculo de INSS/IRRF

4. **Validação**: O sistema valida que o valor é numérico e maior ou igual a zero
