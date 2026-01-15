import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarTipoID() {
  console.log('🔍 Verificando tipo do ID da tabela funcionarios...\n')

  try {
    // Buscar um funcionário para ver o tipo do ID
    const { data, error } = await supabase
      .from('funcionarios')
      .select('id')
      .limit(1)

    if (error) {
      console.error('❌ Erro:', error.message)
      return
    }

    if (data && data.length > 0) {
      const id = data[0].id
      console.log('📋 Exemplo de ID:', id)
      console.log('📋 Tipo do ID:', typeof id)
      
      // Verificar se é UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
      const isInteger = Number.isInteger(id)
      
      console.log('\n✅ Resultado:')
      if (isUUID) {
        console.log('   Tipo: UUID')
        console.log('   ⚠️  As políticas RLS devem usar: auth.uid() (sem conversão)')
      } else if (isInteger) {
        console.log('   Tipo: INTEGER')
        console.log('   ⚠️  As políticas RLS devem usar: auth.uid()::integer')
      } else {
        console.log('   Tipo: Desconhecido -', typeof id)
      }
      
      return { tipo: isUUID ? 'UUID' : isInteger ? 'INTEGER' : 'UNKNOWN', exemplo: id }
    } else {
      console.log('⚠️  Tabela funcionarios está vazia')
      console.log('   Não é possível determinar o tipo do ID')
    }

  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

verificarTipoID()
