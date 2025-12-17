# Exemplo Prático: Usando Toast em Colaboradores

## Como Adicionar Toast em Qualquer Componente

### 1. Importar o Composable

```vue
<script setup lang="ts">
const toast = useToast()
</script>
```

### 2. Usar nas Funções

```vue
<script setup lang="ts">
const toast = useToast()

// Exemplo: Cadastrar Colaborador
const cadastrarColaborador = async (dados: any) => {
  try {
    await $fetch('/api/colaboradores', {
      method: 'POST',
      body: dados
    })
    
    // ✨ Toast de sucesso
    toast.success(
      'Colaborador cadastrado!',
      `${dados.nome} foi adicionado ao sistema com sucesso.`
    )
    
    // Fechar modal, limpar form, etc
    fecharModal()
    
  } catch (error: any) {
    // ✨ Toast de erro
    toast.error(
      'Erro ao cadastrar colaborador',
      error.data?.message || 'Verifique os dados e tente novamente.'
    )
  }
}

// Exemplo: Atualizar Colaborador
const atualizarColaborador = async (id: string, dados: any) => {
  try {
    await $fetch(`/api/colaboradores/${id}`, {
      method: 'PUT',
      body: dados
    })
    
    toast.success('Dados atualizados!', 'As alterações foram salvas.')
    
  } catch (error) {
    toast.error('Erro ao atualizar', 'Não foi possível salvar as alterações.')
  }
}

// Exemplo: Excluir Colaborador
const excluirColaborador = async (id: string, nome: string) => {
  try {
    await $fetch(`/api/colaboradores/${id}`, {
      method: 'DELETE'
    })
    
    toast.success('Colaborador excluído!', `${nome} foi removido do sistema.`)
    
  } catch (error) {
    toast.error('Erro ao excluir', 'Não foi possível remover o colaborador.')
  }
}
</script>
```

## Exemplos Completos por Funcionalidade

### Cadastro com Validação

```vue
<script setup lang="ts">
const toast = useToast()
const formData = ref({
  nome: '',
  cpf: '',
  email: ''
})

const validar = () => {
  if (!formData.value.nome) {
    toast.warning('Campo obrigatório', 'Por favor, preencha o nome.')
    return false
  }
  
  if (!formData.value.cpf) {
    toast.warning('Campo obrigatório', 'Por favor, preencha o CPF.')
    return false
  }
  
  if (!formData.value.email) {
    toast.warning('Campo obrigatório', 'Por favor, preencha o email.')
    return false
  }
  
  return true
}

const salvar = async () => {
  if (!validar()) return
  
  try {
    await $fetch('/api/colaboradores', {
      method: 'POST',
      body: formData.value
    })
    
    toast.success(
      'Colaborador cadastrado!',
      `${formData.value.nome} foi adicionado com sucesso.`
    )
    
    // Limpar formulário
    formData.value = { nome: '', cpf: '', email: '' }
    
  } catch (error: any) {
    if (error.statusCode === 409) {
      toast.error('CPF já cadastrado', 'Este CPF já existe no sistema.')
    } else {
      toast.error('Erro ao cadastrar', 'Tente novamente mais tarde.')
    }
  }
}
</script>

<template>
  <form @submit.prevent="salvar">
    <input v-model="formData.nome" placeholder="Nome" />
    <input v-model="formData.cpf" placeholder="CPF" />
    <input v-model="formData.email" placeholder="Email" />
    <button type="submit">Cadastrar</button>
  </form>
</template>
```

### Upload de Arquivo com Progresso

```vue
<script setup lang="ts">
const toast = useToast()

const uploadArquivo = async (file: File) => {
  // Mostrar toast de progresso
  const loadingId = toast.info(
    'Enviando arquivo...',
    'Por favor, aguarde.',
    0 // Não desaparece automaticamente
  )
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    await $fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    // Remover toast de loading
    toast.removeToast(loadingId)
    
    // Mostrar sucesso
    toast.success(
      'Arquivo enviado!',
      `${file.name} foi carregado com sucesso.`
    )
    
  } catch (error) {
    toast.removeToast(loadingId)
    toast.error('Erro no upload', 'Não foi possível enviar o arquivo.')
  }
}
</script>
```

### Operações em Lote

