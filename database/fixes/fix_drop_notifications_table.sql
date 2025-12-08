-- SOLUÇÃO DEFINITIVA: Remover tabela notifications problemática
-- Execute este script no Supabase SQL Editor

-- Opção 1: DROP a tabela notifications (RECOMENDADO)
DROP TABLE IF EXISTS notifications CASCADE;

-- Verificar se foi removida
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications')
    THEN 'Tabela notifications ainda existe'
    ELSE 'Tabela notifications removida com sucesso!'
  END as status;
