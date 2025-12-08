-- ============================================================================
-- INSERIR REGISTROS DE PONTO PARA SAMUEL
-- Execute no Supabase SQL Editor
-- ============================================================================

-- 1️⃣ PRIMEIRO: Verificar se o colaborador existe
SELECT id, nome FROM colaboradores 
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38';

-- 2️⃣ PEGAR O empresa_id
SELECT id as empresa_id FROM empresas LIMIT 1;

-- 3️⃣ INSERIR REGISTROS DE PONTO PARA DEZEMBRO 2024
-- (Ajuste as datas conforme necessário)

INSERT INTO registros_ponto (
  empresa_id, 
  colaborador_id, 
  data, 
  entrada_1, 
  saida_1, 
  entrada_2, 
  saida_2, 
  status
)
VALUES
  -- Semana 1 de Dezembro
  ((SELECT id FROM empresas LIMIT 1), '84165a85-616f-4709-9069-54cfd46d6a38', '2024-12-02', '08:00', '12:00', '13:00', '17:00', 'Normal'),
  ((SELECT id FROM empresas LIMIT 1), '84165a85-616f-4709-9069-54cfd46d6a38', '2024-12-03', '08:05', '12:00', '13:00', '17:10', 'Normal'),
  ((SELECT id FROM empresas LIMIT 1), '84165a85-616f-4709-9069-54cfd46d6a38', '2024-12-04', '07:55', '12:00', '13:00', '17:00', 'Normal')
ON CONFLICT (colaborador_id, data) DO UPDATE SET
  entrada_1 = EXCLUDED.entrada_1,
  saida_1 = EXCLUDED.saida_1,
  entrada_2 = EXCLUDED.entrada_2,
  saida_2 = EXCLUDED.saida_2,
  status = EXCLUDED.status;

-- 4️⃣ VERIFICAR SE INSERIU
SELECT * FROM registros_ponto 
WHERE colaborador_id = '84165a85-616f-4709-9069-54cfd46d6a38'
ORDER BY data DESC;

-- ============================================================================
-- PRONTO! Agora acesse o portal do funcionário e veja a aba "Meu Ponto"
-- Selecione Dezembro/2024 e clique em Buscar
-- ============================================================================