```vue
<script setup lang="ts">
const toast = useToast()

const processarLote = async (ids: string[]) => {
  const total = ids.length
  let processados = 0
  let erros = 0
  
  // Toast inicial
  const loadingId = toast.info(
    'Processando...',
    `0 de ${total} registros processados`,
    0
  )
  
  for (const id of ids) {
    try {
      await $fetch(`/api/processar/${id}`, { method: 'POST' })
      processados++
    } catch (error) {
      erros++
    }
  }
  
  // Remover loading
  toast.removeToast(loadingId)
  
  // Mostrar resultado
  if (erros === 0) {
    toast.success(
      'Processamento concluído!',
      `${processados} registros processados com sucesso.`
    )
  } else {
    toast.warning(
      'Processamento concluído com erros',
      `${processados} sucesso, ${erros} erros.`
    )
  }
}
</script>
```

### Confirmação de Ação Crítica

```vue
<script setup lang="ts">
const toast = useToast()

const excluirTodos = async () => {
  // Primeiro aviso
  toast.warning(
    'Atenção!',
    'Você está prestes a excluir todos os registros.',
    5000
  )
  
  // Aguardar confirmação do usuário (via modal, por exemplo)
  const confirmado = await confirmarExclusao()
  
  if (!confirmado) {
    toast.info('Operação cancelada', 'Nenhum registro foi excluído.')
    return
  }
  
  try {
    await $fetch('/api/excluir-todos', { method: 'DELETE' })
    
    toast.success(
      'Registros excluídos!',
      'Todos os registros foram removidos.'
    )
    
  } catch (error) {
    toast.error(
      'Erro ao excluir',
      'Não foi possível remover os registros.'
    )
  }
}
</script>
```

### Sincronização de Dados

```vue
<script setup lang="ts">
const toast = useToast()

const sincronizar = async () => {
  toast.info('Sincronizando...', 'Buscando atualizações do servidor.')
  
  try {
    const response = await $fetch('/api/sincronizar')
    
    if (response.atualizacoes > 0) {
      toast.success(
        'Sincronização concluída!',
        `${response.atualizacoes} registros atualizados.`
      )
    } else {
      toast.info(
        'Tudo atualizado',
        'Não há novas atualizações disponíveis.'
      )
    }
    
  } catch (error) {
    toast.error(
      'Erro na sincronização',
      'Não foi possível conectar ao servidor.'
    )
  }
}
</script>
```

## Dicas de UX

### 1. Feedback Imediato
```typescript
// ✅ BOM - Usuário sabe que algo está acontecendo
const salvar = async () => {
  toast.info('Salvando...')
  await api.salvar()
  toast.success('Salvo!')
}
```

### 2. Mensagens Específicas
```typescript
// ✅ BOM - Mensagem específica
toast.success('Colaborador João Silva cadastrado!')

// ❌ EVITAR - Mensagem genérica
toast.success('Sucesso!')
```

### 3. Informar Próximos Passos
```typescript
toast.success(
  'Email enviado!',
  'Verifique sua caixa de entrada em alguns minutos.'
)
```

### 4. Erros Acionáveis
```typescript
toast.error(
  'Erro ao conectar',
  'Verifique sua conexão e tente novamente.'
)
```

## Integração com Formulários

```vue
<script setup lang="ts">
const toast = useToast()
const { handleSubmit, errors } = useForm()

const onSubmit = handleSubmit(async (values) => {
  try {
    await $fetch('/api/colaboradores', {
      method: 'POST',
      body: values
    })
    
    toast.success('Colaborador cadastrado!', 'Dados salvos com sucesso.')
    
  } catch (error: any) {
    // Mostrar erros de validação do servidor
    if (error.data?.errors) {
      Object.entries(error.data.errors).forEach(([field, message]) => {
        toast.error(`Erro no campo ${field}`, message as string)
      })
    } else {
      toast.error('Erro ao cadastrar', 'Verifique os dados.')
    }
  }
})
</script>
```

## Testando o Sistema

```vue
<script setup lang="ts">
const toast = useToast()

// Testar todos os tipos
const testar = () => {
  toast.success('Teste de sucesso', 'Tudo funcionando!')
  
  setTimeout(() => {
    toast.error('Teste de erro', 'Algo deu errado.')
  }, 1000)
  
  setTimeout(() => {
    toast.warning('Teste de aviso', 'Atenção necessária.')
  }, 2000)
  
  setTimeout(() => {
    toast.info('Teste de info', 'Informação importante.')
  }, 3000)
}
</script>

<template>
  <button @click="testar">Testar Toasts</button>
</template>
```

---

**Pronto para usar em qualquer componente! 🎉**
