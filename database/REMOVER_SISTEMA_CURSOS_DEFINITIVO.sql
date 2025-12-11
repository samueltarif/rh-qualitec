-- ============================================
-- SCRIPT PARA REMOVER SISTEMA DE CURSOS DEFINITIVO
-- ============================================
-- Este script remove COMPLETAMENTE todas as tabelas, políticas RLS, 
-- funções, triggers e dados relacionados ao sistema de cursos

-- ⚠️  ATENÇÃO: Este script é IRREVERSÍVEL!
-- ⚠️  Faça backup antes de executar se necessário
-- ⚠️  Todas as tabelas e dados de cursos serão perdidos permanentemente

BEGIN;

-- ============================================
-- 1. DESABILITAR RLS TEMPORARIAMENTE
-- ============================================
ALTER TABLE IF EXISTS categorias_cursos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cursos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS materiais_curso DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS progresso_cursos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS progresso_materiais DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS avaliacoes_curso DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS questoes_avaliacao DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS respostas_avaliacao DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tentativas_avaliacao DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS comentarios_curso DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS favoritos_curso DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. REMOVER TODAS AS POLÍTICAS RLS
-- ============================================

-- Políticas de categorias_cursos
DROP POLICY IF EXISTS "Todos podem ver categorias ativas" ON categorias_cursos;
DROP POLICY IF EXISTS "Admins acesso total categorias" ON categorias_cursos;
DROP POLICY IF EXISTS "Admin pode gerenciar categorias" ON categorias_cursos;
DROP POLICY IF EXISTS "Todos podem ver categorias" ON categorias_cursos;

-- Políticas de cursos
DROP POLICY IF EXISTS "Todos podem ver cursos ativos" ON cursos;
DROP POLICY IF EXISTS "Admins acesso total cursos" ON cursos;
DROP POLICY IF EXISTS "Admin pode gerenciar cursos" ON cursos;
DROP POLICY IF EXISTS "Funcionários podem ver cursos ativos" ON cursos;

-- Políticas de materiais_curso
DROP POLICY IF EXISTS "Todos podem ver materiais" ON materiais_curso;
DROP POLICY IF EXISTS "Admins acesso total materiais" ON materiais_curso;
DROP POLICY IF EXISTS "Admin pode gerenciar materiais" ON materiais_curso;
DROP POLICY IF EXISTS "Funcionários podem ver materiais de cursos atribuídos" ON materiais_curso;

-- Políticas de progresso_cursos
DROP POLICY IF EXISTS "Funcionários veem seu progresso" ON progresso_cursos;
DROP POLICY IF EXISTS "Funcionários atualizam progresso" ON progresso_cursos;
DROP POLICY IF EXISTS "Admins veem todo progresso" ON progresso_cursos;
DROP POLICY IF EXISTS "Admin total acesso progresso_cursos" ON progresso_cursos;
DROP POLICY IF EXISTS "Funcionário vê próprio progresso" ON progresso_cursos;
DROP POLICY IF EXISTS "Funcionário atualiza próprio progresso" ON progresso_cursos;
DROP POLICY IF EXISTS "Funcionários podem ver seu próprio progresso" ON progresso_cursos;
DROP POLICY IF EXISTS "Admin pode gerenciar progresso de cursos" ON progresso_cursos;
DROP POLICY IF EXISTS "Funcionários podem atualizar seu progresso" ON progresso_cursos;

-- Políticas de progresso_materiais
DROP POLICY IF EXISTS "Funcionários veem progresso materiais" ON progresso_materiais;

-- Políticas de avaliacoes_curso
DROP POLICY IF EXISTS "Todos veem avaliações" ON avaliacoes_curso;

-- Políticas de questoes_avaliacao
DROP POLICY IF EXISTS "Todos veem questões" ON questoes_avaliacao;

-- Políticas de respostas_avaliacao
DROP POLICY IF EXISTS "Funcionários gerenciam respostas" ON respostas_avaliacao;

