import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarSchema() {
  console.log('🔍 Verificando schema da tabela holerites...\n')

  try {
    // Verificar se a tabela existe
    const { data: tabelas, error: erroTabelas } = await supabase
      .from('holerites')
      .select('*')
      .limit(0)

    if (erroTabelas) {
      if (erroTabelas.code === '42P01') {
        console.log('❌ Tabela "holerites" NÃO EXISTE no banco de dados')
        console.log('\n📋 A tabela precisa ser criada.')
        console.log('✅ Isso é normal - vamos criar a tabela corretamente.')
        return { existe: false }
      }
      console.error('❌ Erro ao verificar tabela:', erroTabelas.message)
      return { existe: false, erro: erroTabelas }
    }

    console.log('✅ Tabela "holerites" JÁ EXISTE!\n')

    // Fazer uma query simples para ver as colunas
    const { data: teste, error: erroTeste } = await supabase
      .from('holerites')
      .select('*')
      .limit(1)

    if (erroTeste) {
      console.error('❌ Erro ao buscar dados:', erroTeste.message)
      return { existe: true, erro: erroTeste }
    }

    if (teste && teste.length > 0) {
      console.log('📋 Colunas encontradas na tabela:')
      const colunas = Object.keys(teste[0])
      colunas.forEach(col => {
        console.log(`  ✓ ${col}`)
      })
      
      console.log('\n🔍 Verificando colunas importantes:')
      const colunasImportantes = [
        'id',
        'funcionario_id',
        'periodo_inicio',
        'periodo_fim',
        'salario_base',
        'total_proventos',
        'total_descontos',
        'salario_liquido',
        'status'
      ]

      colunasImportantes.forEach(col => {
        const existe = colunas.includes(col)
        console.log(`  ${existe ? '✅' : '❌'} ${col}`)
      })
      
      return { existe: true, colunas }
    } else {
      console.log('⚠️  Tabela existe mas está vazia.')
      console.log('📋 Tentando buscar estrutura via metadata...')
      
      // Tentar buscar pelo menos uma linha para ver a estrutura
      const { error: erroInsert } = await supabase
        .from('holerites')
        .select('*')
        .limit(1)
      
      if (erroInsert) {
        console.log('Erro:', erroInsert.message)
      }
      
      return { existe: true, vazia: true }
    }

  } catch (error) {
    console.error('❌ Erro ao verificar schema:', error.message)
    return { existe: false, erro: error }
  }
}

verificarSchema().then(resultado => {
  console.log('\n' + '='.repeat(80))
  if (!resultado.existe) {
    console.log('📝 PRÓXIMO PASSO: Criar a tabela holerites')
    console.log('   Execute o script SQL corrigido no Supabase')
  } else {
    console.log('✅ Tabela existe. Verifique se todas as colunas necessárias estão presentes.')
  }
})
