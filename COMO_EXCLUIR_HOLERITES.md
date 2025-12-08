# 🗑️ Como Excluir Holerites Errados

## 📋 Situação Atual

Atualmente, **funcionários NÃO podem excluir** seus próprios holerites pelo portal. Apenas **administradores** têm essa permissão.

## ✅ Solução Implementada

Criei uma API de exclusão de holerites com as seguintes regras de segurança:

### Regras de Exclusão

1. ✅ Apenas holerites com status **"gerado"** podem ser excluídos
2. ❌ Holerites **"enviado"** ou **"pago"** NÃO podem ser excluídos
3. 🔒 Apenas **administradores** podem excluir
4. 📝 A exclusão é registrada no log de atividades

## 🚀 Como Usar

### Opção 1: Pelo Supabase (Mais Rápido)

Execute este SQL no Supabase SQL Editor:

```sql
-- Ver holerites que podem ser excluídos
SELECT 
  id,
  nome_colaborador,
  mes,
  ano,
  tipo,
  parcela_13,
  status,
  salario_liquido
FROM holerites
WHERE status = 'gerado'  -- Apenas holerites não enviados
ORDER BY created_at DESC;

-- Excluir um holerite específico (substitua o ID)
DELETE FROM holerites
WHERE id = 'COLE_O_ID_AQUI'
  AND status = 'gerado';  -- Segurança extra
```

### Opção 2: Pela API (Recomendado para Produção)

Use a API criada:

```bash
# Excluir holerite por ID
DELETE /api/holerites/{id}
```

**Exemplo com fetch:**

```javascript
const excluirHolerite = async (holeriteId) => {
  const response = await fetch(`/api/holerites/${holeriteId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  if (response.ok) {
    console.log('Holerite excluído com sucesso')
  }
}
```

## 🔍 Verificar Holerites Duplicados

Se você gerou holerites duplicados, use este SQL:

```sql
-- Ver holerites duplicados
SELECT 
  colaborador_id,
  nome_colaborador,
  mes,
  ano,
  tipo,
  COUNT(*) as quantidade
FROM holerites
GROUP BY colaborador_id, nome_colaborador, mes, ano, tipo
HAVING COUNT(*) > 1
ORDER BY quantidade DESC;

-- Excluir duplicatas (mantém apenas o mais recente)
DELETE FROM holerites h1
WHERE EXISTS (
  SELECT 1 FROM holerites h2
  WHERE h2.colaborador_id = h1.colaborador_id
    AND h2.mes = h1.mes
    AND h2.ano = h1.ano
    AND h2.tipo = h1.tipo
    AND h2.created_at > h1.created_at
)
AND h1.status = 'gerado';
```

## 📊 Casos de Uso Comuns

### 1. Excluir Holerite com Valor Errado

```sql
-- 1. Encontrar o holerite
SELECT id, nome_colaborador, mes, ano, salario_liquido
FROM holerites
WHERE nome_colaborador ILIKE '%NOME%'
  AND mes = 12
  AND ano = 2025;

-- 2. Excluir
DELETE FROM holerites
WHERE id = 'ID_ENCONTRADO'
  AND status = 'gerado';

-- 3. Gerar novamente pela interface
-- Vá em Folha de Pagamento > 13º Salário > Gerar
```

### 2. Excluir Todos os Holerites de 13º de um Mês

```sql
-- ⚠️ CUIDADO: Isso exclui TODOS os holerites de 13º do mês
DELETE FROM holerites
WHERE tipo = 'decimo_terceiro'
  AND mes = 12
  AND ano = 2025
  AND status = 'gerado';
```

### 3. Excluir Apenas a 2ª Parcela

```sql
DELETE FROM holerites
WHERE tipo = 'decimo_terceiro'
  AND parcela_13 = '2'
  AND ano = 2025
  AND status = 'gerado';
```

## ⚠️ Avisos Importantes

1. **Backup**: Sempre faça backup antes de excluir em massa
2. **Status**: Só exclua holerites com status "gerado"
3. **Auditoria**: Todas as exclusões devem ser documentadas
4. **Regeneração**: Após excluir, gere novamente pela interface

## 🔐 Segurança

A API de exclusão tem as seguintes proteções:

- ✅ Requer autenticação
- ✅ Verifica se o holerite existe
- ✅ Impede exclusão de holerites enviados/pagos
- ✅ Registra quem excluiu e quando
- ✅ Retorna mensagem de confirmação

## 📝 Exemplo Completo

```sql
-- PASSO 1: Ver o que será excluído
SELECT 
  id,
  nome_colaborador,
  mes,
  ano,
  tipo,
  parcela_13,
  salario_liquido,
  status
FROM holerites
WHERE tipo = 'decimo_terceiro'
  AND ano = 2025
  AND status = 'gerado'
ORDER BY nome_colaborador, mes;

-- PASSO 2: Confirmar que está correto

-- PASSO 3: Excluir
DELETE FROM holerites
WHERE tipo = 'decimo_terceiro'
  AND ano = 2025
  AND status = 'gerado';

-- PASSO 4: Verificar
SELECT COUNT(*) as total_restante
FROM holerites
WHERE tipo = 'decimo_terceiro'
  AND ano = 2025;

-- PASSO 5: Gerar novamente pela interface
```

## 🆘 Recuperação

Se excluiu por engano:

1. **Não há recuperação automática** - os dados são permanentemente excluídos
2. **Solução**: Gere novamente pela interface
3. **Prevenção**: Sempre verifique antes de excluir

---

**Arquivo criado**: `server/api/holerites/[id].delete.ts`
**Status**: ✅ Pronto para uso
**Segurança**: 🔒 Alta
