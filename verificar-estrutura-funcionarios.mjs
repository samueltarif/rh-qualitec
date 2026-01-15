import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarEstrutura() {
  console.log('🔍 Verificando estrutura da tabela funcionarios...\n')

  try {
    const { data, error } = await supabase
      .from('funcionarios')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Erro:', error.message)
      return
    }

    if (data && data.length > 0) {
      console.log('📋 Colunas da tabela funcionarios:\n')
      const colunas = Object.keys(data[0])
      
      colunas.forEach(col => {
        const valor = data[0][col]
        const tipo = typeof valor
        const isUUID = typeof valor === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(valor)
        
        console.log(`  ${col.padEnd(25)} | Tipo: ${tipo.padEnd(10)} | ${isUUID ? '🔑 UUID' : ''}`)
      })
      
      console.log('\n🔍 Procurando colunas relacionadas a autenticação:')
      const authCols = colunas.filter(col => 
        col.includes('auth') || 
        col.includes('user_id') || 
        col.includes('uuid') ||
        col === 'id'
      )
      
      if (authCols.length > 0) {
        console.log('   Encontradas:', authCols.join(', '))
        authCols.forEach(col => {
          const valor = data[0][col]
          console.log(`   - ${col}: ${valor} (${typeof valor})`)
        })
      } else {
        console.log('   ⚠️  Nenhuma coluna de autenticação encontrada')
      }
      
    } else {
      console.log('⚠️  Tabela funcionarios está vazia')
    }

  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

verificarEstrutura()
