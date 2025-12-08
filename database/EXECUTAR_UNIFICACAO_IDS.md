# 🎯 UNIFICAÇÃO DE IDs: Guia de Execução

## O que esta migração faz?

Transforma a tabela `colaboradores` para usar **UUID** como chave primária, usando o **mesmo UUID** da tabela `app_users` (que vem do Supabase Auth).

### Antes:
```
colaboradores.id = 1, 2, 3... (SERIAL)
app_users.id = uuid-xxx-xxx (UUID)
Vínculo: por email (frágil)
```

### Depois:
```
colaboradores.id = uuid-xxx-xxx (UUID)
app_users.id = uuid-xxx-xxx (UUID)
Vínculo: mesmo ID (forte)
```

## ✅ Vantagens

1. **Vínculo direto** - Não precisa mais sincronizar nomes por email
2. **Relacionamento 1:1 perfeito** - Um colaborador = Um usuário
3. **Melhor performance** - Joins diretos por UUID
4. **Menos complexidade** - Elimina lógica de sincronização
5. **Mais seguro** - UUID é o padrão do Supabase Auth

## ⚠️ IMPORTANTE: Leia antes de executar!

### Pré-requisitos:

1. **Backup completo do banco** - Faça backup antes!
2. **Todos os colaboradores devem ter usuário** - Verifique primeiro
3. **Sistema em manutenção** - Coloque o sistema offline durante a migração
4. **Tempo estimado** - 5-10 minutos dependendo do volume de dados

### Tabelas que serão afetadas:

- ✅ `colaboradores` (PK mudará de SERIAL para UUID)
- ✅ `holerites` (FK será atualizada)
- ✅ `registros_ponto` (FK será atualizada)
- ✅ `ferias` (FK será atualizada)
- ✅ `solicitacoes_alteracao_dados` (FK será atualizada)

## 📋 Passo a Passo

### 1. Verificação Inicial

Execute primeiro apenas os passos 1-4 do script para verificar:

```sql
-- Ver quantos colaboradores serão vinculados
SELECT 
  COUNT(*) FILTER (WHERE new_id IS NOT NULL) as vinculados,
  COUNT(*) FILTER (WHERE new_id IS NULL) as sem_vinculo
FROM colaboradores;
```

**Se houver colaboradores sem vínculo**, crie os usuários primeiro!

### 2. Executar Migração Completa

Se todos os colaboradores tiverem vínculo, execute o script completo:

```bash
# No Supabase SQL Editor
# Cole e execute: nuxt-app/database/MIGRACAO_UNIFICAR_IDS_UUID.sql
```

### 3. Verificar Resultado

Após a execução, você verá:

```
🎉 MIGRAÇÃO CONCLUÍDA!
✅ IDs UNIFICADOS para todos os colaboradores
```

## 🔧 Ajustes no Código

Após a migração, você precisará atualizar alguns arquivos:

### 1. Tipos TypeScript

```typescript
// Antes
interface Colaborador {
  id: number  // ❌
  nome: string
}

// Depois
interface Colaborador {
  id: string  // ✅ UUID
  nome: string
}
```

### 2. APIs que criam colaboradores

```typescript
// Antes
const { data } = await supabase
  .from('colaboradores')
  .insert({ nome, email })  // ❌ ID gerado automaticamente

// Depois
const { data: { user } } = await supabase.auth.signUp({ email, password })
const { data } = await supabase
  .from('colaboradores')
  .insert({ 
    id: user.id,  // ✅ Usar UUID do auth
    nome, 
    email 
  })
```

### 3. Queries que usam colaborador_id

Não precisa mudar nada! As FKs continuam funcionando normalmente.

## 🚨 Rollback (se necessário)

Se algo der errado, restaure o backup:

```sql
-- Restaurar do backup
-- (Use o backup que você fez antes!)
```

## 📊 Verificação Pós-Migração

Execute estas queries para confirmar:

```sql
-- 1. Verificar tipo da coluna
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'colaboradores' 
  AND column_name = 'id';
-- Deve retornar: data_type = 'uuid'

-- 2. Verificar foreign keys
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'colaboradores';
-- Deve mostrar todas as FKs recriadas

-- 3. Testar um join
SELECT 
  c.id,
  c.nome,
  au.email
FROM colaboradores c
INNER JOIN app_users au ON c.id = au.id
LIMIT 5;
-- Deve funcionar perfeitamente!
```

## 🎯 Próximos Passos

Após a migração bem-sucedida:

1. ✅ Remover scripts de sincronização de nomes por email
2. ✅ Atualizar documentação do sistema
3. ✅ Testar todas as funcionalidades
4. ✅ Colocar sistema de volta online

## 💡 Dúvidas?

- **E se um colaborador não tiver usuário?** - Crie o usuário primeiro
- **Posso reverter?** - Sim, com o backup
- **Vai quebrar algo?** - Não, se seguir o passo a passo
- **Quanto tempo leva?** - 5-10 minutos

---

**Pronto para executar?** Faça o backup e vamos lá! 🚀
