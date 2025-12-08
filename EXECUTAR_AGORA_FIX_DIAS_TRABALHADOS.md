# ⚡ EXECUTAR AGORA: Fix Dias Trabalhados

## 🎯 O que foi corrigido

O cálculo de "Dias Trabalhados" no holerite estava **ERRADO**:
- ❌ Antes: Multiplicava meses * 30 (ex: 6 meses = 180 dias)
- ✅ Agora: Calcula dias reais entre admissão e fim do mês

## 📋 Passo a Passo

### 1️⃣ Executar SQL no Supabase

Copie e cole no SQL Editor do Supabase:

```sql
-- Adicionar coluna data_admissao na tabela holerites
ALTER TABLE holerites 
ADD COLUMN IF NOT EXISTS data_admissao DATE;

COMMENT ON COLUMN holerites.data_admissao IS 'Data de admissão do colaborador (usada para calcular dias trabalhados)';
```

### 2️⃣ Regerar Holerites de 13º Salário

Os holerites antigos **não têm** a data de admissão salva. Para corrigir:

1. Acesse: **Folha de Pagamento → Gerenciar Holerites**
2. Filtre por: **Tipo = 13º Salário**
3. **Exclua** os holerites antigos
4. Acesse: **Folha de Pagamento → Ações Rápidas**
5. Clique em: **Gerar 13º Salário**
6. Selecione os colaboradores e gere novamente

### 3️⃣ Verificar Resultado

Abra qualquer holerite de 13º salário e confira:

**Exemplo esperado:**
- Colaborador admitido em: **01/08/2025**
- Competência: **Dezembro/2025**
- Dias Trabalhados: **153 dias** ✅ (antes mostrava 180 ❌)

## 🔍 Como Funciona Agora

A função calcula automaticamente:

```
Data Admissão: 01/08/2025
Último dia do mês: 31/12/2025
Diferença: 153 dias corridos
```

**Funciona para qualquer data:**
- 01/01/2025 → 365 dias
- 15/03/2025 → 292 dias  
- 20/11/2025 → 42 dias
- 01/08/2025 → 153 dias ✅

## ✅ Checklist de Validação

- [ ] SQL executado no Supabase
- [ ] Coluna `data_admissao` criada
- [ ] Holerites antigos excluídos
- [ ] Novos holerites gerados
- [ ] Dias trabalhados corretos no holerite
- [ ] Cálculo muda conforme data de admissão

## 📊 Teste Rápido

Execute no Supabase para ver os dados:

```sql
SELECT 
  nome_colaborador,
  data_admissao,
  mes,
  ano,
  meses_trabalhados,
  tipo
FROM holerites
WHERE tipo = 'decimo_terceiro'
  AND data_admissao IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
```

## 🎉 Pronto!

Agora o sistema calcula corretamente os dias trabalhados para **qualquer data de admissão**, não apenas para casos específicos.
