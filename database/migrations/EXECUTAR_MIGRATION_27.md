# 🚀 Executar Migration 27 - Sistema de Holerites

## 📋 O que esta migration faz?

Cria o sistema completo de holerites individuais para funcionários:

- ✅ Tabela `holerites` com todos os campos necessários
- ✅ RLS configurado (cada funcionário vê apenas seus holerites)
- ✅ Índices para performance
- ✅ Triggers para atualização automática
- ✅ Políticas de segurança

## 🔧 Como Executar

### 1. Acesse o Supabase SQL Editor

```
https://supabase.com/dashboard/project/SEU_PROJETO/sql
```

### 2. Copie e Execute o SQL

⚠️ **IMPORTANTE**: Use o arquivo CORRIGIDO!

Abra o arquivo: `nuxt-app/database/migrations/27_holerites_CORRIGIDO.sql`

Copie TODO o conteúdo e execute no SQL Editor do Supabase.

**NÃO use** o arquivo `27_holerites.sql` (versão antiga com erros)

### 3. Verifique a Execução

Você deve ver a mensagem:

```
✅ Migration 27 executada com sucesso!
📋 Tabela holerites criada
🔒 RLS configurado (funcionários veem apenas seus holerites)
📊 Índices criados para performance
```

## 📊 Estrutura da Tabela

```sql
holerites
├── id (UUID)
├── colaborador_id (UUID) → colaboradores
├── mes (INTEGER 1-12)
├── ano (INTEGER)
├── nome_colaborador (VARCHAR)
├── cpf (VARCHAR)
├── cargo (VARCHAR)
├── departamento (VARCHAR)
├── salario_base (DECIMAL)
├── total_proventos (DECIMAL)
├── inss (DECIMAL)
├── irrf (DECIMAL)
├── total_descontos (DECIMAL)
├── salario_bruto (DECIMAL)
├── salario_liquido (DECIMAL)
├── fgts (DECIMAL)
├── status (VARCHAR)
└── ... (outros campos)
```

## 🔒 Segurança (RLS)

### Admin
- ✅ Ver todos os holerites
- ✅ Criar holerites
- ✅ Atualizar holerites
- ✅ Deletar holerites

### Funcionário
- ✅ Ver apenas seus próprios holerites
- ✅ Marcar como visualizado
- ❌ Não pode ver holerites de outros
- ❌ Não pode criar/deletar

## 🎯 Funcionalidades Implementadas

### 1. Geração de Holerites (Admin)
- Gerar holerites para todos os colaboradores
- Gerar holerites para colaboradores específicos
- Cálculo automático de INSS, IRRF, FGTS
- Atualização de holerites existentes

### 2. Visualização (Funcionário)
- Lista de todos os holerites disponíveis
- Visualização detalhada de cada holerite
- Marcação automática como "visualizado"
- Download e impressão

### 3. APIs Criadas

```
POST   /api/holerites/gerar          → Gerar holerites (Admin)
GET    /api/holerites                → Listar holerites (Admin)
GET    /api/holerites/[id]           → Ver holerite específico
GET    /api/funcionario/holerites    → Holerites do funcionário logado
```

### 4. Componentes Criados

```
ModalHolerite.vue              → Modal de visualização do holerite
EmployeeHoleritesTab.vue       → Aba de holerites no portal
```

## 📱 Como Usar

### Para Administradores

1. Acesse: `/folha-pagamento`
2. Selecione mês e ano
3. Clique em "Calcular Folha"
4. Clique em "Gerar Holerites"
5. Confirme a geração
6. ✅ Holerites disponíveis para os funcionários

### Para Funcionários

1. Acesse: `/employee`
2. Clique na aba "Holerites"
3. Visualize seus holerites disponíveis
4. Clique em um holerite para ver detalhes
5. Imprima ou baixe em PDF

## 🔍 Verificar se Funcionou

Execute no SQL Editor:

```sql
-- Ver estrutura da tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'holerites';

-- Ver políticas RLS
SELECT * FROM pg_policies 
WHERE tablename = 'holerites';

-- Contar holerites (deve estar vazio inicialmente)
SELECT COUNT(*) FROM holerites;
```

## ⚠️ Importante

1. **Backup**: Sempre faça backup antes de executar migrations
2. **Teste**: Teste primeiro em ambiente de desenvolvimento
3. **RLS**: Não desabilite o RLS desta tabela (segurança crítica)
4. **Dados Sensíveis**: Holerites contêm dados financeiros sensíveis

## 🐛 Troubleshooting

### Erro: "relation holerites already exists"
A tabela já existe. Você pode:
- Pular esta migration
- Ou dropar a tabela: `DROP TABLE IF EXISTS holerites CASCADE;`

### Erro: "permission denied"
Verifique se você tem permissões de admin no Supabase.

### Funcionário não vê seus holerites
1. Verifique se o `user_id` está vinculado ao colaborador
2. Execute: `SELECT * FROM colaboradores WHERE user_id = 'UUID_DO_USER';`
3. Verifique as políticas RLS

## ✅ Checklist

- [ ] Migration 27 executada
- [ ] Tabela `holerites` criada
- [ ] RLS habilitado e políticas criadas
- [ ] Índices criados
- [ ] Testado geração de holerites (admin)
- [ ] Testado visualização (funcionário)
- [ ] Verificado que funcionários não veem holerites de outros

## 📚 Próximos Passos

Após executar esta migration:

1. Acesse `/folha-pagamento` como admin
2. Gere holerites para um período
3. Faça login como funcionário
4. Verifique se o holerite aparece
5. Teste a visualização e impressão

---

**Status**: ⏳ Aguardando execução
**Data**: 05/12/2025
**Versão**: 27
