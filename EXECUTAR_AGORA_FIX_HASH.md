# 🚨 EXECUTAR AGORA - FIX HASH ASSINATURA

## PROBLEMA
```
ERROR: null value in column "hash_assinatura" violates not-null constraint
```

## SOLUÇÃO IMEDIATA

### PASSO 1: EXECUTAR SQL NO SUPABASE
Copie e cole este SQL no Supabase SQL Editor:

```sql
-- Atualizar registros existentes sem hash
UPDATE assinaturas_ponto 
SET hash_assinatura = encode(sha256(
    (colaborador_id::text || '-' || mes::text || '-' || ano::text || '-' || 
     COALESCE(assinatura_digital, 'sem-assinatura') || '-' || 
     COALESCE(data_assinatura::text, created_at::text))::bytea
), 'hex')
WHERE hash_assinatura IS NULL;

-- Verificar se foi corrigido
SELECT 
    COUNT(*) as total_registros,
    COUNT(hash_assinatura) as com_hash,
    COUNT(*) - COUNT(hash_assinatura) as sem_hash
FROM assinaturas_ponto;
```

### PASSO 2: REINICIAR SERVIDOR
```bash
# Parar servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

### PASSO 3: TESTAR ASSINATURA DIGITAL
Agora a API deve funcionar sem erro 500.

## RESULTADO ESPERADO
✅ Erro 500 resolvido
✅ Campo hash_assinatura preenchido
✅ Assinatura digital funcionando

**EXECUTE O SQL PRIMEIRO, DEPOIS REINICIE O SERVIDOR!**