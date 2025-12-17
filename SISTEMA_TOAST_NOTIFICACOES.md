# Sistema de Notificações Toast - Profissional e Elegante

## 📋 Visão Geral

Sistema de notificações toast moderno, elegante e profissional implementado no sistema RH Qualitec.

## ✨ Características

- ✅ Design profissional e elegante
- ✅ Animações suaves de entrada e saída
- ✅ Desaparece automaticamente após 5 segundos (configurável)
- ✅ Pode ser fechado manualmente
- ✅ Barra de progresso visual
- ✅ 4 tipos: Success, Error, Warning, Info
- ✅ Ícones personalizados para cada tipo
- ✅ Empilhamento múltiplo de notificações
- ✅ Posicionamento fixo no canto superior direito
- ✅ Responsivo e acessível

## 🎨 Tipos de Notificação

### Success (Verde)
```typescript
const toast = useToast()
toast.success('Colaborador cadastrado!', 'Os dados foram salvos com sucesso.')
```

### Error (Vermelho)
```typescript
const toast = useToast()
toast.error('Erro ao salvar', 'Verifique os dados e tente novamente.')
```

### Warning (Amarelo)
```typescript
const toast = useToast()
toast.warning('Atenção', 'Alguns campos estão incompletos.')
```

### Info (Azul)
```typescript
const toast = useToast()
toast.info('Informação', 'O sistema será atualizado em breve.')
```

## 📝 Exemplos de Uso

### Uso Básico

```vue
<script setup lang="ts">
const toast = useToast()

const salvarColaborador = async () => {
  try {
    await $fetch('/api/colaboradores', {
      method: 'POST',
      body: formData
    })
    
    toast.success('Colaborador cadastrado!', 'Os dados foram salvos com sucesso.')
  } catch (error) {
    toast.error('Erro ao cadastrar', 'Verifique os dados e tente novamente.')
  }
}
</script>
```

### Com Duração Personalizada

```typescript
// Notificação que dura 10 segundos
toast.success('Operação concluída!', 'Tudo certo!', 10000)

// Notificação que não desaparece automaticamente
toast.info('Leia com atenção', 'Mensagem importante', 0)
```

### Múltiplas Notificações

```typescript
const toast = useToast()

// Todas aparecerão empilhadas
toast.info('Processando...')
toast.success('Etapa 1 concluída')
toast.success('Etapa 2 concluída')
toast.success('Processo finalizado!')
```

### Remover Notificação Programaticamente

```typescript
const toast = useToast()

// Adicionar e guardar o ID
const toastId = toast.info('Carregando...', undefined, 0)

// Remover depois
setTimeout(() => {
  toast.removeToast(toastId)
  toast.success('Carregamento concluído!')
}, 3000)
```

### Limpar Todas as Notificações

```typescript
const toast = useToast()

// Limpar todas
toast.clear()
```

## 🔧 Exemplos Práticos por Funcionalidade

### Cadastro de Colaborador

```vue
<script setup lang="ts">
const toast = useToast()

const cadastrarColaborador = async (dados: any) => {
  try {
    const response = await $fetch('/api/colaboradores', {
      method: 'POST',
      body: dados
    })
    
    toast.success(
      'Colaborador cadastrado com sucesso!',
      `${dados.nome} foi adicionado ao sistema.`
    )
    
    // Redirecionar ou limpar formulário
    navigateTo('/colaboradores')
  } catch (error: any) {
    toast.error(
      'Erro ao cadastrar colaborador',
      error.data?.message || 'Verifique os dados e tente novamente.'
    )
  }
}
</script>
```

### Atualização de Dados

```vue
<script setup lang="ts">
const toast = useToast()

const atualizarColaborador = async (id: string, dados: any) => {
  try {
    await $fetch(`/api/colaboradores/${id}`, {
      method: 'PUT',
      body: dados
    })
    
    toast.success(
      'Dados atualizados!',
      'As alterações foram salvas com sucesso.'
    )
  } catch (error) {
    toast.error(
      'Erro ao atualizar',
      'Não foi possível salvar as alterações.'
    )
  }
}
</script>
```

### Exclusão com Confirmação

```vue
<script setup lang="ts">
const toast = useToast()

const excluirColaborador = async (id: string, nome: string) => {
  // Primeiro mostrar aviso
  toast.warning(
    'Excluindo colaborador...',
    `${nome} será removido do sistema.`,
    3000
  )
  
  try {
    await $fetch(`/api/colaboradores/${id}`, {
      method: 'DELETE'
    })
    
    toast.success(
      'Colaborador excluído!',
      'O registro foi removido com sucesso.'
    )
  } catch (error) {
    toast.error(
      'Erro ao excluir',
      'Não foi possível remover o colaborador.'
    )
  }
}
</script>
```

### Geração de Holerite

```vue
<script setup lang="ts">
const toast = useToast()

const gerarHolerite = async (colaboradorId: string, mes: string) => {
  // Mostrar progresso
  const loadingId = toast.info(
    'Gerando holerite...',
    'Por favor, aguarde.',
    0
  )
  
  try {
    const response = await $fetch('/api/holerites/gerar', {
      method: 'POST',
      body: { colaboradorId, mes }
    })
    
    // Remover loading
    toast.removeToast(loadingId)
    
    // Mostrar sucesso
    toast.success(
      'Holerite gerado com sucesso!',
      'O documento está disponível para download.'
    )
  } catch (error) {
    toast.removeToast(loadingId)
    toast.error(
      'Erro ao gerar holerite',
      'Verifique os dados e tente novamente.'
    )
  }
}
</script>
```

