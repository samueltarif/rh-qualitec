# Executar Migration 31 - Sistema de Assinatura de Ponto

## 🎯 O que esta migration faz?

Cria o sistema de assinatura digital de ponto com:
- Limite de 30 dias para visualização
- Assinatura mensal pelos funcionários
- Geração e armazenamento de CSV
- Download permanente do arquivo assinado

## 📋 Passo a Passo

### 1. Acesse o Supabase Dashboard
```
https://supabase.com/dashboard/project/[seu-projeto]/editor
```

### 2. Abra o SQL Editor

### 3. Copie e Cole o Conteúdo
Arquivo: `nuxt-app/database/migrations/31_assinatura_ponto.sql`

### 4. Execute a Migration

### 5. Verifique a Criação
```sql
-- Verificar se a tabela foi criada
SELECT * FROM assinaturas_ponto LIMIT 1;

-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'assinaturas_ponto';

-- Verificar índices
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'assinaturas_ponto';
```

## ✅ Validação

Execute estes comandos para validar:

```sql
-- 1. Verificar estrutura da tabela
\d assinaturas_ponto

-- 2. Testar constraint de período único
-- (deve falhar se tentar inserir duplicado)
INSERT INTO assinaturas_ponto (colaborador_id, mes, ano, total_dias, total_horas)
VALUES (
  (SELECT id FROM colaboradores LIMIT 1),
  12,
  2024,
  22,
  '176h00'
);

-- Tentar inserir novamente (deve dar erro)
INSERT INTO assinaturas_ponto (colaborador_id, mes, ano, total_dias, total_horas)
VALUES (
  (SELECT id FROM colaboradores LIMIT 1),
  12,
  2024,
  22,
  '176h00'
);
-- Esperado: ERROR: duplicate key value violates unique constraint

-- 3. Verificar RLS está ativo
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'assinaturas_ponto';
-- Esperado: rowsecurity = true
```

## 🔍 Troubleshooting

### Erro: "relation already exists"
```sql
-- Verificar se já existe
SELECT * FROM assinaturas_ponto LIMIT 1;

-- Se existir e quiser recriar
DROP TABLE IF EXISTS assinaturas_ponto CASCADE;
-- Depois execute a migration novamente
```

### Erro: "function uuid_generate_v4 does not exist"
```sql
-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Políticas não funcionam
```sql
-- Recriar políticas
DROP POLICY IF EXISTS "Funcionários podem ver suas assinaturas" ON assinaturas_ponto;
DROP POLICY IF EXISTS "Funcionários podem criar assinaturas" ON assinaturas_ponto;
DROP POLICY IF EXISTS "Admins podem ver todas assinaturas" ON assinaturas_ponto;

-- Execute novamente as políticas da migration
```

## 📊 Dados de Teste (Opcional)

```sql
-- Criar assinatura de teste
INSERT INTO assinaturas_ponto (
  colaborador_id,
  mes,
  ano,
  ip_assinatura,
  arquivo_csv,
  total_dias,
  total_horas,
  observacoes
)
VALUES (
  (SELECT id FROM colaboradores WHERE email = 'seu@email.com'),
  11, -- Novembro
  2024,
  '192.168.1.1',
  encode('Dados do CSV em base64', 'base64'),
  22,
  '176h00',
  'Teste de assinatura'
);

-- Verificar
SELECT 
  c.nome,
  a.mes,
  a.ano,
  a.data_assinatura,
  a.total_dias,
  a.total_horas
FROM assinaturas_ponto a
JOIN colaboradores c ON c.id = a.colaborador_id;
```

## 🎯 Próximos Passos

Após executar a migration:

1. ✅ Reinicie o servidor Nuxt (se estiver rodando)
2. ✅ Acesse o portal do funcionário
3. ✅ Vá para a aba "Ponto"
4. ✅ Teste assinar o ponto do mês atual
5. ✅ Teste fazer download do CSV
6. ✅ Verifique o limite de 30 dias

## 📝 Notas Importantes

- ⚠️ Assinatura é **irreversível** - não pode ser deletada ou modificada
- ⚠️ Apenas **uma assinatura por período** (mês/ano)
- ⚠️ CSV fica armazenado **permanentemente** no banco
- ⚠️ Após **30 dias**, apenas o CSV assinado fica disponível
- ✅ Funcionários só veem suas próprias assinaturas
- ✅ Admins veem todas as assinaturas

## 🔗 Arquivos Relacionados

- Migration: `nuxt-app/database/migrations/31_assinatura_ponto.sql`
- Componente: `nuxt-app/app/components/EmployeePontoTab.vue`
- API Assinatura: `nuxt-app/server/api/funcionario/ponto/assinatura.get.ts`
- API Assinar: `nuxt-app/server/api/funcionario/ponto/assinar.post.ts`
- API Download: `nuxt-app/server/api/funcionario/ponto/download-csv.get.ts`
- Documentação: `nuxt-app/SISTEMA_ASSINATURA_PONTO.md`

---

**Status:** Pronto para executar
**Versão:** 31
**Data:** 09/12/2024
