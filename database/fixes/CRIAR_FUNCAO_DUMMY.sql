-- Criar função dummy para substituir fn_criar_notificacao
-- Execute este script no Supabase SQL Editor

-- Criar função vazia que não faz nada
CREATE OR REPLACE FUNCTION fn_criar_notificacao(
  p_user_id UUID,
  p_tipo TEXT,
  p_titulo TEXT,
  p_mensagem TEXT,
  p_link TEXT,
  p_dados_extras JSONB
) RETURNS VOID AS $$
BEGIN
  -- Função vazia - não faz nada
  -- Criada apenas para evitar erro "function does not exist"
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Mensagem de sucesso
SELECT 'Função dummy criada com sucesso! Tente aprovar novamente.' as status;
