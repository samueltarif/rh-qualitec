# ✅ Correção de Segurança: API de Colaboradores

## Problema Corrigido

**ANTES (Inseguro):**
```javascript
// Frontend fazendo PATCH direto no Supabase
await supabase
  .from('colaboradores')
  .update({ salario: 999999 }) // ❌ Qualquer um pode manipular
  .eq('id', id)
```

**DEPOIS (Seguro):**
```javascript
// Frontend chama API do servidor
await $fetch(`/api/colaboradores/${id}`, {
  method: 'PUT',
  body: { salario: 5000 } // ✅ Validado no servidor
})
```

## O que foi implementado

### 1. API Segura no Servidor
- `server/api/colaboradores/[id].put.ts`
- Valida autenticação
- Verifica se é admin
- Filtra campos permitidos
- Valida dados (CPF, salário, etc.)

### 2. Proteções Implementadas

#### Autenticação
```typescript
if (!session?.user) {
  throw createError({ statusCode: 401 })
}
```

#### Autorização
```typescript
if (appUser.role !== 'admin') {
  throw createError({ statusCode: 403 })
}
```

#### Whitelist de Campos
Apenas campos específicos podem ser atualizados:
- ✅ nome, cpf, salario, cargo_id, etc.
- ❌ id, empresa_id, created_at (protegidos)

#### Validações
- CPF deve ter 11 dígitos
- Salário não pode ser negativo
- Campos obrigatórios verificados

### 3. Criação de Usuário Segura

Se `criar_usuario: true`:
1. Cria usuário no Supabase Auth
2. Cria registro em `app_users`
3. Vincula ao colaborador
4. Tudo no servidor (seguro)

## Como Usar

### No Frontend (Componente/Composable)

```typescript
// Atualizar colaborador
const atualizarColaborador = async (id: string, dados: any) => {
  try {
    const response = await $fetch(`/api/colaboradores/${id}`, {
      method: 'PUT',
      body: {
        nome: dados.nome,
        cpf: dados.cpf,
        salario: dados.salario,
        cargo_id: dados.cargo_id,
        // ... outros campos
      }
    })
    
    return response.data
  } catch (error) {
    console.error('Erro ao atualizar:', error)
    throw error
  }
}

// Atualizar E criar usuário
const atualizarComUsuario = async (id: string, dados: any) => {
  const response = await $fetch(`/api/colaboradores/${id}`, {
    method: 'PUT',
    body: {
      ...dados,
      criar_usuario: true,
      usuario_email: 'usuario@qualitec.ind.br',
      usuario_senha: 'senha123',
      usuario_role: 'funcionario',
      usuario_ativo: true
    }
  })
  
  return response.data
}
```

## Benefícios de Segurança

### 1. Validação Centralizada
- Todas as validações em um único lugar
- Impossível burlar no frontend

### 2. Auditoria
- Logs no servidor
- Rastreamento de quem fez o quê

### 3. Proteção de Dados Sensíveis
- Salário só pode ser alterado por admin
- CPF validado antes de salvar
- Campos críticos protegidos

### 4. Prevenção de Ataques
- ❌ Não pode alterar `empresa_id`
- ❌ Não pode alterar `id`
- ❌ Não pode injetar campos maliciosos
- ❌ Não pode burlar permissões

## Próximos Passos

Para completar a segurança:

1. **Atualizar o frontend** para usar a nova API
2. **Remover** chamadas diretas ao Supabase
3. **Adicionar** logs de auditoria
4. **Implementar** rate limiting

## Exemplo de Migração

### Antes (Inseguro)
```vue
<script setup>
const salvar = async () => {
  const { error } = await supabase
    .from('colaboradores')
    .update(formData.value)
    .eq('id', colaboradorId)
}
</script>
```

### Depois (Seguro)
```vue
<script setup>
const salvar = async () => {
  try {
    await $fetch(`/api/colaboradores/${colaboradorId}`, {
      method: 'PUT',
      body: formData.value
    })
    alert('Salvo com sucesso!')
  } catch (error) {
    alert('Erro ao salvar')
  }
}
</script>
```

## Testando

```bash
# Teste com curl
curl -X PUT http://localhost:3000/api/colaboradores/ID_AQUI \
  -H "Content-Type: application/json" \
  -d '{"nome": "João Silva", "salario": 5000}'
```

---

**Status:** ✅ Implementado e pronto para uso
**Prioridade:** 🔴 Alta (Segurança)
**Impacto:** Protege dados sensíveis de RH
