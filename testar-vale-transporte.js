import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testar() {
  console.log('🚌 Testando Vale Transporte...\n')

  // 1. Verificar se os campos foram criados
  console.log('1️⃣ Verificando campos...')
  const { data: funcionarios, error: erro1 } = await supabase
    .from('funcionarios')
    .select('id, nome_completo, beneficios, descontos_personalizados')
    .limit(1)

  if (erro1) {
    console.error('❌ Erro ao buscar funcionários:', erro1)
    return
  }

  console.log('✅ Campos encontrados!')
  console.log('Exemplo:', JSON.stringify(funcionarios[0], null, 2))

  // 2. Verificar a view
  console.log('\n2️⃣ Testando view vw_vale_transporte_funcionarios...')
  const { data: valeTransporte, error: erro2 } = await supabase
    .from('vw_vale_transporte_funcionarios')
    .select('*')

  if (erro2) {
    console.error('❌ Erro ao consultar view:', erro2)
    return
  }

  console.log('✅ View funcionando!')
  console.log(`📊 ${valeTransporte.length} funcionário(s) encontrado(s)`)
  
  if (valeTransporte.length > 0) {
    console.log('\n📋 Dados do Vale Transporte:')
    valeTransporte.forEach(f => {
      console.log(`\n👤 ${f.nome_completo}`)
      console.log(`   Ativo: ${f.vt_ativo ? '✅' : '❌'}`)
      if (f.vt_ativo) {
        console.log(`   Tipo: ${f.tipo_transporte}`)
        console.log(`   Valor Total: R$ ${f.valor_total}`)
        console.log(`   Desconto: R$ ${f.valor_desconto}`)
        console.log(`   Valor Líquido: R$ ${f.valor_liquido}`)
      }
    })
  }

  console.log('\n✅ Tudo funcionando perfeitamente! 🎉')
}

testar()
