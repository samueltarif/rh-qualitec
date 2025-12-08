# 🔘 ButtonBaterPonto - Componente de Botão de Registro de Ponto

## 📋 Descrição

Componente especializado para o botão de registro de ponto com design premium, animações e feedback visual.

## ✨ Características

- **Design Premium**: Gradiente laranja com efeitos de hover e active
- **Animações Suaves**: Transformações, brilho e pulso animado
- **Estados Visuais**: Loading, disabled, hover, active
- **Ícone Dinâmico**: Impressão digital que rotaciona no hover
- **Feedback Tátil**: Escala e sombra responsivas ao clique
- **Indicador de Pulso**: Ponto animado para chamar atenção
- **Acessível**: Suporte completo a estados disabled e loading

## 🎨 Preview Visual

```
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐  │
│  │  [👆]  Bater Ponto          ●    │  │
│  │   ↑         ↑                ↑    │  │
│  │  Ícone    Texto           Pulso   │  │
│  └───────────────────────────────────┘  │
│         Gradiente Laranja                │
│         com Efeito de Brilho             │
└─────────────────────────────────────────┘
```

## 📦 Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `texto` | `string` | `'Bater Ponto'` | Texto exibido no botão |
| `textoCarregando` | `string` | `'Registrando...'` | Texto durante loading |
| `loading` | `boolean` | `false` | Estado de carregamento |
| `disabled` | `boolean` | `false` | Desabilita o botão |
| `mostrarPulso` | `boolean` | `true` | Exibe indicador de pulso |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamanho do botão |

## 🎯 Eventos

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `@click` | `void` | Emitido ao clicar no botão |

## 💻 Exemplos de Uso

### Uso Básico

```vue
<template>
  <ButtonBaterPonto @click="registrarPonto" />
</template>

<script setup lang="ts">
const registrarPonto = () => {
  console.log('Registrando ponto...')
}
</script>
```

### Com Loading

```vue
<template>
  <ButtonBaterPonto 
    :loading="registrando"
    @click="registrarPonto" 
  />
</template>

<script setup lang="ts">
const registrando = ref(false)

const registrarPonto = async () => {
  registrando.value = true
  try {
    await $fetch('/api/ponto/registrar', { method: 'POST' })
  } finally {
    registrando.value = false
  }
}
</script>
```

### Customizado

```vue
<template>
  <ButtonBaterPonto
    texto="Marcar Presença"
    texto-carregando="Aguarde..."
    size="lg"
    :mostrar-pulso="false"
    @click="marcarPresenca"
  />
</template>
```

### Tamanhos Diferentes

```vue
<template>
  <div class="space-y-4">
    <!-- Pequeno -->
    <ButtonBaterPonto size="sm" texto="Pequeno" />
    
    <!-- Médio (padrão) -->
    <ButtonBaterPonto size="md" texto="Médio" />
    
    <!-- Grande -->
    <ButtonBaterPonto size="lg" texto="Grande" />
  </div>
</template>
```

### Desabilitado

```vue
<template>
  <ButtonBaterPonto
    :disabled="!podeRegistrar"
    @click="registrarPonto"
  />
</template>

<script setup lang="ts">
const podeRegistrar = computed(() => {
  // Lógica para verificar se pode registrar
  return horaAtual.value >= horaMinima.value
})
</script>
```

### Integrado com CardRegistroPonto

```vue
<template>
  <CardRegistroPonto
    titulo="Registro de Ponto"
    :subtitulo="dataFormatada"
    texto-botao="Bater Ponto"
    :loading="registrando"
    @bater-ponto="handleBaterPonto"
  />
</template>

<script setup lang="ts">
const registrando = ref(false)

const handleBaterPonto = async () => {
  registrando.value = true
  try {
    await $fetch('/api/funcionario/ponto/registrar', {
      method: 'POST',
      body: { tipo: 'entrada' }
    })
    // Sucesso
  } catch (error) {
    // Erro
  } finally {
    registrando.value = false
  }
}
</script>
```

## 🎨 Variações de Estado

### Estado Normal
- Gradiente laranja vibrante
- Ícone de impressão digital
- Pulso animado no canto
- Efeito de brilho no hover

### Estado Hover
- Gradiente mais escuro
- Ícone rotaciona 12°
- Escala aumenta 5%
- Sombra mais pronunciada

### Estado Active (Clicando)
- Gradiente ainda mais escuro
- Escala reduz 5%
- Sombra menor

### Estado Loading
- Texto muda para "Registrando..."
- Ícone vira spinner animado
- Pulso desaparece
- Botão fica pulsando

