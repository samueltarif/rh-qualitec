import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testarNumeroDependentes() {
  try {
    console.log('🔍 Testando campo numero_dependentes...\n')
    
    // 1. Verificar se a coluna existe na tabela
    console.log('1️⃣ Verificando se a coluna existe...')
    const { data: colunas, error: colError } = await supabase
      .rpc('exec', {
        sql: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = 'funcionarios'
          AND column_name = 'numero_dependentes';
        `
      })
    
    if (colError) {
      console.log('⚠️ Não foi possível verificar via RPC, tentando buscar dados...')
    } else if (colunas && colunas.length > 0) {
      console.log('✅ Coluna numero_dependentes existe!')
      console.log('   Tipo:', colunas[0].data_type)
      console.log('   Nullable:', colunas[0].is_nullable)
    }
    
    // 2. Buscar funcionários e verificar o campo
    console.log('\n2️⃣ Verificando dados dos funcionários...')
    const { data: funcionarios, error: funcError } = await supabase
      .from('funcionarios')
      .select('id, nome_completo, numero_dependentes')
      .limit(5)
    
    if (funcError) {
      console.error('❌ Erro ao buscar funcionários:', funcError.message)
      return
    }
    
    if (!funcionarios || funcionarios.length === 0) {
      console.log('⚠️ Nenhum funcionário encontrado')
      return
    }
    
    console.log('📊 Funcionários encontrados:')
    funcionarios.forEach(func => {
      console.log(`   • ${func.nome_completo}: ${func.numero_dependentes ?? 'NULL'} dependentes`)
    })
    
    // 3. Testar atualização de um funcionário
    console.log('\n3️⃣ Testando atualização...')
    const primeiroFunc = funcionarios[0]
    const novoNumero = (primeiroFunc.numero_dependentes || 0) + 1
    
    console.log(`   Atualizando ${primeiroFunc.nome_completo} para ${novoNumero} dependentes...`)
    
    const { data: atualizado, error: updateError } = await supabase
      .from('funcionarios')
      .update({ numero_dependentes: novoNumero })
      .eq('id', primeiroFunc.id)
      .select('nome_completo, numero_dependentes')
      .single()
    
    if (updateError) {
      console.error('❌ Erro ao atualizar:', updateError.message)
      return
    }
    
    console.log('✅ Atualização bem-sucedida!')
    console.log(`   ${atualizado.nome_completo}: ${atualizado.numero_dependentes} dependentes`)
    
    // 4. Reverter a alteração
    console.log('\n4️⃣ Revertendo alteração...')
    await supabase
      .from('funcionarios')
      .update({ numero_dependentes: primeiroFunc.numero_dependentes })
      .eq('id', primeiroFunc.id)
    
    console.log('✅ Alteração revertida!')
    
    console.log('\n🎉 TESTE CONCLUÍDO!')
    console.log('✅ O campo numero_dependentes está funcionando corretamente!')
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
  }
}

testarNumeroDependentes()