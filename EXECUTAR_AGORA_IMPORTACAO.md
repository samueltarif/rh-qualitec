# 🚀 EXECUTAR AGORA - Sistema de Importação/Exportação

## ⚡ AÇÃO RÁPIDA

### 1️⃣ Executar SQL no Supabase (2 minutos)

Acesse: https://supabase.com/dashboard/project/SEU_PROJECT_ID/sql

Copie e cole TODO o conteúdo de:
```
nuxt-app/database/migrations/22_importacao_exportacao.sql
```

Clique em **RUN** ▶️

### 2️⃣ Verificar se funcionou

Execute esta query:
```sql
SELECT COUNT(*) as total FROM templates_importacao;
```

Deve retornar: **4** (quatro templates padrão)

### 3️⃣ Acessar Interface

No sistema, vá em:
```
Configurações > Importação/Exportação
```

## ✅ Pronto!

Agora você pode:
- ✅ Importar colaboradores em lote
- ✅ Exportar relatórios
- ✅ Gerenciar templates
- ✅ Configurar parâmetros

## 📖 Documentação Completa

Leia: `SISTEMA_IMPORTACAO_EXPORTACAO.md`

---

**Tempo total**: ~3 minutos  
**Dificuldade**: Fácil 🟢
