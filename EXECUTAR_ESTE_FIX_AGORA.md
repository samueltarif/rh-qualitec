# ⚡ EXECUTAR ESTE FIX AGORA

## 🎯 Problemas Identificados

1. ❌ Constraint `chk_admin_email` impedindo insert/update
2. ❌ RLS da tabela `holerites` está **DESABILITADO** (false)

## ✅ Solução (Execute no Supabase SQL Editor)

### Copie e cole este script completo:

```sql
-- 1. Remover constraint problemática
ALTER TABLE app_users DROP CONSTRAINT IF EXISTS chk_admin_email;

-- 2. Atualizar seu usuário para admin
UPDATE app_users
SET 
  role = 'admin',
  ativo = true
WHERE auth_uid = auth.uid();

-- 3. Habilitar RLS na tabela holerites
ALTER TABLE holerites ENABLE ROW LEVEL SECURITY;

-- 4. Recriar política admin
DROP POLICY IF EXISTS "admin_all_holerites" ON holerites;

CREATE POLICY "admin_all_holerites"
  ON holerites
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.auth_uid = auth.uid()
      AND app_users.role = 'admin'
      AND app_users.ativo = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.auth_uid = auth.uid()
      AND app_users.role = 'admin'
      AND app_users.ativo = true
    )
  );

-- 5. Confirmar
SELECT 
  'Seu usuário:' as info,
  email,
  role,
  ativo
FROM app_users 
WHERE auth_uid = auth.uid();

SELECT 
  'RLS Holerites:' as info,
  CASE WHEN rowsecurity THEN 'HABILITADO ✅' ELSE 'DESABILITADO ❌' END as status
FROM pg_tables 
WHERE tablename = 'holerites';
```

## 📋 Resultado Esperado

Você deve ver:

**Tabela 1:**
| info | email | role | ativo |
|------|-------|------|-------|
| Seu usuário: | admin@qualitec.com | admin | true |

**Tabela 2:**
| info | status |
|------|--------|
| RLS Holerites: | HABILITADO ✅ |

## 🔄 Após Executar

1. **Faça logout** do sistema
2. **Faça login** novamente
3. **Tente gerar holerites**
4. **Verifique os logs** no terminal do servidor

Você deve ver:
```
🔍 Verificando usuário: [seu-auth-uid]
👤 Dados do usuário: { id: '...', role: 'admin', email: 'admin@qualitec.com' }
✅ Usuário autorizado: admin@qualitec.com
```

## ✅ Deve Funcionar!

O erro 403 deve desaparecer e os holerites serão gerados com sucesso.

---

**Tempo:** 1 minuto
**Dificuldade:** Fácil
