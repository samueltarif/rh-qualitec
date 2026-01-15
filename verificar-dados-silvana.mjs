import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarDados() {
  console.log('🔍 Verificando dados da Silvana...\n')

  try {
    // Buscar funcionário com email silvana@qualitec.ind.br
    const { data: funcionarios, error } = await supabase
      .from('funcionarios')
      .select('*')
      .eq('email_login', 'silvana@qualitec.ind.br')

    if (error) {
      console.error('❌ Erro:', error.message)
      return
    }

    if (!funcionarios || funcionarios.length === 0) {
      console.log('⚠️  Nenhum funcionário encontrado com email silvana@qualitec.ind.br')
      return
    }

    console.log('📋 Dados encontrados:\n')
    funcionarios.forEach((f, index) => {
      console.log(`Registro ${index + 1}:`)
      console.log(`  ID: ${f.id}`)
      console.log(`  Nome Completo: "${f.nome_completo}"`)
      console.log(`  Email: ${f.email_login}`)
      console.log(`  CPF: ${f.cpf}`)
      console.log(`  Tipo Acesso: ${f.tipo_acesso}`)
      console.log(`  Status: ${f.status}`)
      console.log(`  Data Admissão: ${f.data_admissao}`)
      console.log('')
    })

    // Verificar se há nome incorreto
    const comProblema = funcionarios.filter(f => 
      f.nome_completo && (
        f.nome_completo.includes('MACIEL') || 
        f.nome_completo === 'MACIELCARVALHO' ||
        !f.nome_completo.includes('Silvana')
      )
    )

    if (comProblema.length > 0) {
      console.log('⚠️  PROBLEMA ENCONTRADO!')
      console.log('   O nome está incorreto. Deveria ser "Silvana" mas está como:', comProblema[0].nome_completo)
      console.log('\n💡 Para corrigir, execute o script de correção.')
    } else {
      console.log('✅ Nome está correto!')
    }

  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

verificarDados()
