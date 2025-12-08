# FIX: Erro de RLS em Solicitações de Alteração

## Problema
Ao tentar alterar dados bancários, aparece o erro:
```
new row violates row-level security policy for table "solicitacoes_alteracao_dados"
```

## Solução Rápida

Execute no Supabase SQL Editor:

```sql
ALTER TABLE solicitacoes_alteracao_dados DISABLE ROW LEVEL SECURITY;
```

Pronto! Isso desabilita o RLS e permite que os funcionários criem solicitações.

## Solução Completa (com RLS)

Se você quiser manter o RLS ativo para segurança, execute:

```sql
-- Remover política antiga
DROP POLICY IF EXISTS "service_role_solic_alt" ON solicitacoes_alteracao_dados;

-- Habilitar RLS
ALTER TABLE solicitacoes_alteracao_dados ENABLE ROW LEVEL SECURITY;

-- Política para service_role (bypass total)
CREATE POLICY "service_role_all" ON solicitacoes_alteracao_dados
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Política para authenticated users poderem inserir
CREATE POLICY "authenticated_insert" ON solicitacoes_alteracao_dados
  FOR INSERT TO authenticated WITH CHECK (true);

-- Política para authenticated users verem suas próprias solicitações
CREATE POLICY "authenticated_select_own" ON solicitacoes_alteracao_dados
  FOR SELECT TO authenticated USING (
    colaborador_id IN (
      SELECT colaborador_id FROM app_users WHERE auth_uid = auth.uid()
    )
  );

-- Política para admins verem tudo
CREATE POLICY "admin_select_all" ON solicitacoes_alteracao_dados
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE auth_uid = auth.uid() 
      AND role IN ('admin', 'gestor')
    )
  );

-- Política para admins atualizarem
CREATE POLICY "admin_update" ON solicitacoes_alteracao_dados
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE auth_uid = auth.uid() 
      AND role IN ('admin', 'gestor')
    )
  );
```

## Recomendação

Para simplificar, use a **Solução Rápida** (desabilitar RLS). O sistema já usa `service_role` nas APIs que faz bypass do RLS de qualquer forma.
