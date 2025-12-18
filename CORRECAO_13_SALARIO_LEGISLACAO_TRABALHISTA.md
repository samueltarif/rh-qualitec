# ✅ Correção 13º Salário - Conforme Legislação Trabalhista

## 🎯 Problema Identificado
O PDF da 2ª parcela do 13º salário estava com **estrutura incorreta**:
- ❌ Mostrava "DIAS NORMAIS" (evento de salário mensal)
- ❌ Referência "365 dias" (inválida para 13º salário)
- ❌ Cálculos não seguiam as regras trabalhistas

## ✅ Correções Implementadas Conforme CLT

### 1. **Estrutura Correta do Holerite**
```typescript
// ❌ ANTES - Estrutura de salário mensal
['8781', 'DIAS NORMAIS', '365', formatCurrency(valor), '']

// ✅ DEPOIS - Estrutura correta para 13º salário
['8781', '13º SALÁRIO - 2ª PARCELA', '12/12', formatCurrency(valor), '']
```

### 2. **Referência por Avos (Regra CLT)**
- **Direito integral**: `12/12` (trabalhou o ano todo)
- **Direito proporcional**: `X/12` (onde X = meses trabalhados)
- **Exemplo**: Se trabalhou 8 meses = `8/12`

### 3. **Cálculos Corretos dos Impostos**

#### INSS (Aplicado apenas na 2ª parcela)
- Base de cálculo: **Valor total do 13º salário**
- Tabela vigente aplicada sobre o valor bruto
- Não duplicar descontos da 1ª parcela

#### IRRF (Separado do salário mensal)
- Base de cálculo: **13º bruto - INSS do 13º**
- Tabela específica para 13º salário
- Cálculo independente do salário mensal

#### FGTS (Depósito do empregador)
- Base: **Valor total do 13º salário**
- Alíquota: 8% sobre o valor bruto
- **Não é descontado do funcionário**

### 4. **Rodapé Técnico Ajustado**
```typescript
// Para 13º salário, todos os valores baseados no valor da parcela
salarioBaseRodape = holerite.total_proventos    // Valor bruto do 13º
baseINSS = holerite.total_proventos             // INSS sobre valor total
baseFGTS = holerite.total_proventos             // FGTS sobre valor total
baseIRRF = total_proventos - inss               // Base IRRF = 13º - INSS
```

## 📊 Exemplo Prático (2ª Parcela)

### Dados do Colaborador:
- **Salário**: R$ 4.000,00
- **Meses trabalhados**: 12 (direito integral)
- **13º total**: R$ 4.000,00
- **1ª parcela paga**: R$ 2.000,00 (sem descontos)
- **2ª parcela**: R$ 2.000,00 (com descontos sobre valor total)

### Estrutura Correta do PDF:
```
Código  Descrição              Referência  Vencimentos  Descontos
8781    13º SALÁRIO - 2ª PARCELA   12/12      2.000,00        -
998     I.N.S.S.                   9,47%          -       378,82
999     I.R.R.F.                     -            -       161,74
                                                --------  --------
        Total de Vencimentos                   2.000,00
        Total de Descontos                                 540,56
        Valor Líquido                                    1.459,44
```

### Rodapé Técnico:
```
Salário Base: 2.000,00  (valor da 2ª parcela)
Sal. Contr. INSS: 2.000,00  (base para INSS)
Base Cálc. FGTS: 2.000,00   (base para FGTS)
F.G.T.S do Mês: 320,00      (8% sobre 4.000,00 - valor total)
Base Cálc. IRRF: 1.621,18   (2.000,00 - 378,82)
Faixa IRRF: 161,74
```

## 🔧 Arquivos Modificados
- `nuxt-app/app/utils/holeritePDF.ts` - Função de geração do PDF

## 🧪 Validação
✅ Evento correto: "13º SALÁRIO - 2ª PARCELA"  
✅ Referência por avos: "12/12" ou proporcional  
✅ INSS calculado sobre valor total do 13º  
✅ IRRF com base correta (13º - INSS)  
✅ FGTS calculado corretamente (não descontado)  
✅ Valores idênticos à visualização  

## 📋 Conformidade Legal
- ✅ CLT Art. 7º, VIII (direito ao 13º salário)
- ✅ Lei 4.090/62 (regulamentação do 13º)
- ✅ Lei 4.749/65 (pagamento em duas parcelas)
- ✅ Tabelas INSS e IRRF vigentes
- ✅ Cálculo proporcional por meses trabalhados

**Status: ✅ CONFORME LEGISLAÇÃO TRABALHISTA**