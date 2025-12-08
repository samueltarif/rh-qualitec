# 🔧 FIX RÁPIDO: Estado Civil Vazio

## O Problema

O estado civil não aparece no formulário porque o valor no banco está em formato diferente.

## Solução em 3 Passos

### 1️⃣ Abra o Supabase SQL Editor

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Clique em "SQL Editor" no menu lateral

### 2️⃣ Execute o Script

1. Copie TODO o conteúdo do arquivo: `database/FIX_ESTADO_CIVIL_AGORA.sql`
2. Cole no SQL Editor
3. Clique em "Run" (ou pressione Ctrl+Enter)

### 3️⃣ Recarregue o Navegador

1. Volte para o painel admin
2. Pressione `F5` para recarregar
3. Abra o modal de edição do colaborador
4. Vá para "Dados Pessoais"
5. ✅ O estado civil deve aparecer agora!

## O Que o Script Faz

- Converte todos os valores de estado civil para lowercase
- Padroniza: `Casado(a)` → `casado`
- Padroniza: `União Estável` → `uniao_estavel`
- Corrige TODOS os colaboradores de uma vez

## Valores Corretos Após o Fix

- ✅ `solteiro`
- ✅ `casado`
- ✅ `divorciado`
- ✅ `viuvo`
- ✅ `uniao_estavel`

## Resultado Esperado

Após executar o script, você verá algo assim:

```
Estado Civil | Quantidade
-------------|------------
casado       | 5
solteiro     | 3
viuvo        | 1
```

E o Samuel especificamente:

```
nome                  | cpf          | estado_civil | sexo
----------------------|--------------|--------------|------
SAMUEL BARRETOS TARIF | 43396431812  | casado       | M
```

## ⚠️ Importante

Este script corrige o problema de forma permanente. Você só precisa executá-lo UMA VEZ.

Depois disso, todos os novos valores salvos já estarão no formato correto automaticamente.
