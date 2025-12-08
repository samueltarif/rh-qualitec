# 🔧 Solução: Erro de Chave Duplicada

## ❌ Erro Atual

```
duplicate key value violates unique constraint 
"holerites_colaborador_id_mes_ano_key"
```

## 🎯 Causa do Problema

A tabela `holerites` tem uma constraint única:
```sql
UNIQUE(colaborador_id, mes, ano)
```

Isso impede que o mesmo colaborador tenha mais de um holerite no mesmo mês/ano.

**Problema**: Não podemos ter:
- ❌ Holerite mensal de dezembro/2025
- ❌ 13º salário de dezembro/2025
- ❌ Ambos para o mesmo colaborador

## ✅ Solução

### Passo 1: Corrigir a Constraint no Banco

Execute no Supabase SQL Editor:

```sql
-- Remover constraint antiga
ALTER TABLE holerites 
DROP CONSTRAINT IF EXISTS holerites_colaborador_id_mes_ano_key;

-- Criar nova constraint incluindo o tipo
ALTER TABLE holerites 
ADD CONSTRAINT holerites_colaborador_mes_ano_tipo_key 
UNIQUE (colaborador_id, mes, ano, tipo);
```

Ou execute o arquivo: `nuxt-app/database/FIX_HOLERITES_CONSTRAINT.sql`

### Passo 2: Código Já Corrigido ✅

O código foi atualizado para:
- Verificar corretamente se o holerite existe
- Não dar erro quando não encontrar resultado
- Atualizar se existir, criar se não existir

## 🎉 Resultado

Agora você pode ter múltiplos holerites do mesmo mês/ano:
- ✅ Holerite mensal de dezembro/2025
- ✅ 13º salário (1ª parcela) de dezembro/2025  
- ✅ 13º salário (2ª parcela) de dezembro/2025
- ✅ Férias de dezembro/2025
- ✅ Todos para o mesmo colaborador!

## 📋 Checklist

- [ ] Execute o SQL para corrigir a constraint
- [ ] Teste gerar 13º salário novamente
- [ ] Deve funcionar! ✅

## 🔍 Como Verificar

Execute no Supabase:

```sql
-- Ver constraints atuais
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'holerites'::regclass
AND contype = 'u';
```

Deve mostrar:
```
holerites_colaborador_mes_ano_tipo_key | UNIQUE (colaborador_id, mes, ano, tipo)
```

---

**Status**: ✅ Código corrigido + SQL pronto para executar!