### Envio de Email

```vue
<script setup lang="ts">
const toast = useToast()

const enviarEmail = async (destinatario: string) => {
  toast.info('Enviando email...', undefined, 3000)
  
  try {
    await $fetch('/api/email/enviar', {
      method: 'POST',
      body: { destinatario }
    })
    
    toast.success(
      'Email enviado!',
      `Mensagem enviada para ${destinatario}`
    )
  } catch (error) {
    toast.error(
      'Falha no envio',
      'Não foi possível enviar o email.'
    )
  }
}
</script>
```

### Importação de Dados

```vue
<script setup lang="ts">
const toast = useToast()

const importarDados = async (arquivo: File) => {
  const loadingId = toast.info(
    'Importando dados...',
    'Processando arquivo, aguarde.',
    0
  )
  
  try {
    const formData = new FormData()
    formData.append('arquivo', arquivo)
    
    const response = await $fetch('/api/importacao/executar', {
      method: 'POST',
      body: formData
    })
    
    toast.removeToast(loadingId)
    
    toast.success(
      'Importação concluída!',
      `${response.total} registros importados com sucesso.`
    )
  } catch (error: any) {
    toast.removeToast(loadingId)
    
    toast.error(
      'Erro na importação',
      error.data?.message || 'Verifique o arquivo e tente novamente.'
    )
  }
}
</script>
```

### Validação de Formulário

```vue
<script setup lang="ts">
const toast = useToast()

const validarFormulario = (dados: any) => {
  const erros = []
  
  if (!dados.nome) erros.push('Nome é obrigatório')
  if (!dados.cpf) erros.push('CPF é obrigatório')
  if (!dados.email) erros.push('Email é obrigatório')
  
  if (erros.length > 0) {
    toast.warning(
      'Campos obrigatórios',
      erros.join(', ')
    )
    return false
  }
  
  return true
}

const salvar = async (dados: any) => {
  if (!validarFormulario(dados)) return
  
  // Continuar com salvamento...
}
</script>
```

## 🎯 Boas Práticas

### 1. Mensagens Claras e Objetivas
```typescript
// ✅ BOM
toast.success('Colaborador cadastrado!', 'João Silva foi adicionado ao sistema.')

// ❌ EVITAR
toast.success('Sucesso', 'Operação realizada.')
```

### 2. Usar o Tipo Correto
```typescript
// ✅ BOM - Usar success para confirmações
toast.success('Dados salvos!')

// ✅ BOM - Usar warning para avisos
toast.warning('Alguns campos estão vazios')

// ✅ BOM - Usar error para erros
toast.error('Falha ao conectar com servidor')

// ✅ BOM - Usar info para informações
toast.info('Sistema será atualizado às 22h')
```

### 3. Duração Apropriada
```typescript
// Mensagens rápidas (3 segundos)
toast.success('Salvo!', undefined, 3000)

// Mensagens normais (5 segundos - padrão)
toast.info('Processamento iniciado')

// Mensagens importantes (10 segundos)
toast.warning('Atenção: prazo se encerrando', undefined, 10000)

// Mensagens críticas (não desaparecem)
toast.error('Erro crítico no sistema', 'Contate o suporte', 0)
```

### 4. Feedback Imediato
```typescript
// ✅ BOM - Feedback imediato
const salvar = async () => {
  toast.info('Salvando...')
  await api.salvar()
  toast.success('Salvo!')
}

// ❌ EVITAR - Sem feedback
const salvar = async () => {
  await api.salvar()
  // Usuário não sabe o que está acontecendo
}
```

## 🔄 Substituindo Alerts Antigos

### Antes (alert nativo)
```typescript
alert('Colaborador cadastrado!')
```

### Depois (toast profissional)
```typescript
const toast = useToast()
toast.success('Colaborador cadastrado!', 'Os dados foram salvos com sucesso.')
```

## 📱 Responsividade

O sistema de toast é totalmente responsivo:
- Desktop: Aparece no canto superior direito
- Mobile: Ocupa largura adequada e mantém legibilidade
- Tablet: Adapta-se automaticamente

## ♿ Acessibilidade

- Suporte a leitores de tela
- Contraste adequado de cores
- Botão de fechar acessível
- Animações respeitam preferências do usuário

## 🎨 Personalização

As cores e estilos podem ser ajustados no componente `ToastItem.vue`:

```typescript
// Cores atuais:
- Success: Verde (emerald)
- Error: Vermelho (red)
- Warning: Amarelo (amber)
- Info: Azul (blue)
```

## 📦 Arquivos do Sistema

- `composables/useToast.ts` - Lógica e estado
- `components/ToastContainer.vue` - Container principal
- `components/ToastItem.vue` - Item individual
- `app.vue` - Integração global

## 🚀 Próximos Passos

1. Substituir todos os alerts nativos por toasts
2. Adicionar toasts em todas as operações CRUD
3. Implementar feedback visual em processos longos
4. Adicionar sons opcionais (configurável)
5. Criar variantes de toast (compacto, expandido)

---

**Sistema implementado e pronto para uso! 🎉**
