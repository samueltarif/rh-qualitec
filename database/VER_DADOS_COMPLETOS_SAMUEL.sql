-- ============================================================================
-- VER TODOS OS DADOS DO SAMUEL
-- Execute no Supabase SQL Editor
-- ============================================================================

-- 1️⃣ DADOS NA TABELA APP_USERS (dados do sistema)
-- Esta é a tabela principal com nome, role, etc.
SELECT 
  id,
  email,
  nome,
  role,
  colaborador_id,
  ativo,
  created_at
FROM app_users
WHERE email LIKE '%samuel%' OR email LIKE '%vendas2%';

-- 2️⃣ DADOS DO COLABORADOR (dados de RH)
-- Aqui estão os dados completos de RH
SELECT 
  id,
  nome,
  email_corporativo,
  cpf,
  matricula,
  cargo,
  departamento,
  data_admissao,
  status
FROM colaboradores
WHERE nome LIKE '%SAMUEL%' OR email_corporativo LIKE '%vendas2%';

-- 3️⃣ VISÃO COMPLETA - JUNTANDO TUDO
-- Mostra o vínculo entre app_users e colaboradores
SELECT 
  au.email as "Email Login",
  au.nome as "Nome no Sistema",
  au.role as "Perfil",
  au.colaborador_id as "ID Vínculo",
  c.id as "ID Colaborador Real",
  c.nome as "Nome RH",
  c.email_corporativo as "Email Corporativo",
  c.cpf as "CPF",
  c.matricula as "Matrícula",
  c.cargo as "Cargo",
  c.departamento as "Departamento",
  CASE 
    WHEN au.colaborador_id = c.id THEN '✅ CORRETO'
    WHEN au.colaborador_id IS NULL THEN '❌ SEM VÍNCULO'
    ELSE '⚠️ VÍNCULO ERRADO'
  END as "Status Vínculo"
FROM app_users au
LEFT JOIN colaboradores c ON au.colaborador_id = c.id
WHERE au.email LIKE '%samuel%' OR au.email LIKE '%vendas2%'
   OR c.nome LIKE '%SAMUEL%' OR c.email_corporativo LIKE '%vendas2%';

-- ============================================================================
-- ONDE ENCONTRAR NO SUPABASE:
-- ============================================================================
-- 
-- 📍 Authentication > Users
--    └─ Só mostra: email e metadata básico
--    └─ Serve apenas para login/senha
--
-- 📍 Table Editor > app_users  
--    └─ Mostra: id, email, nome, role, colaborador_id
--    └─ Esta é a tabela do SISTEMA
--
-- 📍 Table Editor > colaboradores
--    └─ Mostra: todos os dados de RH (CPF, matrícula, cargo, etc)
--    └─ Esta é a tabela de RECURSOS HUMANOS
--
-- 🔗 O campo "colaborador_id" em app_users faz o vínculo entre as duas
-- ============================================================================
