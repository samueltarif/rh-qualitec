# ✅ CORREÇÃO COMPLETA - 2ª PARCELA DO 13º SALÁRIO

## 🎯 Problemas Corrigidos

1. ✅ **Erro de chave duplicada** - Constraint já existe e está correta
2. ✅ **Campo `nome_colaborador` nulo** - Código corrigido para buscar dados completos
3. ✅ **Cálculo incorreto da 2ª parcela** - Descontos aplicados corretamente

## 📋 O QUE FOI CORRIGIDO

### 1. Código da API (`/server/api/decimo-terceiro/gerar.post.ts`)

**Correções Implementadas:**

✅ **Busca completa do colaborador** com cargo e departamento
✅ **Todos os campos obrigatórios** preenchidos (nome_colaborador, cpf, cargo, departamento)
✅ **Cálculo correto da 2ª parcela** seguindo regras brasileiras:
   - 1ª Parcela (novembro): 50% SEM descontos
   - 2ª Parcela (dezembro): 50% COM descontos sobre o TOTAL
   - Descontos (INSS + IRRF) aplicados sobre o valor total do 13º

✅ **Meses corretos**:
   - 1ª parcela: mês 11 (novembro)
   - 2ª parcela: mês 12 (dezembro)

✅ **Verificação de duplicidade** usando `maybeSingle()` ao invés de `single()`

### 2. Tabelas INSS e IRRF 2025

✅ **INSS Progressivo 2025:**
- Até R$ 1.412,00 → 7,5%
- De R$ 1.412,01 até R$ 2.666,68 → 9%
- De R$ 2.666,69 até R$ 4.000,03 → 12%
- De R$ 4.000,04 até R$ 7.786,02 → 14%
- **Teto:** R$ 908,85

✅ **IRRF 2025:**
- Até R$ 2.259,20 → Isento
- De R$ 2.259,21 até R$ 2.826,65 → 7,5% (dedução R$ 169,44)
- De R$ 2.826,66 até R$ 3.751,05 → 15% (dedução R$ 381,44)
- De R$ 3.751,06 até R$ 4.664,68 → 22,5% (dedução R$ 662,77)
- Acima de R$ 4.664,68 → 27,5% (dedução R$ 896,00)

## 🔧 COMO USAR AGORA

### Passo 1: Reiniciar o Servidor

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

### Passo 2: Gerar 2ª Parcela do 13º

1. Acesse: **Folha de Pagamento**
2. Clique em: **Ações Rápidas** → **13º Salário**
3. Selecione:
   - ✅ Colaboradores desejados
   - ✅ Parcela: **2 (Segunda Parcela)**
   - ✅ Ano: **2025**
4. Clique em: **Gerar 13º Salário**

## 📊 EXEMPLO DE CÁLCULO - 2ª PARCELA

**Colaborador:** João Silva  
**Salário:** R$ 5.000,00  
**Meses trabalhados:** 12  
**Dependentes:** 0

### Cálculo Detalhado:

```
1. Valor Total do 13º:
   R$ 5.000,00 ÷ 12 × 12 meses = R$ 5.000,00

2. 1ª Parcela (já paga em novembro):
   R$ 5.000,00 ÷ 2 = R$ 2.500,00 (SEM descontos)

3. Cálculo dos Descontos (sobre o TOTAL):
   
   INSS (progressivo):
   - R$ 1.412,00 × 7,5% = R$ 105,90
   - R$ 1.254,68 × 9% = R$ 112,92
   - R$ 1.333,35 × 12% = R$ 160,00
   - R$ 1.000,00 × 14% = R$ 140,00
   Total INSS = R$ 518,82
   
   IRRF:
   Base = R$ 5.000,00 - R$ 518,82 = R$ 4.481,18
   Faixa: 22,5% - R$ 662,77
   IRRF = (R$ 4.481,18 × 22,5%) - R$ 662,77 = R$ 345,50

4. 2ª Parcela (dezembro):
   R$ 2.500,00 - R$ 518,82 - R$ 345,50 = R$ 1.635,68

5. Total Recebido:
   1ª Parcela: R$ 2.500,00
   2ª Parcela: R$ 1.635,68
   TOTAL: R$ 4.135,68
```

## ✅ VERIFICAÇÕES

### Verificar se o holerite foi gerado corretamente:

```sql
-- Ver holerites de 13º salário gerados
SELECT 
  h.id,
  h.nome_colaborador,
  h.mes,
  h.ano,
  h.parcela_13,
  h.salario_base,
  h.salario_bruto,
  h.total_proventos,
  h.inss,
  h.irrf,
  h.total_descontos,
  h.salario_liquido,
  h.observacoes
FROM holerites h
WHERE h.tipo = 'decimo_terceiro'
  AND h.ano = 2025
ORDER BY h.nome_colaborador, h.mes;
```

### Resultado Esperado:

```
nome_colaborador | mes | parcela_13 | total_proventos | descontos | liquido
-----------------|-----|------------|-----------------|-----------|----------
João Silva       | 11  | 1          | 2500.00         | 0.00      | 2500.00
João Silva       | 12  | 2          | 2500.00         | 864.32    | 1635.68
```

## 🎯 REGRAS DO 13º SALÁRIO (BRASIL)

### 1ª Parcela (Adiantamento)
- **Quando:** Entre fevereiro e novembro
- **Valor:** 50% do 13º proporcional
- **Descontos:** NENHUM
- **Mês no sistema:** 11 (novembro)

### 2ª Parcela (Complemento)
- **Quando:** Até 20 de dezembro
- **Valor:** 50% restante
- **Descontos:** INSS + IRRF sobre o TOTAL
- **Mês no sistema:** 12 (dezembro)

### Cálculo Proporcional
```
Valor do 13º = (Salário ÷ 12) × Meses trabalhados
```

**Meses trabalhados:**
- Admitido em janeiro: 12 meses
- Admitido em julho: 6 meses
- Mais de 15 dias no mês: conta o mês inteiro
- Menos de 15 dias: não conta

## 🚨 IMPORTANTE

### ⚠️ NÃO GERE NOVAMENTE SE JÁ GEROU

Se você já gerou a 2ª parcela com erro, o sistema irá **ATUALIZAR** o registro existente automaticamente.

### ✅ O Sistema Agora:

1. **Verifica** se já existe holerite para aquele mês/ano
2. **Atualiza** se existir
3. **Cria novo** se não existir
4. **Preenche** todos os campos obrigatórios
5. **Calcula** descontos corretamente

## 📱 TESTE RÁPIDO

1. Gere a 2ª parcela para UM colaborador
2. Verifique o holerite gerado
3. Confira se os valores estão corretos:
   - ✅ Nome do colaborador preenchido
   - ✅ CPF preenchido
   - ✅ Cargo preenchido
   - ✅ INSS calculado
   - ✅ IRRF calculado
   - ✅ Valor líquido correto

## 🎉 PRONTO!

O sistema está corrigido e pronto para gerar a 2ª parcela do 13º salário com:

✅ Todos os campos obrigatórios preenchidos  
✅ Descontos calculados corretamente  
✅ Seguindo as regras brasileiras  
✅ Sem erros de duplicidade  

**Agora é só usar!** 🚀
