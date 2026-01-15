// Script para executar migração de jornadas de trabalho
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.NUXT_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Variáveis de ambiente não configuradas!')
  console.error('Necessário: NUXT_PUBLIC_SUPABASE_URL e NUXT_SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function executarMigracao() {
  console.log('🚀 Executando migração de jornadas de trabalho...\n')

  try {
    // Ler arquivo SQL
    const sql = readFileSync('database/06-criar-jornadas-trabalho.sql', 'utf8')
    
    console.log('📄 Arquivo SQL carregado')
    console.log('📊 Tamanho:', sql.length, 'caracteres\n')

    // Executar SQL via RPC (se disponível) ou via REST API
    console.log('⚙️  Executando SQL...\n')

    // Dividir em comandos individuais
    const comandos = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))

    console.log(`📋 Total de comandos: ${comandos.length}\n`)

    let sucessos = 0
    let erros = 0

    for (let i = 0; i < comandos.length; i++) {
      const comando = comandos[i]
      
      // Pular comentários e comandos vazios
      if (comando.startsWith('--') || comando.length < 10) {
        continue
      }

      try {
        console.log(`[${i + 1}/${comandos.length}] Executando...`)
        
        const { error } = await supabase.rpc('exec_sql', { sql_query: comando + ';' })
        
        if (error) {
          console.error(`❌ Erro no comando ${i + 1}:`, error.message)
          erros++
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`)
          sucessos++
        }
      } catch (err) {
        console.error(`❌ Erro ao executar comando ${i + 1}:`, err.message)
        erros++
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log(`✅ Sucessos: ${sucessos}`)
    console.log(`❌ Erros: ${erros}`)
    console.log('='.repeat(60))

    // Verificar se as tabelas foram criadas
    console.log('\n🔍 Verificando tabelas criadas...\n')

    const { data: jornadas, error: jornadasError } = await supabase
      .from('jornadas_trabalho')
      .select('*')
      .limit(1)

    if (jornadasError) {
      console.error('❌ Tabela jornadas_trabalho não encontrada:', jornadasError.message)
    } else {
      console.log('✅ Tabela jornadas_trabalho criada com sucesso!')
    }

    const { data: horarios, error: horariosError } = await supabase
      .from('jornada_horarios')
      .select('*')
      .limit(1)

    if (horariosError) {
      console.error('❌ Tabela jornada_horarios não encontrada:', horariosError.message)
    } else {
      console.log('✅ Tabela jornada_horarios criada com sucesso!')
    }

    console.log('\n✅ Migração concluída!')

  } catch (error) {
    console.error('💥 Erro durante migração:', error)
  }
}

executarMigracao()
