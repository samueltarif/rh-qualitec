# 💻 Exemplos de Código - Tempo Real no Ponto

## 🎯 Para Desenvolvedores

Este documento mostra como usar a funcionalidade de tempo real em seus componentes.

---

## 📦 Importações

```typescript
// Funções utilitárias
import { 
  calcularHorasTrabalhadas,
  calcularHorasTempoReal,
  registroEmAndamento,
  formatarHora
} from '~/utils/pontoCalculos'

// Composable de tempo real
import { 
  usePontoTempoReal,
  usePontoTempoRealSingle 
} from '~/composables/usePontoTempoReal'
```

---

## 🔧 Uso Básico

### Exemplo 1: Verificar se Registro Está em Andamento

```typescript
const registro = {
  entrada_1: '08:00',
  saida_1: '12:00',
  entrada_2: '13:00',
  saida_2: null  // Sem saída = em andamento
}

const emAndamento = registroEmAndamento(registro)
console.log(emAndamento) // true
```

### Exemplo 2: Calcular Horas em Tempo Real

```typescript
const registro = {
  entrada_1: '08:00',
  saida_1: '12:00',
  entrada_2: '13:00',
  saida_2: null
}

// Hora atual: 15:30
const resultado = calcularHorasTempoReal(registro)

console.log(resultado.horasFormatadas)  // "6h30"
console.log(resultado.avisos)           // ["⏱️ Contagem em tempo real"]
console.log(resultado.detalhes)         // Explicação do cálculo
```

---

## 🎨 Uso em Componentes Vue

### Exemplo 3: Componente com Múltiplos Registros

```vue
<template>
  <div>
    <div v-for="reg in registros" :key="reg.id">
      <span 
        :class="{
          'text-green-600 animate-pulse': estaEmAndamento(reg)
        }"
      >
        {{ calcularHoras(reg).horasFormatadas }}
      </span>
      
      <span 
        v-if="estaEmAndamento(reg)"
        class="badge badge-green"
      >
        ⏱️ Tempo real
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePontoTempoReal } from '~/composables/usePontoTempoReal'
import { registroEmAndamento } from '~/utils/pontoCalculos'

const registros = ref([
  { id: 1, entrada_1: '08:00', saida_2: null },
  { id: 2, entrada_1: '09:00', saida_2: '17:00' }
])

// Usar composable
const { calcularHoras, horaAtual } = usePontoTempoReal(registros)

const estaEmAndamento = (reg: any) => {
  return registroEmAndamento(reg)
}
</script>
```

### Exemplo 4: Componente com Registro Único

```vue
<template>
  <div>
    <h3>Seu Ponto Hoje</h3>
    
    <div class="ponto-card">
      <div class="horarios">
        <span>Entrada: {{ registro.entrada_1 }}</span>
        <span>Saída: {{ registro.saida_2 || '--:--' }}</span>
      </div>
      
      <div class="total">
        <span 
          :class="{
            'text-green-600 animate-pulse': emAndamento
          }"
        >
          {{ horasCalculadas.horasFormatadas }}
        </span>
        
        <div v-if="emAndamento" class="badge-tempo-real">
          ⏱️ Contando...
        </div>
      </div>
      
      <div class="avisos">
        <span 
          v-for="(aviso, idx) in horasCalculadas.avisos" 
          :key="idx"
          class="badge"
        >
          {{ aviso }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePontoTempoRealSingle } from '~/composables/usePontoTempoReal'

const registro = ref({
  entrada_1: '08:00',
  saida_1: '12:00',
  entrada_2: '13:00',
  saida_2: null
})

// Usar composable para registro único
const { 
  emAndamento, 
  horasCalculadas, 
  horaAtual 
} = usePontoTempoRealSingle(registro)

// horasCalculadas atualiza automaticamente a cada minuto
</script>
```

---

## 🔄 Controle Manual do Timer

### Exemplo 5: Iniciar/Parar Timer Manualmente

```typescript
const registros = ref([...])

const { 
  calcularHoras,
  iniciarTimer,
  pararTimer,
  temRegistroEmAndamento
} = usePontoTempoReal(registros)

// Iniciar manualmente
onMounted(() => {
  if (temRegistroEmAndamento.value) {
    iniciarTimer()
  }
})

// Parar manualmente
onUnmounted(() => {
  pararTimer()
})

// Ou usar watch para controle automático
watch(temRegistroEmAndamento, (tem) => {
  if (tem) {
    iniciarTimer()
  } else {
    pararTimer()
  }
})
```

---

## 📊 Cálculos Avançados

### Exemplo 6: Calcular Total com Tempo Real

```typescript
const registros = ref([
  { entrada_1: '08:00', saida_2: null },      // Em andamento
  { entrada_1: '08:00', saida_2: '17:00' },   // Finalizado
  { entrada_1: '09:00', saida_2: null }       // Em andamento
])

const { calcularHoras } = usePontoTempoReal(registros)

const totalMinutos = computed(() => {
  return registros.value.reduce((total, reg) => {
    const resultado = calcularHoras(reg)
    return total + resultado.totalMinutos
  }, 0)
})

const totalFormatado = computed(() => {
  const horas = Math.floor(totalMinutos.value / 60)
  const minutos = totalMinutos.value % 60
  return `${horas}h${minutos.toString().padStart(2, '0')}`
})

// totalFormatado atualiza automaticamente
```

### Exemplo 7: Filtrar Apenas Registros em Andamento

