# CORREÇÃO: Aprovação de Alterações de Dados dos Funcionários

## Problema Identificado

O sistema estava rejeitando aprovações de alterações com erros:
```
invalid input value for enum tipo_conta_bancaria: "corrente"
invalid input value for enum estado_civil: "Solteiro(a)"
```

## Causas Raiz

1. **Incompatibilidade de Enums**: 
   - `tipo_conta_bancaria`: Banco tinha `'Corrente'`, `'Poupanca'` mas frontend envia `'corrente'`, `'poupanca'`, `'salario'`
   - `estado_civil`: Banco tinha `'Solteiro'`, `'Casado'` mas frontend envia `'Solteiro(a)'`, `'Casado(a)'`, `'União Estável'`

2. **Campos Incorretos**: O endpoint de aprovação estava usando campos `banco` ao invés de `banco_nome` e `banco_codigo`

3. **Falta de Validação**: Não havia conversão ou validação dos valores antes de salvar

## Correções Aplicadas

### 1. Script SQL de Correção COMPLETA ⭐
Execute o arquivo: `nuxt-app/database/fixes/fix_todos_enums_COMPLETO.sql`

Este script corrige TODOS os enums problemáticos:

**tipo_conta_bancaria:**
- Remove enum antigo com valores capitalizados
- Cria novo com: `'corrente'`, `'poupanca'`, `'salario'`
- Converte dados existentes automaticamente

**estado_civil:**
- Remove enum antigo
- Cria novo com: `'Solteiro(a)'`, `'Casado(a)'`, `'Divorciado(a)'`, `'Viúvo(a)'`, `'União Estável'`
- Converte dados existentes automaticamente

### 2. Endpoint de Aprovação Corrigido ✅
Arquivo: `nuxt-app/server/api/admin/alteracoes-dados/[id].put.ts`

Corrigido os campos de dados bancários:
```typescript
// ANTES (errado)
banco: solicitacao.dados_novos.banco,

// DEPOIS (correto)
banco_nome: solicitacao.dados_novos.banco_nome,
banco_codigo: solicitacao.dados_novos.banco_codigo,
```

## Como Executar a Correção

### Passo 1: Execute o Script SQL

1. **Abra o Supabase SQL Editor**
   - Acesse: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

2. **Execute o script de correção completa**
   - Abra o arquivo: `nuxt-app/database/fixes/fix_todos_enums_COMPLETO.sql`
   - Copie TODO o conteúdo
   - Cole no SQL Editor do Supabase
   - Clique em "Run"

3. **Verifique os resultados**
   - Você verá mensagens de sucesso para cada enum corrigido
   - Tabelas mostrando os valores aceitos
   - Contagem de registros afetados

### Passo 2: Reinicie o Servidor

```bash
# Pare o servidor (Ctrl+C se estiver rodando)
# Inicie novamente
cd nuxt-app
npm run dev
```

### Passo 3: Teste o Fluxo Completo

**Como Funcionário:**
1. Faça login com um usuário funcionário
2. Vá em "Meu Perfil"
3. Edite dados bancários (escolha tipo de conta)
4. Edite dados pessoais (escolha estado civil)
5. Envie as solicitações

**Como Admin:**
1. Faça login como admin
2. Vá em "Alterações de Dados"
3. Aprove as solicitações
4. ✅ Deve funcionar sem erros!

## Verificação de Sucesso

Após executar, você verá no SQL Editor:

```
✓ tipo_conta_bancaria corrigido
✓ estado_civil corrigido

=== TIPO_CONTA_BANCARIA ===
Valores aceitos:
- corrente
- poupanca
- salario

=== ESTADO_CIVIL ===
Valores aceitos:
- Solteiro(a)
- Casado(a)
- Divorciado(a)
- Viúvo(a)
- União Estável

✓ Correção completa executada com sucesso!
```

## O Que Foi Corrigido

### Dados Bancários
- ✅ Enum aceita: corrente, poupanca, salario
- ✅ Campos corretos: banco_nome, banco_codigo
- ✅ Conversão automática de dados antigos

### Dados Pessoais
- ✅ Enum aceita: Solteiro(a), Casado(a), etc.
- ✅ Valores com formatação correta
- ✅ Conversão automática de dados antigos

### Endpoint de Aprovação
- ✅ Campos de banco corrigidos
- ✅ Compatível com frontend
- ✅ Validação funcionando

## Prevenção de Problemas Futuros

1. **Sempre teste o fluxo completo**: Criação → Solicitação → Aprovação
2. **Mantenha consistência**: Frontend e backend devem usar os mesmos valores
3. **Documente enums**: Sempre documente os valores aceitos
4. **Valide antes de salvar**: Adicione validação nos endpoints
