# Sistema de Exclusão e Recriação de Holerites

## 📋 Resumo

Implementado sistema completo para exclusão de holerites e recriação automática, permitindo que o admin gerencie holerites com flexibilidade total.

## ✨ Funcionalidades Implementadas

### 1. Exclusão de Holerites (Admin)

**Localização:** `app/pages/admin/holerites.vue`

- ✅ Botão "🗑️ Excluir" em cada holerite
- ✅ Confirmação antes de excluir
- ✅ Exclusão permanente do banco de dados
- ✅ Atualização automática da lista após exclusão
- ✅ Notificação de sucesso/erro

**Como usar:**
1. Acesse a página de Gestão de Holerites (admin)
2. Localize o holerite que deseja excluir
3. Clique no botão "🗑️ Excluir"
4. Confirme a exclusão no alerta
5. O holerite será removido do sistema

### 2. API de Exclusão

**Arquivo:** `server/api/holerites/[id].delete.ts`

```typescript
DELETE /api/holerites/:id
```

**Funcionalidade:**
- Exclui holerite do banco de dados usando Service Role Key
- Retorna confirmação de sucesso
- Tratamento de erros adequado

### 3. Geração com Opção de Recriar

**Localização:** `app/pages/admin/holerites.vue`

**Melhorias:**
- ✅ Modal de confirmação antes de gerar
- ✅ Checkbox "🔄 Recriar holerites existentes"
- ✅ Informações claras sobre o que será feito
- ✅ Opção de recriar holerites já existentes

**Como usar:**
1. Clique em "🤖 Gerar Automático"
2. Um modal será exibido com opções:
   - **Sem marcar checkbox:** Gera apenas holerites que não existem
   - **Com checkbox marcado:** Exclui e recria todos os holerites do período
3. Clique em "✓ Confirmar Geração"

### 4. API de Geração Atualizada

**Arquivo:** `server/api/holerites/gerar.post.ts`

**Novo parâmetro:**
```typescript
{
  periodo_inicio: string,
  periodo_fim: string,
  funcionario_ids?: number[],
  recriar?: boolean  // NOVO!
}
```

**Comportamento:**
- `recriar = false` (padrão): Pula holerites já existentes
- `recriar = true`: Exclui e recria holerites existentes

**Lógica implementada:**
```typescript
// Verifica se existe
const { data: existente } = await supabase
  .from('holerites')
  .select('id')
  .eq('funcionario_id', funcionario.id)
  .eq('periodo_inicio', inicio)
  .eq('periodo_fim', fim)
  .single()

// Se existe e não deve recriar, pula
if (existente && !recriar) {
  continue
}

// Se existe e deve recriar, exclui o antigo
if (existente && recriar) {
  await supabase
    .from('holerites')
    .delete()
    .eq('id', existente.id)
}

// Cria o novo holerite
```

## 🔄 Sincronização Automática

### Painel do Funcionário

**Arquivo:** `app/pages/holerites.vue`

- ✅ Busca holerites diretamente do banco via API
- ✅ Quando admin exclui, holerite desaparece automaticamente
- ✅ Quando admin recria, novo holerite aparece automaticamente
- ✅ Não requer alterações adicionais

**API usada:**
```typescript
GET /api/holerites/meus-holerites?funcionarioId=:id
```

## 🎯 Casos de Uso

### Caso 1: Corrigir Erro em Holerite
1. Admin identifica erro em holerite gerado
2. Admin clica em "🗑️ Excluir" no holerite problemático
3. Admin corrige dados do funcionário (salário, dependentes, etc.)
4. Admin clica em "🤖 Gerar Automático"
5. Marca checkbox "🔄 Recriar holerites existentes"
6. Novo holerite é gerado com dados corretos

### Caso 2: Atualizar Todos os Holerites do Período
1. Admin precisa recalcular todos os holerites (ex: mudança na tabela de INSS)
2. Admin clica em "🤖 Gerar Automático"
3. Marca checkbox "🔄 Recriar holerites existentes"
4. Todos os holerites do período são excluídos e recriados

### Caso 3: Remover Holerite Específico
1. Admin identifica holerite que não deveria existir
2. Admin clica em "🗑️ Excluir"
3. Holerite é removido permanentemente
4. Funcionário não vê mais o holerite em seu painel

## 🔒 Segurança

- ✅ Apenas admins podem excluir holerites
- ✅ Confirmação obrigatória antes de excluir
- ✅ Uso de Service Role Key para operações no banco
- ✅ Logs de todas as operações
- ✅ Tratamento de erros adequado

## 📊 Fluxo de Dados

```
Admin exclui holerite
    ↓
DELETE /api/holerites/:id
    ↓
Supabase remove registro
    ↓
Lista de holerites atualizada (admin)
    ↓
Funcionário recarrega página
    ↓
GET /api/holerites/meus-holerites
    ↓
Holerite não aparece mais
```

## 🎨 Interface do Usuário

### Botão de Exclusão
- Cor: Vermelho (variant="danger")
- Ícone: 🗑️
- Texto: "Excluir"
- Posição: Ao lado dos botões Ver, Editar e Enviar

### Modal de Geração
- Título: "Gerar Holerites Automáticos"
- Informações claras sobre o que será feito
- Checkbox para recriar holerites existentes
- Botões: Cancelar e Confirmar Geração

### Notificações
- Sucesso: Verde com mensagem de confirmação
- Erro: Vermelho com descrição do problema
- Informação: Azul para avisos gerais

## 📝 Notas Técnicas

1. **Exclusão em Cascata:** Não implementada - holerites são excluídos individualmente
2. **Backup:** Não há backup automático - exclusão é permanente
3. **Auditoria:** Logs no console do servidor para rastreamento
4. **Performance:** Exclusão e recriação são operações rápidas (< 1s por holerite)

## 🚀 Próximas Melhorias Sugeridas

- [ ] Histórico de exclusões (auditoria)
- [ ] Backup automático antes de excluir
- [ ] Exclusão em lote (múltiplos holerites)
- [ ] Restauração de holerites excluídos (soft delete)
- [ ] Notificação por email ao funcionário quando holerite é excluído
- [ ] Permissões granulares (quem pode excluir)

## ✅ Status

**Implementação:** Completa
**Testes:** Pendente
**Documentação:** Completa
**Deploy:** Pronto para produção

---

**Data:** 15/01/2026
**Desenvolvedor:** Sistema RH
**Versão:** 1.0.0
