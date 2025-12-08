# ⚡ Solução Rápida: Benefícios não pré-preenchem

## 🎯 Problema
Os benefícios cadastrados no colaborador não aparecem automaticamente no modal de edição da folha.

## ✅ Solução em 3 Passos

### 1️⃣ Verificar se os campos existem no banco

Execute no Supabase SQL Editor:

```sql
-- Copie e cole este SQL
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'colaboradores' 
AND column_name IN ('recebe_vt', 'valor_vt', 'recebe_va', 'valor_va');
```

**Se retornar vazio**, os campos não existem. Execute:

```sql
ALTER TABLE colaboradores 
ADD COLUMN IF NOT EXISTS recebe_vt BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS valor_vt DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS recebe_vr BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS valor_vr DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS recebe_va BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS valor_va DECIMAL(10,2) DEFAULT 0;
```

### 2️⃣ Adicionar dados de teste

```sql
-- Atualizar um colaborador com benefícios
UPDATE colaboradores 
SET 
  recebe_vt = true,
  valor_vt = 220.00,
  recebe_va = true,
  valor_va = 280.00
WHERE id = (SELECT id FROM colaboradores LIMIT 1)
RETURNING nome, valor_vt, valor_va;
```

### 3️⃣ Testar no navegador

1. Abra a página **Folha de Pagamento**
2. Calcule a folha
3. Clique em **Editar** no colaborador que você atualizou
4. Abra o **Console** (F12)
5. Procure pelos logs:
   ```
   Benefícios do colaborador: { vale_transporte: 220, ... }
   ```

## 🔍 Debug Rápido

Se ainda não funcionar, execute no console do navegador:

```javascript
// Teste direto da API
fetch('/api/colaboradores/SEU_ID_AQUI')
  .then(r => r.json())
  .then(data => {
    console.log('recebe_vt:', data.recebe_vt)
    console.log('valor_vt:', data.valor_vt)
    console.log('recebe_va:', data.recebe_va)
    console.log('valor_va:', data.valor_va)
  })
```

Substitua `SEU_ID_AQUI` pelo ID do colaborador (copie da URL ou do banco).

## 📋 Checklist

- [ ] Campos existem no banco
- [ ] Colaborador tem valores cadastrados
- [ ] Console mostra os logs
- [ ] Valores aparecem nos campos do modal

## 🆘 Ainda não funciona?

Execute este SQL completo:

```sql
-- Ver estrutura completa da tabela
SELECT 
  column_name, 
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name = 'colaboradores'
ORDER BY ordinal_position;

-- Ver dados de um colaborador
SELECT * FROM colaboradores LIMIT 1;
```

Copie o resultado e me envie para análise.

## 💡 Dica

Os logs no console são essenciais! Se você não vê:
```
Benefícios do colaborador: {...}
```

Significa que o código não está sendo executado. Verifique se:
- Você está clicando no botão "Editar" correto
- O modal está abrindo
- Não há erros no console

---

**Tempo estimado**: 5 minutos
**Dificuldade**: Fácil
