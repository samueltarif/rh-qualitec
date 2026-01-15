import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function corrigirNome() {
  console.log('🔧 Corrigindo nome da Silvana...\n')

  try {
    // Atualizar nome
    const { data, error } = await supabase
      .from('funcionarios')
      .update({ nome_completo: 'Silvana' })
      .eq('email_login', 'silvana@qualitec.ind.br')
      .select()

    if (error) {
      console.error('❌ Erro ao atualizar:', error.message)
      return
    }

    if (data && data.length > 0) {
      console.log('✅ Nome corrigido com sucesso!')
      console.log('\n📋 Dados atualizados:')
      console.log(`  ID: ${data[0].id}`)
      console.log(`  Nome: ${data[0].nome_completo}`)
      console.log(`  Email: ${data[0].email_login}`)
      console.log(`  Tipo: ${data[0].tipo_acesso}`)
    } else {
      console.log('⚠️  Nenhum registro foi atualizado')
    }

  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

corrigirNome()
