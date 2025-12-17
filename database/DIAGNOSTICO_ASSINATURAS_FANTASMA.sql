-- DIAGNÓSTICO: Assinaturas Fantasma
-- Problema: Todos colaboradores aparecem como tendo assinado, mas não há registros na tabela

-- 1. Verificar se a tabela assinaturas_ponto existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'assinaturas_ponto'
) as tabela_existe;

-- 2. Se existe, verificar quantos registros tem
SELECT COUNT(*) as total_assinaturas FROM assinaturas_ponto;

-- 3. Ver estrutura da tabela
\d assinaturas_ponto;

-- 4. Ver todos os registros (se houver)
SELECT * FROM assinaturas_ponto ORDER BY created_at DESC LIMIT 10;

-- 5. Verificar colaboradores que deveriam ter assinatura
SELECT 
  c.id,
  c.nome,
  c.email,
  au.auth_uid,
  COUNT(rp.id) as registros_ponto
FROM colaboradores c
LEFT JOIN app_users au ON au.colaborador_id = c.id
LEFT JOIN registros_ponto rp ON rp.colaborador_id = c.id 
  AND EXTRACT(MONTH FROM rp.data) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND EXTRACT(YEAR FROM rp.data) = EXTRACT(YEAR FROM CURRENT_DATE)
WHERE c.status = 'ativo'
GROUP BY c.id, c.nome, c.email, au.auth_uid
ORDER BY c.nome;

-- 6. Verificar se há alguma view ou função que está retornando dados falsos
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE viewname LIKE '%assinatura%' OR viewname LIKE '%ponto%';

-- 7. Verificar se há triggers que podem estar criando assinaturas automaticamente
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'assinaturas_ponto' OR action_statement LIKE '%assinatura%';