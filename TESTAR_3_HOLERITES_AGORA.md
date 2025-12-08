# 🧪 TESTAR: Geração de 3 Holerites de 13º Salário

## 🎯 Objetivo

Validar que o sistema gera corretamente **3 holerites** ao selecionar "1ª Parcela" do 13º salário.

---

## 📋 Pré-requisitos

- [ ] SQL executado no Supabase (`fix_constraint_holerites_tipo.sql`)
- [ ] Servidor Nuxt reiniciado
- [ ] Pelo menos 1 colaborador ativo no sistema

---

## 🧪 Teste 1: Geração Básica

### Passo 1: Limpar Dados de Teste

```sql
-- Executar no Supabase SQL Editor
DELETE FROM holerites 
WHERE ano = 2025 
  AND mes IN (11, 12)
  AND colaborador_id IN (
    SELECT id FROM colaboradores 
    WHERE nome LIKE '%SAMUEL%'
  );
```

### Passo 2: Acessar Sistema

1. Abrir: http://localhost:3000/folha-pagamento
2. Clicar em **"Gerar 13º Salário"**

### Passo 3: Configurar Geração

```
┌─────────────────────────────────────┐
│  Gerar 13º Salário                  │
├─────────────────────────────────────┤
│  Parcela: [1ª Parcela ▼]            │  ← Selecionar "1ª Parcela"
│  Ano: [2025 ▼]                      │  ← Ano atual
│                                     │
│  ☑ Samuel Barretos Tarif            │  ← Marcar colaborador
│                                     │
│  [Gerar Holerites]                  │  ← Clicar aqui
└─────────────────────────────────────┘
```

### Passo 4: Verificar Mensagem

Deve aparecer:
```
✅ 3 holerite(s) de 13º salário gerado(s) com sucesso!

Os funcionários já podem visualizar seus holerites no portal.
```

### Passo 5: Verificar no Modal

Clicar em **"Gerenciar Holerites"**

**Resultado Esperado:**
```
┌──────────────────────────────────────────────────┐
│  Gerenciar Holerites                             │
├──────────────────────────────────────────────────┤
│  Total: 3  |  Gerados: 3  |  Enviados: 0         │
├──────────────────────────────────────────────────┤
│                                                  │
│  📄 SAMUEL BARRETOS TARIF                        │
│     Nov/2025 - 13º Salário (1ª Parcela)          │
│     Bruto: R$ 3.015,00                           │
│     Descontos: R$ 297,76                         │
│     Líquido: R$ 2.717,24                         │
│     [Ver] [Excluir]                              │
│                                                  │
│  📄 SAMUEL BARRETOS TARIF                        │
│     Dez/2025 - 13º Salário (2ª Parcela)          │
│     Bruto: R$ 2.010,00                           │
│     Descontos: R$ 0,00                           │
│     Líquido: R$ 1.005,00                         │
│     [Ver] [Excluir]                              │
│                                                  │
│  📄 SAMUEL BARRETOS TARIF                        │
│     Dez/2025 - Salário Mensal                    │
│     Bruto: R$ 2.010,00                           │
│     Descontos: R$ 159,72                         │
│     Líquido: R$ 1.850,28                         │
│     [Ver] [Excluir]                              │
│                                                  │
└──────────────────────────────────────────────────┘
```

✅ **PASSOU:** 3 holerites gerados  
❌ **FALHOU:** Menos de 3 holerites

---

## 🧪 Teste 2: Verificação no Banco

### Consulta SQL

```sql
SELECT 
  id,
  nome_colaborador,
  mes,
  ano,
  tipo,
  parcela_13,
  salario_base,
  salario_bruto,
  total_descontos,
  salario_liquido,
  observacoes,
  created_at
FROM holerites
WHERE ano = 2025
  AND nome_colaborador LIKE '%SAMUEL%'
ORDER BY mes, tipo, parcela_13;
```

### Resultado Esperado

```
id | nome   | mes | ano  | tipo            | parcela | base    | bruto   | desc   | liquido | observacoes
---|--------|-----|------|-----------------|---------|---------|---------|--------|---------|-------------
1  | Samuel | 11  | 2025 | decimo_terceiro | 1       | 2010.00 | 1340.00 | 0.00   | 1005.00 | 13º Salário - 1ª Parcela...
2  | Samuel | 12  | 2025 | decimo_terceiro | 2       | 2010.00 | 1340.00 | 159.72 | 845.28  | 13º Salário - 2ª Parcela...
3  | Samuel | 12  | 2025 | normal          | NULL    | 2010.00 | 2010.00 | 159.72 | 1850.28 | Salário Mensal - Dezembro...
```

✅ **PASSOU:** 3 linhas retornadas  
❌ **FALHOU:** Número diferente de linhas

---

## 🧪 Teste 3: Valores Corretos

### Verificar Cálculos

Para Samuel (Salário R$ 2.010,00, 8 meses):

**13º Proporcional:**
```
(2.010,00 / 12) × 8 = R$ 1.340,00
```

**1ª Parcela (Novembro):**
```
✅ Valor Bruto: R$ 1.340,00
✅ 50% sem descontos: R$ 670,00
✅ Líquido: R$ 670,00
```

**2ª Parcela (Dezembro):**
```
✅ Valor Bruto: R$ 670,00 (50% restante)
✅ INSS sobre total: R$ 159,72
✅ IRRF: R$ 0,00
✅ Líquido: R$ 510,28
```

**Salário Normal (Dezembro):**
```
✅ Valor Bruto: R$ 2.010,00
✅ INSS: R$ 159,72
✅ IRRF: R$ 0,00
✅ Líquido: R$ 1.850,28
```

