# 🐛 DEBUG: Benefícios não estão pré-preenchendo

## 🔍 Problema

Os benefícios não estão sendo pré-preenchidos automaticamente no modal de edição da folha de pagamento.

## ✅ Correção Aplicada

Ajustei o código para:
1. Usar `Number()` para garantir conversão correta dos valores
2. Adicionar logs de console para debug
3. Tratar corretamente os campos boolean (plano_saude, plano_odonto)

## 🧪 Como Testar

### 1. Verificar dados no banco

Execute no Supabase SQL Editor:

```sql
-- Ver dados de um colaborador específico
SELECT 
  id,
  nome,
  recebe_vt,
  valor_vt,
  recebe_vr,
  valor_vr,
  recebe_va,
  valor_va,
  plano_saude,
  plano_odonto
FROM colaboradores
WHERE nome ILIKE '%samuel%'
LIMIT 1;
```

### 2. Testar no navegador

1. Abra a página de Folha de Pagamento
2. Calcule a folha para um mês
3. Clique em "Editar" em um colaborador
4. Abra o Console do navegador (F12)
5. Procure pelos logs:
   - `Benefícios do colaborador:`
   - `Dados completos:`

### 3. Verificar valores esperados

Se o colaborador tem no cadastro:
- ✅ Vale Transporte: R$ 220,00
- ✅ Vale Alimentação: R$ 280,00

O console deve mostrar:
```javascript
Benefícios do colaborador: {
  vale_transporte: 220,
  vale_refeicao: 0,
  vale_alimentacao: 280,
  plano_saude: 0,
  plano_odontologico: 0
}
```

E os campos no modal devem aparecer com esses valores.

## 🔧 Possíveis Causas do Problema

### 1. Campos não existem no banco
```sql
-- Verificar se as colunas existem
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'colaboradores' 
AND column_name IN ('recebe_vt', 'valor_vt', 'recebe_vr', 'valor_vr', 'recebe_va', 'valor_va');
```

### 2. Valores são NULL
```sql
-- Ver valores NULL
SELECT 
  nome,
  recebe_vt IS NULL as vt_null,
  valor_vt IS NULL as valor_vt_null,
  recebe_va IS NULL as va_null,
  valor_va IS NULL as valor_va_null
FROM colaboradores
LIMIT 5;
```

### 3. API não está retornando os campos

Teste direto no navegador:
```javascript
// No console do navegador
fetch('/api/colaboradores/SEU_ID_AQUI')
  .then(r => r.json())
  .then(data => console.log('Dados da API:', data))
```

## 🛠️ Soluções

### Se os campos não existem no banco:

```sql
-- Adicionar campos se não existirem
ALTER TABLE colaboradores 
ADD COLUMN IF NOT EXISTS recebe_vt BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS valor_vt DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS recebe_vr BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS valor_vr DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS recebe_va BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS valor_va DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS recebe_va_vr BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS valor_va_vr DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS plano_saude BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS plano_odonto BOOLEAN DEFAULT false;
```

### Se os valores estão NULL:

```sql
-- Atualizar valores NULL para 0
UPDATE colaboradores 
SET 
  valor_vt = COALESCE(valor_vt, 0),
  valor_vr = COALESCE(valor_vr, 0),
  valor_va = COALESCE(valor_va, 0),
  valor_va_vr = COALESCE(valor_va_vr, 0)
WHERE valor_vt IS NULL 
   OR valor_vr IS NULL 
   OR valor_va IS NULL 
   OR valor_va_vr IS NULL;
```

### Se a API não retorna os campos:

Verifique as políticas RLS (Row Level Security):

```sql
-- Ver políticas da tabela colaboradores
SELECT * FROM pg_policies WHERE tablename = 'colaboradores';

-- Se necessário, criar política para SELECT
CREATE POLICY "Permitir leitura de colaboradores"
ON colaboradores FOR SELECT
TO authenticated
USING (true);
```

## 📋 Checklist de Verificação

- [ ] Campos existem na tabela `colaboradores`
- [ ] Valores não são NULL
- [ ] API retorna os campos corretamente
- [ ] Console mostra os logs de debug
- [ ] Valores aparecem nos campos do modal
- [ ] Valores são números (não strings)

## 🎯 Teste Rápido

Execute este SQL para criar dados de teste:

```sql
-- Atualizar um colaborador com benefícios
UPDATE colaboradores 
SET 
  recebe_vt = true,
  valor_vt = 220.00,
  recebe_va = true,
  valor_va = 280.00,
  plano_saude = true,
  plano_odonto = false
WHERE nome ILIKE '%samuel%'
RETURNING id, nome, valor_vt, valor_va;
```

Depois teste novamente no modal de edição da folha.

## 📝 Logs Esperados no Console

Quando funcionar corretamente, você verá:

```
Benefícios do colaborador: {
  vale_transporte: 220,
  vale_refeicao: 0,
  vale_alimentacao: 280,
  plano_saude: 0,
  plano_odontologico: 0
}

Dados completos: {
  id: "uuid-aqui",
  nome: "Samuel Silva",
  recebe_vt: true,
  valor_vt: 220,
  recebe_va: true,
  valor_va: 280,
  // ... outros campos
}
```

## 🚀 Próximos Passos

Depois de confirmar que está funcionando:

1. Remover os `console.log()` de debug
2. Testar com vários colaboradores
3. Verificar se os valores são salvos corretamente
4. Integrar com a geração de holerites

---

**Status**: 🔧 Em debug
**Última atualização**: Agora
