# ✅ Checklist de Validação - 2ª Parcela do 13º Salário

## 📋 Antes de Aplicar a Correção

### 1. Verificar Holerites Atuais
```sql
-- Execute no Supabase SQL Editor
SELECT 
  nome_colaborador,
  meses_trabalhados,
  salario_base,
  total_proventos,
  inss,
  salario_liquido,
  observacoes
FROM holerites
WHERE tipo = 'decimo_terceiro'
  AND parcela_13 = '2'
  AND ano = 2025
ORDER BY nome_colaborador;
```

- [ ] Anotei os valores atuais para comparação
- [ ] Identifiquei quais estão incorretos
- [ ] Fiz backup dos dados (opcional)

### 2. Verificar Código Corrigido
- [ ] Arquivo `server/api/decimo-terceiro/gerar.post.ts` foi atualizado
- [ ] Função `calcularMesesTrabalhados` usa `12 - mesAdmissao + 1`
- [ ] Cálculo da 2ª parcela desconta a 1ª parcela

## 🔧 Durante a Aplicação

### 3. Excluir Holerites Incorretos
```sql
-- ATENÇÃO: Isso vai excluir os holerites da 2ª parcela
DELETE FROM holerites
WHERE tipo = 'decimo_terceiro'
  AND parcela_13 = '2'
  AND ano = 2025;
```

- [ ] Executei o comando DELETE
- [ ] Verifiquei que os registros foram excluídos
- [ ] Confirmei que apenas a 2ª parcela foi excluída (1ª parcela intacta)

### 4. Gerar Novamente no Sistema
- [ ] Acessei o sistema
- [ ] Fui em Folha de Pagamento → 13º Salário
- [ ] Selecionei os colaboradores
- [ ] Escolhi "2ª Parcela"
- [ ] Cliquei em "Gerar"
- [ ] Aguardei a confirmação de sucesso

## ✅ Após a Aplicação

### 5. Validar Meses Trabalhados

Para cada colaborador, verificar:

| Mês Admissão | Meses Esperados | Fórmula |
|--------------|-----------------|---------|
| Janeiro (1) | 12 | 12 - 1 + 1 = 12 |
| Fevereiro (2) | 11 | 12 - 2 + 1 = 11 |
| Março (3) | 10 | 12 - 3 + 1 = 10 |
| Abril (4) | 9 | 12 - 4 + 1 = 9 |
| Maio (5) | 8 | 12 - 5 + 1 = 8 |
| Junho (6) | 7 | 12 - 6 + 1 = 7 |
| Julho (7) | 6 | 12 - 7 + 1 = 6 |
| Agosto (8) | 5 | 12 - 8 + 1 = 5 |
| Setembro (9) | 4 | 12 - 9 + 1 = 4 |
| Outubro (10) | 3 | 12 - 10 + 1 = 3 |
| Novembro (11) | 2 | 12 - 11 + 1 = 2 |
| Dezembro (12) | 1 | 12 - 12 + 1 = 1 |

```sql
-- Verificar meses trabalhados
SELECT 
  c.nome,
  c.data_admissao,
  EXTRACT(MONTH FROM c.data_admissao) as mes_admissao,
  h.meses_trabalhados,
  (12 - EXTRACT(MONTH FROM c.data_admissao) + 1) as esperado,
  CASE 
    WHEN h.meses_trabalhados = (12 - EXTRACT(MONTH FROM c.data_admissao) + 1)
    THEN '✅ CORRETO'
    ELSE '❌ INCORRETO'
  END as status
FROM colaboradores c
JOIN holerites h ON h.colaborador_id = c.id
WHERE h.tipo = 'decimo_terceiro'
  AND h.parcela_13 = '2'
  AND h.ano = 2025
  AND EXTRACT(YEAR FROM c.data_admissao) = 2025
ORDER BY c.data_admissao;
```

- [ ] Todos os meses trabalhados estão corretos

### 6. Validar Cálculos Financeiros

Para cada colaborador, verificar:

```sql
-- Verificar cálculos
SELECT 
  nome_colaborador,
  salario_base,
  meses_trabalhados,
  -- Valores calculados
  ROUND((salario_base / 12.0) * meses_trabalhados, 2) as "13º Total Esperado",
  salario_bruto as "13º Total no Holerite",
  ROUND(((salario_base / 12.0) * meses_trabalhados) / 2, 2) as "2ª Parcela Esperada",
  total_proventos as "2ª Parcela no Holerite",
  -- Validação
  CASE 
    WHEN ABS(salario_bruto - ROUND((salario_base / 12.0) * meses_trabalhados, 2)) < 0.10
    THEN '✅'
    ELSE '❌'
  END as "13º OK",
  CASE 
    WHEN ABS(total_proventos - ROUND(((salario_base / 12.0) * meses_trabalhados) / 2, 2)) < 0.10
    THEN '✅'
    ELSE '❌'
  END as "2ª Parcela OK"
FROM holerites
WHERE tipo = 'decimo_terceiro'
  AND parcela_13 = '2'
  AND ano = 2025
ORDER BY nome_colaborador;
```