### SQL de Verificação

```sql
SELECT 
  tipo,
  parcela_13,
  salario_bruto,
  inss,
  irrf,
  total_descontos,
  salario_liquido
FROM holerites
WHERE ano = 2025
  AND nome_colaborador LIKE '%SAMUEL%'
ORDER BY mes, tipo;
```

✅ **PASSOU:** Valores conferem  
❌ **FALHOU:** Valores diferentes

---

## 🧪 Teste 4: Portal do Funcionário

### Passo 1: Fazer Login como Funcionário

1. Logout do admin
2. Login com: samuel@qualitec.com.br
3. Acessar: http://localhost:3000/employee

### Passo 2: Ver Holerites

Clicar na aba **"Holerites"**

**Resultado Esperado:**
```
┌────────────────────────────────┐
│  Meus Holerites                │
├────────────────────────────────┤
│                                │
│  📄 Novembro/2025              │
│     13º Salário (1ª Parcela)   │
│     R$ 1.005,00                │
│     [Baixar PDF]               │
│                                │
│  📄 Dezembro/2025              │
│     13º Salário (2ª Parcela)   │
│     R$ 845,28                  │
│     [Baixar PDF]               │
│                                │
│  📄 Dezembro/2025              │
│     Salário Mensal             │
│     R$ 1.850,28                │
│     [Baixar PDF]               │
│                                │
└────────────────────────────────┘
```

✅ **PASSOU:** 3 holerites visíveis  
❌ **FALHOU:** Menos de 3 holerites

---

## 🧪 Teste 5: Geração Múltipla

### Passo 1: Selecionar Múltiplos Colaboradores

```
☑ Samuel Barretos Tarif
☑ Silvana Barretos Tarif
☑ Outro Colaborador
```

### Passo 2: Gerar

Clicar em **"Gerar Holerites"**

### Passo 3: Verificar

Deve gerar **3 holerites × número de colaboradores**

Exemplo: 3 colaboradores = 9 holerites

```sql
SELECT 
  nome_colaborador,
  COUNT(*) as total_holerites
FROM holerites
WHERE ano = 2025
  AND mes IN (11, 12)
GROUP BY nome_colaborador
ORDER BY nome_colaborador;
```

**Resultado Esperado:**
```
nome_colaborador      | total_holerites
----------------------|----------------
Samuel Barretos Tarif | 3
Silvana Barretos Tarif| 3
Outro Colaborador     | 3
```

✅ **PASSOU:** 3 holerites por colaborador  
❌ **FALHOU:** Número diferente

---

## 🧪 Teste 6: Parcela Integral

### Passo 1: Limpar Dados

```sql
DELETE FROM holerites WHERE ano = 2025;
```

### Passo 2: Selecionar "Parcela Integral"

```
Parcela: [Integral (Parcela Única) ▼]
```

### Passo 3: Gerar

**Resultado Esperado:** Apenas **1 holerite** (não 3)

```sql
SELECT COUNT(*) FROM holerites 
WHERE ano = 2025 
  AND nome_colaborador LIKE '%SAMUEL%';
```

Deve retornar: **1**

✅ **PASSOU:** 1 holerite gerado  
❌ **FALHOU:** Número diferente

---

## 🧪 Teste 7: Atualização de Holerites

### Passo 1: Gerar Novamente

Sem limpar os dados, gerar novamente o 13º salário

### Passo 2: Verificar

Não deve duplicar holerites, apenas atualizar

```sql
SELECT COUNT(*) FROM holerites 
WHERE ano = 2025 
  AND nome_colaborador LIKE '%SAMUEL%';
```

Deve continuar retornando: **3**

✅ **PASSOU:** Não duplicou  
❌ **FALHOU:** Duplicou holerites

---

## 📊 Checklist Final

- [ ] Teste 1: Geração básica (3 holerites)
- [ ] Teste 2: Verificação no banco (3 linhas)
- [ ] Teste 3: Valores corretos (cálculos OK)
- [ ] Teste 4: Portal do funcionário (3 visíveis)
- [ ] Teste 5: Geração múltipla (3 × N colaboradores)
- [ ] Teste 6: Parcela integral (1 holerite)
- [ ] Teste 7: Não duplica ao regerar

---

## ✅ Critérios de Sucesso

Para considerar o teste **APROVADO**, todos os itens devem estar ✅:

1. ✅ 3 holerites gerados por colaborador
2. ✅ Valores calculados corretamente
3. ✅ Funcionários conseguem visualizar
4. ✅ Não duplica ao regerar
5. ✅ Parcela integral gera apenas 1 holerite
6. ✅ Sem erros no console
7. ✅ Sem warnings Vue

---

## 🐛 Troubleshooting

### Problema: Gera apenas 2 holerites

**Solução:**
```sql
-- Verificar constraint
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'holerites'::regclass;

-- Se não incluir parcela_13, executar fix novamente
```

### Problema: Erro de constraint violation

**Solução:**
```sql
-- Limpar holerites duplicados
DELETE FROM holerites 
WHERE id NOT IN (
  SELECT MIN(id)
  FROM holerites
  GROUP BY colaborador_id, mes, ano, tipo, COALESCE(parcela_13, '')
);
```

### Problema: Valores incorretos

**Solução:**
- Verificar data de admissão do colaborador
- Verificar cálculo de meses trabalhados
- Verificar tabelas INSS e IRRF no código

---

## 📞 Suporte

Se todos os testes passarem: **🎉 SISTEMA FUNCIONANDO!**

Se algum teste falhar: Consultar `CORRECAO_GERAR_3_HOLERITES_13.md`
