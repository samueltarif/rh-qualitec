# 🚨 COPIE E COLE ESTE SQL AGORA

## 📋 EXECUTE NO SUPABASE SQL EDITOR:

```sql
-- 1. Garantir vínculo auth_uid
UPDATE colaboradores 
SET auth_uid = 'cdefc7c4-0ac1-4f74-9fcb-f074ac0548b7'
WHERE id = 'c79f679a-147a-47c1-9344-83833507adb0';

-- 2. Limpar registros existentes do CARLOS
DELETE FROM registros_ponto 
WHERE colaborador_id = 'c79f679a-147a-47c1-9344-83833507adb0';

-- 3. Inserir registros novos
INSERT INTO registros_ponto (
  colaborador_id, data, entrada_1, saida_1, entrada_2, saida_2, observacoes
) VALUES 
  ('c79f679a-147a-47c1-9344-83833507adb0', '2025-12-10', '08:00:00', '12:00:00', '13:00:00', '17:00:00', 'Dia completo'),
  ('c79f679a-147a-47c1-9344-83833507adb0', '2025-12-09', '08:15:00', '12:15:00', '13:15:00', '17:15:00', 'Dia completo'),
  ('c79f679a-147a-47c1-9344-83833507adb0', '2025-12-08', '08:00:00', '12:00:00', '13:00:00', '17:00:00', 'Dia completo');
```

## 🚀 DEPOIS:

1. **Recarregue a página** do portal funcionário
2. **Clique "PDF (30 dias)"**
3. **DEVE BAIXAR O PDF**

## ✅ RESULTADO ESPERADO:

- PDF com 3 dias de registros
- Tabela formatada com horários
- Cálculos de horas corretos
- Download automático

**EXECUTE AGORA!**