# 🚀 EXECUTAR MIGRATION 29 - ADIANTAMENTO SALARIAL

## ⚠️ IMPORTANTE
Execute este script no **SQL Editor do Supabase** para ativar o sistema de adiantamento salarial.

## 📋 O que esta migration faz?

1. ✅ Adiciona configurações de adiantamento em `parametros_folha`
2. ✅ Adiciona campo `valor_adiantamento` em `holerites`
3. ✅ Adiciona tipo `'adiantamento'` no enum de holerites
4. ✅ Cria função de cálculo automático
5. ✅ Cria view para relatórios

## 🎯 Passo a Passo

### 1. Abrir SQL Editor no Supabase
- Acesse: https://supabase.com/dashboard
- Selecione seu projeto
- Vá em **SQL Editor**

### 2. Copiar e Executar o Script
Copie TODO o conteúdo do arquivo:
```
nuxt-app/database/migrations/29_adiantamento_salarial.sql
```

### 3. Clicar em "Run"

### 4. Verificar Sucesso
Você deve ver mensagens de sucesso e uma tabela mostrando as colunas criadas.

## ✅ Verificação

Execute este SQL para confirmar:

```sql
-- Verificar configurações
SELECT 
    adiantamento_habilitado,
    adiantamento_percentual,
    adiantamento_dia_pagamento,
    adiantamento_gerar_holerite
FROM parametros_folha;

-- Verificar enum
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_holerite')
ORDER BY enumlabel;
```

## 🎉 Resultado Esperado

Você deve ver:
- `adiantamento_habilitado`: false (desabilitado por padrão)
- `adiantamento_percentual`: 40.00
- `adiantamento_dia_pagamento`: 20
- `adiantamento_gerar_holerite`: true
- Enum incluindo: 'adiantamento', 'decimo_terceiro', 'mensal'

## 📌 Próximos Passos

Após executar a migration:
1. Ativar o adiantamento em **Configurações > Folha de Pagamento**
2. Gerar adiantamentos pela página de **Folha de Pagamento**
3. Holerites do dia 5 descontarão automaticamente o adiantamento

## 🆘 Problemas?

Se encontrar erro de "enum já existe", é seguro ignorar - significa que já foi executado antes.