- [ ] 13º Total está correto para todos
- [ ] 2ª Parcela (proventos) está correta para todos
- [ ] Diferenças são apenas centavos (arredondamento)

### 7. Validar Descontos

```sql
-- Verificar descontos
SELECT 
  nome_colaborador,
  salario_bruto as "13º Total",
  inss,
  irrf,
  total_descontos,
  salario_liquido,
  -- Validação
  CASE 
    WHEN (inss + irrf) = total_descontos THEN '✅'
    ELSE '❌'
  END as "Descontos OK",
  CASE 
    WHEN (total_proventos - total_descontos) = salario_liquido THEN '✅'
    ELSE '❌'
  END as "Líquido OK"
FROM holerites
WHERE tipo = 'decimo_terceiro'
  AND parcela_13 = '2'
  AND ano = 2025
ORDER BY nome_colaborador;
```

- [ ] INSS calculado corretamente
- [ ] IRRF calculado corretamente
- [ ] Total de descontos = INSS + IRRF
- [ ] Líquido = Proventos - Descontos

### 8. Validar Observações

```sql
-- Verificar observações
SELECT 
  nome_colaborador,
  meses_trabalhados,
  observacoes
FROM holerites
WHERE tipo = 'decimo_terceiro'
  AND parcela_13 = '2'
  AND ano = 2025
ORDER BY nome_colaborador;
```

- [ ] Observações mencionam "2ª Parcela (Com Descontos)"
- [ ] Meses trabalhados corretos nas observações
- [ ] Ano correto (2025)

### 9. Teste Visual no Sistema

- [ ] Abri o modal "Gerenciar Holerites"
- [ ] Filtrei por "13º Salário"
- [ ] Verifiquei os valores exibidos nos cards
- [ ] Cliquei em "Ver" em um holerite
- [ ] Verifiquei o holerite completo
- [ ] Valores estão corretos e legíveis
- [ ] Observações estão claras

### 10. Teste de PDF

- [ ] Gerei PDF de um holerite
- [ ] Valores estão corretos no PDF
- [ ] Formatação está adequada
- [ ] Observações aparecem corretamente

## 📊 Exemplo de Validação: Samuel

### Dados Esperados
- Salário: R$ 2.650,00
- Admissão: 01/08/2025
- Meses: 5

### Checklist Específico

- [ ] Meses trabalhados: 5 ✅
- [ ] 13º Total: R$ 1.104,17 ✅
- [ ] 2ª Parcela Proventos: R$ 552,08 ✅
- [ ] INSS: R$ 82,81 ✅
- [ ] IRRF: R$ 0,00 ✅
- [ ] Total Descontos: R$ 82,81 ✅
- [ ] Líquido: R$ 469,27 ✅
- [ ] Observações: "5/12" ✅

## 🎯 Validação Final

### Todos os Colaboradores

```sql
-- Resumo geral
SELECT 
  COUNT(*) as total_holerites,
  COUNT(CASE WHEN meses_trabalhados > 0 AND meses_trabalhados <= 12 THEN 1 END) as meses_ok,
  COUNT(CASE WHEN total_proventos > 0 THEN 1 END) as proventos_ok,
  COUNT(CASE WHEN salario_liquido > 0 THEN 1 END) as liquido_ok,
  SUM(salario_liquido) as total_a_pagar
FROM holerites
WHERE tipo = 'decimo_terceiro'
  AND parcela_13 = '2'
  AND ano = 2025;
```

- [ ] Total de holerites gerados: ___
- [ ] Todos com meses válidos (1-12): ___
- [ ] Todos com proventos > 0: ___
- [ ] Todos com líquido > 0: ___
- [ ] Total a pagar: R$ ___

## ✅ Conclusão

- [ ] Todos os itens acima foram verificados
- [ ] Todos os valores estão corretos
- [ ] Sistema está pronto para uso
- [ ] Holerites podem ser enviados aos colaboradores

## 📝 Observações

Anote aqui qualquer problema encontrado:

```
_______________________________________________
_______________________________________________
_______________________________________________
```

## 🚀 Próximos Passos

Após validação completa:

1. [ ] Enviar holerites por e-mail
2. [ ] Atualizar status para "enviado"
3. [ ] Arquivar documentação
4. [ ] Comunicar RH sobre conclusão

---

**Data da Validação**: ___/___/2025
**Responsável**: _______________
**Status**: [ ] Aprovado [ ] Pendente [ ] Reprovado
