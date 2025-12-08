# ✅ Migration 12 - Parâmetros de Folha de Pagamento

## 📋 O que faz

Cria a tabela `parametros_folha` com:
- Faixas e alíquotas do INSS (4 faixas progressivas)
- Faixas e alíquotas do IRRF (5 faixas progressivas com deduções)
- Alíquota do FGTS
- Configurações de benefícios (VT, VA, VR)
- Salário família
- Controle de vigência e histórico

## 🚀 Como Executar

1. Acesse o **Supabase SQL Editor**
2. Copie e cole o conteúdo de `12_parametros_folha.sql`
3. Execute o script
4. Verifique as mensagens de sucesso

## ✅ Verificação

Execute no SQL Editor:
```sql
-- Verificar se a tabela foi criada
SELECT * FROM parametros_folha;

-- Deve retornar 1 registro com os valores padrão de 2024
```

## 📊 Valores Padrão (2024)

### INSS
- Faixa 1: até R$ 1.320,00 → 7,5%
- Faixa 2: até R$ 2.571,29 → 9,0%
- Faixa 3: até R$ 3.856,94 → 12,0%
- Faixa 4: até R$ 7.507,49 → 14,0%

### IRRF
- Faixa 1: até R$ 2.112,00 → 0% (isento)
- Faixa 2: até R$ 2.826,65 → 7,5% (dedução R$ 158,40)
- Faixa 3: até R$ 3.751,05 → 15,0% (dedução R$ 370,40)
- Faixa 4: até R$ 4.664,68 → 22,5% (dedução R$ 651,73)
- Faixa 5: acima → 27,5% (dedução R$ 884,96)

### Outros
- FGTS: 8%
- Vale Transporte: desconto máximo 6%
- Salário Família: R$ 62,04 (limite R$ 1.819,26)

## 🔐 Permissões (RLS)

- **Admin**: pode criar, editar e visualizar
- **Funcionários**: podem apenas visualizar

## 🎯 Próximos Passos

1. Acesse `/configuracoes/folha` no sistema
2. Ajuste os valores conforme necessário
3. Configure os benefícios padrão da empresa

## 📝 Notas

- Os valores são referentes à tabela de 2024
- Atualize anualmente conforme legislação
- O sistema mantém histórico por vigência
- Apenas um registro pode estar ativo por vez
