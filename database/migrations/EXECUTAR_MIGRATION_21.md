# 🔐 Executar Migration 21 - Políticas e Compliance

## ⚠️ IMPORTANTE - Leia Antes de Executar

Esta migration cria o sistema completo de **Políticas e Compliance** para RH, incluindo:
- ✅ Políticas internas (LGPD, termos de uso, código de conduta)
- ✅ Aceites de políticas pelos colaboradores
- ✅ Histórico e versionamento de políticas
- ✅ Treinamentos sobre políticas
- ✅ Incidentes e violações
- ✅ Auditorias de compliance

## 📋 Passo a Passo

### 1. Acesse o Supabase

Vá para: https://supabase.com/dashboard

### 2. Selecione seu Projeto

Clique no projeto do sistema RH

### 3. Abra o SQL Editor

No menu lateral esquerdo, clique em **SQL Editor**

### 4. Copie o Script

Abra o arquivo: `database/migrations/21_politicas_compliance.sql`

Copie **TODO** o conteúdo do arquivo

### 5. Cole no SQL Editor

Cole o script completo no editor SQL do Supabase

### 6. Execute o Script

Clique no botão **RUN** (ou pressione Ctrl+Enter)

### 7. Aguarde a Conclusão

O script vai criar:
- ✅ 7 tabelas novas
- ✅ Índices para performance
- ✅ 3 políticas padrão (LGPD, Código de Conduta, Segurança)

### 8. Verifique se Funcionou

Execute este comando para verificar:

```sql
SELECT 
  table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'politicas%'
ORDER BY table_name;
```

Deve retornar 7 tabelas:
- politicas_aceites
- politicas_auditorias
- politicas_compliance
- politicas_historico
- politicas_incidentes
- politicas_treinamentos
- politicas_treinamentos_participantes

## ✅ Pronto!

Agora você pode usar o sistema de Políticas e Compliance!

## 🔧 Atualizar Empresa ID

As políticas padrão foram criadas com empresa_id genérico. Execute este comando para atualizar com o ID real da sua empresa:

```sql
-- Primeiro, pegue o ID da sua empresa
SELECT id, nome FROM empresa LIMIT 1;

-- Depois, atualize as políticas (substitua SEU_EMPRESA_ID)
UPDATE politicas_compliance 
SET empresa_id = 'SEU_EMPRESA_ID'
WHERE empresa_id = '00000000-0000-0000-0000-000000000000';
```

## 📊 Consultas Úteis

### Ver todas as políticas
```sql
SELECT 
  codigo,
  titulo,
  tipo,
  status,
  publicado,
  data_vigencia
FROM politicas_compliance
ORDER BY created_at DESC;
```

### Ver aceites pendentes
```sql
SELECT 
  pc.titulo,
  pa.colaborador_id,
  pa.prazo_aceite,
  pa.atrasado
FROM politicas_aceites pa
JOIN politicas_compliance pc ON pc.id = pa.politica_id
WHERE pa.aceito = FALSE
ORDER BY pa.prazo_aceite;
```

### Ver incidentes abertos
```sql
SELECT 
  titulo,
  gravidade,
  status,
  data_ocorrencia
FROM politicas_incidentes
WHERE status IN ('aberto', 'em_investigacao')
ORDER BY gravidade DESC, data_ocorrencia DESC;
```

## 🆘 Problemas?

Se der erro, verifique:
1. ✅ Você está conectado ao projeto correto
2. ✅ Você tem permissões de administrador
3. ✅ Não há tabelas com nomes conflitantes

Se o erro persistir, delete as tabelas e tente novamente:

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
