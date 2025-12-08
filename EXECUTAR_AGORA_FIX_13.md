# ⚡ EXECUTAR AGORA - Fix 13º Salário

## 🎯 Execute Este SQL no Supabase

Copie e cole no SQL Editor do Supabase:

```sql
-- ============================================================================
-- FIX COMPLETO: 13º Salário
-- ============================================================================

-- 1. Corrigir constraint única (OBRIGATÓRIO)
ALTER TABLE holerites 
DROP CONSTRAINT IF EXISTS holerites_colaborador_id_mes_ano_key;

ALTER TABLE holerites 
ADD CONSTRAINT holerites_colaborador_mes_ano_tipo_key 
UNIQUE (colaborador_id, mes, ano, tipo);

-- 2. Adicionar email do Samuel (OPCIONAL)
UPDATE colaboradores
SET email = 'samuel.tarif@gmail.com'
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38';

-- 3. Verificar
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'holerites'::regclass
AND contype = 'u';

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- Deve mostrar:
-- holerites_colaborador_mes_ano_tipo_key | UNIQUE (colaborador_id, mes, ano, tipo)
-- ============================================================================
```

## ✅ Depois de Executar

1. Volte para o sistema
2. Acesse a página de 13º Salário
3. Selecione Samuel
4. Clique em "Gerar e Enviar"
5. **Deve funcionar!** ✅

## 📋 O Que Foi Corrigido

- ✅ Constraint única agora permite múltiplos holerites do mesmo mês (desde que sejam tipos diferentes)
- ✅ Email do Samuel adicionado (opcional, mas recomendado)
- ✅ Código já está corrigido no servidor

## 🔍 Se Ainda Der Erro

Verifique os logs no terminal:
- ✅ Não deve mais aparecer erro de chave duplicada
- ✅ Não deve mais aparecer erro de campo NULL
- ⚠️ Pode aparecer aviso de email (se não executou o passo 2)

---

**⚡ Execute o SQL acima e teste!**
