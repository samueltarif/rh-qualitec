<template>
  <div class="space-y-6">
    <!-- Cabeçalho da Jornada -->
    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
            🕐 {{ jornada.nome }}
            <UiBadge v-if="jornada.padrao" variant="primary">Padrão</UiBadge>
          </h3>
          <p class="text-gray-600 mt-1">{{ jornada.descricao }}</p>
        </div>
        
        <div class="text-right">
          <div class="text-2xl font-bold text-blue-600">
            {{ formatarHorasDecimais(jornada.horas_semanais) }}
          </div>
          <div class="text-sm text-gray-500">por semana</div>
        </div>
      </div>
      
      <!-- Resumo Mensal -->
      <div class="mt-4 pt-4 border-t border-blue-200">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-lg font-semibold text-gray-800">
              {{ formatarHorasDecimais(jornada.horas_semanais) }}
            </div>
            <div class="text-sm text-gray-500">Horas Semanais</div>
          </div>
          
          <div>
            <div class="text-lg font-semibold text-gray-800">
              {{ formatarHorasDecimais(jornada.horas_mensais) }}
            </div>
            <div class="text-sm text-gray-500">Horas Mensais</div>
          </div>
          
          <div>
            <div class="text-lg font-semibold text-gray-800">
              {{ diasTrabalhados }}/7
            </div>
            <div class="text-sm text-gray-500">Dias por Semana</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Horários Detalhados -->
    <UiCard>
      <div class="p-6">
        <h4 class="text-lg font-bold text-gray-800 mb-4">📅 Horários Detalhados</h4>
        
        <div class="space-y-3">
          <div 
            v-for="horario in horariosOrdenados" 
            :key="horario.dia_semana"
            :class="[
              'flex items-center justify-between p-4 rounded-xl border-2 transition-colors',
              horario.trabalha 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 bg-gray-50'
            ]"
          >
            <!-- Dia da Semana -->
            <div class="flex items-center gap-3">
              <div :class="[
                'w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm',
                horario.trabalha 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-400 text-white'
              ]">
                {{ obterAbrevDia(horario.dia_semana) }}
              </div>
              
              <div>
                <div class="font-semibold text-gray-800">
                  {{ obterNomeDia(horario.dia_semana) }}
                </div>
                <div v-if="!horario.trabalha" class="text-sm text-gray-500">
                  Não trabalha
                </div>
                <div v-else class="text-sm text-gray-600">
                  {{ formatarHorasDecimais(horario.horas_liquidas) }} líquidas
                </div>
              </div>
            </div>

            <!-- Horários -->
            <div v-if="horario.trabalha" class="flex items-center gap-6 text-sm">
              <!-- Entrada e Saída -->
              <div class="text-center">
                <div class="font-semibold text-gray-800">
                  {{ formatarHorario(horario.entrada) }} - {{ formatarHorario(horario.saida) }}
                </div>
                <div class="text-gray-500">Expediente</div>
              </div>
              
              <!-- Intervalo -->
              <div v-if="horario.intervalo_inicio && horario.intervalo_fim" class="text-center">
                <div class="font-semibold text-orange-600">
                  {{ formatarHorario(horario.intervalo_inicio) }} - {{ formatarHorario(horario.intervalo_fim) }}
                </div>
                <div class="text-gray-500">
                  Intervalo ({{ formatarHorasDecimais(horario.horas_intervalo) }})
                </div>
              </div>
              
              <!-- Horas Brutas -->
              <div class="text-center">
                <div class="font-semibold text-blue-600">
                  {{ formatarHorasDecimais(horario.horas_brutas) }}
                </div>
                <div class="text-gray-500">Total</div>
              </div>
            </div>
            
            <!-- Folga -->
            <div v-else class="flex items-center gap-2 text-gray-500">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
              </svg>
              <span>Folga</span>
            </div>
          </div>
        </div>
      </div>
    </UiCard>

    <!-- Observações -->
    <UiCard v-if="mostrarObservacoes">
      <div class="p-6">
        <h4 class="text-lg font-bold text-gray-800 mb-4">📝 Observações</h4>
        
        <div class="space-y-3 text-sm">
          <div class="flex items-start gap-2">
            <span class="text-blue-500">ℹ️</span>
            <span>O intervalo de almoço não é contabilizado na carga horária.</span>
          </div>
          
          <div class="flex items-start gap-2">
            <span class="text-green-500">✅</span>
            <span>Sexta-feira possui jornada reduzida conforme configuração.</span>
          </div>
          
          <div class="flex items-start gap-2">
            <span class="text-orange-500">⚠️</span>
            <span>Esta jornada é configurada pelo RH e não pode ser alterada pelo funcionário.</span>
          </div>
          
          <div class="flex items-start gap-2">
            <span class="text-purple-500">📊</span>
            <span>O cálculo mensal considera 4,33 semanas por mês em média.</span>
          </div>
        </div>
      </div>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import type { JornadaTrabalho } from '~/composables/useJornadas'

interface Props {
  jornada: JornadaTrabalho
  mostrarObservacoes?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mostrarObservacoes: true
})

const { 
  formatarHorario, 
  formatarHorasDecimais, 
  obterNomeDia, 
  obterAbrevDia 
} = useJornadas()

// Horários ordenados por dia da semana
const horariosOrdenados = computed(() => {
  if (!props.jornada.horarios) return []
  
  return [...props.jornada.horarios].sort((a, b) => a.dia_semana - b.dia_semana)
})

// Contar dias trabalhados
const diasTrabalhados = computed(() => {
  if (!props.jornada.horarios) return 0
  
  return props.jornada.horarios.filter(h => h.trabalha).length
})
</script>