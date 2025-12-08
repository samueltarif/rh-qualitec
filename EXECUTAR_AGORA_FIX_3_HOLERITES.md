# ⚡ EXECUTAR AGORA: Fix 3 Holerites

## 🎯 Copie e Cole Este SQL no Supabase

```sql
-- Remover constraints antigas
ALTER TABLE holerites 
DROP CONSTRAINT IF EXISTS holerites_colaborador_mes_ano_tipo_unique;

ALTER TABLE holerites 
DROP CONSTRAINT IF EXISTS holerites_colaborador_mes_ano_tipo_parcela_unique;

ALTER TABLE holerites 
DROP CONSTRAINT IF EXISTS holerites_colaborador_id_mes_ano_key;

ALTER TABLE holerites 
DROP CONSTRAINT IF EXISTS holerites_colaborador_id_mes_ano_tipo_key;

-- Remover índices antigos
DROP INDEX IF EXISTS idx_holerites_unique_normal;
DROP INDEX IF EXISTS idx_holerites_unique_13_parcela;

-- Criar índice único para holerites normais (sem parcela_13)
CREATE UNIQUE INDEX idx_holerites_unique_normal
ON holerites (colaborador_id, mes, ano, tipo)
WHERE parcela_13 IS NULL;

-- Criar índice único para holerites de 13º (com parcela_13)
CREATE UNIQUE INDEX idx_holerites_unique_13_parcela
ON holerites (colaborador_id, mes, ano, tipo, parcela_13)
WHERE parcela_13 IS NOT NULL;

-- Verificar
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'holerites'
  AND indexname LIKE 'idx_holerites_unique%';
```

## ✅ Resultado Esperado

Deve aparecer 2 índices:
```
idx_holerites_unique_normal
idx_holerites_unique_13_parcela
```

## 🚀 Próximos Passos

1. ✅ SQL executado
2. Reiniciar servidor: `npm run dev`
3. Testar geração de 13º salário
4. Verificar que 3 holerites são criados

## 🎯 Pronto!

Agora o sistema pode gerar:
- ✅ Salário Normal (Dezembro)
- ✅ 1ª Parcela 13º (Novembro)
- ✅ 2ª Parcela 13º (Dezembro)

Tudo no mesmo mês sem conflitos!
