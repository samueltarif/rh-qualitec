-- FIX PARA ASSINATURA DO CARLOS APARECER NO PDF
-- Problema: PDF não mostra assinatura mesmo ela existindo

-- 1. Verificar se a assinatura do Carlos existe
SELECT 
  'Assinatura Carlos' as info,
  ap.*,
  c.nome as colaborador_nome
FROM assinaturas_ponto ap
LEFT JOIN colaboradores c ON ap.colaborador_id = c.id
WHERE c.nome ILIKE '%CARLOS%'
ORDER BY ap.created_at DESC;

-- 2. Verificar se o ID do colaborador está correto no PDF
SELECT 
  'Colaborador Carlos' as info,
  id,
  nome,
  matricula,
  created_at
FROM colaboradores 
WHERE nome ILIKE '%CARLOS%';

-- 3. Verificar assinatura para dezembro/2025 (mês atual)
SELECT 
  'Assinatura Dezembro 2025' as info,
  ap.*
FROM assinaturas_ponto ap
LEFT JOIN colaboradores c ON ap.colaborador_id = c.id
WHERE c.nome ILIKE '%CARLOS%'
  AND ap.mes = 12
  AND ap.ano = 2025;

-- 4. Se não existir assinatura para dezembro, criar uma de teste
INSERT INTO assinaturas_ponto (
  colaborador_id,
  mes,
  ano,
  data_assinatura,
  ip_assinatura,
  user_agent,
  hash_assinatura,
  assinatura_digital,
  arquivo_csv,
  total_dias,
  total_horas,
  observacoes
)
SELECT 
  c.id,
  12, -- dezembro
  2025,
  NOW(),
  '192.168.1.100',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'HASH_CARLOS_DEZEMBRO_2025_' || EXTRACT(EPOCH FROM NOW())::text,
  'Assinatura digital do Carlos para dezembro/2025',
  'carlos_ponto_dezembro_2025.csv',
  20, -- dias trabalhados
  '160:00', -- horas trabalhadas
  'Assinatura gerada automaticamente para teste do PDF'
FROM colaboradores c
WHERE c.nome ILIKE '%CARLOS%'
  AND NOT EXISTS (
    SELECT 1 FROM assinaturas_ponto ap2 
    WHERE ap2.colaborador_id = c.id 
      AND ap2.mes = 12 
      AND ap2.ano = 2025
  );

-- 5. Verificar se foi criada
SELECT 
  'Verificação Final' as info,
  ap.*,
  c.nome as colaborador_nome
FROM assinaturas_ponto ap
LEFT JOIN colaboradores c ON ap.colaborador_id = c.id
WHERE c.nome ILIKE '%CARLOS%'
  AND ap.mes = 12
  AND ap.ano = 2025;