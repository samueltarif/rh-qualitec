# 🚀 EXECUTAR MIGRATION 18 - AGORA!

## ⚠️ Problema Resolvido

O erro que você teve:
```
ERROR: cannot change name of view column "departamento_nome" to "pis_pasep"
```

Foi causado porque já existia uma view `vw_colaboradores_completo` com estrutura diferente.

**✅ JÁ CORRIGI!** A migration agora dropa a view antiga antes de criar a nova.

## 📋 Como Executar (ATUALIZADO)

### Opção 1: Executar a Migration Completa (RECOMENDADO)

1. **Acesse o Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/SEU_PROJECT_ID/sql/new
   ```

2. **Copie TODO o conteúdo do arquivo:**
   ```
   nuxt-app/database/migrations/18_personalizacao_campos_customizados.sql
   ```
   (O arquivo já foi atualizado com o DROP da view no início)

3. **Cole no SQL Editor e Execute**

4. **Verifique o resultado:**
   ```
   ✅ Sistema de Campos Customizados criado!
   📋 Tabelas: campos_customizados, valores_campos_customizados
   📝 33 campos customizados iniciais criados para colaboradores
   💡 Use a página de Campos Customizados para gerenciar
   ```

### Opção 2: Executar em 2 Passos (Se ainda der erro)

**Passo 1 - Dropar a view:**
```sql
DROP VIEW IF EXISTS vw_colaboradores_completo CASCADE;
```

**Passo 2 - Executar a migration completa:**
Cole todo o conteúdo de `18_personalizacao_campos_customizados.sql`

## ✅ O que será criado:

1. **Tabelas:**
   - `campos_customizados` - Define campos extras
   - `valores_campos_customizados` - Armazena valores

2. **33 Campos Pré-configurados:**
   - Dados pessoais (nome social, gênero, etc)
   - Documentação (CNH, título eleitor, etc)
   - Formação (escolaridade, curso, etc)
   - Saúde (tipo sanguíneo, alergias, etc)
   - Benefícios (vale transporte, refeição, etc)

3. **Funções e Views:**
   - `get_campos_customizados()` - Buscar campos
   - `get_valores_campos_customizados()` - Buscar valores
   - `vw_colaboradores_completo` - View com campos customizados

4. **Segurança (RLS)** configurada

## 🎯 Depois de Executar:

Acesse no sistema:
```
Painel Admin → Configurações → Campos Customizados
```

## 🆘 Se ainda der erro:

Execute este comando primeiro para limpar tudo:
```sql
-- Limpar tudo relacionado a campos customizados
DROP VIEW IF EXISTS vw_colaboradores_completo CASCADE;
DROP TABLE IF EXISTS valores_campos_customizados CASCADE;
DROP TABLE IF EXISTS campos_customizados CASCADE;
DROP FUNCTION IF EXISTS get_campos_customizados(VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS get_valores_campos_customizados(VARCHAR, UUID);
```

Depois execute a migration completa novamente.

## 📞 Deu certo?

Depois de executar, me avise se funcionou! 😊
