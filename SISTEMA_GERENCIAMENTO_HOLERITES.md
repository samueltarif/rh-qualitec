# 🗂️ Sistema de Gerenciamento de Holerites

## ✅ Implementado

Sistema completo e componentizado para gerenciar holerites na Folha de Pagamento.

## 📦 Componentes Criados

### 1. `HoleriteCard.vue`
Card reutilizável para exibir um holerite individual.

**Props:**
- `holerite`: Objeto com dados do holerite
- `showDelete`: Boolean para mostrar botão de exclusão

**Eventos:**
- `@visualizar`: Emitido ao clicar em visualizar
- `@excluir`: Emitido ao clicar em excluir

**Uso:**
```vue
<HoleriteCard
  :holerite="holerite"
  :show-delete="true"
  @visualizar="verHolerite"
  @excluir="excluirHolerite"
/>
```

### 2. `HoleritesList.vue`
Lista de holerites com filtros avançados.

**Props:**
- `holerites`: Array de holerites
- `loading`: Estado de carregamento
- `showDelete`: Mostrar botão de exclusão

**Filtros:**
- Mês
- Ano
- Status (Gerado, Enviado, Pago)
- Tipo (Mensal, 13º Salário)

**Uso:**
```vue
<HoleritesList
  :holerites="holerites"
  :loading="loading"
  :show-delete="true"
  @visualizar="verHolerite"
  @excluir="excluirHolerite"
/>
```

### 3. `ModalConfirmarExclusao.vue`
Modal de confirmação para exclusão de holerites.

**Props:**
- `show`: Boolean para mostrar/ocultar
- `holerite`: Holerite a ser excluído
- `loading`: Estado de carregamento

**Eventos:**
- `@close`: Fechar modal
- `@confirmar`: Confirmar exclusão

**Uso:**
```vue
<ModalConfirmarExclusao
  :show="modalAberto"
  :holerite="holeriteParaExcluir"
  :loading="excluindo"
  @close="fecharModal"
  @confirmar="confirmarExclusao"
/>
```

## 🔧 Composable

### `useHolerites.ts`
Composable para gerenciar holerites.

**Métodos:**
- `buscarHolerites(filtros?)`: Buscar holerites com filtros
- `buscarHoleritePorId(id)`: Buscar holerite específico
- `excluirHolerite(id)`: Excluir holerite
- `gerarHolerites(dados)`: Gerar novos holerites
- `enviarHoleritePorEmail(id)`: Enviar por email
- `gerar13Salario(dados)`: Gerar 13º salário

**Uso:**
```typescript
const { 
  holerites, 
  loading, 
  error,
  buscarHolerites,
  excluirHolerite 
} = useHolerites()

// Buscar todos
await buscarHolerites()

// Buscar com filtros
await buscarHolerites({
  mes: 12,
  ano: 2025,
  status: 'gerado'
})

// Excluir
await excluirHolerite('holerite-id')
```

## 📄 Página

### `/folha-pagamento/holerites`
Página completa de gerenciamento de holerites.

**Recursos:**
- ✅ Visualização em cards
- ✅ Filtros avançados
- ✅ Estatísticas (Total, Gerados, Enviados, Valor Total)
- ✅ Exclusão com confirmação
- ✅ Visualização detalhada
- ✅ Atualização em tempo real

## 🔐 Segurança

### Regras de Exclusão
1. ✅ Apenas holerites com status **"gerado"** podem ser excluídos
2. ❌ Holerites **"enviado"** ou **"pago"** NÃO podem ser excluídos
3. 🔒 Apenas **administradores** podem excluir
4. 📝 Todas as exclusões são registradas no log

### API de Exclusão
**Endpoint:** `DELETE /api/holerites/:id`

**Validações:**
- Verifica autenticação
- Verifica se holerite existe
- Verifica status (só permite "gerado")
- Registra no log de atividades

## 🎯 Como Usar

### 1. Acessar Gerenciamento
```
Folha de Pagamento > Gerenciar Holerites
```

### 2. Filtrar Holerites
- Selecione mês, ano, status ou tipo
- Clique em "Filtrar"

### 3. Excluir Holerite
1. Encontre o holerite (deve estar com status "Gerado")
2. Clique no botão "Excluir"
3. Confirme a exclusão no modal
4. Holerite será excluído permanentemente

### 4. Gerar Novamente
Após excluir, você pode gerar novamente:
- Vá em "Gerar Holerites"
- Selecione os colaboradores
- Gere novamente

## 📊 Exemplos de Uso

### Excluir Holerite Errado
```typescript
// 1. Buscar holerites
const { holerites, excluirHolerite } = useHolerites()
await buscarHolerites({ mes: 12, ano: 2025 })

// 2. Encontrar o holerite errado
const holeriteErrado = holerites.value.find(h => 
  h.nome_colaborador === 'João Silva' && 
  h.status === 'gerado'
)

// 3. Excluir
if (holeriteErrado) {
  await excluirHolerite(holeriteErrado.id)
}
```

### Excluir Todos de um Mês
```typescript
// Buscar holerites do mês
await buscarHolerites({ 
  mes: 12, 
  ano: 2025, 
  status: 'gerado' 
})

// Excluir todos
for (const holerite of holerites.value) {
  await excluirHolerite(holerite.id)
}
```

### Excluir Apenas 13º Salário
```typescript
// Buscar 13º salário
await buscarHolerites({ 
  tipo: 'decimo_terceiro',
  ano: 2025,
  status: 'gerado'
})

// Excluir
for (const holerite of holerites.value) {
  await excluirHolerite(holerite.id)
}
```

## 🎨 Personalização

### Cores dos Status
```typescript
const statusColors = {
  gerado: 'blue',    // Azul
  enviado: 'green',  // Verde
  pago: 'purple',    // Roxo
  cancelado: 'red'   // Vermelho
}
```

### Adicionar Novo Filtro
```vue
<!-- Em HoleritesList.vue -->
<div>
  <label>Colaborador</label>
  <input v-model="filtros.colaborador" />
</div>
```

## 📱 Responsividade

Todos os componentes são responsivos:
- **Mobile**: 1 coluna
- **Tablet**: 2 colunas
- **Desktop**: 3 colunas

## ⚡ Performance

- Filtros aplicados via `computed` (sem requisições extras)
- Lazy loading de modais
- Debounce em buscas (se implementado)
- Cache de dados

## 🔄 Fluxo Completo

```
1. Usuário acessa /folha-pagamento/holerites
2. Sistema carrega todos os holerites
3. Usuário aplica filtros (opcional)
4. Usuário clica em "Excluir" em um holerite
5. Modal de confirmação é exibido
6. Usuário confirma
7. API valida e exclui
8. Lista é atualizada automaticamente
9. Mensagem de sucesso é exibida
```

## 🆘 Troubleshooting

### Erro: "Holerite não pode ser excluído"
**Causa:** Status não é "gerado"
**Solução:** Apenas holerites gerados podem ser excluídos

### Erro: "Não autenticado"
**Causa:** Sessão expirada
**Solução:** Faça login novamente

### Holerite não aparece na lista
**Causa:** Filtros ativos
**Solução:** Clique em "Limpar Filtros"

## 📝 Próximas Melhorias

- [ ] Exclusão em massa (selecionar múltiplos)
- [ ] Exportar lista de holerites
- [ ] Histórico de exclusões
- [ ] Restaurar holerites excluídos (soft delete)
- [ ] Notificações por email ao excluir

---

**Status**: ✅ Pronto para uso
**Versão**: 1.0.0
**Data**: 06/12/2024
