# 🚀 Guia Rápido: Corrigir Silvana "Sem Acesso"

## 🎯 Problema

Silvana aparece no card "Colaboradores sem Acesso" mesmo tendo usuário ativo.

## ✅ Solução em 3 Passos

### 1️⃣ Executar SQL no Supabase

1. Abrir **Supabase Dashboard**
2. Ir em **SQL Editor**
3. Copiar e colar este SQL:

```sql
-- Vincular usuário da Silvana ao colaborador
UPDATE app_users
SET 
  colaborador_id = (
    SELECT id 
    FROM colaboradores 
    WHERE LOWER(email_corporativo) = 'silvana@qualitec.ind.br'
    LIMIT 1
  ),
  updated_at = NOW()
WHERE LOWER(email) = 'silvana@qualitec.ind.br';
```

4. Clicar em **Run** ou **Ctrl + Enter**

### 2️⃣ Verificar no Banco

Executar para confirmar:

```sql
SELECT 
  c.nome AS colaborador,
  u.email AS usuario,
  u.role,
  CASE 
    WHEN u.colaborador_id = c.id THEN '✅ Vinculado'
    ELSE '❌ Problema'
  END AS status
FROM colaboradores c
INNER JOIN app_users u ON c.id = u.colaborador_id
WHERE LOWER(u.email) = 'silvana@qualitec.ind.br';
```

**Resultado esperado**:
```
colaborador: Silvana Bevilacqua
usuario: silvana@qualitec.ind.br
role: admin
status: ✅ Vinculado
```

### 3️⃣ Recarregar Sistema

1. Ir na página **Usuários** no sistema
2. Pressionar **Ctrl + Shift + R** (recarregar sem cache)
3. Verificar card **"Colaboradores sem Acesso"**
4. Silvana **NÃO** deve aparecer mais ✅

## 🔍 Como Verificar se Funcionou

### No Sistema:
- [ ] Silvana não aparece em "Colaboradores sem Acesso"
- [ ] Silvana consegue fazer login normalmente
- [ ] Silvana tem acesso admin (vê todas as páginas)

### No Banco:
```sql
-- Deve retornar 0 linhas (Silvana não está sem acesso)
SELECT COUNT(*) 
FROM colaboradores c
LEFT JOIN app_users u ON c.id = u.colaborador_id
WHERE c.status = 'Ativo' 
  AND u.id IS NULL
  AND LOWER(c.email_corporativo) = 'silvana@qualitec.ind.br';
```

## 🆘 Se Não Funcionar

### Opção A: Verificar se Silvana existe nas duas tabelas

```sql
-- Ver colaborador
SELECT * FROM colaboradores 
WHERE LOWER(email_corporativo) = 'silvana@qualitec.ind.br';

-- Ver usuário
SELECT * FROM app_users 
WHERE LOWER(email) = 'silvana@qualitec.ind.br';
```

Se algum não existir, criar:

**Criar colaborador** (se não existir):
```sql
INSERT INTO colaboradores (
  empresa_id,
  nome,
  cpf,
  email_corporativo,
  status,
  tipo_contrato,
  salario,
  data_admissao
) VALUES (
  (SELECT id FROM empresas LIMIT 1),
  'Silvana Bevilacqua',
  '000.000.000-00', -- CPF real
  'silvana@qualitec.ind.br',
  'Ativo',
  'CLT',
  0,
  NOW()
);
```

**Criar usuário** (se não existir):
- Usar a interface em Usuários → Novo Usuário

### Opção B: Forçar vínculo manualmente

```sql
-- 1. Pegar ID do colaborador
SELECT id FROM colaboradores 
WHERE LOWER(email_corporativo) = 'silvana@qualitec.ind.br';

-- 2. Pegar ID do usuário
SELECT id FROM app_users 
WHERE LOWER(email) = 'silvana@qualitec.ind.br';

-- 3. Vincular (substituir IDs)
UPDATE app_users
SET colaborador_id = 'ID_DO_COLABORADOR_AQUI'
WHERE id = 'ID_DO_USUARIO_AQUI';
```

### Opção C: Limpar cache do navegador

```
Chrome/Edge: Ctrl + Shift + Delete
Firefox: Ctrl + Shift + Delete
Safari: Cmd + Option + E

Ou abrir em aba anônima:
Ctrl + Shift + N (Windows)
Cmd + Shift + N (Mac)
```

## 📋 Checklist Final

- [ ] SQL executado no Supabase
- [ ] Vínculo confirmado no banco
- [ ] Sistema recarregado (Ctrl + Shift + R)
- [ ] Silvana não aparece em "sem acesso"
- [ ] Silvana consegue fazer login
- [ ] Silvana tem acesso admin

## 💡 Por Que Aconteceu?

Silvana provavelmente foi criada em momentos diferentes:
1. Primeiro: criado colaborador
2. Depois: criado usuário (mas sem vincular)

Com a nova funcionalidade, isso não acontece mais porque:
- Criar colaborador + usuário juntos (automático)
- Sistema exclui admins da lista "sem acesso"

## 📚 Documentação Completa

Ver: `SOLUCAO_SILVANA_SEM_ACESSO.md`

---

**Tempo estimado**: 2 minutos  
**Dificuldade**: Fácil  
**Requer**: Acesso ao Supabase Dashboard
