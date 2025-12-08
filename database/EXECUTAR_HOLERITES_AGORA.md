# 🚀 EXECUTAR SISTEMA DE HOLERITES - GUIA RÁPIDO

## ⚡ Passo a Passo

### 1. Acesse o Supabase SQL Editor
```
https://supabase.com/dashboard/project/SEU_PROJETO/sql
```

### 2. Execute a Migration

**Arquivo correto:** `nuxt-app/database/migrations/27_holerites_FINAL.sql`

❌ **NÃO use:**
- `27_holerites.sql` (versão antiga)
- `27_holerites_CORRIGIDO.sql` (versão intermediária)

✅ **USE:** `27_holerites_FINAL.sql`

### 3. Copie e Cole

Abra o arquivo `27_holerites_FINAL.sql`, copie TODO o conteúdo e cole no SQL Editor.

### 4. Execute

Clique em "Run" ou pressione `Ctrl+Enter`

### 5. Verifique o Resultado

Você deve ver:
```
✅ Migration 27 executada com sucesso!
📋 Tabela holerites criada
🔒 RLS configurado (funcionários veem apenas seus holerites)
📊 Índices criados para performance

🎯 Próximos passos:
1. Acesse /folha-pagamento como admin
2. Gere holerites para um período
3. Faça login como funcionário
4. Verifique a aba "Holerites" em /employee
```

## 🧪 Testar

### Como Admin:
1. Acesse: `http://localhost:3000/folha-pagamento`
2. Selecione mês e ano (ex: Dezembro/2024)
3. Clique em "Calcular Folha"
4. Clique em "Gerar Holerites"
5. Confirme a geração

### Como Funcionário:
1. Faça login como funcionário (ex: Samuel)
2. Acesse: `http://localhost:3000/employee`
3. Clique na aba "Holerites"
4. Você deve ver seus holerites disponíveis
5. Clique em um holerite para visualizar

## ✅ Checklist

- [ ] Migration 27 executada sem erros
- [ ] Tabela `holerites` criada
- [ ] RLS habilitado
- [ ] Testado geração de holerites (admin)
- [ ] Testado visualização (funcionário)
- [ ] Verificado que funcionários não veem holerites de outros

## 🐛 Se der erro

### Erro: "relation holerites already exists"
```sql
-- Execute isto para limpar e tentar novamente:
DROP TABLE IF EXISTS holerites CASCADE;
```

### Erro: "column colaborador_id does not exist"
Você está usando o arquivo errado! Use `27_holerites_FINAL.sql`

### Erro de permissão
Verifique se você está logado como admin no Supabase.

## 📊 Estrutura Criada

```
holerites
├── id (UUID)
├── colaborador_id (UUID) → colaboradores.id
├── mes (1-12)
├── ano (2020-2100)
├── nome_colaborador
├── cpf
├── salario_base
├── total_proventos
├── inss
├── irrf
├── total_descontos
├── salario_liquido
├── fgts
├── status (gerado/enviado/visualizado/pago)
└── ... (outros campos)
```

## 🔒 Segurança (RLS)

✅ **Admin:**
- Ver todos os holerites
- Criar holerites
- Atualizar holerites
- Deletar holerites

✅ **Funcionário:**
- Ver APENAS seus próprios holerites
- Marcar como visualizado
- NÃO pode ver holerites de outros
- NÃO pode criar/deletar

## 📝 Relacionamentos

```
app_users (auth_uid) ← auth.uid()
    ↓ (id)
colaboradores (user_id)
    ↓ (id)
holerites (colaborador_id)
```

---

**Pronto!** Após executar, o sistema de holerites estará 100% funcional! 🎉
