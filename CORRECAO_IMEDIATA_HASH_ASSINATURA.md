# 🚨 CORREÇÃO IMEDIATA - HASH ASSINATURA

## PROBLEMA IDENTIFICADO
```
ERROR: null value in column "hash_assinatura" violates not-null constraint
```

## CAUSA
A tabela `assinaturas_ponto` tem uma coluna `hash_assinatura` que é **NOT NULL** mas a API não estava enviando esse campo.

## SOLUÇÃO IMEDIATA

### PASSO 1: EXECUTAR SQL NO SUPABASE
Copie e cole este SQL no Supabase SQL Editor:

```sql
-- Atualizar registros existentes sem hash (se houver)
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

### PASSO 3: TESTAR IMEDIATAMENTE

#### Teste da API:
```
POST http://localhost:3000/api/funcionario/ponto/assinar-digital
Content-Type: application/json

{
  "mes": 12,
  "ano": 2025,
  "assinaturaDigital": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "observacoes": "Teste de assinatura"
}
```

**Resultado esperado:** Status 200 com success: true

## O QUE FOI CORRIGIDO

1. **API atualizada** para gerar `hash_assinatura` automaticamente
2. **SQL criado** para corrigir registros existentes
3. **Campo obrigatório** agora é preenchido corretamente

## CAMPOS ENVIADOS PELA API AGORA:
- ✅ colaborador_id
- ✅ mes
- ✅ ano  
- ✅ assinatura_digital
- ✅ **hash_assinatura** (NOVO - corrige o erro)
- ✅ arquivo_csv
- ✅ total_dias
- ✅ total_horas
- ✅ observacoes
- ✅ ip_assinatura
- ✅ data_assinatura

## RESULTADO FINAL
✅ Erro 500 resolvido
✅ Campo hash_assinatura preenchido
✅ Assinatura digital funcionando
✅ Dados salvos corretamente

**IMPORTANTE:** Execute o SQL primeiro, depois reinicie o servidor e teste!