-- Políticas de tentativas_avaliacao
DROP POLICY IF EXISTS "Funcionários gerenciam tentativas" ON tentativas_avaliacao;

-- Políticas de comentarios_curso
DROP POLICY IF EXISTS "Funcionários comentam" ON comentarios_curso;
DROP POLICY IF EXISTS "Todos veem comentários" ON comentarios_curso;
DROP POLICY IF EXISTS "Admins respondem comentários" ON comentarios_curso;

-- Políticas de favoritos_curso
DROP POLICY IF EXISTS "Funcionários gerenciam favoritos" ON favoritos_curso;

-- ============================================
-- 3. REMOVER TRIGGERS E FUNÇÕES
-- ============================================

-- Remover triggers relacionados a cursos
DROP TRIGGER IF EXISTS trigger_update_categorias_cursos ON categorias_cursos;
DROP TRIGGER IF EXISTS trigger_update_cursos ON cursos;
DROP TRIGGER IF EXISTS trigger_update_materiais ON materiais_curso;
DROP TRIGGER IF EXISTS trigger_update_progresso ON progresso_cursos;
DROP TRIGGER IF EXISTS trigger_atualizar_progresso_curso ON progresso_cursos;
DROP TRIGGER IF EXISTS trigger_notificar_curso_concluido ON progresso_cursos;
DROP TRIGGER IF EXISTS trigger_log_atividade_cursos ON cursos;

-- Remover funções relacionadas a cursos
DROP FUNCTION IF EXISTS update_cursos_updated_at() CASCADE;
DROP FUNCTION IF EXISTS atualizar_progresso_curso() CASCADE;
DROP FUNCTION IF EXISTS notificar_curso_concluido() CASCADE;
DROP FUNCTION IF EXISTS calcular_progresso_geral_curso(uuid, uuid) CASCADE;

-- ============================================
-- 4. REMOVER TABELAS (em ordem de dependência)
-- ============================================

-- 4.1 Remover tabelas dependentes primeiro
DROP TABLE IF EXISTS respostas_avaliacao CASCADE;
DROP TABLE IF EXISTS tentativas_avaliacao CASCADE;
DROP TABLE IF EXISTS questoes_avaliacao CASCADE;
DROP TABLE IF EXISTS avaliacoes_curso CASCADE;
DROP TABLE IF EXISTS comentarios_curso CASCADE;
DROP TABLE IF EXISTS favoritos_curso CASCADE;
DROP TABLE IF EXISTS progresso_materiais CASCADE;
DROP TABLE IF EXISTS progresso_cursos CASCADE;
DROP TABLE IF EXISTS materiais_curso CASCADE;

-- 4.2 Remover tabela principal de cursos
DROP TABLE IF EXISTS cursos CASCADE;

-- 4.3 Remover tabela de categorias
DROP TABLE IF EXISTS categorias_cursos CASCADE;

-- ============================================
-- 5. REMOVER TIPOS ENUM RELACIONADOS
-- ============================================

-- Remover enums de cursos (se existirem)
DROP TYPE IF EXISTS tipo_curso CASCADE;
DROP TYPE IF EXISTS modalidade_curso CASCADE;
DROP TYPE IF EXISTS status_progresso_curso CASCADE;
DROP TYPE IF EXISTS tipo_material_curso CASCADE;
DROP TYPE IF EXISTS nivel_curso CASCADE;
DROP TYPE IF EXISTS status_curso CASCADE;
DROP TYPE IF EXISTS tipo_avaliacao CASCADE;

-- ============================================
-- 6. REMOVER ÍNDICES ESPECÍFICOS DE CURSOS
-- ============================================

