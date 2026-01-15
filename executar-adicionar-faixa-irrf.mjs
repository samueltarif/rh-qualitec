import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔄 Tentando adicionar coluna faixa_irrf...\n')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function adicionarColuna() {
  console.log('⚠️ O Supabase não permite ALTER TABLE via API REST.')
  console.log('📋 Você precisa executar o SQL manualmente no Supabase Dashboard.\n')
  
  console.log('═'.repeat(80))
  console.log('INSTRUÇÕES:')
  console.log('═'.repeat(80))
  console.log('1. Acesse: https://supabase.com/dashboard')
  console.log('2. Selecione seu projeto: rqryspxfvfzfghrfqtbm')
  console.log('3. Vá em: SQL Editor (menu lateral)')
  console.log('4. Clique em: "New query"')
  console.log('5. Cole o SQL abaixo:')
  console.log('─'.repeat(80))
  console.log(`
ALTER TABLE holerites 
ADD COLUMN IF NOT EXISTS faixa_irrf TEXT;
  `)
  console.log('─'.repeat(80))
  console.log('6. Clique em "Run" (ou pressione Ctrl+Enter)')
  console.log('7. Você deve ver: "Success. No rows returned"')
  console.log('═'.repeat(80))
  
  console.log('\n✅ Após executar, rode novamente a geração de holerites!')
}

adicionarColuna()
