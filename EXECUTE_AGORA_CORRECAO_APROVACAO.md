# 🚨 EXECUTE AGORA: Correção de Aprovação de Alterações

## ⚡ Ação Imediata Necessária

O sistema está com erro ao aprovar alterações de dados dos funcionários.

## 🎯 Solução em 3 Passos

### 1️⃣ Execute o Script SQL (2 minutos)

1. Abra: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Copie o conteúdo de: `nuxt-app/database/fixes/fix_enums_COM_VIEWS.sql`
3. Cole no SQL Editor
4. Clique em **RUN**
5. Aguarde mensagem de sucesso

**IMPORTANTE:** Use o arquivo `fix_enums_COM_VIEWS.sql` (não o `fix_todos_enums_COMPLETO.sql`)

### 2️⃣ Reinicie o Servidor (30 segundos)

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
cd nuxt-app
npm run dev
```

### 3️⃣ Teste (2 minutos)

**Como Funcionário:**
- Login → Meu Perfil → Editar Dados Bancários
- Escolha tipo de conta e envie

**Como Admin:**
- Login → Alterações de Dados → Aprovar
- ✅ Deve funcionar!

## 🔍 O Que Foi Corrigido

### Problema 1: Enum tipo_conta_bancaria
- ❌ Banco tinha: `'Corrente'`, `'Poupanca'`
- ✅ Agora aceita: `'corrente'`, `'poupanca'`, `'salario'`

### Problema 2: Enum estado_civil
- ❌ Banco tinha: `'Solteiro'`, `'Casado'`
- ✅ Agora aceita: `'Solteiro(a)'`, `'Casado(a)'`, `'União Estável'`

### Problema 3: Campos de banco
- ❌ Endpoint usava: `banco`
- ✅ Agora usa: `banco_nome`, `banco_codigo`

## 📁 Arquivos Criados/Modificados

```
✅ database/fixes/fix_enums_COM_VIEWS.sql (⭐ EXECUTE ESTE!)
✅ server/api/admin/alteracoes-dados/[id].put.ts (já corrigido)
📖 database/SOLUCAO_APROVACAO_FUNCIONARIOS.md (documentação completa)
📖 database/CORRIGIR_APROVACAO_DADOS.md (guia detalhado)
```

**NOTA:** O arquivo `fix_enums_COM_VIEWS.sql` resolve o problema de views/rules que dependem das colunas.

## ✅ Checklist

- [ ] Script SQL executado no Supabase
- [ ] Servidor reiniciado
- [ ] Teste como funcionário (solicitar alteração)
- [ ] Teste como admin (aprovar alteração)
- [ ] Confirmado que funciona sem erros

## 🆘 Se Algo Der Errado

1. Verifique se o script foi executado completamente
2. Confirme que não há erros no console do Supabase
3. Reinicie o servidor novamente
4. Limpe o cache do navegador (Ctrl+Shift+Del)

## 📚 Documentação Completa

Para entender todos os detalhes:
- `SOLUCAO_APROVACAO_FUNCIONARIOS.md` - Solução completa
- `CORRIGIR_APROVACAO_DADOS.md` - Guia passo a passo

---

**⏱️ Tempo total estimado: 5 minutos**
**🎯 Resultado: Sistema de aprovação funcionando 100%**
