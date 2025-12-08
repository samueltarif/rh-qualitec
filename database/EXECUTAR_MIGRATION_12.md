# Executar Migration 12 - Parâmetros de Folha

## 📋 O que será criado

A migration `12_parametros_folha.sql` cria:

- ✅ Tabela `parametros_folha` com todos os parâmetros de cálculo
- ✅ Alíquotas de INSS (4 faixas progressivas)
- ✅ Alíquotas de IRRF (5 faixas progressivas com deduções)
- ✅ Alíquota de FGTS (8%)
- ✅ Parâmetros de benefícios (VT, VA, VR)
- ✅ Salário família
- ✅ RLS configurado
- ✅ Dados padrão (tabela 2024)

## 🚀 Como executar

1. Abra o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Copie e cole o conteúdo do arquivo `migrations/12_parametros_folha.sql`
4. Clique em **Run**

## ✅ Resultado esperado

Você verá as mensagens:

```
✅ Tabela parametros_folha criada com sucesso!
📋 Parâmetros padrão (tabela 2024) inseridos
💡 Configure os valores em /configuracoes/folha
```

## 🎯 Após a execução

1. Acesse `/configuracoes`
2. Clique em "Parâmetros de Folha"
3. Configure as alíquotas conforme necessário
4. Os valores serão usados automaticamente no cálculo da folha de pagamento

## 📊 Parâmetros Padrão (2024)

### INSS
- Até R$ 1.320,00 → 7,5%
- Até R$ 2.571,29 → 9%
- Até R$ 3.856,94 → 12%
- Até R$ 7.507,49 → 14%

### IRRF
- Até R$ 2.112,00 → Isento
- Até R$ 2.826,65 → 7,5% (dedução R$ 158,40)
- Até R$ 3.751,05 → 15% (dedução R$ 370,40)
- Até R$ 4.664,68 → 22,5% (dedução R$ 651,73)
- Acima → 27,5% (dedução R$ 884,96)

### Outros
- FGTS: 8%
- VT: Desconto máximo de 6%
- Salário Família: R$ 62,04 (limite R$ 1.819,26)
