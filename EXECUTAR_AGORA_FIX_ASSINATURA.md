# CORREÇÃO IMEDIATA - ENDPOINT ASSINATURA PONTO

## PROBLEMA
- Erro 401 no endpoint `/api/funcionario/ponto/assinatura`
- Endpoint não estava usando autenticação correta do Supabase

## SOLUÇÃO APLICADA
✅ Corrigido endpoint para usar `serverSupabaseClient` e `serverSupabaseUser`
✅ Corrigido campo de `funcionario_id` para `colaborador_id` 
✅ Adicionados logs para debug

## EXECUTAR AGORA

### 1. Verificar se tabela existe
```sql
-- Copie e execute no Supabase SQL Editor:
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_name = 'assinaturas_ponto';
```

### 2. Se tabela não existir, criar:
```sql
-- Copie e execute no Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS assinaturas_ponto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  ano INTEGER NOT NULL CHECK (ano >= 2020 AND ano <= 2100),
  data_assinatura TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_assinatura VARCHAR(45),
  user_agent TEXT,
  hash_assinatura TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(colaborador_id, mes, ano)
);

CREATE INDEX IF NOT EXISTS idx_assinaturas_ponto_colaborador ON assinaturas_ponto(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_ponto_mes_ano ON assinaturas_ponto(mes, ano);
CREATE INDEX IF NOT EXISTS idx_assinaturas_ponto_data ON assinaturas_ponto(data_assinatura DESC);
```

### 3. Testar agora
- Acesse o perfil do Lucas novamente
- Clique na aba "Ponto"
- O erro 401 deve ter sido resolvido

## RESULTADO ESPERADO
- ✅ Endpoint funcionando sem erro 401
- ✅ Logs aparecendo no terminal
- ✅ Dados de assinatura carregando (mesmo que null)