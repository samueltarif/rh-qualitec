require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

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
        console.log('\n📋 Você precisa criar a tabela primeiro.')
        return
      }
      console.error('❌ Erro ao verificar tabela:', erroTabelas.message)
      return
    }

    console.log('✅ Tabela "holerites" existe!\n')

    // Buscar estrutura da tabela
    const { data: colunas, error: erroColunas } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          column_default,
          is_nullable,
          is_generated
        FROM information_schema.columns
        WHERE table_name = 'holerites'
        ORDER BY ordinal_position;
      `
    })

    if (erroColunas) {
      // Tentar método alternativo
      console.log('⚠️  Método RPC não disponível, tentando consulta direta...\n')
      
      // Fazer uma query simples para ver as colunas
      const { data: teste, error: erroTeste } = await supabase
        .from('holerites')
        .select('*')
        .limit(1)

      if (erroTeste) {
        console.error('❌ Erro:', erroTeste.message)
        return
      }

      if (teste && teste.length > 0) {
        console.log('📋 Colunas encontradas na tabela (baseado em dados):')
        Object.keys(teste[0]).forEach(col => {
          console.log(`  - ${col}`)
        })
      } else {
        console.log('⚠️  Tabela existe mas está vazia. Não é possível inferir colunas.')
        console.log('\n💡 Sugestão: Verifique manualmente no Supabase Dashboard:')
        console.log('   1. Acesse: Database > Tables > holerites')
        console.log('   2. Veja a aba "Definition" ou "Columns"')
      }
      return
    }

    console.log('📋 Estrutura da tabela "holerites":\n')
    console.log('Coluna'.padEnd(30), 'Tipo'.padEnd(20), 'Nulo?'.padEnd(10), 'Gerada?')
    console.log('-'.repeat(80))
    
    colunas.forEach(col => {
      console.log(
        col.column_name.padEnd(30),
        col.data_type.padEnd(20),
        col.is_nullable.padEnd(10),
        col.is_generated || 'NEVER'
      )
    })

    // Verificar colunas específicas importantes
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

    const colunasExistentes = colunas.map(c => c.column_name)
    colunasImportantes.forEach(col => {
      const existe = colunasExistentes.includes(col)
      console.log(`  ${existe ? '✅' : '❌'} ${col}`)
    })

  } catch (error) {
    console.error('❌ Erro ao verificar schema:', error.message)
  }
}

verificarSchema()
