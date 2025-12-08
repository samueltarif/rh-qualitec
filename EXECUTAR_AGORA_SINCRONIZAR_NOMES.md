# 🔄 Sincronizar Nomes entre Colaboradores e Usuários

## 📋 Problema

Quando você altera o nome de um colaborador na aba "Colaboradores", a alteração não aparece automaticamente na aba "Gestão de Usuários" porque são duas tabelas diferentes:

- **Tabela `colaboradores`** - Coluna `id` e `nome`
- **Tabela `app_users`** - Coluna `id` e `nome`

## ✅ Solução

Execute o script SQL que cria um **trigger automático** para sincronizar os nomes.

## 🚀 Como Executar

### 1. Abra o Supabase SQL Editor

Acesse: https://app.supabase.com → Seu Projeto → SQL Editor

### 2. Cole e Execute o Script

Copie todo o conteúdo do arquivo:
```
nuxt-app/database/fixes/fix_sincronizar_nomes_colaboradores_usuarios.sql
```

### 3. Clique em "Run"

O script vai:
- ✅ Criar uma função de sincronização
- ✅ Criar um trigger automático
- ✅ Sincronizar todos os nomes existentes
- ✅ Mostrar o status da sincronização

## 🎯 O Que Acontece Depois

### Antes (Problema):
```
Colaboradores:
- ID: abc123 | Nome: JOÃO SILVA

App_Users:
- ID: abc123 | Nome: João Silva  ❌ Diferente!
```

### Depois (Solução):
```
Colaboradores:
- ID: abc123 | Nome: JOÃO SILVA

App_Users:
- ID: abc123 | Nome: JOÃO SILVA  ✅ Sincronizado!
```

## 🔄 Funcionamento Automático

Agora, sempre que você alterar o nome de um colaborador:

1. **Você edita** na aba Colaboradores
2. **Sistema salva** na tabela `colaboradores`
3. **Trigger dispara** automaticamente
4. **Nome atualiza** na tabela `app_users`
5. **Aparece atualizado** na aba Gestão de Usuários

## 📊 Verificar Sincronização

Execute esta query para ver o status:

```sql
SELECT 
  c.id,
  c.nome as nome_colaborador,
  au.nome as nome_usuario,
  CASE 
    WHEN c.nome = au.nome THEN '✅ OK'
    ELSE '❌ Diferente'
  END as status
FROM colaboradores c
LEFT JOIN app_users au ON c.id = au.id
WHERE au.id IS NOT NULL
ORDER BY c.nome;
```

## 🎉 Pronto!

Agora os nomes ficam sempre sincronizados automaticamente entre as duas tabelas!

---

**Nota:** Este trigger só sincroniza o **nome**. Se precisar sincronizar outros campos (email, telefone, etc.), me avise que crio triggers adicionais.