### Estado Disabled
- Opacidade 50%
- Cursor not-allowed
- Sem interações

## 🎭 Animações

### 1. Efeito de Brilho (Shine)
```css
@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```
- Passa da esquerda para direita
- Loop infinito a cada 2 segundos
- Visível apenas no hover

### 2. Pulso do Indicador
```vue
<span class="animate-ping ..."></span>
```
- Círculo branco expandindo
- Opacidade 75%
- Chama atenção para o botão

### 3. Rotação do Ícone
```css
group-hover:rotate-12
```
- Rotaciona 12° no hover
- Transição suave de 300ms

### 4. Escala do Botão
```css
hover:scale-105
active:scale-95
```
- Aumenta 5% no hover
- Diminui 5% ao clicar
- Feedback tátil visual

## 🎨 Cores e Gradientes

### Gradiente Principal
```css
from-orange-500 to-orange-600
```
- Laranja vibrante (#f97316 → #ea580c)

### Hover
```css
from-orange-600 to-orange-700
```
- Laranja mais escuro (#ea580c → #c2410c)

### Active
```css
from-orange-700 to-orange-800
```
- Laranja profundo (#c2410c → #9a3412)

## 📐 Tamanhos

| Size | Padding | Font Size | Ícone |
|------|---------|-----------|-------|
| `sm` | `px-6 py-3` | `text-base` | `w-5 h-5` |
| `md` | `px-8 py-4` | `text-lg` | `w-6 h-6` |
| `lg` | `px-10 py-5` | `text-xl` | `w-7 h-7` |

## 🔧 Customização Avançada

### Mudar Cores

```vue
<ButtonBaterPonto
  class="!from-blue-500 !to-blue-600 hover:!from-blue-600 hover:!to-blue-700"
  @click="registrar"
/>
```

### Adicionar Ícone Customizado

```vue
<template>
  <button class="...">
    <div class="...">
      <IconCustomizado class="w-6 h-6" />
    </div>
    <span>{{ texto }}</span>
  </button>
</template>
```

### Remover Animações

```vue
<ButtonBaterPonto
  class="!transform-none !transition-none"
  :mostrar-pulso="false"
  @click="registrar"
/>
```

## ♿ Acessibilidade

- ✅ Estados disabled claramente visíveis
- ✅ Cursor apropriado para cada estado
- ✅ Feedback visual em todas as interações
- ✅ Contraste adequado de cores
- ✅ Tamanho mínimo de toque (44x44px)
- ✅ Suporte a teclado (Enter/Space)

## 🚀 Performance

- ✅ Animações com GPU (transform, opacity)
- ✅ Sem re-renders desnecessários
- ✅ CSS otimizado
- ✅ Componente leve (~2KB)

## 📱 Responsividade

O botão se adapta automaticamente a diferentes tamanhos de tela:

```vue
<!-- Mobile -->
<ButtonBaterPonto size="sm" class="w-full" />

<!-- Tablet -->
<ButtonBaterPonto size="md" />

<!-- Desktop -->
<ButtonBaterPonto size="lg" />
```

## 🎯 Casos de Uso

1. **Portal do Funcionário**: Registro de entrada/saída
2. **App Mobile**: Marcação de ponto por geolocalização
3. **Kiosk**: Terminal de ponto em tela touch
4. **Dashboard Admin**: Registro manual de ponto
5. **Integração Biométrica**: Confirmação após leitura

## 🔗 Componentes Relacionados

- `CardRegistroPonto.vue` - Card que contém o botão
- `CardHorasTrabalhadasHeader.vue` - Exibe horas trabalhadas
- `TablePonto.vue` - Lista de registros
- `StatusBadge.vue` - Status dos registros

## 📝 Notas

- O botão emite apenas o evento `@click`, a lógica de registro deve ser implementada no componente pai
- O estado de loading deve ser controlado externamente
- O pulso animado pode ser desabilitado se necessário
- Todas as animações respeitam `prefers-reduced-motion`

## 🐛 Troubleshooting

### Botão não responde ao clique
```vue
<!-- Verifique se não está disabled ou loading -->
<ButtonBaterPonto 
  :disabled="false" 
  :loading="false"
  @click="handleClick" 
/>
```

### Animações não funcionam
```vue
<!-- Certifique-se que Tailwind está configurado -->
<!-- tailwind.config.js deve incluir animations -->
```

### Texto não muda durante loading
```vue
<!-- Passe a prop loading corretamente -->
<ButtonBaterPonto :loading="isLoading" />
```

---

**Componente criado em:** 05/12/2025  
**Versão:** 1.0.0  
**Autor:** Sistema de Ponto Eletrônico
