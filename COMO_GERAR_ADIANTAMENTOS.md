# 🎯 COMO GERAR ADIANTAMENTOS

## ⚠️ IMPORTANTE

A coluna "Adiantamento" na folha de pagamento **só mostra valores** se você **já gerou os holerites de adiantamento** para aquele mês!

## 📋 Passo a Passo

### 1️⃣ Habilitar Adiantamento (Se ainda não fez)

Execute no Supabase:
```sql
UPDATE parametros_folha
SET 
  adiantamento_habilitado = true,
  adiantamento_percentual = 40,
  adiantamento_dia_pagamento = 20;
```

### 2️⃣ Gerar Holerites de Adiantamento

1. **Acesse**: Folha de Pagamento
2. **Clique**: "💰 Adiantamento Salarial" (botão nas Ações Rápidas)
3. **Selecione**:
   - Mês: Dezembro (ou o mês que você quer)
   - Ano: 2024
   - Colaboradores: Marque "Todos os colaboradores"
4. **Clique**: "Gerar Adiantamentos"
5. **Aguarde**: Confirmação de sucesso

### 3️⃣ Calcular Folha Novamente

1. **Volte** para Folha de Pagamento
2. **Selecione**: Mesmo mês e ano
3. **Clique**: "Calcular Folha"
4. **Veja**: Agora a coluna "Adiantamento" estará preenchida! 🎉

## 🔍 Verificar Adiantamentos Gerados

Execute no Supabase:
```sql
-- Ver adiantamentos gerados
SELECT 
  nome_colaborador,
  mes,
  ano,
  salario_liquido as valor_adiantamento
FROM holerites
WHERE tipo = 'adiantamento'
  AND mes = 12
  AND ano = 2024
ORDER BY nome_colaborador;
```

## 📊 Exemplo Visual

**ANTES de gerar adiantamentos:**
```
Colaborador    | Adiantamento
---------------|-------------
Samuel         | R$ 0,00
Maria          | R$ 0,00
João           | R$ 0,00
```

**DEPOIS de gerar adiantamentos:**
```
Colaborador    | Adiantamento
---------------|-------------
Samuel         | R$ 1.060,00
Maria          | R$ 480,00
João           | R$ 920,00
```

## ⚡ Fluxo Completo

```
1. Dia 20 → Gerar Adiantamentos (40% do salário)
   ↓
2. Colaboradores recebem adiantamento
   ↓
3. Dia 5 → Calcular Folha Mensal
   ↓
4. Sistema desconta automaticamente o adiantamento
   ↓
5. Colaboradores recebem salário líquido (já descontado)
```

## 🆘 Troubleshooting

### Problema: Coluna mostra R$ 0,00 para todos

**Causa**: Você não gerou os holerites de adiantamento ainda

**Solução**: Siga o passo 2️⃣ acima

### Problema: Só 1 colaborador tem adiantamento

**Causa**: Você gerou adiantamento apenas para 1 colaborador

**Solução**: 
1. Gere novamente marcando "Todos os colaboradores"
2. Ou gere individualmente para cada um

### Problema: Erro ao gerar adiantamento

**Causa**: Adiantamento não está habilitado

**Solução**: Execute o SQL do passo 1️⃣

## ✅ Checklist

- [ ] Adiantamento habilitado no banco
- [ ] Holerites de adiantamento gerados
- [ ] Folha calculada novamente
- [ ] Coluna "Adiantamento" preenchida

## 🎉 Pronto!

Agora o sistema está funcionando corretamente! 

Os adiantamentos serão descontados automaticamente no holerite mensal.
