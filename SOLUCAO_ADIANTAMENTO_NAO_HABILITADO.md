# 🔧 SOLUÇÃO: Adiantamento Não Habilitado

## ❌ Erro
```
Adiantamento salarial não está habilitado. 
Ative em Configurações > Folha de Pagamento.
```

## ✅ Solução Rápida

### Opção 1: Via Interface (Recomendado)

1. **Acesse**: Configurações > Folha de Pagamento
2. **Localize**: Seção "Adiantamento Salarial"
3. **Ative**: Toggle "Habilitar Adiantamento"
4. **Configure**:
   - Percentual: 40%
   - Dia de Pagamento: 20
5. **Salve** as alterações

### Opção 2: Via SQL (Rápido)

Execute o SQL no Supabase:

```sql
-- Habilitar adiantamento
UPDATE parametros_folha
SET 
  adiantamento_habilitado = true,
  adiantamento_percentual = 40,
  adiantamento_dia_pagamento = 20;

-- Verificar
SELECT 
  adiantamento_habilitado,
  adiantamento_percentual,
  adiantamento_dia_pagamento
FROM parametros_folha;
```

**Arquivo pronto**: `database/HABILITAR_ADIANTAMENTO_AGORA.sql`

## 📋 Como Funciona

Após habilitar, você poderá:

1. **Gerar Adiantamentos**:
   - Acesse: Folha de Pagamento
   - Clique: "💰 Adiantamento Salarial"
   - Selecione colaboradores
   - Gere os holerites de adiantamento

2. **Características**:
   - Valor: 40% do salário bruto
   - Pagamento: Dia 20 do mês
   - Sem descontos (INSS, IRRF)
   - Desconto automático no holerite final

3. **Desconto Automático**:
   - Ao gerar holerite mensal (dia 5)
   - O sistema desconta automaticamente
   - Aparece como "Adiantamento Salarial" nos descontos

## 🎯 Teste Rápido

1. Execute o SQL de habilitação
2. Recarregue a página de Folha de Pagamento
3. Clique em "💰 Adiantamento Salarial"
4. Selecione colaboradores
5. Gere os adiantamentos

## ⚠️ Importante

- Os colaboradores devem ter **salário cadastrado**
- Apenas **colaboradores ativos** aparecem
- O adiantamento é **descontado automaticamente** no holerite mensal
- Gere o holerite mensal **após** pagar os adiantamentos

## 📊 Exemplo de Cálculo

**Colaborador**: João Silva  
**Salário Bruto**: R$ 3.000,00  
**Adiantamento (40%)**: R$ 1.200,00  

**Holerite Adiantamento (Dia 20)**:
- Valor Líquido: R$ 1.200,00
- Sem descontos

**Holerite Mensal (Dia 5)**:
- Salário Bruto: R$ 3.000,00
- INSS: R$ 281,62
- IRRF: R$ 0,00
- **Adiantamento**: R$ 1.200,00
- **Salário Líquido**: R$ 1.518,38

## ✅ Pronto!

Após habilitar, o sistema está pronto para gerar adiantamentos! 🎉
