# ⚡ Ação Rápida: Corrigir 2ª Parcela do 13º Salário

## 🎯 O que foi feito?

Corrigi o cálculo da 2ª parcela do 13º salário que estava:
- ❌ Calculando meses trabalhados errado (7/12 ao invés de 5/12)
- ❌ Mostrando valor total ao invés da 2ª parcela
- ❌ Não descontando a 1ª parcela já paga

## ✅ O que precisa fazer AGORA?

### 1️⃣ Abrir Supabase SQL Editor
Acesse: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

### 2️⃣ Copiar e Colar este SQL

```sql
-- Excluir holerites incorretos da 2ª parcela
DELETE FROM holerites
WHERE tipo = 'decimo_terceiro'
  AND parcela_13 = '2'
  AND ano = 2025;

-- Verificar exclusão (deve retornar 0)
SELECT COUNT(*) FROM holerites
WHERE tipo = 'decimo_terceiro'
  AND parcela_13 = '2'
  AND ano = 2025;
```

### 3️⃣ Gerar Novamente no Sistema

1. Acesse o sistema
2. Vá em **Folha de Pagamento** → **13º Salário**
3. Selecione os colaboradores
4. Escolha **"2ª Parcela"**
5. Clique em **"Gerar"**

### 4️⃣ Verificar Resultado

```sql
-- Ver holerites corrigidos
SELECT 
  nome_colaborador,
  meses_trabalhados,
  total_proventos as "2ª Parcela",
  inss,
  salario_liquido as "Líquido"
FROM holerites
WHERE tipo = 'decimo_terceiro'
  AND parcela_13 = '2'
  AND ano = 2025
ORDER BY nome_colaborador;
```

## 📊 Exemplo: Samuel

### Antes ❌
- Meses: 7/12
- Proventos: R$ 1.545,83
- INSS: R$ 117,95
- Líquido: R$ 1.427,88

### Depois ✅
- Meses: 5/12
- Proventos: R$ 552,08
- INSS: R$ 82,81
- Líquido: R$ 469,27

## 📚 Documentação Completa

Se quiser entender os detalhes:

1. **CORRECAO_13_SALARIO_2_PARCELA.md** - Explicação completa dos cálculos
2. **EXECUTAR_CORRECAO_2PARCELA_13.md** - Guia passo a passo detalhado
3. **ANTES_DEPOIS_13_2PARCELA.md** - Comparação visual
4. **CHECKLIST_VALIDACAO_13_2PARCELA.md** - Checklist de validação

## ⏱️ Tempo Estimado

- Excluir holerites: 30 segundos
- Gerar novamente: 1-2 minutos
- Verificar: 1 minuto
- **Total: ~3 minutos**

## ✨ Resultado

Após seguir estes passos:
- ✅ Todos os holerites da 2ª parcela estarão corretos
- ✅ Meses trabalhados calculados corretamente
- ✅ Valores de acordo com a legislação
- ✅ Prontos para enviar aos colaboradores

---

**Dúvidas?** Consulte os arquivos de documentação detalhada.
