# 🔧 CORRIGIR ERRO DE PONTO - EXECUTAR AGORA

## ❌ Erro Atual
```
GET http://localhost:3001/api/ponto?mes=12&ano=2025 500 (Server Error)
```

## ✅ Solução

### 1. Acesse o Supabase Dashboard
- URL: https://supabase.com/dashboard/project/utuxefswedolrninwgvs
- Vá em: **SQL Editor**

### 2. Execute este SQL:

```sql
-- Remover TODAS as políticas antigas
DROP POLICY IF EXISTS "funcionarios_view_own_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "funcionarios_insert_own_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "funcionarios_update_own_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "admins_all_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "service_role_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "users_select_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "users_insert_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "users_update_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "users_delete_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "admins_rh_all_ponto" ON registros_ponto;

-- Criar políticas CORRETAS

-- 1. Admins, RH e Gestores podem fazer TUDO
CREATE POLICY "admins_rh_all_ponto" ON registros_ponto
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth_uid = auth.uid()
      AND role IN ('admin', 'rh', 'gestor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth_uid = auth.uid()
      AND role IN ('admin', 'rh', 'gestor')
    )
  );

-- 2. Funcionários podem VER seus próprios registros
CREATE POLICY "funcionarios_view_own_ponto" ON registros_ponto
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth_uid = auth.uid()
      AND colaborador_id = registros_ponto.colaborador_id
    )
  );

-- 3. Funcionários podem INSERIR seus próprios registros
CREATE POLICY "funcionarios_insert_own_ponto" ON registros_ponto
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth_uid = auth.uid()
      AND colaborador_id = registros_ponto.colaborador_id
    )
  );

-- 4. Service role tem acesso total
CREATE POLICY "service_role_ponto" ON registros_ponto
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. Garantir que RLS está ativo
ALTER TABLE registros_ponto ENABLE ROW LEVEL SECURITY;
```

### 3. Verificar se funcionou:

```sql
-- Ver políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'registros_ponto'
ORDER BY policyname;
```

### 4. Testar no navegador
- Recarregue a página de Ponto
- O erro 500 deve desaparecer

## 📝 O que foi corrigido?

As políticas RLS (Row Level Security) estavam muito restritivas e impedindo que admins acessassem os registros de ponto. Agora:

✅ Admins, RH e Gestores podem ver e gerenciar TODOS os registros
✅ Funcionários podem ver e inserir apenas seus próprios registros
✅ Service role tem acesso total (para APIs)
