# 🔧 FIX: Erro ao Gerar Holerites

## ❌ Problema Identificado

```
Could not find the 'agencia' column of 'holerites' in the schema cache
```

**Causa**: A tabela `holerites` no Supabase não está sincronizada com o código. Faltam as colunas de dados bancários.

## ✅ Solução

### Passo 1: Executar SQL no Supabase

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Copie e cole o conteúdo do arquivo: `database/FIX_HOLERITES_SCHEMA.sql`
4. Clique em **Run**

### Passo 2: Reiniciar o Servidor

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

### Passo 3: Testar Geração de Holerites

1. Acesse: `http://localhost:3000/folha-pagamento`
2. Clique em **"Gerar Holerites"**
3. Selecione:
   - Mês: Janeiro
   - Ano: 2025
   - Colaborador: SAMUEL BARRETOS TARIF (tem salário configurado)
4. Clique em **"Gerar"**

## 📋 O que o Fix Faz

1. ✅ Recria a tabela `holerites` com TODAS as colunas necessárias
2. ✅ Inclui colunas de dados bancários: `banco`, `agencia`, `conta`
3. ✅ Configura RLS (Row Level Security) corretamente
4. ✅ Cria índices para performance
5. ✅ Adiciona políticas de acesso:
   - Admin: acesso total
   - Funcionário: visualizar apenas seus holerites

## ⚠️ Observações Importantes

### Colaboradores sem Salário

Os seguintes colaboradores **não podem** gerar holerite porque não têm salário configurado:

- ❌ Silvana Administradora: salário = 0
- ❌ MARCELO RIBEIRO: salário = null

**Solução**: Configure o salário deles em `/colaboradores` antes de gerar holerites.

### Colaboradores OK

- ✅ SAMUEL BARRETOS TARIF: salário = R$ 8.000,00

## 🎯 Resultado Esperado

Após executar o fix:

```
✅ Holerites gerados: 1
❌ Erros: 0

Holerite gerado com sucesso para SAMUEL BARRETOS TARIF
```

## 🔍 Verificação

Para verificar se a tabela foi criada corretamente:

```sql
-- No SQL Editor do Supabase
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'holerites'
ORDER BY ordinal_position;
```

Deve mostrar todas as colunas, incluindo:
- ✅ banco
- ✅ agencia
- ✅ conta
