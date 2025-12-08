# 🚨 CORRIGIR ERRO DE HOLERITES - EXECUTAR AGORA

## ❌ Problema
```
Erro ao gerar holerite individual: new row violates row-level security policy for table "holerites"
Erro ao gerar 13º salário: 401 Server Error
```

## ✅ Solução Rápida

### 1️⃣ Executar SQL no Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Copie e cole o conteúdo do arquivo:
   ```
   nuxt-app/database/FIX_RLS_HOLERITES_COMPLETO.sql
   ```
5. Clique em **RUN**

### 2️⃣ Testar Imediatamente

#### Teste 1: Holerite Individual
1. Acesse: http://localhost:3000/folha-pagamento
2. Clique em **"Gerar Holerite Individual"**
3. Selecione um colaborador
4. Clique em **"Gerar Holerite"**
5. ✅ Deve funcionar sem erro 403/500

#### Teste 2: 13º Salário
1. Na mesma página, clique em **"13º Salário"**
2. Selecione:
   - Ano: 2024
   - Parcela: 1ª ou 2ª
3. Clique em **"Gerar Holerites"**
4. ✅ Deve gerar sem erro 401

## 🔍 O Que Foi Corrigido

### Antes (❌ Problema)
- Políticas RLS muito restritivas
- Admin não conseguia inserir holerites
- Verificações complexas causavam falhas

### Depois (✅ Solução)
- Admin pode inserir holerites **SEM RESTRIÇÕES**
- Admin pode fazer todas as operações
- Funcionários continuam vendo apenas seus holerites
- Políticas simplificadas e eficientes

## 📊 Políticas RLS Criadas

```sql
-- Admin (todas as operações)
✓ Admin pode ver todos os holerites
✓ Admin pode inserir holerites (SEM RESTRIÇÕES)
✓ Admin pode atualizar holerites
✓ Admin pode deletar holerites

-- Funcionário (apenas leitura dos seus)
✓ Funcionário pode ver seus próprios holerites
✓ Funcionário pode marcar como visualizado
```

## 🎯 Funcionalidades Liberadas

Após executar o fix, você poderá:

1. ✅ Gerar holerites individuais
2. ✅ Gerar 13º salário (1ª parcela)
3. ✅ Gerar 13º salário (2ª parcela)
4. ✅ Enviar holerites por email
5. ✅ Excluir holerites
6. ✅ Visualizar histórico completo

## 🔧 Verificação

Execute no SQL Editor para confirmar:

```sql
-- Ver políticas ativas
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'holerites'
ORDER BY policyname;

-- Deve retornar 6 políticas
```

## ⚠️ Importante

- **Não desabilite o RLS** - ele protege os dados dos funcionários
- As políticas garantem que funcionários vejam apenas seus holerites
- Admins têm acesso total para gerenciar o sistema

## 🚀 Pronto!

Após executar o SQL, teste imediatamente as funcionalidades.
Qualquer erro, verifique o console do navegador e os logs do servidor.
