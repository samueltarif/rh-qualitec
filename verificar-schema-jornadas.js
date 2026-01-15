// Script para verificar schema das tabelas de jornadas no Supabase
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NUXT_PUBLIC_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarSchema() {
  console.log('🔍 Verificando schema das tabelas de jornadas...\n')

  try {
    // 1. Verificar tabela jornadas_trabalho
    console.log('📋 Tabela: jornadas_trabalho')
    const { data: jornadas, error: jornadasError } = await supabase
      .from('jornadas_trabalho')
      .select('*')
      .limit(1)

    if (jornadasError) {
      console.error('❌ Erro ao acessar jornadas_trabalho:', jornadasError.message)
    } else {
      console.log('✅ Tabela jornadas_trabalho acessível')
      if (jornadas && jornadas.length > 0) {
        console.log('📊 Campos disponíveis:', Object.keys(jornadas[0]).join(', '))
        console.log('📝 Exemplo:', JSON.stringify(jornadas[0], null, 2))
      } else {
        console.log('ℹ️  Tabela vazia')
      }
    }

    console.log('\n' + '='.repeat(60) + '\n')

    // 2. Verificar tabela jornada_horarios
    console.log('📋 Tabela: jornada_horarios')
    const { data: horarios, error: horariosError } = await supabase
      .from('jornada_horarios')
      .select('*')
      .limit(1)

    if (horariosError) {
      console.error('❌ Erro ao acessar jornada_horarios:', horariosError.message)
    } else {
      console.log('✅ Tabela jornada_horarios acessível')
      if (horarios && horarios.length > 0) {
        console.log('📊 Campos disponíveis:', Object.keys(horarios[0]).join(', '))
        console.log('📝 Exemplo:', JSON.stringify(horarios[0], null, 2))
      } else {
        console.log('ℹ️  Tabela vazia')
      }
    }

    console.log('\n' + '='.repeat(60) + '\n')

    // 3. Testar inserção de jornada
    console.log('🧪 Testando inserção de jornada...')
    
    const novaJornada = {
      nome: 'Teste Jornada ' + Date.now(),
      descricao: 'Jornada de teste',
      horas_semanais: 40,
      horas_mensais: 173.2,
      ativa: true,
      padrao: false
    }

    console.log('📤 Dados a inserir:', JSON.stringify(novaJornada, null, 2))

    const { data: jornadaInserida, error: insertError } = await supabase
      .from('jornadas_trabalho')
      .insert(novaJornada)
      .select()

    if (insertError) {
      console.error('❌ Erro ao inserir jornada:', insertError.message)
      console.error('📋 Detalhes:', insertError)
    } else {
      console.log('✅ Jornada inserida com sucesso!')
      console.log('📝 Dados inseridos:', JSON.stringify(jornadaInserida, null, 2))

      // 4. Testar inserção de horários
      if (jornadaInserida && jornadaInserida.length > 0) {
        const jornadaId = jornadaInserida[0].id
        console.log('\n🧪 Testando inserção de horários...')

        const novosHorarios = [
          {
            jornada_id: jornadaId,
            dia_semana: 1,
            entrada: '08:00:00',
            saida: '17:00:00',
            intervalo_inicio: '12:00:00',
            intervalo_fim: '13:00:00',
            horas_brutas: 9,
            horas_intervalo: 1,
            horas_liquidas: 8,
            trabalha: true
          },
          {
            jornada_id: jornadaId,
            dia_semana: 2,
            entrada: '08:00:00',
            saida: '17:00:00',
            intervalo_inicio: '12:00:00',
            intervalo_fim: '13:00:00',
            horas_brutas: 9,
            horas_intervalo: 1,
            horas_liquidas: 8,
            trabalha: true
          }
        ]

        console.log('📤 Horários a inserir:', JSON.stringify(novosHorarios, null, 2))

        const { data: horariosInseridos, error: horariosInsertError } = await supabase
          .from('jornada_horarios')
          .insert(novosHorarios)
          .select()

        if (horariosInsertError) {
          console.error('❌ Erro ao inserir horários:', horariosInsertError.message)
          console.error('📋 Detalhes:', horariosInsertError)
        } else {
          console.log('✅ Horários inseridos com sucesso!')
          console.log('📝 Dados inseridos:', JSON.stringify(horariosInseridos, null, 2))
        }

        // 5. Limpar dados de teste
        console.log('\n🧹 Limpando dados de teste...')
        
        await supabase
          .from('jornada_horarios')
          .delete()
          .eq('jornada_id', jornadaId)

        await supabase
          .from('jornadas_trabalho')
          .delete()
          .eq('id', jornadaId)

        console.log('✅ Dados de teste removidos')
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ Verificação concluída!')

  } catch (error) {
    console.error('💥 Erro durante verificação:', error)
  }
}

verificarSchema()
