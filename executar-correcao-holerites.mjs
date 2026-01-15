import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { config } from 'dotenv'

// Carregar variáveis de ambiente
config()

const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas!')
  console.error('NUXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'OK' : 'FALTANDO')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'OK' : 'FALTANDO')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔧 Iniciando correção da tabela holerites...\n')

try {
  // Ler o arquivo SQL
  const sql = readFileSync('./database/11-corrigir-colunas-holerites.sql', 'utf-8')
  
  // Dividir em comandos individuais
  const comandos = sql
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))
  
  console.log(`📝 ${comandos.length} comandos SQL para executar\n`)
  
  // Executar cada comando
  for (let i = 0; i < comandos.length; i++) {
    const comando = comandos[i]
    console.log(`\n[${i + 1}/${comandos.length}] Executando comando...`)
    console.log(`SQL: ${comando.substring(0, 100)}...`)
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: comando })
    
    if (error) {
      // Tentar executar diretamente se RPC não funcionar
      console.log('⚠️  RPC não disponível, tentando método alternativo...')
      
      // Para Supabase, precisamos usar a API REST diretamente
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql_query: comando })
      })
      
      if (!response.ok) {
        console.error(`❌ Erro no comando ${i + 1}:`, error.message)
        console.log('⚠️  Continuando com próximo comando...')
      } else {
        console.log(`✅ Comando ${i + 1} executado`)
      }
    } else {
      console.log(`✅ Comando ${i + 1} executado`)
    }
  }
  
  console.log('\n\n✅ Correção concluída!')
  console.log('\n📋 Próximos passos:')
  console.log('1. Verifique no Supabase se as colunas foram atualizadas')
  console.log('2. Tente gerar os holerites novamente')
  
} catch (error) {
  console.error('\n❌ Erro ao executar migração:', error.message)
  console.log('\n💡 Solução alternativa:')
  console.log('1. Acesse o Supabase Dashboard')
  console.log('2. Vá em SQL Editor')
  console.log('3. Cole e execute o conteúdo do arquivo: database/11-corrigir-colunas-holerites.sql')
  process.exit(1)
}
