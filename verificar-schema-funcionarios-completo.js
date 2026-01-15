import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verificarSchema() {
  console.log('🔍 Verificando schema da tabela funcionarios...\n')

  // Consultar estrutura da tabela
  const { data, error } = await supabase
    .from('funcionarios')
    .select('*')
    .limit(1)

  if (error) {
    console.error('❌ Erro:', error)
    return
  }

  if (data && data.length > 0) {
    console.log('✅ Colunas encontradas:')
    console.log(Object.keys(data[0]))
    console.log('\n📋 Exemplo de registro:')
    console.log(JSON.stringify(data[0], null, 2))
  } else {
    console.log('⚠️ Nenhum registro encontrado')
  }

  // Verificar via information_schema
  const { data: columns, error: schemaError } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'funcionarios'
      ORDER BY ordinal_position;
    `
  })

  if (!schemaError && columns) {
    console.log('\n📊 Schema completo da tabela:')
    console.table(columns)
  }
}

verificarSchema()
