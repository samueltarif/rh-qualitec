# Migration 28: Suporte para 13º Salário nos Holerites

## 📋 O que esta migration faz?

Adiciona suporte completo para geração de holerites de 13º salário na tabela `holerites`.

## 🎯 Alterações

### Novos Campos

1. **tipo** (VARCHAR)
   - Valores: 'mensal', 'decimo_terceiro', 'ferias', 'rescisao'
   - Default: 'mensal'
   - Identifica o tipo do holerite

2. **parcela_13** (VARCHAR)
   - Valores: '1', '2', 'integral'
   - Identifica qual parcela do 13º salário
   - Apenas para tipo 'decimo_terceiro'

3. **meses_trabalhados** (INTEGER)
   - Range: 0 a 12
   - Usado para cálculo proporcional do 13º
   - Baseado na data de admissão

### Índices Criados

- `idx_holerites_tipo` - Busca por tipo
- `idx_holerites_parcela_13` - Busca por parcela
- `idx_holerites_tipo_ano` - Busca por tipo e ano
- `idx_holerites_colaborador_tipo` - Busca por colaborador e tipo

## 🚀 Como Executar

### Opção 1: Supabase Dashboard (Recomendado)

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Clique em **New Query**
4. Copie e cole o conteúdo de `28_holerites_decimo_terceiro.sql`
5. Clique em **Run**

### Opção 2: CLI do Supabase

```bash
supabase db push
```

### Opção 3: psql

```bash
psql -h [HOST] -U postgres -d postgres -f database/migrations/28_holerites_decimo_terceiro.sql
```

## ✅ Verificar Instalação

Execute no SQL Editor:

```sql
-- Verificar se os campos foram adicionados
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'holerites'
AND column_name IN ('tipo', 'parcela_13', 'meses_trabalhados');

-- Verificar índices
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'holerites'
AND indexname LIKE 'idx_holerites_%';

-- Testar constraint do tipo
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%tipo%';
```

Resultado esperado:
```
column_name        | data_type         | column_default
-------------------+-------------------+----------------
tipo               | character varying | 'mensal'
parcela_13         | character varying | NULL
meses_trabalhados  | integer           | NULL

indexname                          | indexdef
-----------------------------------+------------------------------------------
idx_holerites_tipo                 | CREATE INDEX ... ON holerites(tipo)
idx_holerites_parcela_13           | CREATE INDEX ... ON holerites(parcela_13)
idx_holerites_tipo_ano             | CREATE INDEX ... ON holerites(tipo, ano)
idx_holerites_colaborador_tipo     | CREATE INDEX ... ON holerites(colaborador_id, tipo)
```

## 🧪 Testar Funcionalidade

### 1. Inserir Holerite de 13º (1ª Parcela)

```sql
INSERT INTO holerites (
  colaborador_id,
  mes,
  ano,
  tipo,
  parcela_13,
  nome_colaborador,
  cpf,
  salario_base,
  salario_bruto,
  salario_liquido,
  meses_trabalhados
) VALUES (
  (SELECT id FROM colaboradores LIMIT 1),
  12,
  2024,
  'decimo_terceiro',
  '1',
  'Teste Colaborador',
  '12345678900',
  3000.00,
  1500.00,
  1500.00,
  12
);
```

### 2. Buscar Holerites de 13º

```sql
SELECT 
  id,
  nome_colaborador,
  tipo,
  parcela_13,
  ano,
  salario_liquido,
  meses_trabalhados
FROM holerites
WHERE tipo = 'decimo_terceiro'
ORDER BY ano DESC, parcela_13;
```

### 3. Buscar por Colaborador

```sql
SELECT 
  tipo,
  parcela_13,
  mes,
  ano,
  salario_liquido
FROM holerites
WHERE colaborador_id = '[UUID_DO_COLABORADOR]'
ORDER BY ano DESC, mes DESC;
```

## 📊 Estrutura de Dados

### Exemplo de Holerite Mensal

```json
{
  "tipo": "mensal",
  "parcela_13": null,
  "meses_trabalhados": null,
  "mes": 11,
  "ano": 2024,
  "salario_base": 3000.00,
  "salario_liquido": 2500.00
}
```

### Exemplo de 13º - 1ª Parcela

```json
{
  "tipo": "decimo_terceiro",
  "parcela_13": "1",
  "meses_trabalhados": 12,
  "mes": 12,
  "ano": 2024,
  "salario_base": 3000.00,
  "salario_bruto": 3000.00,
  "salario_liquido": 1500.00,
  "inss": 0,
  "irrf": 0
}
```

### Exemplo de 13º - 2ª Parcela

```json
{
  "tipo": "decimo_terceiro",
  "parcela_13": "2",
  "meses_trabalhados": 12,
  "mes": 12,
  "ano": 2024,
  "salario_base": 3000.00,
  "salario_bruto": 3000.00,
  "salario_liquido": 1200.00,
  "inss": 225.00,
  "irrf": 75.00
}
```

## 🔄 Rollback (se necessário)

```sql
-- Remover índices
DROP INDEX IF EXISTS idx_holerites_tipo;
DROP INDEX IF EXISTS idx_holerites_parcela_13;
DROP INDEX IF EXISTS idx_holerites_tipo_ano;
DROP INDEX IF EXISTS idx_holerites_colaborador_tipo;

-- Remover colunas
ALTER TABLE holerites DROP COLUMN IF EXISTS tipo;
ALTER TABLE holerites DROP COLUMN IF EXISTS parcela_13;
ALTER TABLE holerites DROP COLUMN IF EXISTS meses_trabalhados;
```

## 📝 Regras de Negócio

### 1ª Parcela (até 30/11)
- Valor: 50% do 13º salário proporcional
- Sem descontos de INSS e IRRF
- Campo `parcela_13` = '1'

### 2ª Parcela (até 20/12)
- Valor: 50% restante
- Com descontos de INSS e IRRF sobre o valor total
- Campo `parcela_13` = '2'

### Parcela Integral
- Valor: 100% do 13º salário
- Com todos os descontos
- Campo `parcela_13` = 'integral'

### Cálculo Proporcional

```
Valor 13º = (Salário Base / 12) × Meses Trabalhados
```

Meses trabalhados:
- Admitido antes do ano: 12 meses
- Admitido durante o ano: (13 - mês de admissão)
- Admitido após o ano: 0 meses

## 🎯 Próximos Passos

Após executar esta migration:

1. ✅ Testar geração de 13º no sistema
2. ✅ Verificar cálculos proporcionais
3. ✅ Testar envio de emails
4. ✅ Validar holerites no portal do funcionário

## 📚 Arquivos Relacionados

- `database/migrations/28_holerites_decimo_terceiro.sql` (esta migration)
- `server/api/decimo-terceiro/gerar.post.ts` (API de geração)
- `server/api/decimo-terceiro/gerar-enviar.post.ts` (API com email)
- `app/components/Modal13Salario.vue` (Interface)

## ⚠️ Importante

- Esta migration é **ADITIVA** (não remove dados)
- Holerites existentes terão `tipo = 'mensal'` por padrão
- Não afeta holerites já gerados
- Compatível com versões anteriores

---

**Status:** ✅ Pronto para Executar  
**Impacto:** Baixo (apenas adiciona campos)  
**Reversível:** Sim  
**Tempo Estimado:** < 1 minuto