-- Remover índices que podem ter sobrado
DROP INDEX IF EXISTS idx_cursos_categoria;
DROP INDEX IF EXISTS idx_cursos_ativo;
DROP INDEX IF EXISTS idx_materiais_curso;
DROP INDEX IF EXISTS idx_progresso_colaborador;
DROP INDEX IF EXISTS idx_progresso_curso;
DROP INDEX IF EXISTS idx_progresso_status;
DROP INDEX IF EXISTS idx_comentarios_curso;
DROP INDEX IF EXISTS idx_favoritos_colaborador;
DROP INDEX IF EXISTS idx_cursos_categoria_id;
DROP INDEX IF EXISTS idx_materiais_curso_id;
DROP INDEX IF EXISTS idx_progresso_cursos_colaborador;
DROP INDEX IF EXISTS idx_progresso_cursos_status;
DROP INDEX IF EXISTS idx_materiais_curso_ordem;
DROP INDEX IF EXISTS idx_materiais_curso_obrigatorio;
DROP INDEX IF EXISTS idx_avaliacoes_curso_id;
DROP INDEX IF EXISTS idx_questoes_avaliacao_id;
DROP INDEX IF EXISTS idx_respostas_colaborador;
DROP INDEX IF EXISTS idx_tentativas_colaborador;

-- ============================================
-- 7. LIMPAR DADOS RELACIONADOS EM OUTRAS TABELAS
-- ============================================

-- Remover notificações relacionadas a cursos
DELETE FROM notificacoes 
WHERE tipo IN (
  'curso_atribuido', 
  'curso_concluido', 
  'curso_vencendo', 
  'material_disponivel',
  'avaliacao_disponivel',
  'certificado_emitido'
)
OR titulo ILIKE '%curso%'
OR conteudo ILIKE '%curso%'
OR conteudo ILIKE '%treinamento%';

-- Remover logs de atividades relacionados a cursos
DELETE FROM log_atividades 
WHERE acao IN (
  'criar_curso', 
  'editar_curso', 
  'excluir_curso', 
  'atribuir_curso', 
  'concluir_curso',
  'iniciar_curso',
  'pausar_curso',
  'reprovar_avaliacao',
  'aprovar_avaliacao'
)
OR descricao ILIKE '%curso%'
OR descricao ILIKE '%treinamento%'
OR descricao ILIKE '%material%'
OR descricao ILIKE '%avaliação%';

-- Remover alertas relacionados a cursos
DELETE FROM alertas 
WHERE tipo IN (
  'curso_vencendo', 
  'curso_nao_iniciado', 
  'baixa_conclusao_cursos',
  'avaliacao_pendente',
  'certificado_vencendo'
)
OR titulo ILIKE '%curso%'
OR titulo ILIKE '%treinamento%'
OR mensagem ILIKE '%curso%'
OR mensagem ILIKE '%treinamento%';

-- Remover configurações relacionadas a cursos (se existirem)
DELETE FROM configuracoes 
WHERE chave ILIKE '%curso%'
OR chave ILIKE '%treinamento%'
OR chave ILIKE '%ead%'
OR chave ILIKE '%certificado%';

-- Remover templates de email relacionados a cursos
DELETE FROM email_templates 
WHERE nome ILIKE '%curso%'
OR nome ILIKE '%treinamento%'
OR nome ILIKE '%certificado%'
OR assunto ILIKE '%curso%'
OR assunto ILIKE '%treinamento%'
OR corpo ILIKE '%curso%'
OR corpo ILIKE '%treinamento%';

-- Remover relatórios relacionados a cursos
DELETE FROM relatorios_personalizados 
WHERE nome ILIKE '%curso%'
OR nome ILIKE '%treinamento%'
OR descricao ILIKE '%curso%'
OR descricao ILIKE '%treinamento%';

-- ============================================
-- 8. LIMPAR CAMPOS RELACIONADOS EM COLABORADORES
-- ============================================

-- Remover campos de cursos em colaboradores (se existirem)
-- Nota: Apenas se houver campos específicos de cursos na tabela colaboradores

-- ============================================
-- 9. VERIFICAÇÃO FINAL
-- ============================================

-- Verificar se as tabelas foram removidas
SELECT 'VERIFICAÇÃO: Tabelas de cursos removidas' as status;

SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (
  table_name ILIKE '%curso%' 
  OR table_name ILIKE '%avaliacao%'
  OR table_name ILIKE '%material%'
  OR table_name ILIKE '%progresso%'
  OR table_name ILIKE '%favorito%'
  OR table_name ILIKE '%comentario%'
  OR table_name ILIKE '%questao%'
  OR table_name ILIKE '%resposta%'
  OR table_name ILIKE '%tentativa%'
);

-- Verificar se os tipos foram removidos
SELECT typname 
FROM pg_type 
WHERE typname ILIKE '%curso%'
OR typname ILIKE '%avaliacao%'
OR typname ILIKE '%material%';

-- Verificar se as funções foram removidas
SELECT proname, prosrc
FROM pg_proc 
WHERE proname ILIKE '%curso%'
OR prosrc ILIKE '%curso%';

-- Verificar se os índices foram removidos
SELECT indexname, tablename
FROM pg_indexes 
WHERE indexname ILIKE '%curso%'
OR indexname ILIKE '%material%'
OR indexname ILIKE '%progresso%'
OR indexname ILIKE '%avaliacao%';

-- Verificar políticas RLS restantes
SELECT schemaname, tablename, policyname
FROM pg_policies 
WHERE policyname ILIKE '%curso%'
OR policyname ILIKE '%material%'
OR policyname ILIKE '%progresso%';

-- ============================================
-- 10. LIMPEZA DE STORAGE (INSTRUÇÕES)
-- ============================================

-- NOTA: Se você configurou o Supabase Storage para cursos,
-- também deve limpar os buckets manualmente:
-- 
-- 1. Acesse o painel do Supabase
-- 2. Vá em Storage
-- 3. Delete os buckets:
--    - 'cursos'
--    - 'materiais-curso' 
--    - 'certificados'
--    - 'thumbnails-curso'
-- 4. Delete todos os arquivos relacionados

-- ============================================
-- 11. LIMPEZA DE PERMISSÕES E ROLES
-- ============================================

-- Remover permissões específicas de cursos (se existirem)
-- REVOKE ALL ON ALL TABLES IN SCHEMA cursos FROM funcionario_role;
-- DROP SCHEMA IF EXISTS cursos CASCADE;

-- ============================================
-- FINALIZAÇÃO
-- ============================================

SELECT '✅ SISTEMA DE CURSOS REMOVIDO COMPLETAMENTE!' as resultado;
SELECT '⚠️  Lembre-se de limpar o Storage manualmente se configurado' as aviso_storage;
SELECT '📝 APIs e componentes já foram removidos do código' as lembrete_codigo;
SELECT '🔄 Reinicie o servidor da aplicação após executar este script' as aviso_servidor;

-- Mostrar estatísticas finais
SELECT 
  'Tabelas removidas: ' || COUNT(*) as estatistica
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name ILIKE '%curso%';

COMMIT;

-- ============================================
-- ROLLBACK EM CASO DE ERRO
-- ============================================
-- Se algo der errado durante a execução, execute:
-- ROLLBACK;

-- ============================================
-- VERIFICAÇÃO PÓS-EXECUÇÃO
-- ============================================
-- Após executar este script, verifique:
-- 1. Não há mais tabelas relacionadas a cursos
-- 2. Não há mais políticas RLS de cursos
-- 3. Não há mais funções ou triggers de cursos
-- 4. Storage foi limpo manualmente
-- 5. Aplicação funciona sem erros 404

-- ============================================
-- BACKUP DE SEGURANÇA (OPCIONAL)
-- ============================================
-- Se quiser fazer backup antes de executar:
-- 
-- pg_dump -h seu-host -U seu-usuario -d seu-banco \
--   -t categorias_cursos \
--   -t cursos \
--   -t materiais_curso \
--   -t progresso_cursos \
--   -t progresso_materiais \
--   -t avaliacoes_curso \
--   -t questoes_avaliacao \
--   -t respostas_avaliacao \
--   -t tentativas_avaliacao \
--   -t comentarios_curso \
--   -t favoritos_curso \
--   > backup_sistema_cursos.sql