```typescript
const registros = ref([...])

const registrosEmAndamento = computed(() => {
  return registros.value.filter(r => registroEmAndamento(r))
})

const registrosFinalizados = computed(() => {
  return registros.value.filter(r => !registroEmAndamento(r))
})

// Usar composable apenas para registros em andamento
const { calcularHoras } = usePontoTempoReal(registrosEmAndamento)
```

---

## 🎨 Estilização

### Exemplo 8: Classes CSS para Animação

```vue
<style scoped>
.horas-tempo-real {
  color: #16a34a; /* green-600 */
  font-weight: 600;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.badge-tempo-real {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background-color: #dcfce7; /* green-100 */
  color: #15803d; /* green-700 */
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}
</style>
```

### Exemplo 9: Componente Reutilizável

```vue
<!-- components/HorasTempoReal.vue -->
<template>
  <div class="horas-container">
    <span 
      class="horas-valor"
      :class="{
        'horas-tempo-real': emAndamento,
        'horas-finalizado': !emAndamento
      }"
    >
      {{ horas }}
    </span>
    
    <div v-if="mostrarBadges" class="badges">
      <span 
        v-for="(aviso, idx) in avisos" 
        :key="idx"
        class="badge"
        :class="getBadgeClass(aviso)"
      >
        {{ aviso }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { registroEmAndamento, calcularHorasTempoReal, calcularHorasTrabalhadas } from '~/utils/pontoCalculos'

const props = defineProps<{
  registro: any
  mostrarBadges?: boolean
}>()

const horaAtual = ref(new Date())
let intervalId: NodeJS.Timeout | null = null

const emAndamento = computed(() => {
  return registroEmAndamento(props.registro)
})

const resultado = computed(() => {
  if (emAndamento.value) {
    return calcularHorasTempoReal(props.registro, horaAtual.value)
  }
  return calcularHorasTrabalhadas(props.registro)
})

const horas = computed(() => resultado.value.horasFormatadas)
const avisos = computed(() => resultado.value.avisos)

const getBadgeClass = (aviso: string) => {
  if (aviso.includes('⏱️')) return 'badge-green'
  if (aviso.includes('⚠️')) return 'badge-yellow'
  if (aviso.includes('ℹ️')) return 'badge-blue'
  if (aviso.includes('❌')) return 'badge-red'
  return 'badge-gray'
}

// Timer
const atualizarHora = () => {
  horaAtual.value = new Date()
}

watch(emAndamento, (andamento) => {
  if (andamento) {
    intervalId = setInterval(atualizarHora, 60000)
    atualizarHora()
  } else if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}, { immediate: true })

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<style scoped>
/* Estilos aqui */
</style>
```

**Uso:**
```vue
<HorasTempoReal 
  :registro="registro" 
  :mostrar-badges="true" 
/>
```

---

## 🧪 Testes

### Exemplo 10: Testar Função de Tempo Real

```typescript
import { describe, it, expect } from 'vitest'
import { calcularHorasTempoReal, registroEmAndamento } from '~/utils/pontoCalculos'

describe('Tempo Real', () => {
  it('deve detectar registro em andamento', () => {
    const registro = {
      entrada_1: '08:00',
      saida_2: null
    }
    
    expect(registroEmAndamento(registro)).toBe(true)
  })
  
  it('deve calcular horas em tempo real', () => {
    const registro = {
      entrada_1: '08:00',
      saida_2: null
    }
    
    // Simular hora atual: 10:00
    const horaAtual = new Date()
    horaAtual.setHours(10, 0, 0, 0)
    
    const resultado = calcularHorasTempoReal(registro, horaAtual)
    
    expect(resultado.horasFormatadas).toBe('2h00')
    expect(resultado.avisos).toContain('⏱️ Contagem em tempo real')
  })
  
  it('deve considerar intervalo completo', () => {
    const registro = {
      entrada_1: '08:00',
      saida_1: '12:00',
      entrada_2: '13:00',
      saida_2: null
    }
    
    // Hora atual: 15:00
    const horaAtual = new Date()
    horaAtual.setHours(15, 0, 0, 0)
    
    const resultado = calcularHorasTempoReal(registro, horaAtual)
    
    // (12:00 - 08:00) + (15:00 - 13:00) = 4h + 2h = 6h
    expect(resultado.horasFormatadas).toBe('6h00')
  })
})
```

---

## 📚 Referências Rápidas

### Funções Principais

```typescript
// Verificar se em andamento
registroEmAndamento(registro): boolean

// Calcular com tempo real
calcularHorasTempoReal(registro, horaAtual?): ResultadoCalculo

// Calcular normal (sem tempo real)
calcularHorasTrabalhadas(registro): ResultadoCalculo

// Formatar hora
formatarHora(hora): string
```

### Composables

```typescript
// Para múltiplos registros
usePontoTempoReal(registros: Ref<any[]>)

// Para registro único
usePontoTempoRealSingle(registro: Ref<any>)
```

### Retorno de ResultadoCalculo

```typescript
interface ResultadoCalculo {
  totalMinutos: number
  horasFormatadas: string
  intervaloMinutos: number
  intervaloFormatado: string
  avisos: string[]
  detalhes: string
}
```

---

## 🎯 Dicas

1. **Use o composable** em vez de criar seu próprio timer
2. **Sempre limpe** o timer no `onUnmounted`
3. **Use computed** para reatividade automática
4. **Teste** com diferentes horários
5. **Documente** seu código

---

## 🚀 Conclusão

Com estes exemplos, você pode:
- ✅ Integrar tempo real em qualquer componente
- ✅ Criar componentes reutilizáveis
- ✅ Controlar o timer manualmente
- ✅ Testar sua implementação

**Boa codificação!** 💻✨

---

**Última atualização**: 05/12/2024  
**Versão**: 1.0.0
