# 🔥 ATUALIZAR NOMES AGORA - PASSO A PASSO

## ⚠️ IMPORTANTE
Execute estes scripts NA ORDEM para sincronizar os nomes!

---

## 📋 PASSO 1: DIAGNÓSTICO

### Abra o Supabase SQL Editor
https://app.supabase.com → Seu Projeto → SQL Editor

### Cole e Execute:
```sql
-- Copie TODO o conteúdo do arquivo:
nuxt-app/database/DIAGNOSTICO_VINCULOS.sql
```

### O que você vai ver:
- Lista de colaboradores e seus vínculos
- Quais nomes estão diferentes
- Quantos registros existem em cada tabela

---

## 🔧 PASSO 2: ATUALIZAÇÃO FORÇADA

### No mesmo SQL Editor, cole e execute:
```sql
-- Copie TODO o conteúdo do arquivo:
nuxt-app/database/ATUALIZAR_NOMES_AGORA.sql
```

### O que vai acontecer:
1. ✅ Mostra o ANTES (nomes diferentes)
2. 🔄 ATUALIZA todos os nomes
3. ✅ Mostra o DEPOIS (nomes iguais)
4. 🔧 Cria trigger automático para futuras alterações

---

## 🎯 PASSO 3: VERIFICAR NO SISTEMA

1. **Recarregue a página** do sistema (F5)
2. Vá em **Gestão de Usuários**
3. Verifique se os nomes estão atualizados

---

## 🧪 PASSO 4: TESTAR O TRIGGER

1. Vá em **Colaboradores**
2. Edite o nome de um colaborador
3. Salve
4. Vá em **Gestão de Usuários**
5. O nome deve estar atualizado automaticamente!

---

## ❓ SE AINDA NÃO FUNCIONAR

Execute esta query para ver se os IDs estão corretos:

```sql
SELECT 
  c.id as id_colaborador,
  au.id as id_app_user,
  c.nome as nome_colaborador,
  au.nome as nome_usuario,
  CASE 
    WHEN c.id = au.id THEN '✅ IDs IGUAIS'
    ELSE '❌ IDs DIFERENTES'
  END as status_ids
FROM colaboradores c
FULL OUTER JOIN app_users au ON c.id = au.id
ORDER BY c.nome;
```

Se os IDs estiverem diferentes, me avise que vou criar um script para corrigir o vínculo!

---

## 📊 RESULTADO ESPERADO

### Antes:
```
Colaboradores:
- ID: abc123 | Nome: JOÃO SILVA

App_Users:
- ID: abc123 | Nome: João Silva  ❌
```

### Depois:
```
Colaboradores:
- ID: abc123 | Nome: JOÃO SILVA

App_Users:
- ID: abc123 | Nome: JOÃO SILVA  ✅
```

---

## 🎉 PRONTO!

Agora os nomes ficam sempre sincronizados automaticamente!
