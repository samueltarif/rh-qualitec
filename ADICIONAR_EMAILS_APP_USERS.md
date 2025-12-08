# 📧 Adicionar Colunas de Email em app_users

## 🎯 Objetivo

Adicionar `email_corporativo` e `email_pessoal` na tabela `app_users` para manter consistência com a tabela `colaboradores`.

## 📋 Estrutura Atual vs Nova

### Antes
```
app_users
├── email  (para login)
└── ...

colaboradores
├── email_corporativo
├── email_pessoal
└── ...
```

### Depois
```
app_users
├── email  (para login)
├── email_corporativo  ← NOVO!
├── email_pessoal      ← NOVO!
└── ...

colaboradores
├── email_corporativo
├── email_pessoal
└── ...
```

## ⚡ Executar Agora

Execute no Supabase SQL Editor:

```sql
-- Adicionar colunas
ALTER TABLE app_users 
ADD COLUMN IF NOT EXISTS email_corporativo VARCHAR(255);

ALTER TABLE app_users 
ADD COLUMN IF NOT EXISTS email_pessoal VARCHAR(255);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_app_users_email_corporativo 
ON app_users(email_corporativo) 
WHERE email_corporativo IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_app_users_email_pessoal 
ON app_users(email_pessoal) 
WHERE email_pessoal IS NOT NULL;

-- Migrar email existente para email_corporativo
UPDATE app_users 
SET email_corporativo = email
WHERE email IS NOT NULL 
AND email_corporativo IS NULL;
```

Ou execute o arquivo: `nuxt-app/database/fixes/fix_add_emails_app_users.sql`

## ✅ Benefícios

1. **Consistência**: Ambas as tabelas têm a mesma estrutura
2. **Flexibilidade**: Usuários podem ter email corporativo e pessoal
3. **Priorização**: Sistema pode priorizar email corporativo
4. **Migração**: Emails existentes são migrados automaticamente

## 🔄 Sincronização Futura

Com essa estrutura, você pode criar triggers para manter os emails sincronizados:

```sql
-- Exemplo: Quando atualizar email em colaboradores, atualizar em app_users
CREATE OR REPLACE FUNCTION sync_emails_to_app_users()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE app_users
  SET 
    email_corporativo = NEW.email_corporativo,
    email_pessoal = NEW.email_pessoal
  WHERE colaborador_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_emails
AFTER UPDATE OF email_corporativo, email_pessoal ON colaboradores
FOR EACH ROW
EXECUTE FUNCTION sync_emails_to_app_users();
```

## 📊 Verificar

Após executar, verifique:

```sql
-- Ver estrutura
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'app_users'
AND column_name LIKE '%email%'
ORDER BY ordinal_position;

-- Ver dados
SELECT 
  id,
  nome,
  email,
  email_corporativo,
  email_pessoal
FROM app_users
LIMIT 5;
```

---

**Status**: ✅ Script pronto para executar!
