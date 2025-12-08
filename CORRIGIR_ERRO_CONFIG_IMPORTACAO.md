# 🔧 Corrigir Erro de Configuração - Importação/Exportação

## 🔴 Problema

Erro 500 ao tentar salvar configurações, mesmo após executar a migration 22.

## ✅ Solução Rápida

### 1. Execute o SQL de Diagnóstico e Correção

Acesse o Supabase SQL Editor e execute:

```sql
-- Arquivo: database/fixes/fix_config_importacao_exportacao.sql
```

Ou copie e cole este SQL:

```sql
-- Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'config_importacao_exportacao'
) as tabela_existe;

-- Limpar registros duplicados
DELETE FROM config_importacao_exportacao 
WHERE id != '00000000-0000-0000-0000-000000000001';

-- Garantir registro padrão
INSERT INTO config_importacao_exportacao (
  id,
  tamanho_maximo_arquivo,
  formatos_permitidos,
  validacao_automatica,
  backup_antes_importacao,
  notificar_conclusao,
  tempo_expiracao_exportacao,
  limite_registros_exportacao,
  permitir_importacao_paralela,
  encoding_padrao,
  delimitador_csv
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  10485760,
  '["csv", "xlsx", "json"]'::jsonb,
  true,
  true,
  true,
  24,
  50000,
  false,
  'UTF-8',
  ','
)
ON CONFLICT (id) DO NOTHING;

-- Verificar resultado
SELECT * FROM config_importacao_exportacao;
```

### 2. Recarregue a Página

Após executar o SQL, recarregue a página de Importação/Exportação.

### 3. Teste Novamente

Tente salvar as configurações novamente.

## 🔍 Possíveis Causas

1. **Registro padrão não foi criado** - O INSERT na migration pode ter falhado
2. **Políticas RLS muito restritivas** - Usuário não tem permissão
3. **Registros duplicados** - Múltiplos registros causando conflito
4. **Formato de dados incorreto** - JSONB ou outros campos com problema

## 🆘 Se Ainda Não Funcionar

Execute este SQL para ver o erro exato:

```sql
-- Ver logs de erro
SELECT * FROM pg_stat_statements 
WHERE query LIKE '%config_importacao_exportacao%' 
ORDER BY calls DESC 
LIMIT 10;

-- Verificar permissões
SELECT 
  grantee, 
  privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name='config_importacao_exportacao';

-- Testar insert manual
INSERT INTO config_importacao_exportacao (
  id,
  tamanho_maximo_arquivo,
  tempo_expiracao_exportacao,
  limite_registros_exportacao,
  encoding_padrao,
  delimitador_csv
) VALUES (
  gen_random_uuid(),
  10485760,
  24,
  50000,
  'UTF-8',
  ','
);
```

## 📞 Informações para Debug

Se precisar de ajuda, forneça:
1. Resultado de: `SELECT * FROM config_importacao_exportacao;`
2. Resultado de: `SELECT COUNT(*) FROM config_importacao_exportacao;`
3. Mensagem de erro completa do console do navegador
4. Logs do servidor Nuxt

---

**Arquivo de Fix**: `database/fixes/fix_config_importacao_exportacao.sql`  
**Prioridade**: 🔴 Alta
