# ⚡ EXECUTAR AGORA - Migration Políticas

## 🚨 AÇÃO NECESSÁRIA

Você precisa executar a migration no Supabase antes de usar o sistema.

## 📋 Passo a Passo RÁPIDO

### 1️⃣ Acesse o Supabase
https://supabase.com/dashboard

### 2️⃣ Abra o SQL Editor
Menu lateral → **SQL Editor**

### 3️⃣ Copie o Script
Abra o arquivo: `database/migrations/21_politicas_compliance.sql`

**OU** copie daqui:

```sql
-- Cole TODO o conteúdo do arquivo 21_politicas_compliance.sql aqui
```

### 4️⃣ Execute
Clique em **RUN** ou pressione `Ctrl + Enter`

### 5️⃣ Aguarde
Vai criar 7 tabelas + índices + 3 políticas padrão

### 6️⃣ Verifique
Execute este comando para confirmar:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'politicas%'
ORDER BY table_name;
```

Deve retornar 7 tabelas.

### 7️⃣ Atualize a Página
Volte ao sistema e recarregue a página de Políticas e Compliance.

## ✅ Pronto!

Agora você pode usar o sistema normalmente.

---

## 🆘 Se der erro

Execute este comando para limpar e tentar novamente:

```sql
DROP TABLE IF EXISTS politicas_treinamentos_participantes CASCADE;
DROP TABLE IF EXISTS politicas_treinamentos CASCADE;
DROP TABLE IF EXISTS politicas_incidentes CASCADE;
DROP TABLE IF EXISTS politicas_auditorias CASCADE;
DROP TABLE IF EXISTS politicas_historico CASCADE;
DROP TABLE IF EXISTS politicas_aceites CASCADE;
DROP TABLE IF EXISTS politicas_compliance CASCADE;
```

Depois execute a migration novamente.
