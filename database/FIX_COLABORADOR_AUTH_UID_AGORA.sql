-- CORRIGIR VÍNCULO AUTH_UID DO COLABORADOR

-- 1. Verificar usuário atual logado
SELECT 
  au.id as auth_id,
  au.email as auth_email,
  c.id as colaborador_id,
  c.nome,
  c.email_corporativo,
  c.auth_uid
FROM auth.users au
LEFT JOIN colaboradores c ON (c.auth_uid = au.id OR c.email_corporativo = au.email)
WHERE au.email = 'samuel@qualitec.com.br';

-- 2. Se o colaborador existe mas não tem auth_uid, vincular
UPDATE colaboradores 
SET auth_uid = (
  SELECT id FROM auth.users WHERE email = 'samuel@qualitec.com.br'
)
WHERE email_corporativo = 'samuel@qualitec.com.br' 
AND auth_uid IS NULL;

-- 3. Verificar se o vínculo foi criado
SELECT 
  c.id,
  c.nome,
  c.email_corporativo,
  c.auth_uid,
  au.email as auth_email
FROM colaboradores c
LEFT JOIN auth.users au ON au.id = c.auth_uid
WHERE c.email_corporativo = 'samuel@qualitec.com.br';

-- 4. Se ainda não funcionar, criar o vínculo forçado
UPDATE colaboradores 
SET auth_uid = 'cdefc7c4-0ac1-4f74-9fcb-f074ac0548b7'
WHERE id = 'c79f679a-147a-47c1-9344-83833507adb0';

-- 5. Verificação final
SELECT 
  'COLABORADOR ENCONTRADO' as status,
  c.id,
  c.nome,
  c.auth_uid
FROM colaboradores c
WHERE c.auth_uid = 'cdefc7c4-0ac1-4f74-9fcb-f074ac0548b7';