# Migration 10 - Adicionar Parentesco no Contato de Emergência

## Como Executar

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Copie e cole o conteúdo do arquivo `10_add_contato_emergencia_parentesco.sql`
4. Clique em **Run** para executar

## O que esta migration faz

Adiciona a coluna `contato_emergencia_parentesco` na tabela `colaboradores` para armazenar o parentesco do contato de emergência (Pai, Mãe, Cônjuge, Filho(a), Irmão(ã), etc).

## Após executar

Após executar a migration no Supabase, o campo de Parentesco estará disponível no formulário de Contato de Emergência e será exibido corretamente no resumo.
