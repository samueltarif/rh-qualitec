-- =====================================================
-- FIX: Configuração de Importação/Exportação
-- =====================================================
-- Diagnóstico e correção de problemas

-- 1. Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'config_importacao_exportacao'
) as tabela_existe;

-- 2. Verificar registros existentes
SELECT * FROM config_importacao_exportacao;

-- 3. Limpar registros duplicados (se houver)
DELETE FROM config_importacao_exportacao 
WHERE id != '00000000-0000-0000-0000-000000000001';

-- 4. Garantir que existe o registro padrão
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
  10485760, -- 10MB
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

-- 5. Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'config_importacao_exportacao';

-- 6. Recriar políticas se necessário
DROP POLICY IF EXISTS "Todos podem ver configurações" ON config_importacao_exportacao;
DROP POLICY IF EXISTS "Apenas admins podem alterar configurações" ON config_importacao_exportacao;

CREATE POLICY "Todos podem ver configurações" ON config_importacao_exportacao
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Apenas admins podem alterar configurações" ON config_importacao_exportacao
    FOR ALL TO authenticated 
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- 7. Verificar resultado final
SELECT 
  id,
  tamanho_maximo_arquivo,
  tempo_expiracao_exportacao,
  limite_registros_exportacao,
  encoding_padrao,
  delimitador_csv,
  validacao_automatica,
  backup_antes_importacao,
  notificar_conclusao,
  permitir_importacao_paralela,
  created_at,
  updated_at
FROM config_importacao_exportacao;

-- =====================================================
-- FIM DO FIX
-- =====================================================
