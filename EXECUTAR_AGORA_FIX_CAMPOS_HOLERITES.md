# 🚨 EXECUTAR AGORA: Adicionar Campos Faltantes

## Problema

Erro ao salvar holerite:
```
Could not find the 'adiantamento' column of 'holerites' in the schema cache
```

## Causa

A tabela `holerites` não tem as colunas para os novos campos que adicionamos.

## Solução

Execute o SQL abaixo no Supabase SQL Editor:

```sql
-- PROVENTOS
ALTER TABLE holerites ADD COLUMN IF NOT EXISTS bonus DECIMAL(10,2) DEFAULT 0;
ALTER TABLE holerites ADD COLUMN IF NOT EXISTS comissoes DECIMAL(10,2) DEFAULT 0;

-- DESCONTOS
ALTER TABLE holerites ADD COLUMN IF NOT EXISTS adiantamento DECIMAL(10,2) DEFAULT 0;
ALTER TABLE holerites ADD COLUMN IF NOT EXISTS emprestimos DECIMAL(10,2) DEFAULT 0;

-- BENEFÍCIOS
ALTER TABLE holerites ADD COLUMN IF NOT EXISTS vale_alimentacao DECIMAL(10,2) DEFAULT 0;
ALTER TABLE holerites ADD COLUMN IF NOT EXISTS plano_odontologico DECIMAL(10,2) DEFAULT 0;
ALTER TABLE holerites ADD COLUMN IF NOT EXISTS seguro_vida DECIMAL(10,2) DEFAULT 0;
ALTER TABLE holerites ADD COLUMN IF NOT EXISTS auxilio_creche DECIMAL(10,2) DEFAULT 0;
ALTER TABLE holerites ADD COLUMN IF NOT EXISTS auxilio_educacao DECIMAL(10,2) DEFAULT 0;
ALTER TABLE holerites ADD COLUMN IF NOT EXISTS auxilio_combustivel DECIMAL(10,2) DEFAULT 0;
ALTER TABLE holerites ADD COLUMN IF NOT EXISTS outros_beneficios DECIMAL(10,2) DEFAULT 0;
```

## Passo a Passo

1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Cole o SQL acima
4. Clique em "Run"
5. Aguarde a confirmação
6. Teste novamente no sistema

## Verificação

Após executar, rode este SQL para verificar:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'holerites' 
  AND column_name IN (
    'bonus', 
    'comissoes', 
    'adiantamento', 
    'emprestimos',
    'vale_alimentacao',
    'plano_odontologico',
    'seguro_vida',
    'auxilio_creche',
    'auxilio_educacao',
    'auxilio_combustivel',
    'outros_beneficios'
  )
ORDER BY column_name;
```

Deve retornar 11 linhas (uma para cada coluna).

## Campos Adicionados

| Campo | Tipo | Descrição |
|-------|------|-----------|
| bonus | DECIMAL(10,2) | Bônus / Gratificações |
| comissoes | DECIMAL(10,2) | Comissões |
| adiantamento | DECIMAL(10,2) | Adiantamento Salarial |
| emprestimos | DECIMAL(10,2) | Empréstimos / Consignados |
| vale_alimentacao | DECIMAL(10,2) | Vale Alimentação |
| plano_odontologico | DECIMAL(10,2) | Plano Odontológico |
| seguro_vida | DECIMAL(10,2) | Seguro de Vida |
| auxilio_creche | DECIMAL(10,2) | Auxílio Creche |
| auxilio_educacao | DECIMAL(10,2) | Auxílio Educação |
| auxilio_combustivel | DECIMAL(10,2) | Auxílio Combustível |
| outros_beneficios | DECIMAL(10,2) | Outros Benefícios |

## Após Executar

1. Recarregue a página do sistema
2. Tente salvar novamente
3. Deve funcionar normalmente
